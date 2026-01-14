import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/swipe');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center text-white">
        <h1 className="text-5xl font-bold mb-6">Find your next game fast</h1>
        <p className="text-xl mb-8 opacity-90">
          Works for quick sessions and longer games — filter by playtime, platform, and co-op.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/auth?mode=signup')}
            className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Get started
          </button>
          <button
            onClick={() => navigate('/auth?mode=login')}
            className="bg-transparent border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}
