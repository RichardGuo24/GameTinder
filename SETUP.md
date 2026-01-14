# OneNightGames - Setup Guide

This guide will walk you through setting up the OneNightGames MVP from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [Backend Setup](#backend-setup)
5. [Frontend Setup](#frontend-setup)
6. [Running the Application](#running-the-application)
7. [Manual Testing Checklist](#manual-testing-checklist)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js**: v20 LTS (recommended)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`
- **npm**: Comes with Node.js
  - Verify installation: `npm --version`
- **Supabase Account**: Free account at https://supabase.com
- **Git**: For cloning the repository
- **A modern web browser**: Chrome, Firefox, Safari, or Edge

**Important**: This is a web application. No iOS/Xcode/React Native/CocoaPods needed. All development happens in the browser.

---

## Initial Setup

1. **Clone or navigate to the repository**:
   ```bash
   cd /path/to/GameTinder
   ```

2. **Verify the folder structure**:
   ```
   GameTinder/
   ├── frontend/
   ├── backend/
   └── SETUP.md
   ```

---

## Supabase Configuration

### Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in (or create an account)
2. Click **"New Project"**
3. Fill in the project details:
   - **Name**: OneNightGames (or any name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to you
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to be created

### Step 2: Get Your API Keys

Once your project is ready:

1. Go to **Settings** (gear icon in the left sidebar)
2. Click on **API** in the settings menu
3. You'll see the following information - copy these values:

   - **Project URL**:
     - Example: `https://abcdefghijklmnop.supabase.co`
     - You'll need this for both frontend and backend

   - **Project API keys** → **anon public**:
     - Starts with `eyJhbGc...`
     - You'll need this for the frontend

   - **Project API keys** → **service_role** (click "Reveal" to see it):
     - Starts with `eyJhbGc...`
     - **KEEP THIS SECRET!** Never commit this to Git or share publicly
     - You'll need this for the backend

### Step 3: Run Database Migrations

1. In Supabase Dashboard, click on **SQL Editor** in the left sidebar
2. Click **"New Query"**
3. Copy the contents of `backend/supabase/migrations/001_create_tables.sql`
4. Paste into the SQL Editor
5. Click **"Run"** (or press Ctrl/Cmd + Enter)
6. You should see a success message

7. Create another new query
8. Copy the contents of `backend/supabase/migrations/002_seed_games.sql`
9. Paste into the SQL Editor
10. Click **"Run"**
11. You should see "Success. 20 rows affected." or similar

### Step 4: Verify Tables

1. Click on **Table Editor** in the left sidebar
2. You should see three tables:
   - `games` (20 rows)
   - `swipes` (0 rows)
   - `sessions` (0 rows)

---

## Backend Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Create Environment File

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your text editor

3. Fill in the values with your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   PORT=3000
   CORS_ORIGIN=http://localhost:5173
   ```

   **Replace**:
   - `SUPABASE_URL`: Your Project URL from Supabase
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service_role key from Supabase
   - Keep `PORT=3000` as is
   - Keep `CORS_ORIGIN=http://localhost:5173` as is (this is the frontend URL)

4. Save the file

### Step 3: Test Backend Connection

Start the backend server:
```bash
npm run dev
```

You should see:
```
Server running on port 3000
```

Test the health endpoint:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok"}
```

**Keep this terminal open** - the backend server needs to stay running.

---

## Frontend Setup

### Step 1: Install Dependencies

Open a **NEW terminal window/tab** (keep the backend running in the first one):

```bash
cd frontend
npm install
```

### Step 2: Create Environment File

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your text editor

3. Fill in the values:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_public_key_here
   VITE_API_BASE_URL=http://localhost:3000
   ```

   **Replace**:
   - `VITE_SUPABASE_URL`: Your Project URL from Supabase
   - `VITE_SUPABASE_ANON_KEY`: Your anon public key from Supabase
   - Keep `VITE_API_BASE_URL=http://localhost:3000` as is

4. Save the file

### Step 3: Start Frontend Development Server

```bash
npm run dev
```

You should see something like:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

## Running the Application

### Start Both Servers

You need **TWO terminal windows/tabs** open:

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

### Access the Application

Open your browser and go to:
```
http://localhost:5173
```

You should see the landing page with "Find your next game fast" and two buttons.

---

## Manual Testing Checklist

Use this checklist to verify all functionality works:

### ✅ Landing Page
- [ ] Navigate to http://localhost:5173
- [ ] See "Find your next game fast" heading
- [ ] See two buttons: "Get started" and "Log in"
- [ ] Click "Get started" → redirects to Auth page with "Sign Up" selected

### ✅ Authentication
- [ ] **Sign Up**:
  - [ ] Enter email: `test@example.com`
  - [ ] Enter password: `password123`
  - [ ] Click "Sign Up"
  - [ ] Redirects to `/swipe` page
- [ ] **Sign Out**:
  - [ ] Click profile icon (top right)
  - [ ] Click "Sign out"
  - [ ] Redirects to landing page
- [ ] **Log In**:
  - [ ] Click "Log in" from landing page
  - [ ] Enter same credentials
  - [ ] Click "Log In"
  - [ ] Redirects to `/swipe` page

### ✅ Swipe Page
- [ ] See app name "OneNightGames" in header
- [ ] See "Swipe" in center of header
- [ ] See profile icon in top right
- [ ] See "Filters (Coming Soon)" button
- [ ] See a game card with:
  - [ ] Cover image
  - [ ] Game title
  - [ ] Summary text
  - [ ] Playtime (e.g., "~90-120 min")
  - [ ] Platform badges (e.g., PC, Switch)
  - [ ] Co-op type badge
- [ ] Three buttons at bottom: Ignore, Interested, Play Now

### ✅ Swipe Actions
- [ ] **Ignore**:
  - [ ] Click "Ignore"
  - [ ] Card disappears, new game loads
  - [ ] Repeat 2-3 times
- [ ] **Interested**:
  - [ ] Click "Interested"
  - [ ] Card disappears, new game loads
  - [ ] Note the game title for later verification
- [ ] **Play Now**:
  - [ ] Click "Play Now" on a game
  - [ ] Redirects to `/session/:id` page

### ✅ Session Page - Planned State
- [ ] See game cover, title, and details
- [ ] Status badge shows "planned"
- [ ] See two buttons: "Start Session" and "Back to Swipe"
- [ ] Click "Back to Swipe" → returns to swipe page
- [ ] Navigate back to session page (or click Play Now again)
- [ ] Click "Start Session"

### ✅ Session Page - Active State
- [ ] Status badge changes to "active"
- [ ] See "Elapsed time" with a timer (e.g., "0h 0m 5s")
- [ ] Timer updates every second
- [ ] See "End Session" button
- [ ] Wait a few seconds to see timer update
- [ ] Click "End Session"

### ✅ Session Page - Ended State & Rating
- [ ] Status badge changes to "ended"
- [ ] See "Rate This Session" button
- [ ] Click "Rate This Session"
- [ ] See rating form with:
  - [ ] "Did you finish the game?" (Yes/No)
  - [ ] "How fun was it?" (1-5)
  - [ ] "How much friction/frustration?" (1-5)
  - [ ] "Would you play again?" (Yes/No)
- [ ] Fill out the form (select any values)
- [ ] Click "Submit Rating"
- [ ] Redirects to Dashboard

### ✅ Dashboard - Interested Tab
- [ ] See "Welcome, [your email]" greeting
- [ ] See "Start Swiping" button
- [ ] See segmented control with "Interested" and "Past Sessions"
- [ ] "Interested" tab is selected by default
- [ ] See games you marked as "Interested" (including the one from earlier)
- [ ] Each game shows:
  - [ ] Cover image
  - [ ] Title and summary
  - [ ] Platform badges
  - [ ] "Play Now" button
- [ ] Click "Play Now" on an interested game
- [ ] Creates new session and redirects to session page

### ✅ Dashboard - Past Sessions Tab
- [ ] Navigate back to Dashboard
- [ ] Click "Past Sessions" tab
- [ ] See sessions you've started (including the one you just rated)
- [ ] Each session shows:
  - [ ] Game cover and title
  - [ ] Start date
  - [ ] "Completed" badge
  - [ ] Rating badges if you rated it (e.g., "Fun: 5/5")
- [ ] Click on a past session
- [ ] Redirects to session detail page

### ✅ Active Session Banner
- [ ] From Dashboard, click "Start Swiping"
- [ ] Swipe to a game and click "Play Now"
- [ ] Click "Start Session"
- [ ] **DO NOT end the session**
- [ ] Navigate to Dashboard
- [ ] See yellow banner at top: "You have an active session: [Game Name]"
- [ ] Click "Continue" button
- [ ] Redirects to active session page
- [ ] End the session to clean up

### ✅ Profile Menu
- [ ] Click profile icon from any authenticated page
- [ ] See dropdown menu with:
  - [ ] "Dashboard"
  - [ ] "Swipe"
  - [ ] "Sign out"
- [ ] Test each menu item
- [ ] Sign out to return to landing page

### ✅ Protected Routes
- [ ] While signed out, try to navigate to http://localhost:5173/swipe
- [ ] Should redirect to auth page
- [ ] Same for `/dashboard` and any `/session/:id`

### ✅ All Games Swiped
- [ ] Log back in
- [ ] Swipe through ALL remaining games (keep clicking Ignore or Interested)
- [ ] After the last game, should see: "No more games!"
- [ ] See message: "You've swiped through all available games."
- [ ] See "Go to Dashboard" button

---

## Troubleshooting

### Common Issues

#### 1. CORS Error in Browser Console
**Symptom**: Error like "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution**:
- Check that backend `.env` has `CORS_ORIGIN=http://localhost:5173`
- Restart the backend server after changing `.env`
- Verify frontend is running on port 5173 (check the terminal output)

#### 2. "Invalid JWT" or "Authentication failed"
**Symptom**: Can't access authenticated pages, or API calls fail

**Solution**:
- Verify `SUPABASE_URL` matches in both frontend and backend `.env` files
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct in backend `.env`
- Verify `VITE_SUPABASE_ANON_KEY` is correct in frontend `.env`
- Log out and log back in
- Check that you copied the FULL key (they're very long, starting with `eyJhbGc...`)

#### 3. "Module not found" or Import Errors
**Symptom**: Errors about missing modules

**Solution**:
```bash
# In backend directory
cd backend
rm -rf node_modules
npm install

# In frontend directory
cd frontend
rm -rf node_modules
npm install
```

#### 4. RLS Policy Error
**Symptom**: "Row level security policy violation" in console

**Solution**:
- Go to Supabase SQL Editor
- Re-run `001_create_tables.sql` migration
- Make sure you're logged in when testing

#### 5. No Games Loading / Database Empty
**Symptom**: "No more games" message immediately on swipe page

**Solution**:
- Go to Supabase Table Editor
- Check `games` table has 20 rows
- If empty, re-run `002_seed_games.sql` migration

#### 6. Backend Won't Start
**Symptom**: `npm run dev` fails in backend

**Solution**:
- Check that `.env` file exists in `backend/` directory
- Verify all environment variables are set
- Make sure port 3000 is not already in use:
  ```bash
  # On Mac/Linux:
  lsof -ti:3000 | xargs kill -9

  # On Windows:
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

#### 7. Frontend Shows Blank Page
**Symptom**: Browser shows blank white page

**Solution**:
- Open browser console (F12) and check for errors
- Verify `.env` file exists in `frontend/` directory
- Make sure backend is running
- Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

#### 8. Styles Not Loading / Page Looks Broken
**Symptom**: No colors, buttons not styled

**Solution**:
- Verify Tailwind is installed: `npm list tailwindcss` in frontend directory
- Check `frontend/src/index.css` contains Tailwind directives
- Restart the frontend dev server
- Clear browser cache and hard refresh

---

## Environment Variables Reference

### Backend `.env`:
```env
SUPABASE_URL=              # From Supabase → Settings → API → Project URL
SUPABASE_SERVICE_ROLE_KEY= # From Supabase → Settings → API → service_role key
PORT=3000                  # Port for backend server
CORS_ORIGIN=http://localhost:5173  # Frontend URL
```

### Frontend `.env`:
```env
VITE_SUPABASE_URL=         # From Supabase → Settings → API → Project URL
VITE_SUPABASE_ANON_KEY=    # From Supabase → Settings → API → anon public key
VITE_API_BASE_URL=http://localhost:3000  # Backend URL
```

---

## Next Steps After Milestone 1

Once you've verified everything works, here are potential next steps:

1. **Add Filters**: Implement actual filtering by playtime, platform, and co-op type
2. **Personalization**: Improve recommendation algorithm based on user preferences
3. **External APIs**: Integrate RAWG or IGDB for more games and better data
4. **Session Analytics**: Add charts and insights on Dashboard
5. **Social Features**: Share sessions, friend recommendations
6. **Mobile App**: Build React Native version

---

## Getting Help

If you encounter issues not covered in this guide:

1. Check browser console for errors (F12)
2. Check backend terminal for error messages
3. Verify all environment variables are set correctly
4. Try the troubleshooting section above
5. Review the code comments in key files

---

## Summary of Commands

Quick reference for starting the app:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Open browser to:
http://localhost:5173
```

That's it! Happy swiping! 🎮
