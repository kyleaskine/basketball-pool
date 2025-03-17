import React from 'react';
import BasketballPoolEntryForm from './BasketballPoolEntryForm';

const App: React.FC = () => {
  return (
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
              <h1 className="text-xl font-bold">Basketball Pool 2025</h1>
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
        <BasketballPoolEntryForm />
      </main>

      <footer className="bg-gray-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">© 2025 Basketball Pool. All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
              <a href="/rules" className="text-gray-300 hover:text-white">Rules</a>
              <a href="/contact" className="text-gray-300 hover:text-white">Contact</a>
              <a href="/leaderboard" className="text-gray-300 hover:text-white">Leaderboard</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;