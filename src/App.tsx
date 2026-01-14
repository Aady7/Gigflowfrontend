import { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import GigList from './components/GigList';
import CreateGigForm from './components/CreateGigForm';
import { authService } from './services/authService';
import type { User } from './services/authService';

type View = 'login' | 'register';
type DashboardView = 'gigs' | 'create';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('login');
  const [dashboardView, setDashboardView] = useState<DashboardView>('gigs');
  const [gigListKey, setGigListKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user session on mount
  useEffect(() => {
    const restoreSession = async () => {
      setIsLoading(true);
      // First, try to get user from localStorage (fast)
      const storedUser = authService.getUserFromStorage();
      if (storedUser) {
        setUser(storedUser);
        // Then verify with backend
        const verifiedUser = await authService.getCurrentUser();
        if (verifiedUser) {
          setUser(verifiedUser);
        } else {
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    // User is already saved to localStorage in authService.login
  };

  const handleRegisterSuccess = (userData: User) => {
    setUser(userData);
    // User is already saved to localStorage in authService.register
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentView('login');
    setDashboardView('gigs');
  };

  const handleGigCreated = () => {
    setDashboardView('gigs');
    setGigListKey((prev) => prev + 1); // Force GigList to refresh
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">GigFlow</h1>
                <p className="text-sm text-gray-500">Welcome, {user.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {dashboardView === 'gigs' ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Browse Gigs</h2>
                <button
                  onClick={() => setDashboardView('create')}
                  className="px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg shadow-sm transition duration-200"
                >
                  + Create New Gig
                </button>
              </div>
              <GigList key={gigListKey} onGigCreated={handleGigCreated} currentUser={user} />
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <button
                  onClick={() => setDashboardView('gigs')}
                  className="text-gray-600 hover:text-gray-800 font-medium mb-4 flex items-center gap-2 transition"
                >
                  ← Back to Gigs
                </button>
                <h2 className="text-2xl font-semibold text-gray-800">Create New Gig</h2>
              </div>
              <CreateGigForm
                onGigCreated={handleGigCreated}
                onCancel={() => setDashboardView('gigs')}
              />
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      {currentView === 'login' ? (
        <LoginForm
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setCurrentView('register')}
        />
      ) : (
        <RegisterForm
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setCurrentView('login')}
        />
      )}
    </div>
  );
}

export default App
