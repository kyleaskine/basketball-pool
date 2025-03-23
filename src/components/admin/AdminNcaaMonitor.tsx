import React, { useState, useEffect } from 'react';
import { ncaaUpdateServices, UpdateLog, TodayStats } from '../../services/api';

const AdminNcaaMonitor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'today' | 'logs'>('today');
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [logs, setLogs] = useState<UpdateLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<UpdateLog | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Fetch initial data
  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchTodayGames(), fetchLogs()]);
      setError(null);
    } catch (err) {
      console.error('Error fetching NCAA update data:', err);
      setError('Failed to load NCAA update data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch today's game data
  const fetchTodayGames = async () => {
    try {
      const data = await ncaaUpdateServices.getTodayGames();
      setTodayStats(data);
    } catch (err) {
      console.error('Error fetching today\'s games:', err);
      throw err;
    }
  };

  // Fetch update logs
  const fetchLogs = async () => {
    try {
      const data = await ncaaUpdateServices.getLogs();
      setLogs(data);
    } catch (err) {
      console.error('Error fetching update logs:', err);
      throw err;
    }
  };

  // Trigger manual update
  const triggerManualUpdate = async () => {
    setIsUpdating(true);
    setSuccessMessage(null);
    setError(null);
    
    try {
      const response = await ncaaUpdateServices.triggerUpdate();
      
      setSuccessMessage(`Update triggered successfully. Status: ${response.result.status}`);
      
      // Refresh data after update
      await fetchData();
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Error triggering update:', err);
      setError('Failed to trigger NCAA update. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show log details
  const showLogDetails = (log: UpdateLog) => {
    setSelectedLog(log);
  };

  // Get status color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'complete_for_day':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">NCAA Tournament Update Monitor</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6">
          <p>{successMessage}</p>
        </div>
      )}
      
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Last refreshed: {formatDate(new Date().toISOString())}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
          
          <button
            onClick={triggerManualUpdate}
            disabled={isUpdating}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {isUpdating ? 'Updating...' : 'Trigger Update'}
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      {todayStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 border-t-4 border-blue-500">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Total Games Today</div>
            <div className="mt-1 text-2xl font-bold">{todayStats.totalGames || 0}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 border-t-4 border-green-500">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Completed Games</div>
            <div className="mt-1 text-2xl font-bold">{todayStats.completedGames || 0}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 border-t-4 border-yellow-500">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Pending Games</div>
            <div className="mt-1 text-2xl font-bold">{todayStats.pendingGames || 0}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 border-t-4 border-purple-500">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Status</div>
            <div className="mt-1 text-2xl font-bold" style={{
              color: todayStats.allComplete ? '#10b981' : todayStats.hasGames ? '#f59e0b' : '#6b7280'
            }}>
              {todayStats.allComplete ? 'Complete' : todayStats.hasGames ? 'In Progress' : 'No Games'}
            </div>
          </div>
        </div>
      )}
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex -mb-px space-x-8">
          <button
            onClick={() => setActiveTab('today')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'today'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Today's Games
          </button>
          
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Update Logs
          </button>
        </nav>
      </div>
      
      {isLoading && !todayStats && logs.length === 0 ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Today's Games Tab */}
          {activeTab === 'today' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Tracked Tournament Games</h2>
              </div>
              
              {!todayStats?.hasGames ? (
                <div className="p-6 text-center text-gray-500">
                  No tournament games found for today.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Teams
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Region
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Round
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Updated
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[...(todayStats?.completed || []), ...(todayStats?.pending || [])].map(game => (
                        <tr key={game.gameId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              game.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {game.completed ? 'Complete' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {game.awayTeam} vs {game.homeTeam}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {game.region || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {game.round || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {game.completed && game.score ? 
                                `${game.score.awayScore} - ${game.score.homeScore}` : 
                                '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              game.updatedInDb ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {game.updatedInDb ? 'Yes' : 'No'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">Recent Update Logs</h2>
                </div>
                
                {logs.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No update logs found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Games Updated
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {logs.map(log => (
                          <tr 
                            key={log._id} 
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => showLogDetails(log)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatDate(log.runDate)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                                {log.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {log.updatedCount || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showLogDetails(log);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              {/* Log Details */}
              {selectedLog && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Log Details</h2>
                    <button
                      onClick={() => setSelectedLog(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <span className="text-sm text-gray-500">Time:</span>
                      <span className="ml-2 font-medium">{formatDate(selectedLog.runDate)}</span>
                    </div>
                    
                    <div className="mb-4">
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedLog.status)}`}>
                        {selectedLog.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <span className="text-sm text-gray-500">Games:</span>
                      <span className="ml-2 font-medium">
                        {selectedLog.completedGames} / {selectedLog.totalTrackedGames} completed
                      </span>
                    </div>
                    
                    <div className="bg-gray-800 text-gray-200 p-4 rounded font-mono text-sm overflow-auto max-h-96">
                      {selectedLog.logs.map((line, index) => (
                        <div key={index} className="mb-1">{line}</div>
                      ))}
                      
                      {selectedLog.errors && selectedLog.errors.length > 0 && (
                        <div className="mt-4 border-t border-gray-700 pt-4 text-red-400">
                          <div className="font-bold mb-2">ERRORS:</div>
                          {selectedLog.errors.map((error, index) => (
                            <div key={`error-${index}`} className="mb-2">
                              <div>{error.message}</div>
                              {error.stack && (
                                <div className="text-xs text-red-300 ml-4 mt-1">{error.stack}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminNcaaMonitor;