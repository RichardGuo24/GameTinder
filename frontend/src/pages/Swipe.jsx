import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileMenu } from '../components/ProfileMenu';
import { getNextRecommendation, recordSwipe, createSession } from '../lib/api';

export function Swipe() {
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNextGame();
  }, []);

  async function loadNextGame() {
    try {
      setLoading(true);
      setError('');
      const nextGame = await getNextRecommendation();
      if (nextGame.done) {
        setGame(null);
      } else {
        setGame(nextGame);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleIgnore() {
    if (!game) return;
    try {
      await recordSwipe(game.id, 'ignore');
      loadNextGame();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleInterested() {
    if (!game) return;
    try {
      await recordSwipe(game.id, 'interested');
      loadNextGame();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePlayNow() {
    if (!game) return;
    try {
      const { sessionId } = await createSession(game.id);
      navigate(`/session/${sessionId}`);
    } catch (err) {
      setError(err.message);
    }
  }

  function formatPlaytime(minMinutes, maxMinutes) {
    if (minMinutes < 60 && maxMinutes < 60) {
      return `${minMinutes}-${maxMinutes} min`;
    } else if (minMinutes >= 60 && maxMinutes >= 60) {
      return `${Math.round(minMinutes / 60)}-${Math.round(maxMinutes / 60)} hrs`;
    } else {
      return `${minMinutes} min - ${Math.round(maxMinutes / 60)} hrs`;
    }
  }

  function formatCoopType(type) {
    if (!type) return 'Solo';
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white border-b border-surface-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-surface-900">GameMatch</span>
          </div>
          <ProfileMenu />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {/* Filters placeholder */}
        <div className="mb-5">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white rounded-full text-sm font-medium text-surface-600 shadow-soft hover:shadow-card transition-shadow">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters</span>
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="card p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-surface-100 rounded-full mb-4">
              <svg className="animate-spin h-5 w-5 text-surface-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <p className="text-surface-500">Finding your next game...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl mb-4">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !game && (
          <div className="card p-10 text-center">
            <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-surface-900 mb-2">All caught up!</h2>
            <p className="text-surface-500 mb-6">
              You've swiped through all available games.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
            >
              View your library
            </button>
          </div>
        )}

        {/* Game card */}
        {!loading && game && (
          <div className="card overflow-hidden">
            {/* Image section */}
            <div className="relative aspect-[4/5] bg-surface-200">
              <img
                src={game.cover_url}
                alt={game.title}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Title overlay at bottom of image */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h2 className="text-2xl font-bold text-white mb-2">{game.title}</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatPlaytime(game.minutes_min, game.minutes_max)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {formatCoopType(game.coop_type)}
                  </span>
                </div>
              </div>
            </div>

            {/* Content section */}
            <div className="p-5">
              <p className="text-surface-600 text-sm leading-relaxed mb-4">{game.summary}</p>

              {/* Platforms */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {game.platforms?.map((platform) => (
                  <span
                    key={platform}
                    className="badge badge-neutral text-xs"
                  >
                    {platform}
                  </span>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleIgnore}
                  className="flex-1 py-3.5 rounded-2xl bg-surface-100 text-surface-600 font-semibold hover:bg-surface-200 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Pass</span>
                </button>
                <button
                  onClick={handleInterested}
                  className="flex-1 py-3.5 rounded-2xl bg-primary-50 text-primary-600 font-semibold hover:bg-primary-100 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>Save</span>
                </button>
                <button
                  onClick={handlePlayNow}
                  className="flex-1 py-3.5 rounded-2xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                  <span>Play</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
