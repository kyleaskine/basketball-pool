import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import IntegratedBracketContainer from './components/IntegratedBracketContainer';
import SuccessPage from './components/SuccessPage';

const App: React.FC = () => {
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
              <div>
                <button className="px-3 py-1 rounded bg-blue-700 hover:bg-blue-600">
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="py-4">
          <Routes>
            <Route path="/" element={<IntegratedBracketContainer />} />
            <Route path="/success" element={<SuccessPage />} />
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