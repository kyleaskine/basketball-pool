import React from 'react';

interface ScoreBreakdownProps {
  score: number;
  possibleScore: number | undefined;
  tournamentResults: any;
  futureRoundPoints?: {[key: string]: number};
  teamsStillAlive?: string[];
}

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({
  score,
  possibleScore,
  tournamentResults,
  futureRoundPoints = {},
  teamsStillAlive = []
}) => {
  // Calculate points per round if tournament results available
  const roundScores = React.useMemo(() => {
    if (!tournamentResults || !tournamentResults.scoringConfig) {
      return null;
    }
    
    return {
      round1: tournamentResults.scoringConfig[1] || 1,
      round2: tournamentResults.scoringConfig[2] || 2,
      round3: tournamentResults.scoringConfig[3] || 4,
      round4: tournamentResults.scoringConfig[4] || 8,
      round5: tournamentResults.scoringConfig[5] || 16,
      round6: tournamentResults.scoringConfig[6] || 32
    } as { [key in `round${1 | 2 | 3 | 4 | 5 | 6}`]: number };
  }, [tournamentResults]);

  // Calculate remaining possible points (maximum potential - current score)
  const remainingPoints = (possibleScore !== undefined && possibleScore >= score) ? possibleScore - score : 0;
  
  // Calculate lost points (points that were theoretically available but now impossible)
  const maxPossiblePoints = React.useMemo(() => {
    if (!roundScores) return 0;
    return (
      (32 * roundScores.round1) + // 32 first round games
      (16 * roundScores.round2) + // 16 second round games
      (8 * roundScores.round3) +  // 8 sweet sixteen games
      (4 * roundScores.round4) +  // 4 elite eight games
      (2 * roundScores.round5) +  // 2 final four games
      (1 * roundScores.round6)    // 1 championship game
    );
  }, [roundScores]);
  
  const lostPoints = maxPossiblePoints - (possibleScore || 0);
  
  const completedRounds = tournamentResults?.completedRounds || [];
  
  // Get list of rounds still in progress
  const remainingRounds = React.useMemo(() => {
    if (!roundScores) return [];
    
    const rounds = [];
    for (let i = 1; i <= 6; i++) {
      if (!completedRounds.includes(i)) {
        rounds.push({
          round: i,
          name: getRoundName(i),
          points: roundScores[`round${i}` as keyof typeof roundScores],
          futurePoints: futureRoundPoints[i] || 0
        });
      }
    }
    return rounds;
  }, [roundScores, completedRounds, futureRoundPoints]);

  function getRoundName(round: number): string {
    switch (round) {
      case 1: return "First Round";
      case 2: return "Second Round";
      case 3: return "Sweet 16";
      case 4: return "Elite 8";
      case 5: return "Final Four";
      case 6: return "Championship";
      default: return `Round ${round}`;
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mt-3">
      <h3 className="text-lg font-bold mb-3 text-gray-700">Score Breakdown</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Current Score</h4>
          <div className="text-2xl font-bold text-blue-700">{score} points</div>
          
          {/* Completed rounds */}
          <div className="mt-2">
            <h5 className="text-xs font-medium text-gray-500 mb-1">Completed Rounds:</h5>
            <div className="flex flex-wrap gap-2">
              {completedRounds.length > 0 ? (
                completedRounds.map((round: number) => (
                  <span key={round} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    {getRoundName(round)}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-xs">None yet</span>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Possible Score</h4>
          <div className="text-2xl font-bold text-green-600">{possibleScore} points</div>
          
          {/* Remaining points */}
          {remainingPoints > 0 && (
            <div className="mt-2">
              <h5 className="text-xs font-medium text-gray-500 mb-1">
                Up to {remainingPoints} more points possible:
              </h5>
              <div className="flex flex-wrap gap-2">
                {remainingRounds
                  .filter(round => round.futurePoints > 0)
                  .map(round => (
                    <span key={round.name} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                      {round.name}: {round.futurePoints} pts
                    </span>
                  ))}
              </div>
            </div>
          )}
          
          {/* Lost points */}
          {lostPoints > 0 && (
            <div className="mt-2">
              <h5 className="text-xs font-medium text-gray-500 mb-1">
                {lostPoints} points no longer possible:
              </h5>
              <div className="text-xs text-gray-500">
                Points lost due to eliminated teams or incorrect picks in completed rounds.
              </div>
            </div>
          )}
          
          {/* Teams still alive */}
          {teamsStillAlive && teamsStillAlive.length > 0 && (
            <div className="mt-2">
              <h5 className="text-xs font-medium text-gray-500 mb-1">
                Teams still active:
              </h5>
              <div className="flex flex-wrap gap-1">
                {teamsStillAlive.map(team => (
                  <span key={team} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                    {team}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Points per round explanation */}
      {roundScores && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Points per correct pick</h4>
          <div className="flex flex-wrap gap-3">
            <div className="px-3 py-1 bg-gray-100 rounded text-xs">
              First Round: <span className="font-medium">{roundScores.round1} pt</span>
            </div>
            <div className="px-3 py-1 bg-gray-100 rounded text-xs">
              Second Round: <span className="font-medium">{roundScores.round2} pts</span>
            </div>
            <div className="px-3 py-1 bg-gray-100 rounded text-xs">
              Sweet 16: <span className="font-medium">{roundScores.round3} pts</span>
            </div>
            <div className="px-3 py-1 bg-gray-100 rounded text-xs">
              Elite 8: <span className="font-medium">{roundScores.round4} pts</span>
            </div>
            <div className="px-3 py-1 bg-gray-100 rounded text-xs">
              Final Four: <span className="font-medium">{roundScores.round5} pts</span>
            </div>
            <div className="px-3 py-1 bg-gray-100 rounded text-xs">
              Championship: <span className="font-medium">{roundScores.round6} pts</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreBreakdown;