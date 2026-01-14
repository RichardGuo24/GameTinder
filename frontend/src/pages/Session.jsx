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
        setElapsedTime(`${hours}h ${minutes}m ${seconds}s`);
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
      return `~${minMinutes}-${maxMinutes} min`;
    } else if (minMinutes >= 60 && maxMinutes >= 60) {
      return `${Math.round(minMinutes / 60)}-${Math.round(maxMinutes / 60)} hrs`;
    } else {
      return `${minMinutes} min - ${Math.round(maxMinutes / 60)} hrs`;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Session not found</div>
      </div>
    );
  }

  const game = session.games;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-bold text-purple-600">OneNightGames</div>
          <div className="text-lg font-semibold">Session</div>
          <ProfileMenu />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <img
            src={game.cover_url}
            alt={game.title}
            className="w-full h-64 object-cover"
          />
          <div className="p-6">
            <h2 className="text-3xl font-bold mb-3">{game.title}</h2>
            <p className="text-gray-700 mb-4">{game.summary}</p>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Playtime:</span>
                <span>{formatPlaytime(game.minutes_min, game.minutes_max)}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold">Co-op:</span>
                <span>{game.coop_type?.replace('_', ' ')}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold">Platforms:</span>
                <div className="flex gap-2">
                  {game.platforms?.map((platform) => (
                    <span
                      key={platform}
                      className="bg-gray-100 px-2 py-1 rounded text-sm"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold">Status:</span>
                <span className="bg-purple-100 px-2 py-1 rounded text-sm">
                  {session.status}
                </span>
              </div>

              {session.status === 'active' && elapsedTime && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Elapsed time:</span>
                  <span className="text-purple-600 font-mono">{elapsedTime}</span>
                </div>
              )}
            </div>

            {session.status === 'planned' && (
              <div className="flex gap-3">
                <button
                  onClick={handleStart}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 font-semibold"
                >
                  Start Session
                </button>
                <button
                  onClick={() => navigate('/swipe')}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-md hover:bg-gray-300 font-semibold"
                >
                  Back to Swipe
                </button>
              </div>
            )}

            {session.status === 'active' && (
              <button
                onClick={handleEnd}
                className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 font-semibold"
              >
                End Session
              </button>
            )}

            {session.status === 'ended' && !showRating && (
              <div className="space-y-4">
                <p className="text-center text-gray-600">Session ended</p>
                <button
                  onClick={() => setShowRating(true)}
                  className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 font-semibold"
                >
                  Rate This Session
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-md hover:bg-gray-300 font-semibold"
                >
                  Back to Dashboard
                </button>
              </div>
            )}

            {showRating && (
              <div className="space-y-4 border-t pt-6 mt-6">
                <h3 className="text-xl font-bold">Rate your session</h3>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Did you finish the game?
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRating({ ...rating, finished: true })}
                      className={`flex-1 py-2 rounded ${
                        rating.finished === true
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setRating({ ...rating, finished: false })}
                      className={`flex-1 py-2 rounded ${
                        rating.finished === false
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    How fun was it? (1-5)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => setRating({ ...rating, rating_fun: val })}
                        className={`flex-1 py-2 rounded ${
                          rating.rating_fun === val
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    How much friction/frustration? (1-5)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => setRating({ ...rating, rating_friction: val })}
                        className={`flex-1 py-2 rounded ${
                          rating.rating_friction === val
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Would you play again?
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setRating({ ...rating, would_play_again: true })
                      }
                      className={`flex-1 py-2 rounded ${
                        rating.would_play_again === true
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() =>
                        setRating({ ...rating, would_play_again: false })
                      }
                      className={`flex-1 py-2 rounded ${
                        rating.would_play_again === false
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSubmitRating}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 font-semibold"
                  >
                    Submit Rating
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-md hover:bg-gray-300 font-semibold"
                  >
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
