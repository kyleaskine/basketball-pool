import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Team, Matchup, BracketData } from '../../types';
import PrintStyleCompactBracket from '../../PrintStyleCompactBracket';
import TournamentInitialize from './TournamentInitialize';

interface Game {
  matchupId: number;
  round: number;
  teamA: Team;
  teamB: Team;
  winner: Team | null;
  score: {
    teamA: number;
    teamB: number;
  };
  completed: boolean;
  playedAt?: string;
}

interface TournamentResults {
  _id: string;
  year: number;
  results: BracketData;
  completedRounds: number[];
  games: Game[];
  scoringConfig: {
    [key: number]: number;
  };
  lastUpdated: string;
}

const AdminTournament: React.FC = () => {
  const [results, setResults] = useState<TournamentResults | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isCalculatingScores, setIsCalculatingScores] = useState<boolean>(false);
  const [isLockingBrackets, setIsLockingBrackets] = useState<boolean>(false);
  const [isUnlockingBrackets, setIsUnlockingBrackets] = useState<boolean>(false);
  const [activeRound, setActiveRound] = useState<number>(1);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [scoreTeamA, setScoreTeamA] = useState<string>('');
  const [scoreTeamB, setScoreTeamB] = useState<string>('');

  useEffect(() => {
    fetchTournamentResults();
  }, []);

  const fetchTournamentResults = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/tournament/results');
      setResults(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching tournament results:', err);
      setError('Failed to load tournament results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLockBrackets = async () => {
    if (!window.confirm('Are you sure you want to lock ALL brackets? This cannot be undone!')) {
      return;
    }

    setIsLockingBrackets(true);
    try {
      const response = await api.put('/tournament/lock-brackets');
      setSuccessMessage(`Successfully locked ${response.data.count} brackets`);
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Error locking brackets:', err);
      setError('Failed to lock brackets. Please try again.');
    } finally {
      setIsLockingBrackets(false);
    }
  };

  const handleUnlockBrackets = async () => {
    if (!window.confirm('Are you sure you want to UNLOCK ALL brackets? This should only be done for testing.')) {
      return;
    }

    setIsUnlockingBrackets(true);
    try {
      const response = await api.put('/tournament/unlock-brackets');
      setSuccessMessage(`Successfully unlocked ${response.data.count} brackets`);
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Error unlocking brackets:', err);
      setError('Failed to unlock brackets. Please try again.');
    } finally {
      setIsUnlockingBrackets(false);
    }
  };

  const handleCalculateScores = async () => {
    if (!window.confirm('Are you sure you want to calculate scores for all brackets?')) {
      return;
    }

    setIsCalculatingScores(true);
    try {
      const response = await api.post('/tournament/calculate-scores');
      setSuccessMessage(`Successfully calculated scores: ${response.data.updated} brackets updated`);
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Error calculating scores:', err);
      setError('Failed to calculate scores. Please try again.');
    } finally {
      setIsCalculatingScores(false);
    }
  };

  const handleEditGame = (game: Game) => {
    setEditingGame(game);
    setScoreTeamA(game.score?.teamA?.toString() || '');
    setScoreTeamB(game.score?.teamB?.toString() || '');
  };

  const handleSaveGameResult = async () => {
    if (!editingGame) return;
    
    setIsSaving(true);
    try {
      // Determine winner based on scores
      const scoreA = parseInt(scoreTeamA);
      const scoreB = parseInt(scoreTeamB);
      
      // Check if scores are valid numbers
      if (isNaN(scoreA) || isNaN(scoreB)) {
        setError('Please enter valid scores for both teams');
        setIsSaving(false);
        return;
      }
      
      let winner = null;
      if (scoreA > scoreB) {
        winner = editingGame.teamA;
      } else if (scoreB > scoreA) {
        winner = editingGame.teamB;
      } else {
        setError('Teams cannot have the same score. Please enter a winner.');
        setIsSaving(false);
        return;
      }
      
      const response = await api.put(`/tournament/games/${editingGame.matchupId}`, {
        winner,
        score: {
          teamA: scoreA,
          teamB: scoreB
        },
        completed: true
      });
      
      // Update local state with updated tournament data
      setResults(response.data);
      
      // Clear editing state
      setEditingGame(null);
      setScoreTeamA('');
      setScoreTeamB('');
      
      setSuccessMessage('Game result saved successfully');
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Error saving game result:', err);
      setError('Failed to save game result. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkRoundComplete = async (round: number) => {
    if (!window.confirm(`Are you sure you want to mark Round ${round} as complete?`)) {
      return;
    }
    
    setIsSaving(true);
    try {
      // Update completed rounds
      const completedRounds = results?.completedRounds || [];
      if (!completedRounds.includes(round)) {
        const updatedRounds = [...completedRounds, round].sort();
        
        const response = await api.post('/tournament/results', {
          completedRounds: updatedRounds
        });
        
        setResults(response.data);
        setSuccessMessage(`Round ${round} marked as complete`);
        
        // Auto-clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      }
    } catch (err) {
      console.error('Error marking round as complete:', err);
      setError('Failed to update round status. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

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

  // Format date from string
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

  // Get games for the active round
  const gamesForActiveRound = results?.games?.filter(game => game.round === activeRound) || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tournament Management</h1>
      
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
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div>
          {/* Control Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={handleLockBrackets}
              disabled={isLockingBrackets}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
            >
              {isLockingBrackets ? 'Locking...' : 'Lock All Brackets'}
            </button>
            
            <button
              onClick={handleUnlockBrackets}
              disabled={isUnlockingBrackets}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400"
            >
              {isUnlockingBrackets ? 'Unlocking...' : 'Unlock All Brackets (Testing)'}
            </button>
            
            <button
              onClick={handleCalculateScores}
              disabled={isCalculatingScores || !results?.completedRounds?.length}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isCalculatingScores ? 'Calculating...' : 'Calculate Bracket Scores'}
            </button>
            
            <Link
              to="/admin/brackets"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              View Brackets
            </Link>
            
            <Link
              to="/standings"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              target="_blank"
            >
              View Public Standings
            </Link>
          </div>
          
          {/* Tournament Initialization */}
          {!results && (
            <div className="mb-8">
              <TournamentInitialize />
            </div>
          )}
          
          {/* Tournament Information */}
          {results && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">Tournament Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium">{results?.lastUpdated ? formatDate(results.lastUpdated) : 'Not yet updated'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed Rounds</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {results?.completedRounds?.length ? (
                      results.completedRounds.map(round => (
                        <span 
                          key={round}
                          className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                        >
                          {getRoundName(round)}
                        </span>
                      ))
                    ) : (
                      <span className="text-yellow-600">No rounds completed yet</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600">Scoring Configuration</p>
                <div className="flex flex-wrap gap-4 mt-1">
                  {results?.scoringConfig ? (
                    Object.entries(results.scoringConfig).map(([round, points]) => (
                      <div key={round} className="px-3 py-1 bg-gray-100 rounded-lg text-sm">
                        <span className="font-medium">{getRoundName(parseInt(round))}:</span> {points} pts
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-600">Default scoring configuration</span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Round Selection Tabs */}
          {results && (
            <div className="mb-4">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  {[1, 2, 3, 4, 5, 6].map(round => (
                    <button
                      key={round}
                      onClick={() => setActiveRound(round)}
                      className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                        activeRound === round
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } ${
                        results?.completedRounds?.includes(round) ? 'bg-green-50' : ''
                      }`}
                    >
                      {getRoundName(round)}
                      {results?.completedRounds?.includes(round) && (
                        <span className="ml-2 text-green-600">✓</span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}
          
          {/* Game Results for Selected Round */}
          {results && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Games for {getRoundName(activeRound)}</h2>
                
                {!results?.completedRounds?.includes(activeRound) && (
                  <button
                    onClick={() => handleMarkRoundComplete(activeRound)}
                    disabled={isSaving}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {isSaving ? 'Saving...' : 'Mark Round Complete'}
                  </button>
                )}
              </div>
              
              {gamesForActiveRound.length === 0 ? (
                <div className="bg-gray-100 p-6 rounded-lg text-center">
                  <p className="text-gray-600">No games found for this round.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gamesForActiveRound.map(game => (
                    <div 
                      key={game.matchupId}
                      className={`border rounded-lg overflow-hidden ${
                        game.completed ? 'border-green-500 bg-green-50' : 'border-gray-300'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            Game #{game.matchupId}
                          </span>
                          {game.completed ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Complete
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                              Pending
                            </span>
                          )}
                        </div>
                        
                        {/* Team Display */}
                        <div className="mb-4">
                          <div className="flex items-center mb-2">
                            <span className="flex items-center justify-center bg-gray-200 text-xs font-bold rounded-full w-6 h-6 mr-2">
                              {game.teamA.seed}
                            </span>
                            <span className="font-medium">{game.teamA.name}</span>
                            {game.completed && game.winner?.name === game.teamA.name && (
                              <span className="ml-2 text-green-600">Winner</span>
                            )}
                            {game.completed && (
                              <span className="ml-auto font-bold">{game.score?.teamA || 0}</span>
                            )}
                          </div>
                          <div className="flex items-center">
                            <span className="flex items-center justify-center bg-gray-200 text-xs font-bold rounded-full w-6 h-6 mr-2">
                              {game.teamB.seed}
                            </span>
                            <span className="font-medium">{game.teamB.name}</span>
                            {game.completed && game.winner?.name === game.teamB.name && (
                              <span className="ml-2 text-green-600">Winner</span>
                            )}
                            {game.completed && (
                              <span className="ml-auto font-bold">{game.score?.teamB || 0}</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div>
                          {!game.completed ? (
                            <button
                              onClick={() => handleEditGame(game)}
                              className="w-full px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Enter Result
                            </button>
                          ) : (
                            <div className="text-sm text-gray-500">
                              Completed on {formatDate(game.playedAt || '')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Edit Game Modal */}
          {editingGame && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-bold mb-4">
                  Enter Game Result
                </h3>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="flex items-center justify-center bg-gray-200 text-xs font-bold rounded-full w-6 h-6 mr-2">
                        {editingGame.teamA.seed}
                      </span>
                      <span className="font-medium">{editingGame.teamA.name}</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      className="w-20 px-3 py-1 border border-gray-300 rounded-md"
                      value={scoreTeamA}
                      onChange={(e) => setScoreTeamA(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="flex items-center justify-center bg-gray-200 text-xs font-bold rounded-full w-6 h-6 mr-2">
                        {editingGame.teamB.seed}
                      </span>
                      <span className="font-medium">{editingGame.teamB.name}</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      className="w-20 px-3 py-1 border border-gray-300 rounded-md"
                      value={scoreTeamB}
                      onChange={(e) => setScoreTeamB(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setEditingGame(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveGameResult}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {isSaving ? 'Saving...' : 'Save Result'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Tournament Bracket Preview */}
          {results?.results && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Tournament Bracket Preview</h2>
              <PrintStyleCompactBracket
                bracketData={results.results}
                readOnly={true}
                highlightCorrectPicks={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminTournament;