import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProfileMenu } from '../components/ProfileMenu';
import { getDashboard, createSession, deleteSwipe, deleteSession } from '../lib/api';

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

  async function handleRemoveSaved(gameId) {
    try {
      await deleteSwipe(gameId);
      loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteSession(sessionId) {
    try {
      await deleteSession(sessionId);
      loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  }

  // Get first name or email prefix for greeting
  const displayName = user?.email?.split('@')[0] || 'there';

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
          <p className="text-surface-500">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white border-b border-surface-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
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

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-surface-900 mb-1">
            Hey, {displayName}
          </h1>
          <p className="text-surface-500">Ready to play something?</p>
        </div>

        {/* Quick action */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/swipe')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
            Discover games
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl mb-6">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Active session banner */}
        {data?.activeSession && (
          <div className="card p-4 mb-6 bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-4">
              <img
                src={data.activeSession.games.cover_url}
                alt={data.activeSession.games.title}
                className="w-16 h-16 rounded-2xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-800 mb-0.5">Currently playing</p>
                <p className="font-semibold text-surface-900 truncate">{data.activeSession.games.title}</p>
              </div>
              <button
                onClick={() => navigate(`/session/${data.activeSession.id}`)}
                className="px-4 py-2 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="card overflow-hidden">
          {/* Segmented control */}
          <div className="p-1.5 bg-surface-100 m-4 rounded-2xl flex">
            <button
              onClick={() => setTab('interested')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                tab === 'interested'
                  ? 'bg-white text-surface-900 shadow-soft'
                  : 'text-surface-500 hover:text-surface-700'
              }`}
            >
              Saved ({data?.interestedGames?.length || 0})
            </button>
            <button
              onClick={() => setTab('past')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                tab === 'past'
                  ? 'bg-white text-surface-900 shadow-soft'
                  : 'text-surface-500 hover:text-surface-700'
              }`}
            >
              History ({data?.pastSessions?.length || 0})
            </button>
          </div>

          {/* Content */}
          <div className="px-4 pb-4">
            {tab === 'interested' && (
              <div>
                {!data?.interestedGames || data.interestedGames.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-7 h-7 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <p className="text-surface-500 mb-4">No saved games yet</p>
                    <button onClick={() => navigate('/swipe')} className="btn-secondary text-sm">
                      Start swiping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.interestedGames.map((game) => (
                      <div
                        key={game.id}
                        className="flex gap-4 p-3 rounded-2xl hover:bg-surface-50 transition-colors group"
                      >
                        <img
                          src={game.cover_url}
                          alt={game.title}
                          className="w-20 h-28 object-cover rounded-xl flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0 py-1">
                          <h3 className="font-semibold text-surface-900 mb-1 truncate">{game.title}</h3>
                          <p className="text-sm text-surface-500 line-clamp-2 mb-3">
                            {game.summary}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {game.platforms?.slice(0, 3).map((platform) => (
                              <span
                                key={platform}
                                className="badge badge-neutral text-xs"
                              >
                                {platform}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRemoveSaved(game.id)}
                            className="p-3 bg-surface-100 text-surface-500 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove from saved"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handlePlayNow(game.id)}
                            className="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            </svg>
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
                  <div className="text-center py-12">
                    <div className="w-14 h-14 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-7 h-7 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-surface-500">No play history yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.pastSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex gap-4 p-3 rounded-2xl hover:bg-surface-50 transition-colors group"
                      >
                        <img
                          src={session.games.cover_url}
                          alt={session.games.title}
                          className="w-20 h-28 object-cover rounded-xl flex-shrink-0 cursor-pointer"
                          onClick={() => navigate(`/session/${session.id}`)}
                        />
                        <div
                          className="flex-1 min-w-0 py-1 cursor-pointer"
                          onClick={() => navigate(`/session/${session.id}`)}
                        >
                          <h3 className="font-semibold text-surface-900 mb-1 truncate">
                            {session.games.title}
                          </h3>
                          <p className="text-sm text-surface-500 mb-2">
                            {new Date(session.started_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {session.ended_at ? (
                              <span className="badge bg-green-50 text-green-600 text-xs">
                                Completed
                              </span>
                            ) : (
                              <span className="badge bg-amber-50 text-amber-600 text-xs">
                                In progress
                              </span>
                            )}
                            {session.rating_fun && (
                              <span className="badge badge-primary text-xs">
                                Fun: {session.rating_fun}/5
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteSession(session.id)}
                            className="p-3 bg-surface-100 text-surface-500 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete from history"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <div
                            className="text-surface-300 cursor-pointer"
                            onClick={() => navigate(`/session/${session.id}`)}
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
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
