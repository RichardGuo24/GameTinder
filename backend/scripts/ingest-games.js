/**
 * RAWG Game Ingestion Script
 *
 * This script fetches games from the RAWG API and upserts them into
 * your Supabase database. It's designed to be:
 *
 * - IDEMPOTENT: Safe to run multiple times (uses upsert on rawg_id)
 * - INCREMENTAL: Start small, scale up
 * - SEPARATE: Runs independently from your main API server
 *
 * Usage:
 *   node scripts/ingest-games.js                    # Default: 50 games
 *   node scripts/ingest-games.js --count=100        # Custom count
 *   node scripts/ingest-games.js --count=10 --dry   # Dry run (no inserts)
 *
 * Prerequisites:
 *   1. RAWG_API_KEY in .env
 *   2. Run migration 003_add_rawg_fields.sql first
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  RAWG_API_KEY: process.env.RAWG_API_KEY,
  RAWG_BASE_URL: 'https://api.rawg.io/api',
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Ingestion settings
  DEFAULT_GAME_COUNT: 50,
  PAGE_SIZE: 20,  // RAWG returns up to 20 per page
  DELAY_BETWEEN_REQUESTS_MS: 250,  // Be nice to the API
};

// =============================================================================
// VALIDATION
// =============================================================================

function validateConfig() {
  const missing = [];
  if (!CONFIG.RAWG_API_KEY) missing.push('RAWG_API_KEY');
  if (!CONFIG.SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!CONFIG.SUPABASE_SERVICE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.join(', '));
    console.error('Make sure these are set in backend/.env');
    process.exit(1);
  }
}

// =============================================================================
// RAWG API CLIENT
// =============================================================================

async function fetchGamesPage(page = 1, pageSize = CONFIG.PAGE_SIZE) {
  const url = new URL(`${CONFIG.RAWG_BASE_URL}/games`);
  url.searchParams.set('key', CONFIG.RAWG_API_KEY);
  url.searchParams.set('page', page);
  url.searchParams.set('page_size', pageSize);
  // Get popular/well-rated games for better quality data
  url.searchParams.set('ordering', '-rating');
  url.searchParams.set('metacritic', '70,100');  // Only games with decent metacritic

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`RAWG API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchGameDetails(gameId) {
  const url = new URL(`${CONFIG.RAWG_BASE_URL}/games/${gameId}`);
  url.searchParams.set('key', CONFIG.RAWG_API_KEY);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`RAWG API error for game ${gameId}: ${response.status}`);
  }

  return response.json();
}

// =============================================================================
// DATA TRANSFORMATION
// =============================================================================

/**
 * Transform RAWG game data to your database schema
 */
function transformGame(rawgGame, details = null) {
  // Extract platform names from nested structure
  const platforms = rawgGame.platforms
    ?.map(p => {
      const name = p.platform?.name;
      // Normalize platform names for cleaner display
      if (name?.includes('PlayStation')) return 'PS';
      if (name?.includes('Xbox')) return 'Xbox';
      if (name?.includes('Nintendo Switch')) return 'Switch';
      if (name?.includes('PC')) return 'PC';
      if (name?.includes('macOS') || name?.includes('Mac')) return 'Mac';
      if (name?.includes('Linux')) return 'Linux';
      if (name?.includes('iOS')) return 'iOS';
      if (name?.includes('Android')) return 'Android';
      return name;
    })
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)  // Remove duplicates
    || [];

  // Extract genre names
  const genres = rawgGame.genres?.map(g => g.name) || [];

  // Determine co-op type from tags (if available)
  const tags = rawgGame.tags?.map(t => t.slug) || [];
  let coopType = 'solo';
  if (tags.includes('co-op') && tags.includes('local-co-op')) {
    coopType = 'both';
  } else if (tags.includes('local-co-op') || tags.includes('local-multiplayer')) {
    coopType = 'local_coop';
  } else if (tags.includes('co-op') || tags.includes('online-co-op') || tags.includes('multiplayer')) {
    coopType = 'online_coop';
  }

  // RAWG playtime is in hours, convert to minutes
  // Use a range: playtime as min, playtime * 1.5 as max (rough estimate)
  const playtimeHours = rawgGame.playtime || 0;
  const minutesMin = playtimeHours > 0 ? playtimeHours * 60 : null;
  const minutesMax = playtimeHours > 0 ? Math.round(playtimeHours * 60 * 1.5) : null;

  // Get description from details if available, otherwise use a placeholder
  const description = details?.description_raw
    || details?.description?.replace(/<[^>]*>/g, '')  // Strip HTML tags
    || `${rawgGame.name} is a video game.`;

  return {
    rawg_id: rawgGame.id,
    rawg_slug: rawgGame.slug,
    title: rawgGame.name,
    cover_url: rawgGame.background_image,
    summary: description.substring(0, 500),  // Truncate for summary
    description: description,
    minutes_min: minutesMin,
    minutes_max: minutesMax,
    platforms: platforms,
    genres: genres,
    coop_type: coopType,
    rating: rawgGame.rating,
    metacritic: rawgGame.metacritic,
    released: rawgGame.released,
  };
}

// =============================================================================
// DATABASE OPERATIONS
// =============================================================================

async function upsertGames(supabase, games) {
  // Supabase upsert with ON CONFLICT
  const { data, error } = await supabase
    .from('games')
    .upsert(games, {
      onConflict: 'rawg_id',
      ignoreDuplicates: false  // Update existing records
    })
    .select();

  if (error) {
    throw new Error(`Database upsert failed: ${error.message}`);
  }

  return data;
}

// =============================================================================
// MAIN INGESTION LOGIC
// =============================================================================

async function ingestGames(options = {}) {
  const {
    count = CONFIG.DEFAULT_GAME_COUNT,
    dryRun = false,
    fetchDetails = true  // Fetch individual game details for better descriptions
  } = options;

  console.log('\n========================================');
  console.log('RAWG Game Ingestion Script');
  console.log('========================================\n');
  console.log(`Target: ${count} games`);
  console.log(`Dry run: ${dryRun}`);
  console.log(`Fetch details: ${fetchDetails}\n`);

  validateConfig();

  const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_KEY);

  let allGames = [];
  let page = 1;

  // Fetch games in pages until we have enough
  while (allGames.length < count) {
    const remaining = count - allGames.length;
    const pageSize = Math.min(remaining, CONFIG.PAGE_SIZE);

    console.log(`Fetching page ${page} (${pageSize} games)...`);

    try {
      const response = await fetchGamesPage(page, pageSize);

      if (!response.results || response.results.length === 0) {
        console.log('No more games available from RAWG');
        break;
      }

      // Filter out games without images
      const validGames = response.results.filter(g => g.background_image);
      console.log(`  Got ${response.results.length} games, ${validGames.length} with images`);

      allGames.push(...validGames);
      page++;

      // Rate limiting delay
      await sleep(CONFIG.DELAY_BETWEEN_REQUESTS_MS);

    } catch (error) {
      console.error(`Error fetching page ${page}:`, error.message);
      break;
    }
  }

  // Trim to exact count
  allGames = allGames.slice(0, count);
  console.log(`\nTotal games fetched: ${allGames.length}\n`);

  if (allGames.length === 0) {
    console.log('No games to process. Exiting.');
    return;
  }

  // Transform games
  console.log('Transforming game data...');
  const transformedGames = [];

  for (let i = 0; i < allGames.length; i++) {
    const game = allGames[i];
    let details = null;

    // Optionally fetch detailed info for better descriptions
    if (fetchDetails) {
      try {
        process.stdout.write(`  Fetching details for "${game.name}" (${i + 1}/${allGames.length})...\r`);
        details = await fetchGameDetails(game.id);
        await sleep(CONFIG.DELAY_BETWEEN_REQUESTS_MS);
      } catch (error) {
        console.warn(`\n  Warning: Could not fetch details for ${game.name}`);
      }
    }

    const transformed = transformGame(game, details);
    transformedGames.push(transformed);
  }

  console.log(`\nTransformed ${transformedGames.length} games`);

  // Deduplicate by rawg_id (RAWG can return duplicates)
  const seenIds = new Set();
  const uniqueGames = transformedGames.filter(game => {
    if (seenIds.has(game.rawg_id)) {
      return false;
    }
    seenIds.add(game.rawg_id);
    return true;
  });

  if (uniqueGames.length < transformedGames.length) {
    console.log(`Removed ${transformedGames.length - uniqueGames.length} duplicates`);
  }

  // Preview first game
  console.log('\nSample transformed game:');
  console.log(JSON.stringify(uniqueGames[0], null, 2));

  if (dryRun) {
    console.log('\n[DRY RUN] Skipping database insert');
    console.log(`Would have upserted ${uniqueGames.length} games`);
    return uniqueGames;
  }

  // Upsert to database
  console.log('\nUpserting to database...');
  try {
    const result = await upsertGames(supabase, uniqueGames);
    console.log(`Successfully upserted ${result.length} games`);
  } catch (error) {
    console.error('Database error:', error.message);
    process.exit(1);
  }

  console.log('\n========================================');
  console.log('Ingestion complete!');
  console.log('========================================\n');
}

// =============================================================================
// UTILITIES
// =============================================================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    count: CONFIG.DEFAULT_GAME_COUNT,
    dryRun: false,
    fetchDetails: true,
  };

  for (const arg of args) {
    if (arg.startsWith('--count=')) {
      options.count = parseInt(arg.split('=')[1], 10);
    }
    if (arg === '--dry') {
      options.dryRun = true;
    }
    if (arg === '--no-details') {
      options.fetchDetails = false;
    }
  }

  return options;
}

// =============================================================================
// RUN
// =============================================================================

const options = parseArgs();
ingestGames(options).catch(console.error);
