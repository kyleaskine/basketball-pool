import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import PrintStyleCompactBracket from "../PrintStyleCompactBracket";
import { BracketData, Matchup } from "../types";
import MatchupStatsModal from "./MatchupStatsModal";

const TournamentResultsView: React.FC = () => {
  // Existing state
  const [results, setResults] = useState<{
    results: BracketData;
    completedRounds: number[];
    teams?: Record<string, any>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for matchup stats
  const [selectedMatchupId, setSelectedMatchupId] = useState<number | null>(
    null
  );
  const [isStatsModalOpen, setIsStatsModalOpen] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<"A" | "B" | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await api.get("/tournament/results");
        setResults(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching tournament results:", err);
        setError("Failed to load tournament results. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, []);

  const handleMatchupClick = (matchup: Matchup, slot: "A" | "B") => {
    // Allow clicks for all rounds >= 2 regardless of first round status
    if (matchup.round >= 2) {
      setSelectedMatchupId(matchup.id);
      setSelectedSlot(slot);
      setIsStatsModalOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Loading tournament results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!results || !results.results) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <p>Tournament results are not available yet.</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-2xl font-bold text-blue-800 mb-4">
        Tournament Results
      </h1>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <h2 className="text-lg font-semibold mr-4">Completed Rounds:</h2>
          {results.completedRounds.length === 0 ? (
            <span className="text-yellow-600">No rounds completed yet</span>
          ) : (
            results.completedRounds.map((round) => (
              <span
                key={round}
                className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
              >
                {getRoundName(round)}
              </span>
            ))
          )}
        </div>

        <div className="p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded mb-4">
          <p className="font-medium">Interactive Tournament Bracket</p>
          <p>
            Click on any matchup (2nd round through Championship) to see
            statistics on how people picked that game.
          </p>
        </div>

        <div className="overflow-x-auto">
          <PrintStyleCompactBracket
            bracketData={results.results}
            readOnly={true}
            highlightCorrectPicks={true}
            actualResults={results.results}
            onMatchupClick={handleMatchupClick}
            highlightIncomplete={false}
          />
        </div>
      </div>

      <div className="flex justify-center">
        <Link
          to="/standings"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          View Standings
        </Link>
      </div>

      {/* Stats modal */}
      <MatchupStatsModal
        matchupId={selectedMatchupId}
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        selectedSlot={selectedSlot}
      />
    </div>
  );
};

export default TournamentResultsView;