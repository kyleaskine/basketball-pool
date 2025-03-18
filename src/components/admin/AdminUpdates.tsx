import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminUpdateServices, Update } from '../../services/api';

const AdminUpdates: React.FC = () => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Fetch all updates
  const fetchUpdates = async () => {
    setIsLoading(true);
    try {
      const data = await adminUpdateServices.getAllUpdates();
      setUpdates(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching updates:', err);
      setError('Failed to load updates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUpdates();
  }, []);
  
  // Delete an update
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this update?')) {
      return;
    }
    
    setIsLoading(true);
    try {
      await adminUpdateServices.deleteUpdate(id);
      await fetchUpdates(); // Refresh the list
      setSuccessMessage('Update deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting update:', err);
      setError('Failed to delete update. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'announcement':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
            Announcement
          </span>
        );
      case 'reminder':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
            Reminder
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            News
          </span>
        );
    }
  };
  
  const isActive = (activeUntil: string) => {
    return new Date(activeUntil) > new Date();
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Updates</h1>
        <Link 
          to="/admin/updates/new" 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create New Update
        </Link>
      </div>
      
      {/* Success message */}
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6">
          <p>{successMessage}</p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : updates.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-gray-600 mb-4">No updates found.</p>
          <Link 
            to="/admin/updates/new" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Your First Update
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Importance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {updates.map(update => (
                <tr key={update._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {update.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeLabel(update.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {update.importance}/10
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isActive(update.activeUntil) ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                        Expired
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      Created: {formatDate(update.createdAt)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Active until: {formatDate(update.activeUntil)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      to={`/admin/updates/edit/${update._id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(update._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUpdates;