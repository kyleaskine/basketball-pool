import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BracketResponse } from '../../services/api';
import api from '../../services/api';
import { formatDate, LoadingSpinner, ErrorDisplay } from '../../utils/shared';

// Add additional properties for filtering and display
interface EnhancedBracket extends BracketResponse {
  region?: string;
  champion?: {
    name: string;
    seed: number;
  };
}

const AdminBrackets: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const [brackets, setBrackets] = useState<EnhancedBracket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [filterBy, setFilterBy] = useState<string>('all'); // 'all', 'locked', 'editable'
  const [sortBy, setSortBy] = useState<string>('date'); // 'date', 'score', 'name'
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrackets = async () => {
      setIsLoading(true);
      try {
        let response;
        if (userId) {
          response = await api.get(`/admin/users/${userId}/brackets`);
          // Also fetch user email for display
          const userResponse = await api.get(`/admin/users/${userId}`);
          setUserEmail(userResponse.data.email);
        } else {
          response = await api.get('/admin/brackets');
        }
        
        // Enhance bracket data with champion picks for filtering and display
        const enhancedBrackets = response.data.map((bracket: BracketResponse) => {
          let champion = null;
          let regions = [];
          
          // Extract champion if available
          if (bracket.picks && bracket.picks[6] && bracket.picks[6][0] && bracket.picks[6][0].winner) {
            champion = bracket.picks[6][0].winner;
          }
          
          return {
            ...bracket,
            champion
          };
        });
        
        setBrackets(enhancedBrackets);
        setError(null);
      } catch (err) {
        console.error('Error fetching brackets:', err);
        setError('Failed to load brackets. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrackets();
  }, [userId]);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      let endpoint = '/admin/brackets/export/csv';
      if (userId) {
        endpoint += `?userId=${userId}`;
      }
      
      const response = await api.get(endpoint, { responseType: 'blob' });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `brackets-export-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting brackets:', err);
      setError('Failed to export brackets. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      let endpoint = '/admin/brackets/export/json';
      if (userId) {
        endpoint += `?userId=${userId}`;
      }
      
      const response = await api.get(endpoint, { responseType: 'blob' });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `brackets-export-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting brackets:', err);
      setError('Failed to export brackets. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Filter and sort brackets
  const filteredAndSortedBrackets = brackets
    .filter(bracket => {
      // Apply status filter
      if (filterBy === 'locked' && !bracket.isLocked) return false;
      if (filterBy === 'editable' && bracket.isLocked) return false;
      
      // Apply search filter to participant name or email
      return (
        bracket.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bracket.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bracket.champion && bracket.champion.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      
      // Apply different sort methods
      switch (sortBy) {
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'name':
          comparison = a.participantName.localeCompare(b.participantName);
          break;
        case 'champion':
          const champA = a.champion?.name || '';
          const champB = b.champion?.name || '';
          comparison = champA.localeCompare(champB);
          break;
        case 'date':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      
      // Apply sort order
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        {userId ? `Brackets for ${userEmail || 'User'}` : 'All Brackets'}
      </h1>
      
      {error && (
        <ErrorDisplay error={error} />
      )}
      
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, or champion..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
          >
            <option value="all">All Brackets</option>
            <option value="locked">Locked</option>
            <option value="editable">Editable</option>
          </select>
          
          <select
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="score">Sort by Score</option>
            <option value="name">Sort by Name</option>
            <option value="champion">Sort by Champion</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
      
      <div className="mb-6 flex gap-4">
        <button
          onClick={handleExportCSV}
          disabled={isExporting || brackets.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </button>
        
        <button
          onClick={handleExportJSON}
          disabled={isExporting || brackets.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isExporting ? 'Exporting...' : 'Export JSON'}
        </button>
      </div>
      
      {isLoading ? (
        <LoadingSpinner />
      ) : filteredAndSortedBrackets.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-gray-600 mb-4">No brackets found matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Champion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedBrackets.map(bracket => (
                <tr key={bracket._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {bracket.participantName}
                      {bracket.entryNumber && bracket.entryNumber > 1 && (
                        <span className="text-xs text-gray-500 ml-1">
                          (#{bracket.entryNumber})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {bracket.userEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {bracket.champion ? (
                      <div className="flex items-center">
                        <span className="flex items-center justify-center bg-gray-200 text-xs font-bold rounded-full w-6 h-6 mr-2">
                          {bracket.champion.seed}
                        </span>
                        <span className="text-sm">{bracket.champion.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Not selected</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      bracket.isLocked 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {bracket.isLocked ? 'Locked' : 'Editable'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {bracket.score}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(bracket.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      to={`/bracket/view/${bracket._id}?token=${bracket.editToken}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      target="_blank"
                    >
                      View
                    </Link>
                    {!bracket.isLocked && (
                      <Link 
                        to={`/bracket/edit/${bracket._id}?token=${bracket.editToken}`}
                        className="text-green-600 hover:text-green-900 mr-4"
                        target="_blank"
                      >
                        Edit
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to update this bracket\'s score?')) {
                          // Implement score update functionality
                        }
                      }}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      Update Score
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

export default AdminBrackets;