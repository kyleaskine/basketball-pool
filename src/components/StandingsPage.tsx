import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import FinalFourDetails from "./FinalFourDetails";
import ScoreBreakdown from "./ScoreBreakdown";

interface Team {
  seed: number;
  name: string;
}

interface Participant {
  position: number;
  participantName: string;
  entryNumber: number;
  score: number;
  userEmail: string;
  id: string;
  // New properties for enhanced standings
  possibleScore?: number;
  champion?: Team;
  runnerUp?: Team;
  finalFourTeams?: Team[];
  // Additional tracking data
  teamsStillAlive?: string[];
  futureRoundPoints?: {[key: string]: number};
  // Display position for ties
  displayPosition?: string;
  // New properties for round and region breakdowns
  roundScores?: {[key: string]: number};
  regionScores?: {[key: string]: number};
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

// Tab options
type TabId = 'main' | 'rounds' | 'regions';

const StandingsPage: React.FC = () => {
  const [standingsData, setStandingsData] = useState<StandingsData | null>(null);
  const [processedStandings, setProcessedStandings] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterDisplayed, setFilterDisplayed] = useState<number>(50);
  const [tournamentResults, setTournamentResults] = useState<any | null>(null);
  
  // Tabs state
  const [activeTab, setActiveTab] = useState<TabId>('main');

  // Sorting state for main standings
  const [sortField, setSortField] = useState<string>("position");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Sorting state for round scores
  const [roundSortField, setRoundSortField] = useState<string>("position");
  const [roundSortDirection, setRoundSortDirection] = useState<"asc" | "desc">("asc");
  
  // Sorting state for region scores
  const [regionSortField, setRegionSortField] = useState<string>("position");
  const [regionSortDirection, setRegionSortDirection] = useState<"asc" | "desc">("asc");

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

  // Calculate round and region scores
  const calculateRoundAndRegionScores = (standings: Participant[], tournamentData: any): Participant[] => {
    if (!tournamentData || !tournamentData.results) return standings;
    
    return standings.map(participant => {
      // Initialize round and region scores
      const roundScores: {[key: string]: number} = {
        "1": 0, // First Round
        "2": 0, // Second Round
        "3": 0, // Sweet 16
        "4": 0, // Elite 8
        "5": 0, // Final Four
        "6": 0  // Championship
      };
      
      const regionScores: {[key: string]: number} = {
        "East": 0,
        "West": 0,
        "South": 0,
        "Midwest": 0,
        "FinalFour": 0
      };
      
      // If we don't have picks data, return the participant as is
      if (!participant.id || !tournamentData || !tournamentData.results) {
        return {
          ...participant,
          roundScores,
          regionScores
        };
      }
      
      // Check if picks exist in tournament brackets
      if (tournamentData.games) {
        // We need to fetch this participant's bracket data to calculate scores by round and region
        // This is a simplified simulation since we don't have access to the actual bracket picks here
        
        // In a real implementation, this would analyze each pick and match it with the tournament results
        // For now, we'll simulate random score distributions for the demo
        
        // Get total score from participant
        const totalScore = participant.score || 0;
        
        // Distribute the score among rounds based on a weighted distribution
        // In a real implementation, this would be calculated from actual picks
        if (totalScore > 0) {
          const roundDistribution = [0.15, 0.20, 0.25, 0.15, 0.15, 0.10]; // Example distribution
          for (let i = 1; i <= 6; i++) {
            roundScores[i.toString()] = Math.round(totalScore * roundDistribution[i-1]);
          }
          
          // Distribute the score among regions based on another weighted distribution
          const regionDistribution = [0.25, 0.25, 0.25, 0.15, 0.10]; // Example distribution
          regionScores["East"] = Math.round(totalScore * regionDistribution[0]);
          regionScores["West"] = Math.round(totalScore * regionDistribution[1]);
          regionScores["South"] = Math.round(totalScore * regionDistribution[2]);
          regionScores["Midwest"] = Math.round(totalScore * regionDistribution[3]);
          regionScores["FinalFour"] = Math.round(totalScore * regionDistribution[4]);
        }
      }
      
      return {
        ...participant,
        roundScores,
        regionScores
      };
    });
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch tournament results first to check for eliminated teams
        const resultsResponse = await api.get("/tournament/results");
        setTournamentResults(resultsResponse.data);

        // Then fetch standings
        const standingsResponse = await api.get("/tournament/enhanced-standings");
        setStandingsData(standingsResponse.data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        
        // Try fallback to regular standings and calculating additional data client-side
        try {
          const standingsResponse = await api.get("/tournament/standings");
          
          // If we have tournament results but no enhanced standings, fetch bracket details
          if (tournamentResults) {
            // This would be the place to enhance the standings with more data
            // But for simplicity in this implementation, we'll use the basic standings
            setStandingsData(standingsResponse.data);
          } else {
            setStandingsData(standingsResponse.data);
          }
          
          setError(null);
        } catch (standingsErr) {
          if (err.response && err.response.status === 400) {
            setError(
              "No tournament results available yet. Check back after the games begin!"
            );
          } else {
            setError("Failed to load standings. Please try again later.");
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process standings data separately to avoid infinite loop
  useEffect(() => {
    if (standingsData && standingsData.standings) {
      // Create a new array with updated objects to avoid mutation warnings
      const updatedStandings = standingsData.standings.map(participant => ({
        ...participant,
        futureRoundPoints: participant.futureRoundPoints || {},
        teamsStillAlive: participant.teamsStillAlive || []
        // Don't override roundScores and regionScores if they come from the API
      }));
      
      // Apply tied rankings calculation
      const withTiedRanks = calculateTiedRankings(updatedStandings);
      
      // Store in separate state
      setProcessedStandings(withTiedRanks);
    }
  }, [standingsData, tournamentResults]);

  const getRoundName = (round: number): string => {
    switch (round) {
      case 1:
        return "First Round";
      case 2:
        return "Second Round";
      case 3:
        return "Sweet 16";
      case 4:
        return "Elite 8";
      case 5:
        return "Final Four";
      case 6:
        return "Championship";
      default:
        return `Round ${round}`;
    }
  };

  // Handle column header click for sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      // If already sorting by this field, toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Start sorting by this field
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle round header sorting
  const handleRoundSort = (field: string) => {
    if (roundSortField === field) {
      setRoundSortDirection(roundSortDirection === "asc" ? "desc" : "asc");
    } else {
      setRoundSortField(field);
      setRoundSortDirection("asc");
    }
  };

  // Handle region header sorting
  const handleRegionSort = (field: string) => {
    if (regionSortField === field) {
      setRegionSortDirection(regionSortDirection === "asc" ? "desc" : "asc");
    } else {
      setRegionSortField(field);
      setRegionSortDirection("asc");
    }
  };

  // Check if a team is eliminated
  const isTeamEliminated = (teamName: string): boolean => {
    if (!tournamentResults || !tournamentResults.teams || !teamName) return false;
    return tournamentResults.teams[teamName]?.eliminated === true;
  };

  // Get eliminated round for display purposes
  const getEliminationRound = (teamName: string): string | null => {
    if (!tournamentResults || !tournamentResults.teams || !teamName) return null;
    const round = tournamentResults.teams[teamName]?.eliminationRound;
    return round ? getRoundName(round) : null;
  };

  // Render team with appropriate styling based on elimination status
  const renderTeamWithStatus = (team: Team | undefined): React.ReactNode => {
    if (!team) return "N/A";
    
    const eliminated = isTeamEliminated(team.name);
    const eliminationRound = getEliminationRound(team.name);
    
    return (
      <div className="flex items-center">
        <span className="flex items-center justify-center bg-gray-200 text-xs font-bold rounded-full w-6 h-6 mr-2">
          {team.seed}
        </span>
        <span className={`${eliminated ? "line-through italic text-red-600" : "font-medium"}`}>
          {team.name}
          {eliminated && eliminationRound && (
            <span className="ml-1 text-xs text-gray-500 no-underline">
              (out in {eliminationRound})
            </span>
          )}
        </span>
      </div>
    );
  };

  // State to track expanded rows
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Toggle row expansion
  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  
  // Filter standings by search term
  const filteredStandings =
    processedStandings.filter((participant) =>
      participant.participantName
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    ) || [];

  // Sort the filtered standings for main tab
  const sortedStandings = [...filteredStandings].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case "name":
        comparison = a.participantName.localeCompare(b.participantName);
        break;
      case "score":
        comparison = a.score - b.score;
        break;
      case "possible":
        comparison = (a.possibleScore || 0) - (b.possibleScore || 0);
        break;
      case "position":
      default:
        comparison = a.position - b.position;
        break;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Sort the filtered standings for rounds tab
  const roundSortedStandings = [...filteredStandings].sort((a, b) => {
    let comparison = 0;

    // Handle specific round sorting
    if (roundSortField.startsWith("round_")) {
      const roundKey = roundSortField.split("_")[1];
      comparison = (a.roundScores?.[roundKey] || 0) - (b.roundScores?.[roundKey] || 0);
    } else {
      // Default to position sorting
      comparison = a.position - b.position;
    }

    return roundSortDirection === "asc" ? comparison : -comparison;
  });

  // Sort the filtered standings for regions tab
  const regionSortedStandings = [...filteredStandings].sort((a, b) => {
    let comparison = 0;

    // Handle specific region sorting
    if (regionSortField.startsWith("region_")) {
      const regionKey = regionSortField.split("_")[1];
      comparison = (a.regionScores?.[regionKey] || 0) - (b.regionScores?.[regionKey] || 0);
    } else {
      // Default to position sorting
      comparison = a.position - b.position;
    }

    return regionSortDirection === "asc" ? comparison : -comparison;
  });

  // Limit displayed results based on filterDisplayed
  const displayedStandings = sortedStandings.slice(0, filterDisplayed);
  const displayedRoundStandings = roundSortedStandings.slice(0, filterDisplayed);
  const displayedRegionStandings = regionSortedStandings.slice(0, filterDisplayed);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold text-blue-800 mb-2">
        Tournament Standings
      </h1>

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
                <p className="text-2xl font-bold text-blue-800">
                  {standingsData.stats.totalBrackets}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-blue-800">
                  {standingsData.stats.averageScore.toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">High Score</p>
                <p className="text-2xl font-bold text-blue-800">
                  {standingsData.stats.highestScore}
                </p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">Completed Rounds</p>
              <div className="flex flex-wrap justify-center gap-2 mt-1">
                {standingsData.stats.completedRounds.length === 0 ? (
                  <span className="text-yellow-600">
                    No rounds completed yet
                  </span>
                ) : (
                  standingsData.stats.completedRounds.map((round) => (
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

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('main')}
                  className={`${
                    activeTab === 'main'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                >
                  Overall Standings
                </button>
                <button
                  onClick={() => setActiveTab('rounds')}
                  className={`${
                    activeTab === 'rounds'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                >
                  Round-by-Round
                </button>
                <button
                  onClick={() => setActiveTab('regions')}
                  className={`${
                    activeTab === 'regions'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                >
                  Scores by Region
                </button>
              </nav>
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

          {/* No results message */}
          {filteredStandings.length === 0 && (
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <p className="text-gray-600">
                No participants found matching your search.
              </p>
            </div>
          )}

          {/* Main Standings Table */}
          {activeTab === 'main' && filteredStandings.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("position")}
                    >
                      Rank
                      {sortField === "position" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("name")}
                    >
                      Participant
                      {sortField === "name" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </th>
                    <th
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("score")}
                    >
                      Score
                      {sortField === "score" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </th>
                    <th
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("possible")}
                    >
                      Possible
                      {sortField === "possible" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Champion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Runner Up
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedStandings.map((participant) => {
                    const rowId = `${participant.id}-${participant.entryNumber}`;
                    const isExpanded = expandedRows.has(rowId);
                    
                    return (
                      <React.Fragment key={rowId}>
                        <tr
                          className={`hover:bg-gray-50 ${
                            participant.position <= 3 ? "bg-yellow-50" : ""
                          } cursor-pointer`}
                          onClick={() => toggleRowExpansion(rowId)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className={`text-sm font-bold ${
                                participant.position === 1
                                  ? "text-yellow-600"
                                  : participant.position === 2
                                  ? "text-gray-500"
                                  : participant.position === 3
                                  ? "text-amber-700"
                                  : "text-gray-900"
                              }`}
                            >
                              {participant.position === 1 ? "🏆 " : ""}
                              {participant.position === 2 ? "🥈 " : ""}
                              {participant.position === 3 ? "🥉 " : ""}
                              {participant.displayPosition || participant.position}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {participant.participantName}
                                {participant.entryNumber > 1 && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    (#{participant.entryNumber})
                                  </span>
                                )}
                              </div>
                              <button className="ml-2 text-gray-500">
                                {isExpanded ? (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                  </svg>
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-bold text-gray-900">
                              {participant.score}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {participant.possibleScore !== undefined ? (
                                <span className={participant.possibleScore > participant.score ? "text-green-600" : ""}>
                                  {participant.possibleScore}
                                </span>
                              ) : "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderTeamWithStatus(participant.champion)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderTeamWithStatus(participant.runnerUp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                            <Link
                              to={`/bracket/view/${participant.id}`}
                              className="text-blue-600 hover:text-blue-900"
                              target="_blank"
                            >
                              View Bracket
                            </Link>
                          </td>
                        </tr>
                        
                        {/* Expanded details row */}
                        {isExpanded && (
                          <tr className="bg-gray-50">
                            <td colSpan={7} className="px-6 py-4">
                              <div className="space-y-4">
                                <FinalFourDetails
                                  champion={participant.champion}
                                  runnerUp={participant.runnerUp}
                                  finalFourTeams={participant.finalFourTeams}
                                  tournamentResults={tournamentResults}
                                />
                                
                                <ScoreBreakdown
                                  score={participant.score}
                                  possibleScore={participant.possibleScore}
                                  tournamentResults={tournamentResults}
                                  futureRoundPoints={participant.futureRoundPoints}
                                  teamsStillAlive={participant.teamsStillAlive}
                                  roundScores={participant.roundScores}
                                  regionScores={participant.regionScores}
                                />
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>

              {/* Show count of filtered results */}
              {searchTerm && (
                <div className="p-3 text-center text-sm text-gray-600">
                  Showing {Math.min(filterDisplayed, filteredStandings.length)}{" "}
                  of {filteredStandings.length} results matching "{searchTerm}"
                </div>
              )}
            </div>
          )}

          {/* Round-by-Round Standings Table */}
          {activeTab === 'rounds' && filteredStandings.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleRoundSort("position")}
                    >
                      Rank
                      {roundSortField === "position" && (
                        <span className="ml-1">
                          {roundSortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </th>
                    <th
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleRoundSort("name")}
                    >
                      Participant
                      {roundSortField === "name" && (
                        <span className="ml-1">
                          {roundSortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </th>
                    <th
                      className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleRoundSort("score")}
                    >
                      Total
                      {roundSortField === "score" && (
                        <span className="ml-1">
                          {roundSortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </th>
                    {/* Round columns */}
                    {[1, 2, 3, 4, 5, 6].map(round => (
                      <th
                        key={`round_${round}`}
                        className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleRoundSort(`round_${round}`)}
                      >
                        {getRoundName(round).split(' ')[0]}
                        {roundSortField === `round_${round}` && (
                          <span className="ml-1">
                            {roundSortDirection === "asc" ? "▲" : "▼"}
                          </span>
                        )}
                      </th>
                    ))}
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedRoundStandings.map((participant) => {
                    const rowId = `rounds-${participant.id}-${participant.entryNumber}`;
                    
                    return (
                      <tr
                        key={rowId}
                        className={`hover:bg-gray-50 ${
                          participant.position <= 3 ? "bg-yellow-50" : ""
                        }`}
                      >
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div
                            className={`text-sm font-bold ${
                              participant.position === 1
                                ? "text-yellow-600"
                                : participant.position === 2
                                ? "text-gray-500"
                                : participant.position === 3
                                ? "text-amber-700"
                                : "text-gray-900"
                            }`}
                          >
                            {participant.position === 1 ? "🏆 " : ""}
                            {participant.position === 2 ? "🥈 " : ""}
                            {participant.position === 3 ? "🥉 " : ""}
                            {participant.displayPosition || participant.position}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {participant.participantName}
                            {participant.entryNumber > 1 && (
                              <span className="text-xs text-gray-500 ml-1">
                                (#{participant.entryNumber})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-center">
                          <div className="text-sm font-bold text-gray-900">
                            {participant.score}
                          </div>
                        </td>
                        {/* Round scores */}
                        {[1, 2, 3, 4, 5, 6].map(round => {
                          // Convert to string key if needed
                          const roundKey = round.toString();
                          return (
                            <td key={`${rowId}-round-${round}`} className="px-3 py-4 whitespace-nowrap text-center">
                              <div 
                                className={`text-sm ${
                                  (participant.roundScores?.[roundKey] || 0) > 0 
                                    ? "font-medium text-blue-600" 
                                    : "text-gray-400"
                                }`}
                              >
                                {participant.roundScores?.[roundKey] || 0}
                              </div>
                            </td>
                          );
                        })}
                        <td className="px-3 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <Link
                            to={`/bracket/view/${participant.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            target="_blank"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Show count of filtered results */}
              {searchTerm && (
                <div className="p-3 text-center text-sm text-gray-600">
                  Showing {Math.min(filterDisplayed, filteredStandings.length)}{" "}
                  of {filteredStandings.length} results matching "{searchTerm}"
                </div>
              )}
            </div>
          )}

          {/* Region Standings Table */}
          {activeTab === 'regions' && filteredStandings.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleRegionSort("position")}
                    >
                      Rank
                      {regionSortField === "position" && (
                        <span className="ml-1">
                          {regionSortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </th>
                    <th
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleRegionSort("name")}
                    >
                      Participant
                      {regionSortField === "name" && (
                        <span className="ml-1">
                          {regionSortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </th>
                    <th
                      className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleRegionSort("score")}
                    >
                      Total
                      {regionSortField === "score" && (
                        <span className="ml-1">
                          {regionSortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </th>
                    {/* Region columns */}
                    {["East", "West", "South", "Midwest", "FinalFour"].map(region => (
                      <th
                        key={`region_${region}`}
                        className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleRegionSort(`region_${region}`)}
                      >
                        {region === "FinalFour" ? "Final Four" : region}
                        {regionSortField === `region_${region}` && (
                          <span className="ml-1">
                            {regionSortDirection === "asc" ? "▲" : "▼"}
                          </span>
                        )}
                      </th>
                    ))}
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedRegionStandings.map((participant) => {
                    const rowId = `regions-${participant.id}-${participant.entryNumber}`;
                    
                    return (
                      <tr
                        key={rowId}
                        className={`hover:bg-gray-50 ${
                          participant.position <= 3 ? "bg-yellow-50" : ""
                        }`}
                      >
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div
                            className={`text-sm font-bold ${
                              participant.position === 1
                                ? "text-yellow-600"
                                : participant.position === 2
                                ? "text-gray-500"
                                : participant.position === 3
                                ? "text-amber-700"
                                : "text-gray-900"
                            }`}
                          >
                            {participant.position === 1 ? "🏆 " : ""}
                            {participant.position === 2 ? "🥈 " : ""}
                            {participant.position === 3 ? "🥉 " : ""}
                            {participant.displayPosition || participant.position}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {participant.participantName}
                            {participant.entryNumber > 1 && (
                              <span className="text-xs text-gray-500 ml-1">
                                (#{participant.entryNumber})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-center">
                          <div className="text-sm font-bold text-gray-900">
                            {participant.score}
                          </div>
                        </td>
                        {/* Region scores */}
                        {["East", "West", "South", "Midwest", "FinalFour"].map(region => (
                          <td key={`${rowId}-region-${region}`} className="px-3 py-4 whitespace-nowrap text-center">
                            <div 
                              className={`text-sm ${
                                (participant.regionScores?.[region] || 0) > 0 
                                  ? "font-medium text-blue-600" 
                                  : "text-gray-400"
                              }`}
                            >
                              {participant.regionScores?.[region] !== undefined 
                                ? participant.regionScores[region] 
                                : 0}
                            </div>
                          </td>
                        ))}
                        <td className="px-3 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <Link
                            to={`/bracket/view/${participant.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            target="_blank"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Show count of filtered results */}
              {searchTerm && (
                <div className="p-3 text-center text-sm text-gray-600">
                  Showing {Math.min(filterDisplayed, filteredStandings.length)}{" "}
                  of {filteredStandings.length} results matching "{searchTerm}"
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