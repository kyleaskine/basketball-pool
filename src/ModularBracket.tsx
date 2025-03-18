import React from 'react';
import { Team, Matchup, BracketData } from './types';

interface TeamSlotProps {
  team: Team | null;
  isWinner: boolean;
  onClick: () => void;
  horizontal?: boolean;
  isIncomplete?: boolean;
  submitAttempted?: boolean;
  readOnly?: boolean;
  isCorrectPick?: boolean;
  highlightCorrectPicks?: boolean;
}

const TeamSlot: React.FC<TeamSlotProps> = ({ 
  team, 
  isWinner, 
  onClick, 
  horizontal = false,
  isIncomplete = false,
  submitAttempted = false,
  readOnly = false,
  isCorrectPick = false,
  highlightCorrectPicks = false
}) => {
  // Only show incomplete highlight if submitAttempted is true
  const showIncompleteHighlight = isIncomplete && submitAttempted;
  
  if (!team) {
    return (
      <div className={`${horizontal ? 'w-40' : 'h-10'} bg-gray-50 border border-gray-200 rounded-md flex items-center px-2 text-gray-400 ${
        showIncompleteHighlight ? 'border-red-400 border-2 bg-red-50' : ''
      }`}>
        TBD
      </div>
    );
  }
  
  // Determine the background and border based on various states
  let bgAndBorderClasses = 'bg-white border-gray-300';
  
  if (isWinner) {
    if (isCorrectPick) {
      bgAndBorderClasses = 'bg-green-100 border-green-500'; // Correct pick
    } else if (readOnly && highlightCorrectPicks) {
      bgAndBorderClasses = 'bg-red-50 border-red-300'; // Incorrect pick when highlighting
    } else {
      bgAndBorderClasses = 'bg-blue-100 border-blue-500'; // Standard selection
    }
  }
  
  return (
    <div 
      className={`${horizontal ? 'w-40' : 'h-10'} border rounded-md flex items-center px-2 ${
        readOnly ? 'cursor-default' : 'cursor-pointer hover:bg-blue-50'
      } ${bgAndBorderClasses} ${
        showIncompleteHighlight ? 'border-red-400 border-2 animate-pulse shadow-md' : ''
      }`}
      onClick={readOnly ? undefined : onClick}
    >
      <span className="font-bold text-xs w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
        {team.seed}
      </span>
      <span className="text-sm truncate">{team.name}</span>
    </div>
  );
};

interface BracketRegionProps {
  title: string;
  bracketData: BracketData;
  firstRoundStart: number; 
  firstRoundEnd: number;
  regionName: string;
  onTeamSelect: (matchupId: number, team: Team) => void;
  incompleteMatchups: number[];
  submitAttempted: boolean;
  readOnly?: boolean;
  highlightCorrectPicks?: boolean;
  actualResults?: BracketData;
}

const BracketRegion: React.FC<BracketRegionProps> = ({
  title,
  bracketData,
  firstRoundStart,
  firstRoundEnd,
  regionName,
  onTeamSelect,
  incompleteMatchups,
  submitAttempted,
  readOnly = false,
  highlightCorrectPicks = false,
  actualResults
}) => {
  const firstRoundMatchups = bracketData[1].slice(firstRoundStart, firstRoundEnd);
  
  // Get matchups from other rounds filtered by this region
  const getMatchupsForRound = (round: number) => {
    return bracketData[round].filter(m => m.region === regionName);
  };
  
  const secondRoundMatchups = getMatchupsForRound(2);
  const sweetSixteenMatchups = getMatchupsForRound(3);
  const eliteEightMatchups = getMatchupsForRound(4);
  
  // Function to check if a pick is correct
  const isCorrectPick = (matchup: Matchup, team: Team | null): boolean => {
    if (!highlightCorrectPicks || !actualResults || !team || !matchup.winner) return false;
    
    // Find the corresponding matchup in the actual results
    const actualMatchup = actualResults[matchup.round].find(m => m.id === matchup.id);
    if (!actualMatchup || !actualMatchup.winner) return false;
    
    // Compare the winner
    return actualMatchup.winner.name === team.name && actualMatchup.winner.seed === team.seed;
  };
  
  const renderMatchup = (matchup: Matchup, noBorder = false) => {
    // Check if this matchup is incomplete (has both teams but no winner)
    const isIncomplete = matchup.teamA && matchup.teamB && !matchup.winner && incompleteMatchups.includes(matchup.id);
    
    return (
      <>
        <TeamSlot 
          team={matchup.teamA} 
          isWinner={matchup.winner === matchup.teamA}
          onClick={() => {
            if (matchup.teamA) onTeamSelect(matchup.id, matchup.teamA);
          }}
          isIncomplete={isIncomplete ?? undefined}
          submitAttempted={submitAttempted}
          readOnly={readOnly}
          isCorrectPick={isCorrectPick(matchup, matchup.teamA)}
          highlightCorrectPicks={highlightCorrectPicks}
        />
        <div className="h-2"></div>
        <TeamSlot 
          team={matchup.teamB} 
          isWinner={matchup.winner === matchup.teamB}
          onClick={() => {
            if (matchup.teamB) onTeamSelect(matchup.id, matchup.teamB);
          }}
          isIncomplete={isIncomplete ?? undefined}
          submitAttempted={submitAttempted}
          readOnly={readOnly}
          isCorrectPick={isCorrectPick(matchup, matchup.teamB)}
          highlightCorrectPicks={highlightCorrectPicks}
        />
      </>
    );
  };
  
  return (
    <div className="mb-10">
      <h3 className="bg-blue-800 text-white text-center py-2 rounded-t font-bold mb-4">
        {title}
      </h3>
      <div className="flex min-w-[1100px]">
        {/* First Round */}
        <div className="w-48 mr-4">
          <div className="text-center font-bold mb-2">First Round</div>
          <div className="space-y-4">
            {firstRoundMatchups.map((matchup, index) => (
              <div key={matchup.id} className={`relative ${index % 2 === 1 ? "mb-8" : ""}`}>
                {renderMatchup(matchup)}
              </div>
            ))}
          </div>
        </div>
        
        {/* Second Round */}
        <div className="w-48 mr-4">
          <div className="text-center font-bold mb-2">Second Round</div>
          <div className="space-y-34">
            {secondRoundMatchups.map((matchup, index) => (
              <div 
                key={matchup.id} 
                className={`relative ${index === 0 ? "mt-15" : ""}`}
              >
                {renderMatchup(matchup)}
              </div>
            ))}
          </div>
        </div>
        
        {/* Sweet 16 */}
        <div className="w-48 mr-4">
          <div className="text-center font-bold mb-2">Sweet 16</div>
          <div className="space-y-89">
            {sweetSixteenMatchups.map((matchup, index) => (
              <div 
                key={matchup.id} 
                className={`relative ${index === 0 ? "mt-44" : ""}`}
              >
                {renderMatchup(matchup)}
              </div>
            ))}
          </div>
        </div>
        
        {/* Elite 8 */}
        <div className="w-48">
          <div className="text-center font-bold mb-2">Elite 8</div>
          <div className="space-y-64">
            {eliteEightMatchups.map((matchup, index) => (
              <div 
                key={matchup.id} 
                className={`relative ${index === 0 ? "mt-100" : ""}`}
              >
                {renderMatchup(matchup, true)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface FinalFourProps {
  bracketData: BracketData;
  onTeamSelect: (matchupId: number, team: Team) => void;
  incompleteMatchups: number[];
  submitAttempted: boolean;
  readOnly?: boolean;
  highlightCorrectPicks?: boolean;
  actualResults?: BracketData;
}

const FinalFour: React.FC<FinalFourProps> = ({ 
  bracketData, 
  onTeamSelect,
  incompleteMatchups,
  submitAttempted,
  readOnly = false,
  highlightCorrectPicks = false,
  actualResults
}) => {
  const finalFourMatchups = bracketData[5];
  const championshipMatchup = bracketData[6][0];
  
  // Check if matchups are incomplete
  const isFinalFour1Incomplete = finalFourMatchups[0].teamA && finalFourMatchups[0].teamB && 
                              !finalFourMatchups[0].winner && 
                              incompleteMatchups.includes(finalFourMatchups[0].id);
  
  const isFinalFour2Incomplete = finalFourMatchups[1].teamA && finalFourMatchups[1].teamB && 
                              !finalFourMatchups[1].winner && 
                              incompleteMatchups.includes(finalFourMatchups[1].id);
  
  const isChampionshipIncomplete = championshipMatchup.teamA && championshipMatchup.teamB && 
                                !championshipMatchup.winner && 
                                incompleteMatchups.includes(championshipMatchup.id);
  
  // Only show incomplete highlighting if submitAttempted is true
  const showIncompleteHighlighting = submitAttempted;
  
  // Function to check if a pick is correct
  const isCorrectPick = (matchup: Matchup, team: Team | null): boolean => {
    if (!highlightCorrectPicks || !actualResults || !team || !matchup.winner) return false;
    
    // Find the corresponding matchup in the actual results
    const actualMatchup = actualResults[matchup.round].find(m => m.id === matchup.id);
    if (!actualMatchup || !actualMatchup.winner) return false;
    
    // Compare the winner
    return actualMatchup.winner.name === team.name && actualMatchup.winner.seed === team.seed;
  };
  
  return (
    <div className="mb-10">
      <h3 className="bg-red-800 text-white text-center py-2 rounded-t font-bold mb-4">
        Final Four & Championship
      </h3>
      
      {/* Final Four Matchups */}
      <div className="flex justify-center items-start gap-8 mb-6">
        <div className="w-64">
          <div className="text-center font-bold mb-2">Final Four</div>
          <div className="relative">
            <TeamSlot 
              team={finalFourMatchups[0].teamA} 
              isWinner={finalFourMatchups[0].winner === finalFourMatchups[0].teamA}
              onClick={() => {
                const team = finalFourMatchups[0].teamA;
                if (team) onTeamSelect(finalFourMatchups[0].id, team);
              }}
              isIncomplete={isFinalFour1Incomplete?? undefined}
              submitAttempted={submitAttempted}
              readOnly={readOnly}
              isCorrectPick={isCorrectPick(finalFourMatchups[0], finalFourMatchups[0].teamA)}
              highlightCorrectPicks={highlightCorrectPicks}
            />
            <div className="h-2"></div>
            <TeamSlot 
              team={finalFourMatchups[0].teamB} 
              isWinner={finalFourMatchups[0].winner === finalFourMatchups[0].teamB}
              onClick={() => {
                const team = finalFourMatchups[0].teamB;
                if (team) onTeamSelect(finalFourMatchups[0].id, team);
              }}
              isIncomplete={isFinalFour1Incomplete?? undefined}
              submitAttempted={submitAttempted}
              readOnly={readOnly}
              isCorrectPick={isCorrectPick(finalFourMatchups[0], finalFourMatchups[0].teamB)}
              highlightCorrectPicks={highlightCorrectPicks}
            />
          </div>
        </div>
        
        <div className="w-64">
          <div className="text-center font-bold mb-2">Final Four</div>
          <div className="relative">
            <TeamSlot 
              team={finalFourMatchups[1].teamA} 
              isWinner={finalFourMatchups[1].winner === finalFourMatchups[1].teamA}
              onClick={() => {
                const team = finalFourMatchups[1].teamA;
                if (team) onTeamSelect(finalFourMatchups[1].id, team);
              }}
              isIncomplete={isFinalFour2Incomplete?? undefined}
              submitAttempted={submitAttempted}
              readOnly={readOnly}
              isCorrectPick={isCorrectPick(finalFourMatchups[1], finalFourMatchups[1].teamA)}
              highlightCorrectPicks={highlightCorrectPicks}
            />
            <div className="h-2"></div>
            <TeamSlot 
              team={finalFourMatchups[1].teamB} 
              isWinner={finalFourMatchups[1].winner === finalFourMatchups[1].teamB}
              onClick={() => {
                const team = finalFourMatchups[1].teamB;
                if (team) onTeamSelect(finalFourMatchups[1].id, team);
              }}
              isIncomplete={isFinalFour2Incomplete?? undefined}
              submitAttempted={submitAttempted}
              readOnly={readOnly}
              isCorrectPick={isCorrectPick(finalFourMatchups[1], finalFourMatchups[1].teamB)}
              highlightCorrectPicks={highlightCorrectPicks}
            />
          </div>
        </div>
      </div>
      
      {/* Championship Game - Horizontal Layout */}
      <div className="flex flex-col items-center">
        <div className="text-center font-bold mb-3">Championship</div>
        <div className={`border-2 rounded-lg bg-yellow-50 p-4 w-full max-w-lg ${
          isChampionshipIncomplete && showIncompleteHighlighting ? 'border-red-500 bg-red-50 animate-pulse' : 'border-yellow-500'
        }`}>
          <div className="flex justify-center gap-4 items-center">
            <TeamSlot 
              team={championshipMatchup.teamA} 
              isWinner={championshipMatchup.winner === championshipMatchup.teamA}
              onClick={() => {
                const team = championshipMatchup.teamA;
                if (team) onTeamSelect(championshipMatchup.id, team);
              }}
              horizontal={true}
              isIncomplete={isChampionshipIncomplete?? undefined}
              submitAttempted={submitAttempted}
              readOnly={readOnly}
              isCorrectPick={isCorrectPick(championshipMatchup, championshipMatchup.teamA)}
              highlightCorrectPicks={highlightCorrectPicks}
            />
            <div className="text-center font-bold text-lg">vs</div>
            <TeamSlot 
              team={championshipMatchup.teamB} 
              isWinner={championshipMatchup.winner === championshipMatchup.teamB}
              onClick={() => {
                const team = championshipMatchup.teamB;
                if (team) onTeamSelect(championshipMatchup.id, team);
              }}
              horizontal={true}
              isIncomplete={isChampionshipIncomplete?? undefined}
              submitAttempted={submitAttempted}
              readOnly={readOnly}
              isCorrectPick={isCorrectPick(championshipMatchup, championshipMatchup.teamB)}
              highlightCorrectPicks={highlightCorrectPicks}
            />
          </div>
          
          {/* Champion Display */}
          {championshipMatchup.winner && (
            <div className="mt-4 pt-2 border-t border-yellow-400">
              <p className="text-center text-sm font-bold text-yellow-800 mb-1">CHAMPION</p>
              <div className={`border rounded-md p-2 mx-auto max-w-xs ${
                highlightCorrectPicks && actualResults && actualResults[6][0].winner ? 
                  (actualResults[6][0].winner.name === championshipMatchup.winner.name ? 
                    'bg-green-100 border-green-500' : 'bg-red-50 border-red-300') : 
                  'bg-green-100 border-green-500'
              }`}>
                <div className="flex items-center justify-center">
                  <span className="font-bold text-xs w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                    {championshipMatchup.winner.seed}
                  </span>
                  <span className="font-bold">{championshipMatchup.winner.name}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ModularBracketProps {
  bracketData: BracketData;
  onTeamSelect?: (matchupId: number, team: Team) => void;
  incompleteMatchups?: number[];
  submitAttempted?: boolean;
  readOnly?: boolean;
  highlightCorrectPicks?: boolean;
  actualResults?: BracketData;
}

const ModularBracket: React.FC<ModularBracketProps> = ({ 
  bracketData, 
  onTeamSelect = () => {},
  incompleteMatchups = [],
  submitAttempted = false,
  readOnly = false,
  highlightCorrectPicks = false,
  actualResults
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6 overflow-x-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Tournament Bracket</h2>
      
      {/* South Region */}
      <BracketRegion
        title="South Region"
        bracketData={bracketData}
        firstRoundStart={0}
        firstRoundEnd={8}
        regionName="South"
        onTeamSelect={onTeamSelect}
        incompleteMatchups={incompleteMatchups}
        submitAttempted={submitAttempted}
        readOnly={readOnly}
        highlightCorrectPicks={highlightCorrectPicks}
        actualResults={actualResults}
      />
      
      {/* East Region */}
      <BracketRegion
        title="East Region"
        bracketData={bracketData}
        firstRoundStart={16}
        firstRoundEnd={24}
        regionName="East"
        onTeamSelect={onTeamSelect}
        incompleteMatchups={incompleteMatchups}
        submitAttempted={submitAttempted}
        readOnly={readOnly}
        highlightCorrectPicks={highlightCorrectPicks}
        actualResults={actualResults}
      />
      
      {/* West Region */}
      <BracketRegion
        title="West Region"
        bracketData={bracketData}
        firstRoundStart={8}
        firstRoundEnd={16}
        regionName="West"
        onTeamSelect={onTeamSelect}
        incompleteMatchups={incompleteMatchups}
        submitAttempted={submitAttempted}
        readOnly={readOnly}
        highlightCorrectPicks={highlightCorrectPicks}
        actualResults={actualResults}
      />
      
      {/* Midwest Region */}
      <BracketRegion
        title="Midwest Region"
        bracketData={bracketData}
        firstRoundStart={24}
        firstRoundEnd={32}
        regionName="Midwest"
        onTeamSelect={onTeamSelect}
        incompleteMatchups={incompleteMatchups}
        submitAttempted={submitAttempted}
        readOnly={readOnly}
        highlightCorrectPicks={highlightCorrectPicks}
        actualResults={actualResults}
      />
      
      {/* Final Four & Championship */}
      <FinalFour 
        bracketData={bracketData}
        onTeamSelect={onTeamSelect}
        incompleteMatchups={incompleteMatchups}
        submitAttempted={submitAttempted}
        readOnly={readOnly}
        highlightCorrectPicks={highlightCorrectPicks}
        actualResults={actualResults}
      />
    </div>
  );
};

export default ModularBracket;