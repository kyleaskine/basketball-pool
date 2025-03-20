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
  const [standingsData, setStandingsData] = useState<StandingsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterDisplayed, setFilterDisplayed] = useState<number>(50);
  const [tournamentResults, setTournamentResults] = useState<any | null>(null);

  // Sorting state
  const [sortField, setSortField] = useState<string>("position");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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

  // After fetching, ensure we have proper defaults if data is missing
  useEffect(() => {
    if (standingsData && standingsData.standings) {
      // Create a new array with updated objects to avoid mutation warnings
      const updatedStandings = standingsData.standings.map(participant => ({
        ...participant,
        futureRoundPoints: participant.futureRoundPoints || {},
        teamsStillAlive: participant.teamsStillAlive || []
      }));
      
      // Only update if we actually made changes
      if (updatedStandings.some((p, i) => 
        !p.futureRoundPoints || !p.teamsStillAlive
      )) {
        setStandingsData({
          ...standingsData,
          standings: updatedStandings
        });
      }
    }
  }, [standingsData]);

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
    standingsData?.standings.filter((participant) =>
      participant.participantName
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    ) || [];

  // Sort the filtered standings
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

  // Limit displayed results based on filterDisplayed
  const displayedStandings = sortedStandings.slice(0, filterDisplayed);

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
              <p className="text-gray-600">
                No participants found matching your search.
              </p>
            </div>
          ) : (
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
                              {participant.position}
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
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              to={`/bracket/view/${participant.id}`}
                              className="text-blue-600 hover:text-blue-900"
                              target="_blank"
                              onClick={(e) => e.stopPropagation()}
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
        </div>
      ) : null}
    </div>
  );
};

export default StandingsPage;