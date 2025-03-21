import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface Participant {
  position: number;
  participantName: string;
  entryNumber: number;
  score: number;
  id: string;
  // Display position for ties
  displayPosition?: string;
}

interface SummaryRow {
  isSummary: true;
  count: number;
  score: number;
  position: number;
  displayPosition: string;
}

type DisplayRow = Participant | SummaryRow;

interface TopStandingsWidgetProps {
  limit?: number;
}

const TopStandingsWidget: React.FC<TopStandingsWidgetProps> = ({ limit = 5 }) => {
  const [rawStandings, setRawStandings] = useState<Participant[]>([]);
  const [displayStandings, setDisplayStandings] = useState<DisplayRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Calculate tied rankings
  const calculateTiedRankings = (participants: Participant[]): Participant[] => {
    const sortedByScore = [...participants].sort((a, b) => b.score - a.score);
    
    let currentRank = 1;
    let currentScore = sortedByScore[0]?.score;
    let sameRankCount = 0;
    
    return sortedByScore.map((participant, index) => {
      // If the score is different from the previous one, update the rank
      if (participant.score !== currentScore) {
        currentRank += sameRankCount;
        currentScore = participant.score;
        sameRankCount = 1;
      } else {
        sameRankCount++;
      }
      
      // Set the display position based on ties
      const hasTie = sortedByScore.filter(p => p.score === participant.score).length > 1;
      const displayPosition = hasTie ? `t${currentRank}` : `${currentRank}`;
      
      return {
        ...participant,
        position: currentRank,
        displayPosition
      };
    });
  };

  // Prepare display standings with possible summary row
  const prepareDisplayStandings = (rankedStandings: Participant[], displayLimit: number): DisplayRow[] => {
    // Group participants by position
    const positionGroups: { [key: number]: Participant[] } = {};
    rankedStandings.forEach(p => {
      if (!positionGroups[p.position]) {
        positionGroups[p.position] = [];
      }
      positionGroups[p.position].push(p);
    });

    // Create display standings
    const result: DisplayRow[] = [];
    let visibleCount = 0;
    let nextRankToShow = 1;

    while (visibleCount < displayLimit && nextRankToShow <= Object.keys(positionGroups).length) {
      const currentRankGroup = positionGroups[nextRankToShow];
      
      // If showing all would exceed the limit
      if (visibleCount + currentRankGroup.length > displayLimit) {
        // If we haven't shown any yet, show as many as possible
        if (visibleCount === 0) {
          result.push(...currentRankGroup.slice(0, displayLimit));
        } else {
          // Show a summary row instead
          const nextPosition = nextRankToShow + currentRankGroup.length;
          result.push({
            isSummary: true,
            count: currentRankGroup.length,
            score: currentRankGroup[0].score,
            position: nextRankToShow, 
            displayPosition: currentRankGroup[0].displayPosition || `${nextRankToShow}`
          });
        }
        break;
      } else {
        // Add all participants for this rank
        result.push(...currentRankGroup);
        visibleCount += currentRankGroup.length;
        nextRankToShow += currentRankGroup.length;
      }
    }

    return result;
  };
  
  // Fetch standings data
  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await api.get('/tournament/standings');
        
        // Store raw standings data
        setRawStandings(response.data.standings);
        setError(null);
      } catch (err) {
        console.error('Error fetching standings:', err);
        setError('Unable to load standings');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStandings();
  }, []);

  // Process standings in a separate effect to avoid infinite loops
  useEffect(() => {
    if (rawStandings.length > 0) {
      // Calculate tied rankings
      const rankedStandings = calculateTiedRankings(rawStandings);
      
      // Prepare display standings with summary row if needed
      const display = prepareDisplayStandings(rankedStandings, limit);
      
      setDisplayStandings(display);
    }
  }, [rawStandings, limit]);
  
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
  
  if (rawStandings.length === 0) {
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
            {displayStandings.map((item, index) => {
              // Handle summary row
              if ('isSummary' in item) {
                return (
                  <tr key="summary-row" className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {item.displayPosition}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.count} people tied in {item.position}{getOrdinalSuffix(item.position)}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      <div className="text-sm font-bold text-gray-900">
                        {item.score}
                      </div>
                    </td>
                  </tr>
                );
              }

              // Handle regular participant row
              const participant = item;
              return (
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
                      {participant.displayPosition || participant.position}
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
              );
            })}
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

// Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
const getOrdinalSuffix = (num: number): string => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) {
    return 'st';
  }
  if (j === 2 && k !== 12) {
    return 'nd';
  }
  if (j === 3 && k !== 13) {
    return 'rd';
  }
  return 'th';
};

export default TopStandingsWidget;