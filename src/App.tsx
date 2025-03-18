import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './components/HomePage';
import IntegratedBracketContainer from './components/IntegratedBracketContainer';
import SuccessPage from './components/SuccessPage';
import BracketEdit from './components/BracketEdit';
import BracketView from './components/BracketView';
import UserBrackets from './components/UserBrackets';
import UserBracketsByEmail from './components/UserBracketsByEmail';
import Login from './components/Login';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminUpdates from './components/admin/AdminUpdates';
import AdminUpdateForm from './components/admin/AdminUpdateForm';
import { adminAuthServices } from './services/api';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  // Check login status on component mount
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token');
      const loggedIn = Boolean(token);
      setIsLoggedIn(loggedIn);
      
      // Check if user is admin
      if (loggedIn) {
        try {
          const adminStatus = await adminAuthServices.isAdmin();
          setIsAdmin(adminStatus);
        } catch (error) {
          setIsAdmin(false);
        }
      }
    };
    
    // Initial check
    checkLoginStatus();
    
    // Listen for storage events (for when token is added/removed in another tab)
    window.addEventListener('storage', checkLoginStatus);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setIsAdmin(false);
    window.location.href = '/';
  };
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-800 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <svg
                  className="h-8 w-8 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c3.31 0 6-2.69 6-6H6c0 3.31 2.69 6 6 6zm0 2c-3.31 0-6 2.69-6 6h12c0-3.31-2.69-6-6-6z"
                  />
                </svg>
                <Link to="/" className="text-xl font-bold">Basketball Pool 2025</Link>
              </div>
              <div className="flex space-x-4 items-center">
                <Link to="/entry" className="text-white hover:text-blue-200">
                  Enter Bracket
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-white hover:text-blue-200">
                    Admin
                  </Link>
                )}
                {isLoggedIn ? (
                  <>
                    <Link to="/user/brackets" className="text-white hover:text-blue-200">
                      My Brackets
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="px-3 py-1 rounded bg-blue-700 hover:bg-blue-600"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="px-3 py-1 rounded bg-blue-700 hover:bg-blue-600">
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="py-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/entry" element={<IntegratedBracketContainer />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/bracket/edit/:id" element={<BracketEdit />} />
            <Route path="/bracket/view/:id" element={<BracketView />} />
            <Route path="/user/brackets" element={<UserBrackets />} />
            <Route path="/user/brackets/:email" element={<UserBracketsByEmail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/verify" element={<Login />} />
            
            {/* Admin routes */}
            <Route path="/admin/*" element={<AdminDashboard />}>
              <Route path="updates" element={<AdminUpdates />} />
              <Route path="updates/new" element={<AdminUpdateForm />} />
              <Route path="updates/edit/:id" element={<AdminUpdateForm />} />
            </Route>
            
            <Route path="/rules" element={<div className="container mx-auto px-4">Rules Page</div>} />
            <Route path="/contact" element={<div className="container mx-auto px-4">Contact Page</div>} />
            <Route path="/leaderboard" element={<div className="container mx-auto px-4">Leaderboard Page</div>} />
          </Routes>
        </main>

        <footer className="bg-gray-800 text-white py-6">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-sm">© 2025 Basketball Pool. All rights reserved.</p>
              </div>
              <div className="flex space-x-4">
                <Link to="/rules" className="text-gray-300 hover:text-white">Rules</Link>
                <Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link>
                <Link to="/leaderboard" className="text-gray-300 hover:text-white">Leaderboard</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;