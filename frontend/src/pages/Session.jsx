import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProfileMenu } from '../components/ProfileMenu';
import { getSession, startSession, endSession, rateSession } from '../lib/api';

export function Session() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [elapsedTime, setElapsedTime] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState({
    finished: null,
    rating_fun: null,
    rating_friction: null,
    would_play_again: null
  });

  useEffect(() => {
    loadSession();
  }, [id]);

  useEffect(() => {
    if (session?.status === 'active' && session?.started_at) {
      const interval = setInterval(() => {
        const now = new Date();
        const started = new Date(session.started_at);
        const diff = Math.floor((now - started) / 1000);
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [session]);

  async function loadSession() {
    try {
      setLoading(true);
      const data = await getSession(id);
      setSession(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStart() {
    try {
      await startSession(id);
      loadSession();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleEnd() {
    try {
      await endSession(id);
      loadSession();
      setShowRating(true);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmitRating() {
    try {
      await rateSession(id, rating);
      navigate('/dashboard');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-surface-100 rounded-full mb-4">
            <svg className="animate-spin h-5 w-5 text-surface-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-surface-500">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-surface-900 mb-2">Session not found</h2>
          <button onClick={() => navigate('/dashboard')} className="btn-primary mt-4">
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  const game = session.games;

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white border-b border-surface-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-surface-500 hover:text-surface-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>
          <ProfileMenu />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl mb-4">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="card overflow-hidden">
          {/* Game image */}
          <div className="relative h-48 bg-surface-200">
            <img
              src={game.cover_url}
              alt={game.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-xl font-bold text-white">{game.title}</h1>
            </div>
          </div>

          <div className="p-5">
            {/* Game info */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="badge badge-neutral text-xs">
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatPlaytime(game.minutes_min, game.minutes_max)}
              </span>
              <span className="badge badge-neutral text-xs">
                {formatCoopType(game.coop_type)}
              </span>
              {game.platforms?.slice(0, 2).map((platform) => (
                <span key={platform} className="badge badge-neutral text-xs">
                  {platform}
                </span>
              ))}
            </div>

            {/* Session status */}
            <div className="mb-6">
              {session.status === 'planned' && (
                <div className="text-center py-4">
                  <span className="badge bg-blue-50 text-blue-600 text-sm mb-3">
                    Ready to play
                  </span>
                  <p className="text-surface-500 text-sm">Start a session to track your playtime</p>
                </div>
              )}

              {session.status === 'active' && (
                <div className="text-center py-4">
                  <span className="badge bg-green-50 text-green-600 text-sm mb-3">
                    Now playing
                  </span>
                  {elapsedTime && (
                    <div className="mt-3">
                      <p className="text-xs text-surface-500 uppercase tracking-wide mb-1">Elapsed time</p>
                      <p className="text-3xl font-mono font-bold text-surface-900">{elapsedTime}</p>
                    </div>
                  )}
                </div>
              )}

              {session.status === 'ended' && !showRating && (
                <div className="text-center py-4">
                  <span className="badge bg-surface-100 text-surface-600 text-sm mb-3">
                    Session complete
                  </span>
                  {session.rating_fun && (
                    <div className="mt-3 flex justify-center gap-3">
                      <span className="badge badge-primary">Fun: {session.rating_fun}/5</span>
                      {session.finished !== null && (
                        <span className="badge badge-neutral">
                          {session.finished ? 'Finished' : 'Not finished'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            {session.status === 'planned' && (
              <div className="space-y-3">
                <button onClick={handleStart} className="btn-primary w-full">
                  <svg className="w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                  Start session
                </button>
                <button onClick={() => navigate('/swipe')} className="btn-secondary w-full">
                  Back to swiping
                </button>
              </div>
            )}

            {session.status === 'active' && (
              <button
                onClick={handleEnd}
                className="w-full py-3.5 bg-surface-900 text-white font-semibold rounded-2xl hover:bg-surface-800 transition-colors"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                End session
              </button>
            )}

            {session.status === 'ended' && !showRating && !session.rating_fun && (
              <div className="space-y-3">
                <button onClick={() => setShowRating(true)} className="btn-primary w-full">
                  Rate this session
                </button>
                <button onClick={() => navigate('/dashboard')} className="btn-secondary w-full">
                  Back to dashboard
                </button>
              </div>
            )}

            {session.status === 'ended' && !showRating && session.rating_fun && (
              <button onClick={() => navigate('/dashboard')} className="btn-primary w-full">
                Back to dashboard
              </button>
            )}

            {/* Rating form */}
            {showRating && (
              <div className="space-y-5 pt-2">
                <h3 className="text-lg font-semibold text-surface-900">How was it?</h3>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Did you finish?
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRating({ ...rating, finished: true })}
                      className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                        rating.finished === true
                          ? 'bg-green-500 text-white'
                          : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setRating({ ...rating, finished: false })}
                      className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                        rating.finished === false
                          ? 'bg-surface-900 text-white'
                          : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                      }`}
                    >
                      Not yet
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    How fun was it?
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => setRating({ ...rating, rating_fun: val })}
                        className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                          rating.rating_fun === val
                            ? 'bg-primary-500 text-white'
                            : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    How frustrating?
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => setRating({ ...rating, rating_friction: val })}
                        className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                          rating.rating_friction === val
                            ? 'bg-amber-500 text-white'
                            : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Would you play again?
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRating({ ...rating, would_play_again: true })}
                      className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                        rating.would_play_again === true
                          ? 'bg-green-500 text-white'
                          : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                      }`}
                    >
                      Definitely
                    </button>
                    <button
                      onClick={() => setRating({ ...rating, would_play_again: false })}
                      className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                        rating.would_play_again === false
                          ? 'bg-surface-900 text-white'
                          : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                      }`}
                    >
                      Probably not
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={handleSubmitRating} className="btn-primary flex-1">
                    Submit
                  </button>
                  <button onClick={() => navigate('/dashboard')} className="btn-secondary flex-1">
                    Skip
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
