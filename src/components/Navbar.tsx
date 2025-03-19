import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authServices } from '../services/api';
import api from '../services/api';

const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isTournamentLocked, setIsTournamentLocked] = useState<boolean>(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check login status
    const checkLoginStatus = async () => {
      const loggedIn = authServices.isLoggedIn();
      setIsLoggedIn(loggedIn);
      
      // If logged in, check if admin
      if (loggedIn) {
        try {
          const adminCheck = await authServices.isAdmin();
          setIsAdmin(adminCheck.isAdmin);
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }
    };
    
    // Check tournament lock status
    const checkTournamentStatus = async () => {
      try {
        const response = await api.get('/tournament/status');
        setIsTournamentLocked(response.data.isLocked);
      } catch (error) {
        // If we can't determine lock status, default to unlocked
        console.error('Error checking tournament status:', error);
        setIsTournamentLocked(false);
      }
    };
    
    checkLoginStatus();
    checkTournamentStatus();
  }, []);
  
  const handleLogout = () => {
    authServices.logout();
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate('/');
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <nav className="bg-blue-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-white font-bold text-xl">
                Kyle's Basketball Pool 2025
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              <Link to="/" className="text-gray-300 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              
              {/* Only show Entry link if tournament is not locked */}
              {!isTournamentLocked && (
                <Link to="/entry" className="text-gray-300 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Enter Bracket
                </Link>
              )}
              
              <Link to="/standings" className="text-gray-300 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Standings
              </Link>
              {isLoggedIn && (
                <Link to="/brackets" className="text-gray-300 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  My Brackets
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="text-gray-300 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                className="text-gray-300 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className="text-gray-300 hover:bg-blue-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          
          {/* Only show Entry link if tournament is not locked */}
          {!isTournamentLocked && (
            <Link
              to="/entry"
              className="text-gray-300 hover:bg-blue-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Enter Bracket
            </Link>
          )}
          
          <Link
            to="/standings"
            className="text-gray-300 hover:bg-blue-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            Standings
          </Link>
          {isLoggedIn && (
            <Link
              to="/brackets"
              className="text-gray-300 hover:bg-blue-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              My Brackets
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className="text-gray-300 hover:bg-blue-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Admin
            </Link>
          )}
          {isLoggedIn ? (
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="text-gray-300 hover:bg-blue-700 hover:text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium"
            >
              Sign Out
            </button>
          ) : (
            <Link
              to="/login"
              className="text-gray-300 hover:bg-blue-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;