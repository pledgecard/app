import React from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { CampaignDetails } from './pages/CampaignDetails';
import { Dashboard } from './pages/Dashboard';
import { CreateCampaign } from './pages/CreateCampaign';
import { AdminDashboard } from './pages/AdminDashboard';
import { Campaigns } from './pages/Campaigns';
import { Auth } from './pages/Auth';
import { Footer } from './components/Footer';

const AuthListener: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleAuth = async () => {
      // Check if we have OAuth tokens in the hash
      if (window.location.hash.includes('access_token')) {
        console.log('OAuth tokens detected in URL hash');

        try {
          // Parse the hash - format should be: #access_token=...&refresh_token=...
          const hash = window.location.hash.substring(1); // remove leading #
          const params = new URLSearchParams(hash);

          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');

          if (access_token && refresh_token) {
            console.log('Setting session with OAuth tokens...');
            const { data, error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (!error && data.session) {
              console.log('Session established successfully!');
              // Clean the hash and navigate to dashboard
              window.history.replaceState(null, '', window.location.pathname + '#/dashboard');
              navigate('/dashboard', { replace: true });
            } else {
              console.error('Failed to set session:', error);
            }
          }
        } catch (e) {
          console.error('Error parsing OAuth tokens:', e);
        }
        return;
      }

      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('Existing session found');
      }
    };

    handleAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email || 'no user');

      if (event === 'SIGNED_IN' && session) {
        // Only navigate if we're not already on dashboard
        if (!window.location.hash.includes('/dashboard')) {
          console.log('User signed in, navigating to dashboard');
          navigate('/dashboard', { replace: true });
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        navigate('/login', { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthListener />
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/campaign/:id" element={<CampaignDetails />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create" element={<CreateCampaign />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/login" element={<Auth />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;