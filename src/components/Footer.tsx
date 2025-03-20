import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { authServices } from "../services/api";

const Footer: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const loggedIn = authServices.isLoggedIn();
      setIsLoggedIn(loggedIn);
    };

    checkLoginStatus();
  }, []);

  return (
    <footer className="bg-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold">March Madness 2025</h2>
            <p className="text-sm text-gray-300 mt-1">
              The ultimate basketball bracket challenge
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            <div>
              <h3 className="font-semibold mb-2">Quick Links</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/"
                    className="text-gray-300 hover:text-white text-sm"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/entry"
                    className="text-gray-300 hover:text-white text-sm"
                  >
                    Enter Bracket
                  </Link>
                </li>
                <li>
                  <Link
                    to="/standings"
                    className="text-gray-300 hover:text-white text-sm"
                  >
                    Standings
                  </Link>
                </li>
                <li>
                  <Link
                    to="/prizes"
                    className="text-gray-300 hover:text-white text-sm"
                  >
                    Prizes
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Account</h3>
              <ul className="space-y-1">
                {isLoggedIn ? (
                  <li>
                    <Link
                      to="/brackets"
                      className="text-gray-300 hover:text-white text-sm"
                    >
                      My Brackets
                    </Link>
                  </li>
                ) : (
                  <li>
                    <Link
                      to="/login"
                      className="text-gray-300 hover:text-white text-sm"
                    >
                      Sign In
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-blue-700 text-center text-sm text-gray-300">
          <p>&copy; {currentYear} Kyle Askine</p>
          <p className="mt-1">
            Tournament games: March 20-April 7, 2025 • Championship: April 7 at
            Alamodome
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
