import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Routes, Route } from 'react-router-dom';
import { adminAuthServices } from '../../services/api';
import { LoadingSpinner, ErrorDisplay } from '../../utils/shared';
import AdminUpdates from './AdminUpdates';
import AdminUpdateForm from './AdminUpdateForm';
import AdminUsers from './AdminUsers';
import AdminBrackets from './AdminBrackets';
import AdminTournament from './AdminTournament';
import AdminNcaaMonitor from './AdminNcaaMonitor';
import AdminTournamentPossibilities from './AdminTournamentPossibilities';

const AdminDashboard: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const result = await adminAuthServices.isAdmin();
        setIsAdmin(result);
        setIsLoading(false);
        
        // Redirect to home if not admin
        if (!result) {
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setIsLoading(false);
        navigate('/');
      }
    };
    
    checkAdmin();
  }, [navigate]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ErrorDisplay error={"You don't have permission to access the admin dashboard."} />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-gray-800 text-white rounded-lg p-4 mb-6 md:mb-0 md:mr-6">
          <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>
          <nav>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/admin" 
                  className="block py-2 px-4 rounded hover:bg-gray-700"
                >
                  Overview
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/updates" 
                  className="block py-2 px-4 rounded hover:bg-gray-700"
                >
                  Manage Updates
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/users" 
                  className="block py-2 px-4 rounded hover:bg-gray-700"
                >
                  Manage Users
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/brackets" 
                  className="block py-2 px-4 rounded hover:bg-gray-700"
                >
                  Manage Brackets
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/tournament" 
                  className="block py-2 px-4 rounded hover:bg-gray-700"
                >
                  Tournament Results
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/ncaa-monitor" 
                  className="block py-2 px-4 rounded hover:bg-gray-700"
                >
                  NCAA Updates Monitor
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/tournament-analysis" 
                  className="block py-2 px-4 rounded hover:bg-gray-700"
                >
                  Tournament Analysis
                </Link>
              </li>
              <li>
                <Link 
                  to="/" 
                  className="block py-2 px-4 rounded hover:bg-gray-700"
                >
                  Return to Site
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/updates" element={<AdminUpdates />} />
            <Route path="/updates/new" element={<AdminUpdateForm />} />
            <Route path="/updates/edit/:id" element={<AdminUpdateForm />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/users/:userId/brackets" element={<AdminBrackets />} />
            <Route path="/brackets" element={<AdminBrackets />} />
            <Route path="/tournament" element={<AdminTournament />} />
            <Route path="/ncaa-monitor" element={<AdminNcaaMonitor />} />
            <Route path="/tournament-analysis" element={<AdminTournamentPossibilities />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

// Overview component
const AdminOverview: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <h2 className="text-lg font-bold mb-2">Updates</h2>
          <p className="text-gray-600 mb-4">Manage website updates, announcements, and reminders.</p>
          <Link 
            to="/admin/updates" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Manage Updates →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <h2 className="text-lg font-bold mb-2">Users</h2>
          <p className="text-gray-600 mb-4">View all registered users and their brackets.</p>
          <Link 
            to="/admin/users" 
            className="text-green-600 hover:text-green-800 font-medium"
          >
            Manage Users →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <h2 className="text-lg font-bold mb-2">Brackets</h2>
          <p className="text-gray-600 mb-4">View and manage all submitted brackets.</p>
          <Link 
            to="/admin/brackets" 
            className="text-purple-600 hover:text-purple-800 font-medium"
          >
            Manage Brackets →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <h2 className="text-lg font-bold mb-2">Tournament</h2>
          <p className="text-gray-600 mb-4">Manage tournament results and calculate scores.</p>
          <Link 
            to="/admin/tournament" 
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Manage Tournament →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-500">
          <h2 className="text-lg font-bold mb-2">NCAA Updates Monitor</h2>
          <p className="text-gray-600 mb-4">Monitor automated NCAA tournament updates.</p>
          <Link 
            to="/admin/ncaa-monitor" 
            className="text-amber-600 hover:text-amber-800 font-medium"
          >
            View Monitor →
          </Link>
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h2 className="text-lg font-bold text-blue-800 mb-4">Admin Actions</h2>
        <p className="mb-4">
          Welcome to the admin dashboard. From here, you can manage website content and user data.
        </p>
        <p>
          Use the sidebar to navigate between different administration sections.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;