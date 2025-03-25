import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

// Types for the analysis data based on the schema
interface TopContender {
  id: string;
  participantName: string;
  entryNumber: number;
  currentScore: number;
  winPercentage: number;
  maxScore: number;
  minPlace: number;
  maxPlace: number;
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

interface HighestCeiling {
  id: string;
  participantName: string;
  entryNumber: number;
  currentScore: number;
  maxScore: number;
  minPlace: number;
  maxPlace: number;
}

interface VolatileBracket {
  id: string;
  participantName: string;
  entryNumber: number;
  currentScore: number;
  minScore: number;
  maxScore: number;
  minPlace: number;
  maxPlace: number;
}

interface CinderellaTeam {
  name: string;
  seed: number;
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

interface TournamentAnalysisData {
  timestamp: string;
  stage: string;
  totalBrackets: number;
  totalPossibleOutcomes: number;
  roundName: string;
  currentRound: number;
  topContenders: TopContender[];
  podiumContenders: PodiumContender[];
  highestCeilings: HighestCeiling[];
  mostVolatile: VolatileBracket[];
  cinderellaTeams: CinderellaTeam[];
  championshipPicks: ChampionshipPick[];
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
  const [activeTab, setActiveTab] = useState<string>('topContenders');

  useEffect(() => {
    const fetchAnalysisData = async () => {
      setIsLoading(true);
      try {
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
          <h2 className="text-lg font-bold text-gray-700 mb-2">Cinderella Teams</h2>
          <div className="text-sm text-gray-600">Underdogs Still Active</div>
          <div className="text-3xl font-bold text-purple-800">{analysisData.cinderellaTeams.length}</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex flex-wrap -mb-px">
          <button
            onClick={() => setActiveTab('topContenders')}
            className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${activeTab === 'topContenders' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Top Contenders
          </button>
          <button
            onClick={() => setActiveTab('podiumContenders')}
            className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${activeTab === 'podiumContenders' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Podium Chances
          </button>
          <button
            onClick={() => setActiveTab('highestCeilings')}
            className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${activeTab === 'highestCeilings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Highest Ceilings
          </button>
          <button
            onClick={() => setActiveTab('mostVolatile')}
            className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${activeTab === 'mostVolatile' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Most Volatile
          </button>
          <button
            onClick={() => setActiveTab('championshipPicks')}
            className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${activeTab === 'championshipPicks' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Championship Picks
          </button>
          <button
            onClick={() => setActiveTab('cinderellaTeams')}
            className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${activeTab === 'cinderellaTeams' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Cinderella Teams
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
        {/* Top Contenders Tab */}
        {activeTab === 'topContenders' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Top Contenders</h2>
            <p className="text-gray-600 mb-4">Brackets with the highest chances of winning the pool.</p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Score</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Score</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Win Chance</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Possible Places</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analysisData.topContenders.map((contender, index) => (
                    <tr key={`${contender.id}-${contender.entryNumber}`} className={index < 3 ? "bg-yellow-50" : ""}>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {index + 1}
                          {index === 0 && <span className="ml-1 text-yellow-500">🏆</span>}
                        </div>
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
                        <div className="text-sm font-medium text-gray-900">
                          {contender.maxScore}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: getPercentageWidth(contender.winPercentage) }}
                          ></div>
                        </div>
                        <div className="text-xs font-medium text-gray-900">
                          {contender.winPercentage.toFixed(1)}%
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
              </table>
            </div>
          </div>
        )}

        {/* Podium Contenders Tab */}
        {activeTab === 'podiumContenders' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Podium Contenders</h2>
            <p className="text-gray-600 mb-4">Brackets with the highest chances of finishing in the top 3.</p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Score</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">1st Place %</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">2nd Place %</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">3rd Place %</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Podium %</th>
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
              </table>
            </div>
          </div>
        )}

        {/* Highest Ceilings Tab */}
        {activeTab === 'highestCeilings' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Highest Ceiling Brackets</h2>
            <p className="text-gray-600 mb-4">Brackets with the highest maximum possible scores.</p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Score</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Possible Score</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points to Gain</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Possible Places</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analysisData.highestCeilings.map((bracket, index) => (
                    <tr key={`${bracket.id}-${bracket.entryNumber}`} className={index < 3 ? "bg-green-50" : ""}>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{index + 1}</div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {bracket.participantName}
                          {bracket.entryNumber > 1 && (
                            <span className="text-xs text-gray-500 ml-1">
                              (#{bracket.entryNumber})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {bracket.currentScore}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-600">
                          {bracket.maxScore}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">
                          +{bracket.maxScore - bracket.currentScore}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          {bracket.minPlace === bracket.maxPlace 
                            ? `${bracket.minPlace}${getOrdinalSuffix(bracket.minPlace)}` 
                            : `${bracket.minPlace}${getOrdinalSuffix(bracket.minPlace)} - ${bracket.maxPlace}${getOrdinalSuffix(bracket.maxPlace)}`}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          {bracket.minPlace === bracket.maxPlace 
                            ? `${bracket.minPlace}${getOrdinalSuffix(bracket.minPlace)}` 
                            : `${bracket.minPlace}${getOrdinalSuffix(bracket.minPlace)} - ${bracket.maxPlace}${getOrdinalSuffix(bracket.maxPlace)}`}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <Link 
                          to={`/bracket/view/${bracket.id}`} 
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
            </div>
          </div>
        )}

        {/* Most Volatile Tab */}
        {activeTab === 'mostVolatile' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Most Volatile Brackets</h2>
            <p className="text-gray-600 mb-4">Brackets with the widest range of possible outcomes.</p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Score</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Score</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Score</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Range</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Possible Places</th>
                    <th className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analysisData.mostVolatile.map((bracket, index) => (
                    <tr key={`${bracket.id}-${bracket.entryNumber}`} className={index < 3 ? "bg-purple-50" : ""}>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{index + 1}</div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {bracket.participantName}
                          {bracket.entryNumber > 1 && (
                            <span className="text-xs text-gray-500 ml-1">
                              (#{bracket.entryNumber})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {bracket.currentScore}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-red-600">
                          {bracket.minScore}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          {bracket.maxScore}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-purple-600">
                          {bracket.maxScore - bracket.minScore}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <Link 
                          to={`/bracket/view/${bracket.id}`} 
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
            </div>
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

        {/* Cinderella Teams Tab */}
        {activeTab === 'cinderellaTeams' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Cinderella Teams</h2>
            <p className="text-gray-600 mb-4">Underdog teams (seed 5 or higher) still alive in the tournament.</p>
            
            {analysisData.cinderellaTeams.length === 0 ? (
              <div className="bg-gray-100 p-6 rounded-lg text-center">
                <p className="text-gray-600">No cinderella teams found in the current tournament stage.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysisData.cinderellaTeams.map(team => (
                  <div key={team.name} className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center bg-purple-100 text-purple-800 text-xl font-bold rounded-full w-12 h-12 mr-3">
                        {team.seed}
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-800">{team.name}</div>
                        <div className="text-sm text-gray-600">
                          {team.seed === 16 ? "Biggest" : 
                           team.seed >= 13 ? "Major" : 
                           team.seed >= 10 ? "Significant" : 
                           "Minor"} Upset
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
          This analysis examines all {analysisData.totalPossibleOutcomes.toLocaleString()} 
          remaining possible tournament outcomes to see how each bracket could perform.
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