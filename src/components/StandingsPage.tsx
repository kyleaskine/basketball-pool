import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface Participant {
  position: number;
  participantName: string;
  entryNumber: number;
  score: number;
  userEmail: string;
  id: string;
}

interface Stats {
  totalBrackets: number;
  averageScore: number;
  highestScore: number;
  completedRounds: number[];
}

interface StandingsData {
  standings: Participant[];
  stats: Stats;
}

const StandingsPage: React.FC = () => {
  const [standingsData, setStandingsData] = useState<StandingsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterDisplayed, setFilterDisplayed] = useState<number>(50); // Number of entries to display

  useEffect(() => {
    const fetchStandings = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/tournament/standings');
        setStandingsData(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching standings:', err);
        if (err.response && err.response.status === 400) {
          setError('No tournament results available yet. Check back after the games begin!');
        } else {
          setError('Failed to load standings. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStandings();
  }, []);

  const getRoundName = (round: number): string => {
    switch (round) {
      case 1: return 'First Round';
      case 2: return 'Second Round';
      case 3: return 'Sweet 16';
      case 4: return 'Elite 8';
      case 5: return 'Final Four';
      case 6: return 'Championship';
      default: return `Round ${round}`;
    }
  };

  // Filter standings by search term
  const filteredStandings = standingsData?.standings.filter(participant => 
    participant.participantName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Limit displayed results based on filterDisplayed
  const displayedStandings = filteredStandings.slice(0, filterDisplayed);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold text-blue-800 mb-2">Tournament Standings</h1>
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <p>{error}</p>
        </div>
      ) : standingsData ? (
        <div>
          {/* Stats Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Brackets</p>
                <p className="text-2xl font-bold text-blue-800">{standingsData.stats.totalBrackets}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-blue-800">{standingsData.stats.averageScore.toFixed(1)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">High Score</p>
                <p className="text-2xl font-bold text-blue-800">{standingsData.stats.highestScore}</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">Completed Rounds</p>
              <div className="flex flex-wrap justify-center gap-2 mt-1">
                {standingsData.stats.completedRounds.length === 0 ? (
                  <span className="text-yellow-600">Tournament hasn't started yet</span>
                ) : (
                  standingsData.stats.completedRounds.map(round => (
                    <span 
                      key={round}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                    >
                      {getRoundName(round)}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* Search and Filter Controls */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <select
                className="w-full md:w-40 px-4 py-2 border border-gray-300 rounded-md"
                value={filterDisplayed}
                onChange={(e) => setFilterDisplayed(parseInt(e.target.value))}
              >
                <option value={25}>Top 25</option>
                <option value={50}>Top 50</option>
                <option value={100}>Top 100</option>
                <option value={1000}>All</option>
              </select>
            </div>
          </div>
          
          {/* Standings Table */}
          {filteredStandings.length === 0 ? (
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <p className="text-gray-600">No participants found matching your search.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participant
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Score
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedStandings.map((participant) => (
                    <tr 
                      key={`${participant.id}-${participant.entryNumber}`}
                      className={`hover:bg-gray-50 ${participant.position <= 3 ? 'bg-yellow-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-bold ${
                          participant.position === 1 ? 'text-yellow-600' :
                          participant.position === 2 ? 'text-gray-500' :
                          participant.position === 3 ? 'text-amber-700' :
                          'text-gray-900'
                        }`}>
                          {participant.position === 1 ? '🏆 ' : ''}
                          {participant.position === 2 ? '🥈 ' : ''}
                          {participant.position === 3 ? '🥉 ' : ''}
                          {participant.position}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {participant.participantName}
                          {participant.entryNumber > 1 && (
                            <span className="text-xs text-gray-500 ml-1">
                              (#{participant.entryNumber})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-bold text-gray-900">
                          {participant.score}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          to={`/bracket/view/${participant.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          target="_blank"
                        >
                          View Bracket
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Show count of filtered results */}
              {searchTerm && (
                <div className="p-3 text-center text-sm text-gray-600">
                  Showing {Math.min(filterDisplayed, filteredStandings.length)} of {filteredStandings.length} results matching "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default StandingsPage;