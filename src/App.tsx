import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import Login from './components/Login';
import VerifyLogin from './components/VerifyLogin';
import UserBrackets from './components/UserBrackets';
import UserBracketsByEmail from './components/UserBracketsByEmail';
import IntegratedBracketContainer from './components/IntegratedBracketContainer';
import BracketEdit from './components/BracketEdit';
import BracketView from './components/BracketView';
import SuccessPage from './components/SuccessPage';
import AdminDashboard from './components/admin/AdminDashboard';
import StandingsPage from './components/StandingsPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { authServices } from './services/api';

// Route guard for Admin Routes
const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const checkAdmin = async () => {
      try {
        // Check if user is logged in
        if (!authServices.isLoggedIn()) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        // Check if user is admin
        const result = await authServices.isAdmin();
        setIsAdmin(result.isAdmin);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAdmin ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-gray-50">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/verify" element={<VerifyLogin />} />
            <Route path="/entry" element={<IntegratedBracketContainer />} />
            <Route path="/brackets" element={<UserBrackets />} />
            <Route path="/user/brackets/:email" element={<UserBracketsByEmail />} />
            <Route path="/bracket/edit/:id" element={<BracketEdit />} />
            <Route path="/bracket/view/:id" element={<BracketView />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/standings" element={<StandingsPage />} />
            
            {/* Admin routes */}
            <Route 
              path="/admin/*" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            
            {/* Catch-all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;