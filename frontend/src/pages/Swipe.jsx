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
      return `~${minMinutes}-${maxMinutes} min`;
    } else if (minMinutes >= 60 && maxMinutes >= 60) {
      return `${Math.round(minMinutes / 60)}-${Math.round(maxMinutes / 60)} hrs`;
    } else {
      return `${minMinutes} min - ${Math.round(maxMinutes / 60)} hrs`;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-bold text-purple-600">OneNightGames</div>
          <div className="text-lg font-semibold">Swipe</div>
          <ProfileMenu />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-4">
          <button className="bg-white px-4 py-2 rounded-md shadow hover:shadow-md">
            Filters (Coming Soon)
          </button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="text-lg">Loading...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {!loading && !game && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">No more games!</h2>
            <p className="text-gray-600 mb-4">
              You've swiped through all available games.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {!loading && game && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <img
              src={game.cover_url}
              alt={game.title}
              className="w-full h-96 object-cover"
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
                  <span className="font-semibold">Co-op:</span>
                  <span className="bg-blue-100 px-2 py-1 rounded text-sm">
                    {game.coop_type?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleIgnore}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-md hover:bg-gray-300 font-semibold"
                >
                  Ignore
                </button>
                <button
                  onClick={handleInterested}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 font-semibold"
                >
                  Interested
                </button>
                <button
                  onClick={handlePlayNow}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 font-semibold"
                >
                  Play Now
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
