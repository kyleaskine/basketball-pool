import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Team, Matchup } from '../types';
import { Link } from 'react-router-dom';

interface MatchupInfo {
  teamA: Team | null;
  teamB: Team | null;
  winner: Team | null;
  round: number;
}

interface UserPick {
  name: string;
  entryNumber: number;
  email: string;
  bracketId: string;
}

interface TeamStat {
  count: number;
  seed: number;
  percentage: number;
  isWinner: boolean;
  users: UserPick[];
}

interface MatchupStats {
  totalPicks: number;
  teamStats: {
    [teamName: string]: TeamStat;
  };
  matchupInfo: MatchupInfo | null;
  sourceMatchups: Matchup[];
}

interface MatchupStatsModalProps {
    matchupId: number | null;
    isOpen: boolean;
    onClose: () => void;
    selectedSlot: "A" | "B" | null;
}

const MatchupStatsModal: React.FC<MatchupStatsModalProps> = ({
  matchupId,
  isOpen,
  onClose,
  selectedSlot
}) => {
  const [stats, setStats] = useState<MatchupStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    const fetchStats = async () => {
      if (!matchupId || !isOpen) return;
      
      setIsLoading(true);
      setStats(null);
      setError(null);
      setExpandedTeams(new Set());
      
      try {
        // For round 1, or if no slot is selected, use the original endpoint
        let response;
        
        if (!selectedSlot) {
          // Handle case where no slot is selected (shouldn't happen, but just in case)
          response = await api.get(`/tournament/matchup-stats/${matchupId}/1`);
        } else {
          // Use the new endpoint that returns data for a specific slot (1 for top, 0 for bottom)
          response = await api.get(`/tournament/matchup-stats/${matchupId}/${selectedSlot === "A" ? 1 : 0}`);
        }
        
        const statsData = response.data as MatchupStats;
        
        // If we don't have any matchup info, display an empty state
        if (!statsData.matchupInfo) {
          setStats({
            totalPicks: 0,
            teamStats: {},
            matchupInfo: null,
            sourceMatchups: []
          });
          setIsLoading(false);
          return;
        }
        
        console.log("Stats data for matchup", matchupId, "slot", selectedSlot, ":", statsData);
        
        // No additional processing needed - the backend returns exactly what we want
        setStats(statsData);
      } catch (err) {
        console.error("Error fetching matchup stats:", err);
        setError("Failed to load statistics. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [matchupId, isOpen, selectedSlot]);
  
  const toggleTeamExpansion = (teamName: string) => {
    setExpandedTeams(prevState => {
      const newState = new Set(prevState);
      if (newState.has(teamName)) {
        newState.delete(teamName);
      } else {
        newState.add(teamName);
      }
      return newState;
    });
  };
  
  if (!isOpen) return null;
  
  const getRoundName = (round: number): string => {
    switch (round) {
      case 1: return "First Round";
      case 2: return "Second Round";
      case 3: return "Sweet 16";
      case 4: return "Elite 8";
      case 5: return "Final Four";
      case 6: return "Championship";
      default: return `Round ${round}`;
    }
  };
  
  // Sort teams by popularity and seed
  const getSortedTeams = (teamStats: { [teamName: string]: TeamStat }) => {
    if (!teamStats) return [];
    
    const teams = Object.entries(teamStats);
    
    // Check if it's unanimous (all picked the same team)
    if (teams.length === 1) {
      return teams;
    }

    // Sort by count (descending), then by seed (ascending)
    return teams.sort((a, b) => {
      const countDiff = b[1].count - a[1].count;
      if (countDiff !== 0) return countDiff;
      return a[1].seed - b[1].seed; // Lower seed (higher ranked) first
    });
  };
  
  // Check if picks are unanimous
  const isUnanimous = (teamStats: { [teamName: string]: TeamStat }) => {
    if (!teamStats) return false;
    const teams = Object.values(teamStats);
    return teams.length === 1;
  };
  
  // Get the title for the stats section
  const getStatsTitle = () => {
    if (!stats?.matchupInfo) return "Bracket Selections";
    
    const round = stats.matchupInfo.round;
    const slotLabel = selectedSlot === "A" ? "Top" : "Bottom";
    
    if (round === 1) {
      return `${getRoundName(round)} Selections`;
    } else {
      return `${slotLabel} Slot Selections for ${getRoundName(round)}`;
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-2">
          Bracket Picks Distribution
        </h3>
        
        {stats?.matchupInfo && (
          <div className="mb-4">
            <p className="text-gray-600">
              {getStatsTitle()}
              {stats.matchupInfo.winner && (
                <span className="ml-2 text-green-600">
                  • Completed
                </span>
              )}
            </p>
            
            {/* Show current matchup details if round > 1 */}
            {stats.matchupInfo.round > 1 && (
              <div className="mt-2 p-3 bg-blue-50 rounded text-sm">
                <p className="font-medium text-blue-800 mb-1">Current Matchup Status:</p>
                <div className="flex items-center">
                  {stats.matchupInfo.teamA ? (
                    <span className={stats.matchupInfo.winner?.name === stats.matchupInfo.teamA.name ? "font-medium" : ""}>
                      ({stats.matchupInfo.teamA.seed}) {stats.matchupInfo.teamA.name}
                    </span>
                  ) : (
                    <span className="text-gray-500">TBD</span>
                  )}
                  <span className="mx-2 text-gray-500">vs</span>
                  {stats.matchupInfo.teamB ? (
                    <span className={stats.matchupInfo.winner?.name === stats.matchupInfo.teamB.name ? "font-medium" : ""}>
                      ({stats.matchupInfo.teamB.seed}) {stats.matchupInfo.teamB.name}
                    </span>
                  ) : (
                    <span className="text-gray-500">TBD</span>
                  )}
                  {stats.matchupInfo.winner && (
                    <div className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded ml-2">
                      Winner: {stats.matchupInfo.winner.name}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Source matchups info for rounds > 1 */}
            {stats.sourceMatchups.length > 0 && stats.matchupInfo.round > 1 && (
              <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                <p className="font-medium text-gray-700 mb-1">
                  Source Matchup:
                </p>
                <div className="space-y-1">
                  {stats.sourceMatchups.map(matchup => (
                    <div key={matchup.id} className="flex items-center">
                      <div className="flex-1">
                        {matchup.teamA ? (
                          <span className={matchup.winner?.name === matchup.teamA.name ? "font-medium" : ""}>
                            ({matchup.teamA.seed}) {matchup.teamA.name}
                          </span>
                        ) : (
                          <span className="text-gray-500">TBD</span>
                        )}
                        <span className="mx-2 text-gray-500">vs</span>
                        {matchup.teamB ? (
                          <span className={matchup.winner?.name === matchup.teamB.name ? "font-medium" : ""}>
                            ({matchup.teamB.seed}) {matchup.teamB.name}
                          </span>
                        ) : (
                          <span className="text-gray-500">TBD</span>
                        )}
                      </div>
                      {matchup.winner && (
                        <div className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded ml-2">
                          Winner: {matchup.winner.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p>{error}</p>
          </div>
        ) : stats && Object.keys(stats.teamStats).length > 0 ? (
          <div>
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-center text-blue-800">
                <span className="font-bold">{stats.totalPicks}</span> brackets submitted picks
                {isUnanimous(stats.teamStats) ? (
                  <span className="block mt-1 font-medium">All brackets picked the same team!</span>
                ) : null}
              </p>
            </div>
            
            <div className="space-y-4">
              {getSortedTeams(stats.teamStats).map(([teamName, teamStat]) => {
                return (
                  <div 
                    key={teamName} 
                    className={`p-3 rounded-lg border ${
                      teamStat.isWinner 
                        ? 'bg-green-50 border-green-300' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div 
                      className="flex items-center justify-between mb-2 cursor-pointer"
                      onClick={() => toggleTeamExpansion(teamName)}
                    >
                      <div className="flex items-center">
                        <span className="flex items-center justify-center bg-gray-200 text-xs font-bold rounded-full w-6 h-6 mr-2">
                          {teamStat.seed}
                        </span>
                        <span className="font-medium">{teamName}</span>
                        {teamStat.isWinner && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Winner
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className="font-bold mr-2">{teamStat.count} picks ({teamStat.percentage}%)</span>
                        {teamStat.users.length > 0 && (
                          <button className="text-gray-600">
                            {expandedTeams.has(teamName) ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          teamStat.isWinner ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${teamStat.percentage}%` }}
                      ></div>
                    </div>
                    
                    {/* User list (expanded view) */}
                    {expandedTeams.has(teamName) && teamStat.users.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <h4 className="text-sm font-medium mb-2">Picked by {teamStat.users.length} user{teamStat.users.length !== 1 ? 's' : ''}</h4>
                        <div className="max-h-40 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="text-xs text-gray-700 border-b">
                              <tr>
                                <th className="text-left py-1">Name</th>
                                <th className="text-right py-1">View</th>
                              </tr>
                            </thead>
                            <tbody>
                              {teamStat.users.map((user, index) => (
                                <tr key={`${user.bracketId}-${index}`} className="border-b border-gray-100">
                                  <td className="py-1">
                                    {user.name}
                                    {user.entryNumber > 1 && <span className="text-gray-500 text-xs ml-1">#{user.entryNumber}</span>}
                                  </td>
                                  <td className="py-1 text-right">
                                    <Link 
                                      to={`/bracket/view/${user.bracketId}`} 
                                      className="text-blue-600 hover:underline text-xs"
                                      target="_blank"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      View Bracket
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded text-yellow-700">
            <p className="font-medium">No selections available for this matchup yet.</p>
            <p>This could be because the bracket is still being filled out or no users have made selections for this matchup.</p>
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchupStatsModal;