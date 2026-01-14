import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json());

// Auth middleware - verifies JWT and extracts user
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

// GET /api/recommendation/next - Get next game recommendation
app.get('/api/recommendation/next', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get games that user hasn't swiped on yet
    const { data: swipedGames, error: swipeError } = await supabase
      .from('swipes')
      .select('game_id')
      .eq('user_id', userId);

    if (swipeError) {
      console.error('Error fetching swipes:', swipeError);
      return res.status(500).json({ error: 'Failed to fetch swipes' });
    }

    const swipedGameIds = swipedGames.map(s => s.game_id);

    // Get next game not in swiped list
    let query = supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1);

    if (swipedGameIds.length > 0) {
      query = query.not('id', 'in', `(${swipedGameIds.join(',')})`);
    }

    const { data: games, error: gamesError } = await query;

    if (gamesError) {
      console.error('Error fetching games:', gamesError);
      return res.status(500).json({ error: 'Failed to fetch games' });
    }

    if (!games || games.length === 0) {
      return res.json({ done: true });
    }

    return res.json(games[0]);
  } catch (error) {
    console.error('Error in /api/recommendation/next:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/swipes - Record a swipe decision
app.post('/api/swipes', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId, decision } = req.body;

    if (!gameId || !decision) {
      return res.status(400).json({ error: 'gameId and decision are required' });
    }

    if (!['ignore', 'interested'].includes(decision)) {
      return res.status(400).json({ error: 'decision must be "ignore" or "interested"' });
    }

    const { data, error } = await supabase
      .from('swipes')
      .upsert({
        user_id: userId,
        game_id: gameId,
        decision: decision
      }, {
        onConflict: 'user_id,game_id'
      })
      .select();

    if (error) {
      console.error('Error creating swipe:', error);
      return res.status(500).json({ error: 'Failed to save swipe' });
    }

    return res.json({ success: true, data });
  } catch (error) {
    console.error('Error in /api/swipes:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/sessions - Create a new session
app.post('/api/sessions', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.body;

    if (!gameId) {
      return res.status(400).json({ error: 'gameId is required' });
    }

    // Ensure game is marked as interested
    await supabase
      .from('swipes')
      .upsert({
        user_id: userId,
        game_id: gameId,
        decision: 'interested'
      }, {
        onConflict: 'user_id,game_id'
      });

    // Create planned session
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        game_id: gameId,
        status: 'planned'
      })
      .select();

    if (error) {
      console.error('Error creating session:', error);
      return res.status(500).json({ error: 'Failed to create session' });
    }

    return res.json({ sessionId: data[0].id });
  } catch (error) {
    console.error('Error in /api/sessions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/sessions/:id - Get session details
app.get('/api/sessions/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        games (*)
      `)
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching session:', error);
      return res.status(404).json({ error: 'Session not found' });
    }

    return res.json(data);
  } catch (error) {
    console.error('Error in /api/sessions/:id:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/sessions/:id/start - Start a session
app.patch('/api/sessions/:id/start', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const { data, error } = await supabase
      .from('sessions')
      .update({
        started_at: new Date().toISOString(),
        status: 'active'
      })
      .eq('id', sessionId)
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Error starting session:', error);
      return res.status(500).json({ error: 'Failed to start session' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    return res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Error in /api/sessions/:id/start:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/sessions/:id/end - End a session
app.patch('/api/sessions/:id/end', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const { data, error } = await supabase
      .from('sessions')
      .update({
        ended_at: new Date().toISOString(),
        status: 'ended'
      })
      .eq('id', sessionId)
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Error ending session:', error);
      return res.status(500).json({ error: 'Failed to end session' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    return res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Error in /api/sessions/:id/end:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/sessions/:id/rating - Update session rating
app.patch('/api/sessions/:id/rating', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const { finished, rating_fun, rating_friction, would_play_again } = req.body;

    const { data, error } = await supabase
      .from('sessions')
      .update({
        finished: finished ?? null,
        rating_fun: rating_fun ?? null,
        rating_friction: rating_friction ?? null,
        would_play_again: would_play_again ?? null
      })
      .eq('id', sessionId)
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Error updating rating:', error);
      return res.status(500).json({ error: 'Failed to update rating' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    return res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Error in /api/sessions/:id/rating:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dashboard - Get dashboard data
app.get('/api/dashboard', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get active session
    const { data: activeSessions, error: activeError } = await supabase
      .from('sessions')
      .select(`
        *,
        games (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('started_at', { ascending: false })
      .limit(1);

    if (activeError) {
      console.error('Error fetching active sessions:', activeError);
    }

    // Get interested games
    const { data: swipes, error: swipesError } = await supabase
      .from('swipes')
      .select(`
        *,
        games (*)
      `)
      .eq('user_id', userId)
      .eq('decision', 'interested')
      .order('created_at', { ascending: false });

    if (swipesError) {
      console.error('Error fetching interested games:', swipesError);
    }

    // Get past sessions (sessions that were actually started)
    const { data: pastSessions, error: pastError } = await supabase
      .from('sessions')
      .select(`
        *,
        games (*)
      `)
      .eq('user_id', userId)
      .not('started_at', 'is', null)
      .order('started_at', { ascending: false });

    if (pastError) {
      console.error('Error fetching past sessions:', pastError);
    }

    return res.json({
      activeSession: activeSessions?.[0] || null,
      interestedGames: swipes?.map(s => s.games) || [],
      pastSessions: pastSessions || []
    });
  } catch (error) {
    console.error('Error in /api/dashboard:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
