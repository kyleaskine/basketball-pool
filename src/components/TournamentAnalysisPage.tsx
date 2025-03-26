import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

// Types for the analysis data based on the updated schema
interface Team {
  name: string;
  seed: number;
}

interface PodiumContender {
  id: string;
  participantName: string;
  entryNumber: number;
  currentScore: number;
  placePercentages: {
    1: number;
    2: number;
    3: number;
    podium: number;
  };
  minPlace: number;
  maxPlace: number;
}

interface ChampionshipPick {
  team: string;
  count: number;
  percentage: number;
}

interface BracketOutcome {
  key: string;
  count: number;
  percentage: number;
}

interface RareCorrectPick {
  matchupId: number;
  round: number;
  winner: {
    name: string;
    seed: number;
  };
  correctPicks: number;
  totalPicks: number;
  percentage: number;
  region: string;
  teams: {
    teamA: {
      name: string;
      seed: number;
    };
    teamB: {
      name: string;
      seed: number;
    };
  };
}

interface BracketImpact {
  bracketId: string;
  participantName: string;
  entryNumber: number;
  currentScore: number;
  normalPodiumChance: number;
  affectedPodiumChance: number;
}

interface OutcomeResult {
  winner: {
    name: string;
    seed: number;
  };
  bracketImpacts: BracketImpact[];
}

interface ChampionshipScenario {
  matchup: {
    teamA: {
      name: string;
      seed: number;
    };
    teamB: {
      name: string;
      seed: number;
    };
  };
  outcomes: OutcomeResult[];
}

interface PathAnalysis {
  teamPaths: Record<string, {
    seed: number;
    winsChampionship: {
      affectedBrackets: any[];
      podiumChanges: {
        bracketId: string;
        participantName: string;
        entryNumber: number;
        currentScore: number;
        normalPodiumChance: number;
        adjustedPodiumChance: number;
      }[];
    };
  }>;
  championshipScenarios: ChampionshipScenario[];
}

interface TournamentAnalysisData {
  timestamp: string;
  stage: string;
  totalBrackets: number;
  totalPossibleOutcomes: number;
  roundName: string;
  currentRound: number;
  podiumContenders: PodiumContender[];
  playersWithNoPodiumChance: number;
  playersWithWinChance: number;
  championshipPicks: ChampionshipPick[];
  rareCorrectPicks: RareCorrectPick[];
  pathAnalysis: PathAnalysis;
  bracketOutcomes: {
    sweet16: BracketOutcome[];
    finalFour: BracketOutcome[];
    championship: BracketOutcome[];
  };
}

const TournamentAnalysisPage: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<TournamentAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('podiumContenders');
  const [sortField, setSortField] = useState<string>('podium');
  const [sortDirection, setSortDirection] = useState<string>('desc');

  useEffect(() => {
    const fetchAnalysisData = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching initial tournament analysis data");
        const response = await api.get('/tournament/possibilities');
        setAnalysisData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching tournament analysis:', err);
        setError('Failed to load tournament analysis. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysisData();
  }, []);
  
  // Additional effect to fetch path analysis data for both path-related tabs
  useEffect(() => {
    // Check if we're on either of the path analysis tabs
    const isPathAnalysisTab = (activeTab === 'teamPaths' || activeTab === 'championshipScenarios');
    
    if (isPathAnalysisTab && !isLoading) {
      console.log(`Fetching path data for tab: ${activeTab}`);
      
      const fetchPathAnalysis = async () => {
        try {
          const response = await api.get('/tournament/path-analysis');
          console.log("Path analysis API response received");
          
          if (response.data && response.data.pathAnalysis) {
            // Log detailed info about the received data
            const teamCount = response.data.pathAnalysis.teamPaths ? 
              Object.keys(response.data.pathAnalysis.teamPaths).length : 0;
            
            console.log(`Received data for ${teamCount} teams`);
            
            if (teamCount > 0) {
              const teamsWithImpacts = Object.entries(response.data.pathAnalysis.teamPaths)
                .filter(([_, pathData]) => {
                  const typedPathData = pathData as {
                    winsChampionship?: {
                      podiumChanges?: { length: number };
                    };
                  };
                  return (
                    typedPathData.winsChampionship &&
                    typedPathData.winsChampionship.podiumChanges &&
                    typedPathData.winsChampionship.podiumChanges.length > 0
                  );
                });
              console.log(`Teams with podium impacts: ${teamsWithImpacts.length}`);
              console.log(`Teams: ${teamsWithImpacts.map(t => t[0]).join(', ')}`);
            }
            
            // Update the analysis data
            setAnalysisData(prevData => {
              if (!prevData) return null;
              return {
                ...prevData,
                pathAnalysis: response.data.pathAnalysis
              };
            });
          } else {
            console.log("Response didn't contain expected path analysis data structure");
          }
        } catch (err) {
          console.error('Error fetching path analysis data:', err);
        }
      };
      
      fetchPathAnalysis();
    }
  }, [activeTab, isLoading]);

  // Additional effect to fetch sorted podium contenders when sort changes
  useEffect(() => {
    if (activeTab === 'podiumContenders' && !isLoading && !error) {
      const fetchSortedContenders = async () => {
        try {
          const response = await api.get(`/tournament/podium-contenders?sort=${sortField}&dir=${sortDirection}`);
          if (analysisData) {
            setAnalysisData({
              ...analysisData,
              podiumContenders: response.data.podiumContenders,
              playersWithNoPodiumChance: response.data.playersWithNoPodiumChance
            });
          }
        } catch (err) {
          console.error('Error fetching sorted podium contenders:', err);
        }
      };
      
      fetchSortedContenders();
    }
  }, [activeTab, sortField, sortDirection]);

  // Format a date from ISO string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate width for percentage bars
  const getPercentageWidth = (percentage: number) => {
    return `${Math.max(percentage, 1)}%`; // Minimum 1% width for visibility
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

  // Handle sort change for podium contenders
  const handleSortChange = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to descending for new field
    }
  };

  // Format percentage with one decimal place
  const formatPercentage = (value: number): string => {
    return value.toFixed(1) + '%';
  };

  // Calculate impact color based on change percentage
  const getImpactColor = (normal: number, affected: number): string => {
    const change = affected - normal;
    if (change > 20) return 'text-green-600';
    if (change > 10) return 'text-green-500';
    if (change > 5) return 'text-green-400';
    if (change < -20) return 'text-red-600';
    if (change < -10) return 'text-red-500';
    if (change < -5) return 'text-red-400';
    return 'text-gray-500';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Loading tournament analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error}</p>
        </div>
        <div className="mt-4">
          <Link 
            to="/"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <p>No tournament analysis data is available yet. Analysis is typically generated after each round.</p>
        </div>
        <div className="mt-4">
          <Link 
            to="/"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold text-blue-800 mb-2">Tournament Analysis</h1>
      <p className="text-gray-600 mb-6">
        Current stage: <span className="font-semibold">{analysisData.roundName}</span> • 
        Updated: <span className="font-semibold">{formatDate(analysisData.timestamp)}</span>
      </p>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
          <h2 className="text-lg font-bold text-gray-700 mb-2">Bracket Statistics</h2>
          <div className="text-sm text-gray-600">Total Brackets</div>
          <div className="text-3xl font-bold text-blue-800">{analysisData.totalBrackets}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500">
          <h2 className="text-lg font-bold text-gray-700 mb-2">Remaining Possibilities</h2>
          <div className="text-sm text-gray-600">Possible Outcomes</div>
          <div className="text-3xl font-bold text-green-800">{analysisData.totalPossibleOutcomes.toLocaleString()}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-500">
          <h2 className="text-lg font-bold text-gray-700 mb-2">Win Contenders</h2>
          <div className="text-sm text-gray-600">Players With Win Chance</div>
          <div className="text-3xl font-bold text-purple-800">{analysisData.playersWithWinChance}</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex flex-wrap -mb-px">
          <button
            onClick={() => setActiveTab('podiumContenders')}
            className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${activeTab === 'podiumContenders' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Podium Chances
          </button>
          <button
            onClick={() => setActiveTab('rareCorrectPicks')}
            className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${activeTab === 'rareCorrectPicks' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Rare Correct Picks
          </button>
          <button
            onClick={() => setActiveTab('teamPaths')}
            className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${activeTab === 'teamPaths' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Team Championship Paths
          </button>
          <button
            onClick={() => setActiveTab('championshipScenarios')}
            className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${activeTab === 'championshipScenarios' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Championship Scenarios
          </button>
          <button
            onClick={() => setActiveTab('championshipPicks')}
            className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${activeTab === 'championshipPicks' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Championship Picks
          </button>
          <button
            onClick={() => setActiveTab('bracketOutcomes')}
            className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${activeTab === 'bracketOutcomes' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Projected Outcomes
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        {/* Podium Contenders Tab */}
        {activeTab === 'podiumContenders' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Podium Contenders</h2>
            <p className="text-gray-600 mb-4">Brackets with chances of finishing in the top 3.</p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('name')}>
                      Participant {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('score')}>
                      Score {sortField === 'score' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('first')}>
                      1st Place % {sortField === 'first' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('second')}>
                      2nd Place % {sortField === 'second' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('third')}>
                      3rd Place % {sortField === 'third' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('podium')}>
                      Podium % {sortField === 'podium' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Possible Places</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analysisData.podiumContenders.map((contender, index) => (
                    <tr key={`${contender.id}-${contender.entryNumber}`} className={index < 3 ? "bg-yellow-50" : ""}>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{index + 1}</div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {contender.participantName}
                          {contender.entryNumber > 1 && (
                            <span className="text-xs text-gray-500 ml-1">
                              (#{contender.entryNumber})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {contender.currentScore}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                          <div 
                            className="bg-yellow-500 h-2.5 rounded-full" 
                            style={{ width: getPercentageWidth(contender.placePercentages[1]) }}
                          ></div>
                        </div>
                        <div className="text-xs font-medium text-gray-900">
                          {contender.placePercentages[1].toFixed(1)}%
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                          <div 
                            className="bg-gray-500 h-2.5 rounded-full" 
                            style={{ width: getPercentageWidth(contender.placePercentages[2]) }}
                          ></div>
                        </div>
                        <div className="text-xs font-medium text-gray-900">
                          {contender.placePercentages[2].toFixed(1)}%
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                          <div 
                            className="bg-amber-600 h-2.5 rounded-full" 
                            style={{ width: getPercentageWidth(contender.placePercentages[3]) }}
                          ></div>
                        </div>
                        <div className="text-xs font-medium text-gray-900">
                          {contender.placePercentages[3].toFixed(1)}%
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: getPercentageWidth(contender.placePercentages.podium) }}
                          ></div>
                        </div>
                        <div className="text-xs font-medium text-blue-600 font-bold">
                          {contender.placePercentages.podium.toFixed(1)}%
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          {contender.minPlace === contender.maxPlace 
                            ? `${contender.minPlace}${getOrdinalSuffix(contender.minPlace)}` 
                            : `${contender.minPlace}${getOrdinalSuffix(contender.minPlace)} - ${contender.maxPlace}${getOrdinalSuffix(contender.maxPlace)}`}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <Link 
                          to={`/bracket/view/${contender.id}`} 
                          className="text-blue-600 hover:text-blue-900"
                          target="_blank"
                        >
                          View Bracket
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan={9} className="py-3 px-4 text-sm text-gray-500">
                      {analysisData.playersWithNoPodiumChance > 0 && (
                        <div className="font-medium">
                          {analysisData.playersWithNoPodiumChance} player{analysisData.playersWithNoPodiumChance !== 1 ? 's' : ''} with no chance of making the podium
                        </div>
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Rare Correct Picks Tab */}
        {activeTab === 'rareCorrectPicks' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Rare Correct Picks</h2>
            <p className="text-gray-600 mb-4">Games where few brackets picked the correct winner.</p>
            
            {analysisData.rareCorrectPicks && analysisData.rareCorrectPicks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysisData.rareCorrectPicks.map((pick) => (
                  <div key={pick.matchupId} className="bg-white border border-blue-100 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                      <div className="text-sm text-blue-800 font-medium">
                        Round {pick.round} • {pick.region} Region
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="bg-gray-100 text-gray-800 text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {pick.teams.teamA.seed}
                          </div>
                          <div className="text-gray-700">{pick.teams.teamA.name}</div>
                        </div>
                        <div className="text-gray-400">vs</div>
                        <div className="flex items-center space-x-2">
                          <div className="bg-gray-100 text-gray-800 text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {pick.teams.teamB.seed}
                          </div>
                          <div className="text-gray-700">{pick.teams.teamB.name}</div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-3 rounded-lg mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <div className="bg-green-100 text-green-800 text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">
                              {pick.winner.seed}
                            </div>
                            <div className="text-green-800 font-medium">{pick.winner.name}</div>
                          </div>
                          <div className="text-green-800 font-medium">Winner</div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500 mb-1">Correctly picked by:</div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: getPercentageWidth(pick.percentage) }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <div>{pick.correctPicks} of {pick.totalPicks} brackets</div>
                        <div className="font-medium text-blue-700">{pick.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-100 p-6 rounded-lg text-center">
                <p className="text-gray-600">No rare correct picks found in the current tournament stage.</p>
              </div>
            )}
          </div>
        )}

        {/* Team Championship Paths Tab */}
{activeTab === 'teamPaths' && (
  <div>
    <h2 className="text-xl font-bold text-gray-800 mb-4">Team Championship Paths</h2>
    <p className="text-gray-600 mb-4">How specific teams winning affects bracket chances.</p>
    
    {analysisData.pathAnalysis && analysisData.pathAnalysis.teamPaths && 
     Object.keys(analysisData.pathAnalysis.teamPaths).length > 0 ? (
      <div className="space-y-8">
        {Object.entries(analysisData.pathAnalysis.teamPaths).map(([teamName, pathData], index) => {
          const typedPathData = pathData as {
            seed: number;
            winsChampionship: {
              podiumChanges: Array<{
                bracketId: string;
                participantName: string;
                entryNumber: number;
                currentScore: number;
                normalPodiumChance: number;
                adjustedPodiumChance: number;
              }>;
            };
          };
          
          if (!typedPathData.winsChampionship || 
              !typedPathData.winsChampionship.podiumChanges || 
              typedPathData.winsChampionship.podiumChanges.length === 0) {
            return null;
          }
          
          return (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                <h3 className="flex items-center text-lg font-semibold text-blue-800">
                  <div className="bg-blue-200 text-blue-800 text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center mr-2">
                    {typedPathData.seed}
                  </div>
                  {teamName} Wins Championship
                </h3>
              </div>
              
              <div className="p-4">
                <div className="text-sm text-gray-600 mb-2">Top bracket impacts:</div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-2 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bracket</th>
                        <th className="px-2 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Normal Podium Chance</th>
                        <th className="px-2 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">If {teamName} Wins</th>
                        <th className="px-2 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {typedPathData.winsChampionship.podiumChanges.slice(0, 5).map((impact, impactIndex) => (
                        <tr key={impactIndex}>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {impact.participantName}
                              {impact.entryNumber > 1 && (
                                <span className="text-xs text-gray-500 ml-1">
                                  (#{impact.entryNumber})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatPercentage(impact.normalPodiumChance)}
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <div className="text-sm font-medium">
                              {formatPercentage(impact.adjustedPodiumChance)}
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <div className={`text-sm font-medium ${getImpactColor(impact.normalPodiumChance, impact.adjustedPodiumChance)}`}>
                              {impact.adjustedPodiumChance > impact.normalPodiumChance ? '+' : ''}
                              {formatPercentage(impact.adjustedPodiumChance - impact.normalPodiumChance)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {typedPathData.winsChampionship.podiumChanges.length > 5 && (
                  <div className="mt-2 text-sm text-gray-500 text-right">
                    Showing top 5 of {typedPathData.winsChampionship.podiumChanges.length} affected brackets
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="bg-gray-100 p-6 rounded-lg text-center">
        <p className="text-gray-600">No team championship path analysis is available for the current tournament stage.</p>
      </div>
    )}
  </div>
)}

{/* Championship Scenarios Tab */}
{activeTab === 'championshipScenarios' && (
  <div>
    <h2 className="text-xl font-bold text-gray-800 mb-4">Championship Scenarios</h2>
    <p className="text-gray-600 mb-4">How specific championship matchups affect bracket chances.</p>
    
    {analysisData.pathAnalysis && analysisData.pathAnalysis.championshipScenarios && 
     Array.isArray(analysisData.pathAnalysis.championshipScenarios) && 
     analysisData.pathAnalysis.championshipScenarios.length > 0 ? (
      <div className="space-y-8">
        {analysisData.pathAnalysis.championshipScenarios.map((scenario, scenarioIndex) => (
          <div key={scenarioIndex} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
              <h3 className="text-lg font-semibold text-blue-800">
                Championship Scenario: {scenario.matchup.teamA.name} vs {scenario.matchup.teamB.name}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              {scenario.outcomes.map((outcome, outcomeIndex) => (
                <div key={outcomeIndex} className="p-4">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 text-green-800 text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center mr-2">
                      {outcome.winner.seed}
                    </div>
                    <div className="text-lg font-medium text-green-800">
                      {outcome.winner.name} Wins Championship
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">Top bracket impacts:</div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-2 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bracket</th>
                          <th className="px-2 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Normal Chance</th>
                          <th className="px-2 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">If {outcome.winner.name} Wins</th>
                          <th className="px-2 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {outcome.bracketImpacts.slice(0, 5).map((impact, impactIndex) => (
                          <tr key={impactIndex}>
                            <td className="px-2 py-2 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {impact.participantName}
                                {impact.entryNumber > 1 && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    (#{impact.entryNumber})
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {formatPercentage(impact.normalPodiumChance)}
                              </div>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap">
                              <div className="text-sm font-medium">
                                {formatPercentage(impact.affectedPodiumChance)}
                              </div>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap">
                              <div className={`text-sm font-medium ${getImpactColor(impact.normalPodiumChance, impact.affectedPodiumChance)}`}>
                                {impact.affectedPodiumChance > impact.normalPodiumChance ? '+' : ''}
                                {formatPercentage(impact.affectedPodiumChance - impact.normalPodiumChance)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {outcome.bracketImpacts.length > 5 && (
                    <div className="mt-2 text-sm text-gray-500 text-right">
                      Showing top 5 of {outcome.bracketImpacts.length} affected brackets
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="bg-gray-100 p-6 rounded-lg text-center">
        <p className="text-gray-600">No championship scenario analysis is available for the current tournament stage.</p>
      </div>
    )}
  </div>
)}

        {/* Championship Picks Tab */}
        {activeTab === 'championshipPicks' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Championship Picks</h2>
            <p className="text-gray-600 mb-4">Distribution of teams picked to win the championship.</p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analysisData.championshipPicks.map((pick, index) => (
                    <tr key={pick.team} className={index < 3 ? "bg-blue-50" : ""}>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{index + 1}</div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {pick.team}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {pick.count}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1 max-w-md">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: getPercentageWidth(pick.percentage) }}
                          ></div>
                        </div>
                        <div className="text-xs font-medium text-gray-900">
                          {pick.percentage.toFixed(1)}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bracket Outcomes Tab */}
        {activeTab === 'bracketOutcomes' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Projected Outcomes</h2>
            <p className="text-gray-600 mb-4">Most common outcomes based on bracket picks.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sweet 16 */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Sweet 16 Picks</h3>
                <div className="space-y-3">
                  {analysisData.bracketOutcomes.sweet16.map((outcome, index) => (
                    <div key={outcome.key} className="bg-white p-3 rounded shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-sm font-medium">{outcome.key.split('_')[1]}</div>
                        <div className="text-sm font-medium">{outcome.percentage.toFixed(1)}%</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-400 h-2 rounded-full" 
                          style={{ width: getPercentageWidth(outcome.percentage) }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {outcome.count} brackets
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Final Four */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Final Four Combinations</h3>
                <div className="space-y-3">
                  {analysisData.bracketOutcomes.finalFour.map((outcome, index) => (
                    <div key={outcome.key} className="bg-white p-3 rounded shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-sm font-medium truncate max-w-xs">
                          {outcome.key.split(',').join(', ')}
                        </div>
                        <div className="text-sm font-medium ml-2 shrink-0">{outcome.percentage.toFixed(1)}%</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-400 h-2 rounded-full" 
                          style={{ width: getPercentageWidth(outcome.percentage) }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {outcome.count} brackets
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Championship */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3">Championship Matchups</h3>
                <div className="space-y-3">
                  {analysisData.bracketOutcomes.championship.map((outcome, index) => (
                    <div key={outcome.key} className="bg-white p-3 rounded shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-sm font-medium">{outcome.key}</div>
                        <div className="text-sm font-medium">{outcome.percentage.toFixed(1)}%</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: getPercentageWidth(outcome.percentage) }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {outcome.count} brackets
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Explanation */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-3">About this Analysis</h2>
        <p className="text-gray-700 mb-3">
          This analysis examines all {analysisData.totalPossibleOutcomes.toLocaleString()} remaining possible tournament outcomes to see how each bracket could perform.
        </p>
        <p className="text-gray-700 mb-3">
          We calculate each bracket's potential final scores, chances of winning,
          and likelihoods of placing on the podium under every possible tournament scenario.
          The analysis is updated after each round.
        </p>
        <p className="text-gray-700">
          <strong>Possible Places:</strong> Shows the range of final standings a bracket could achieve across all remaining tournament scenarios. 
          For example, "1st-5th" means this bracket could finish anywhere from first to fifth place depending on upcoming game results.
        </p>
      </div>
    </div>
  );
};

export default TournamentAnalysisPage;