import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RequireAuth } from './components/RequireAuth';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Swipe } from './pages/Swipe';
import { Dashboard } from './pages/Dashboard';
import { Session } from './pages/Session';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/swipe"
            element={
              <RequireAuth>
                <Swipe />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/session/:id"
            element={
              <RequireAuth>
                <Session />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
