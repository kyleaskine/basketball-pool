import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import api from "./services/api";
import HomePage from "./components/HomePage";
import Login from "./components/Login";
import VerifyLogin from "./components/VerifyLogin";
import UserBrackets from "./components/UserBrackets";
import UserBracketsByEmail from "./components/UserBracketsByEmail";
import IntegratedBracketContainer from "./components/IntegratedBracketContainer";
import BracketEdit from "./components/BracketEdit";
import BracketView from "./components/BracketView";
import SuccessPage from "./components/SuccessPage";
import AdminDashboard from "./components/admin/AdminDashboard";
import StandingsPage from "./components/StandingsPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { authServices } from "./services/api";
import TournamentResultsView from "./components/TournamentResultsView";
import PrizesPage from "./components/PrizesPage";

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
        console.error("Error checking admin status:", error);
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

const TournamentGuard = ({ children }: { children: React.ReactElement }) => {
  const [isLocked, setIsLocked] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkTournamentStatus = async () => {
      try {
        const response = await api.get("/tournament/status");
        setIsLocked(response.data.isLocked);
      } catch (error) {
        // If we can't determine status, allow access
        console.error("Error checking tournament status:", error);
        setIsLocked(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkTournamentStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isLocked ? <Navigate to="/locked" /> : children;
};

// Create a component to show when tournament is locked
const TournamentLocked: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
        <h2 className="text-xl font-bold mb-2">Tournament Locked</h2>
        <p>
          The tournament has started and bracket submissions are now closed.
        </p>
      </div>
      <p className="mb-4">
        You can still view the standings and any brackets you've already
        submitted.
      </p>
      <div className="flex gap-4">
        <a
          href="/standings"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          View Standings
        </a>
        <a
          href="/brackets"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          My Brackets
        </a>
      </div>
    </div>
  );
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

            <Route
              path="/tournament/results"
              element={<TournamentResultsView />}
            />

            {/* Bracket entry route with guard */}
            <Route
              path="/entry"
              element={
                <TournamentGuard>
                  <IntegratedBracketContainer />
                </TournamentGuard>
              }
            />

            {/* Add locked page route */}
            <Route path="/locked" element={<TournamentLocked />} />

            <Route path="/brackets" element={<UserBrackets />} />
            <Route
              path="/user/brackets/:email"
              element={<UserBracketsByEmail />}
            />
            <Route path="/bracket/edit/:id" element={<BracketEdit />} />
            <Route path="/bracket/view/:id" element={<BracketView />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/prizes" element={<PrizesPage />} />
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
