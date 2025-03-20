import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface Participant {
  position: number;
  participantName: string;
  entryNumber: number;
  score: number;
  id: string;
}

interface TopStandingsWidgetProps {
  limit?: number;
}

const TopStandingsWidget: React.FC<TopStandingsWidgetProps> = ({ limit = 5 }) => {
  const [standings, setStandings] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await api.get('/tournament/standings');
        const topStandings = response.data.standings.slice(0, limit);
        setStandings(topStandings);
        setError(null);
      } catch (err) {
        console.error('Error fetching standings:', err);
        setError('Unable to load standings');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStandings();
  }, [limit]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return null; // Don't show anything if there's an error
  }
  
  if (standings.length === 0) {
    return null; // Don't show if no standings available
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-bold text-blue-800 mb-3">Leaderboard</h2>
      
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                Rank
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Participant
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Score
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {standings.map((participant) => (
              <tr 
                key={`${participant.id}-${participant.entryNumber}`}
                className={`hover:bg-gray-50 ${participant.position <= 3 ? 'bg-yellow-50' : ''}`}
              >
                <td className="px-4 py-2 whitespace-nowrap">
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
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {participant.participantName}
                    {participant.entryNumber > 1 && (
                      <span className="text-xs text-gray-500 ml-1">
                        (#{participant.entryNumber})
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-right">
                  <div className="text-sm font-bold text-gray-900">
                    {participant.score}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-center">
        <Link 
          to="/standings"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Full Standings →
        </Link>
      </div>
    </div>
  );
};

export default TopStandingsWidget;