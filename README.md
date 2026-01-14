# OneNightGames - MVP

A full-stack web app for discovering games using a swipe/card UI with 3 decisions: Ignore, Interested, and Play Now.

## Overview

OneNightGames helps users discover games across all playtimes (not just one night!). It works especially well for short games but supports filtering by playtime, platform, and co-op type.

**Milestone 1** focuses on correct project structure, wiring, and minimal functionality to verify everything works end-to-end.

## Tech Stack

- **Frontend**: React + Vite (JavaScript), React Router, Tailwind CSS
- **Backend**: Node.js + Express (JavaScript)
- **Database/Auth**: Supabase (Postgres + Supabase Auth)
- **Data Source**: Seeded SQL data (20 games for MVP)

## Features (Milestone 1)

- ✅ Supabase authentication (email + password)
- ✅ Landing page with product pitch
- ✅ Swipe interface with game cards
- ✅ Three swipe actions: Ignore, Interested, Play Now
- ✅ Session tracking (planned → active → ended)
- ✅ Session rating system
- ✅ Dashboard with Interested and Past Sessions tabs
- ✅ Active session detection and resume
- ✅ Protected routes (auth required)
- ✅ Profile menu with logout

## Quick Start

See **[SETUP.md](./SETUP.md)** for detailed setup instructions.

### Prerequisites

- Node.js v20 LTS
- npm (comes with Node.js)
- Supabase account (free)

### TL;DR

1. Create Supabase project and get API keys
2. Run SQL migrations in Supabase SQL Editor
3. Set up backend `.env` and run `npm install && npm run dev`
4. Set up frontend `.env` and run `npm install && npm run dev`
5. Open http://localhost:5173

## Project Structure

```
GameTinder/
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # Auth context
│   │   ├── lib/          # Supabase client, API client
│   │   ├── pages/        # Route pages
│   │   ├── App.jsx       # Main app with routes
│   │   └── main.jsx      # Entry point
│   ├── .env.example      # Frontend env template
│   └── package.json
├── backend/              # Express backend
│   ├── supabase/
│   │   └── migrations/   # SQL migrations
│   ├── index.js          # Main server file
│   ├── .env.example      # Backend env template
│   └── package.json
├── SETUP.md              # Detailed setup guide
└── README.md             # This file
```

## Routes

- `/` - Landing page (public)
- `/auth` - Sign up / Log in (public)
- `/swipe` - Main swipe interface (protected)
- `/session/:id` - Session detail page (protected)
- `/dashboard` - User library and past sessions (protected)

## API Endpoints

- `GET /api/recommendation/next` - Get next game recommendation
- `POST /api/swipes` - Record swipe decision
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session details
- `PATCH /api/sessions/:id/start` - Start a session
- `PATCH /api/sessions/:id/end` - End a session
- `PATCH /api/sessions/:id/rating` - Rate a session
- `GET /api/dashboard` - Get dashboard data

## Database Schema

### games
- id (uuid)
- title, cover_url, summary
- minutes_min, minutes_max
- platforms (text[])
- coop_type (text)

### swipes
- user_id, game_id (composite PK)
- decision ('ignore' | 'interested')
- created_at

### sessions
- id (uuid)
- user_id, game_id
- status ('planned' | 'active' | 'ended')
- created_at, started_at, ended_at
- finished, rating_fun, rating_friction, would_play_again

## Development

### Running Servers

You need two terminal windows:

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

### Testing

See the [Manual Testing Checklist](./SETUP.md#manual-testing-checklist) in SETUP.md.

## What's NOT in Milestone 1

- Advanced recommendation logic
- Actual filters implementation (UI placeholder exists)
- External game APIs (RAWG/IGDB)
- Guest mode
- Styling perfection
- Automated tests

## Next Steps

After verifying Milestone 1 works:

1. Implement filter functionality
2. Add personalized recommendations
3. Integrate external game APIs
4. Add session analytics
5. Improve UI/UX polish
6. Add automated tests

## License

MIT
