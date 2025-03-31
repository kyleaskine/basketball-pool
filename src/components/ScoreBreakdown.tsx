import React, { useState, useEffect } from 'react';

interface ScoreBreakdownProps {
  score: number;
  possibleScore?: number;
  tournamentResults: any;
  futureRoundPoints?: {[key: string]: number};
  teamsStillAlive?: string[];
  roundScores?: {[key: string]: number};
  regionScores?: {[key: string]: number};
}

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({
  score,
  possibleScore,
  tournamentResults,
  futureRoundPoints,
  teamsStillAlive,
  roundScores,
  regionScores
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rounds' | 'regions'>('overview');
  
  // Calculate what rounds are completed
  const completedRounds = tournamentResults?.completedRounds || [];
  
  const getRoundName = (round: number | string): string => {
    const roundNum = typeof round === 'string' ? parseInt(round) : round;
    switch (roundNum) {
      case 1: return "First Round";
      case 2: return "Second Round";
      case 3: return "Sweet 16";
      case 4: return "Elite 8";
      case 5: return "Final Four";
      case 6: return "Championship";
      default: return `Round ${round}`;
    }
  };
  
  const getRegionColor = (region: string): string => {
    switch (region) {
      case "East": return "bg-blue-100 text-blue-800";
      case "West": return "bg-green-100 text-green-800";
      case "South": return "bg-red-100 text-red-800";
      case "Midwest": return "bg-yellow-100 text-yellow-800";
      case "FinalFour": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Score Breakdown</h3>
        
        <div className="mt-2 flex border-b">
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'rounds' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('rounds')}
          >
            Rounds
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'regions' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('regions')}
          >
            Regions
          </button>
        </div>
      </div>
      
      <div className="p-4 bg-white">
        {activeTab === 'overview' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-gray-600 text-sm">Current Score</div>
                <div className="text-2xl font-bold text-blue-700">{score}</div>
              </div>
              
              {possibleScore !== undefined && (
                <div className="text-right">
                  <div className="text-gray-600 text-sm">Max Possible</div>
                  <div className="text-2xl font-bold text-green-600">{possibleScore}</div>
                  {(possibleScore - score) > 0 && (
                    <div className="text-sm text-green-600">
                      (+{possibleScore - score} possible remaining)
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {teamsStillAlive && teamsStillAlive.length > 0 && (
              <div className="mt-4">
                <div className="text-gray-600 text-sm mb-2">Teams Still Active ({teamsStillAlive.length})</div>
                <div className="flex flex-wrap gap-2">
                  {teamsStillAlive.map((team) => (
                    <span 
                      key={team} 
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                    >
                      {team}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {futureRoundPoints && Object.keys(futureRoundPoints).length > 0 && (
              <div className="mt-4">
                <div className="text-gray-600 text-sm mb-2">Potential Future Points</div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {Object.entries(futureRoundPoints).map(([round, points]) => 
                    Number(points) > 0 ? (
                      <div key={round} className="text-center">
                        <div className="text-xs text-gray-500">{getRoundName(round)}</div>
                        <div className="text-sm font-semibold text-green-600">{points}</div>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'rounds' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map(round => {
                const roundKey = round.toString();
                const isCompleted = completedRounds.includes(round);
                const roundScore = roundScores?.[roundKey] || 0;
                
                return (
                  <div 
                    key={`round-${round}`} 
                    className={`p-3 rounded-lg text-center ${
                      isCompleted 
                        ? roundScore > 0 
                          ? "bg-blue-50 border border-blue-200" 
                          : "bg-gray-50 border border-gray-200"
                        : "bg-yellow-50 border border-yellow-200"
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-800">{getRoundName(round)}</div>
                    <div className={`text-2xl font-bold ${
                      roundScore > 0 
                        ? "text-blue-700" 
                        : "text-gray-400"
                    }`}>
                      {roundScore}
                    </div>
                    {!isCompleted && futureRoundPoints && futureRoundPoints[roundKey] > 0 && (
                      <div className="mt-1 text-xs text-green-600">
                        (+{futureRoundPoints[roundKey]} possible)
                      </div>
                    )}
                    {isCompleted && (
                      <div className="mt-1 text-xs text-gray-500">
                        Completed
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Points are earned based on the round: Round 1 (1 pt), Round 2 (2 pts), 
                Sweet 16 (4 pts), Elite 8 (8 pts), Final Four (16 pts), Championship (32 pts)
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'regions' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {["East", "West", "South", "Midwest", "FinalFour"].map(region => {
                const regionScore = regionScores?.[region] || 0;
                
                return (
                  <div 
                    key={`region-${region}`} 
                    className={`p-3 rounded-lg text-center border ${
                      regionScore > 0 
                        ? `${getRegionColor(region)} border-current opacity-80`
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {region === "FinalFour" ? "Final Four" : region}
                    </div>
                    <div className={`text-2xl font-bold ${
                      regionScore > 0 
                        ? "" 
                        : "text-gray-400"
                    }`}>
                      {regionScore}
                    </div>
                    <div className="mt-1 text-xs">
                      {(regionScore / Math.max(score, 1) * 100).toFixed(0)}% of total
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Region scores show how well your bracket performed in each region. 
                Final Four includes championship points.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreBreakdown;