-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  cover_url TEXT,
  summary TEXT,
  minutes_min INTEGER,
  minutes_max INTEGER,
  platforms TEXT[],
  coop_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create swipes table
CREATE TABLE IF NOT EXISTS swipes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  decision TEXT NOT NULL CHECK (decision IN ('ignore', 'interested')),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, game_id)
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('planned', 'active', 'ended')) DEFAULT 'planned',
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  finished BOOLEAN,
  rating_fun INTEGER,
  rating_friction INTEGER,
  would_play_again BOOLEAN
);

-- Enable RLS
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for swipes
CREATE POLICY "Users can view their own swipes"
  ON swipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own swipes"
  ON swipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own swipes"
  ON swipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own swipes"
  ON swipes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for sessions
CREATE POLICY "Users can view their own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Policy for games (readable by authenticated users)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view games"
  ON games FOR SELECT
  USING (auth.role() = 'authenticated');
