import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProfileMenu } from '../components/ProfileMenu';
import { getDashboard, createSession } from '../lib/api';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState('interested');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      const dashboardData = await getDashboard();
      setData(dashboardData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePlayNow(gameId) {
    try {
      const { sessionId } = await createSession(gameId);
      navigate(`/session/${sessionId}`);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-bold text-purple-600">OneNightGames</div>
          <div className="text-lg font-semibold">Dashboard</div>
          <ProfileMenu />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {user?.email}
          </h1>
          <button
            onClick={() => navigate('/swipe')}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 font-semibold"
          >
            Start Swiping
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {data?.activeSession && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-yellow-800">
                  You have an active session: {data.activeSession.games.title}
                </p>
                <p className="text-sm text-yellow-600">
                  Started {new Date(data.activeSession.started_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => navigate(`/session/${data.activeSession.id}`)}
                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 font-semibold"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setTab('interested')}
                className={`flex-1 py-4 px-6 font-semibold ${
                  tab === 'interested'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Interested
              </button>
              <button
                onClick={() => setTab('past')}
                className={`flex-1 py-4 px-6 font-semibold ${
                  tab === 'past'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Past Sessions
              </button>
            </div>
          </div>

          <div className="p-6">
            {tab === 'interested' && (
              <div>
                {!data?.interestedGames || data.interestedGames.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No interested games yet. Start swiping to build your library!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {data.interestedGames.map((game) => (
                      <div
                        key={game.id}
                        className="flex gap-4 border rounded-lg p-4 hover:shadow-md transition"
                      >
                        <img
                          src={game.cover_url}
                          alt={game.title}
                          className="w-24 h-32 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{game.title}</h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {game.summary}
                          </p>
                          <div className="flex gap-2">
                            {game.platforms?.map((platform) => (
                              <span
                                key={platform}
                                className="bg-gray-100 px-2 py-1 rounded text-xs"
                              >
                                {platform}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <button
                            onClick={() => handlePlayNow(game.id)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 font-semibold whitespace-nowrap"
                          >
                            Play Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'past' && (
              <div>
                {!data?.pastSessions || data.pastSessions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No past sessions yet. Start playing games to see your history!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {data.pastSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex gap-4 border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                        onClick={() => navigate(`/session/${session.id}`)}
                      >
                        <img
                          src={session.games.cover_url}
                          alt={session.games.title}
                          className="w-24 h-32 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">
                            {session.games.title}
                          </h3>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-600">
                              Started: {new Date(session.started_at).toLocaleDateString()}
                            </p>
                            {session.ended_at ? (
                              <>
                                <p className="text-gray-600">
                                  Ended: {new Date(session.ended_at).toLocaleDateString()}
                                </p>
                                <div className="flex gap-2 mt-2">
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                    Completed
                                  </span>
                                  {session.finished !== null && (
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                      {session.finished ? 'Finished' : 'Not Finished'}
                                    </span>
                                  )}
                                  {session.rating_fun && (
                                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                      Fun: {session.rating_fun}/5
                                    </span>
                                  )}
                                </div>
                              </>
                            ) : (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs inline-block">
                                Incomplete
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
