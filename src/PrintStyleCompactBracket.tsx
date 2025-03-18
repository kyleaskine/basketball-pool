import React from "react";
import { Team, Matchup, BracketData } from "./types";

interface TeamSlotProps {
  team: Team | null;
  isWinner: boolean;
  onClick: () => void;
  reversed?: boolean;
  isIncomplete?: boolean;
  submitAttempted?: boolean;
  readOnly?: boolean;
  isCorrectPick?: boolean;
}

const TeamSlot: React.FC<TeamSlotProps> = ({
  team,
  isWinner,
  onClick,
  reversed = false,
  isIncomplete = false,
  submitAttempted = false,
  readOnly = false,
  isCorrectPick = false
}) => {
  // Only show incomplete highlight if submitAttempted is true
  const showIncompleteHighlight = isIncomplete && submitAttempted;
  
  if (!team) {
    return (
      <div
        className={`h-7 bg-gray-50 border border-gray-200 rounded-md flex items-center px-2 text-gray-400 text-xs ${
          reversed ? "flex-row-reverse" : ""
        } ${
          showIncompleteHighlight ? 'border-red-400 border-2 bg-red-50' : ''
        }`}
      >
        TBD
      </div>
    );
  }

  // Determine the background and border based on various states
  let bgAndBorderClasses = 'bg-white border-gray-300';
  
  if (isWinner) {
    if (isCorrectPick) {
      bgAndBorderClasses = 'bg-green-100 border-green-500'; // Correct pick
    } else if (readOnly && isWinner) {
      bgAndBorderClasses = 'bg-red-50 border-red-300'; // Incorrect pick when highlighting
    } else {
      bgAndBorderClasses = 'bg-blue-100 border-blue-500'; // Standard selection
    }
  }

  return (
    <div
      className={`h-7 border rounded-md flex items-center px-2 text-xs ${
        readOnly ? 'cursor-default' : 'cursor-pointer hover:bg-blue-50'
      } ${bgAndBorderClasses} ${reversed ? "flex-row-reverse" : ""} ${
        showIncompleteHighlight ? 'border-red-400 border-2 animate-pulse shadow-md' : ''
      }`}
      onClick={readOnly ? undefined : onClick}
    >
      <span
        className={`font-bold text-[10px] w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center ${
          reversed ? "ml-1" : "mr-1"
        }`}
      >
        {team.seed}
      </span>
      <span className="text-xs truncate">{team.name}</span>
    </div>
  );
};

interface RegionColumnProps {
  matchups: Matchup[];
  onTeamSelect: (matchupId: number, team: Team) => void;
  round: number;
  reversed?: boolean;
  showLabel?: boolean;
  roundLabel?: string;
  incompleteMatchups: number[];
  submitAttempted: boolean;
  readOnly?: boolean;
  highlightCorrectPicks?: boolean;
  actualResults?: BracketData;
}

const RegionColumn: React.FC<RegionColumnProps> = ({
  matchups,
  onTeamSelect,
  round,
  reversed = false,
  showLabel,
  roundLabel,
  incompleteMatchups,
  submitAttempted,
  readOnly = false,
  highlightCorrectPicks = false,
  actualResults
}) => {
  // Calculate correct spacing based on round
  const getSpacing = () => {
    switch (round) {
      case 1:
        return "space-y-1";
      case 2:
        return "space-y-17";
      case 3:
        return "space-y-49";
      case 4:
        return "space-y-60";
      default:
        return "space-y-1";
    }
  };

  // Calculate first item margin for proper alignment
  const getFirstItemMargin = () => {
    switch (round) {
      case 1:
        return "mt-1";
      case 2:
        return "mt-9";
      case 3:
        return "mt-25";
      case 4:
        return "mt-57";
      default:
        return "";
    }
  };

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
    <div className={`w-32 ${reversed ? "ml-1" : "mr-1"}`}>
      {showLabel && roundLabel && (
        <div className="text-xs font-medium text-center text-gray-700 mb-1">
          {roundLabel}
        </div>
      )}
      <div className={getSpacing()}>
        {matchups.map((matchup, index) => {
          // Check if this matchup is incomplete (has both teams but no winner)
          const isIncomplete = matchup.teamA && matchup.teamB && !matchup.winner && 
                              incompleteMatchups.includes(matchup.id);
          
          return (
            <div
              key={matchup.id}
              className={`relative ${index === 0 ? getFirstItemMargin() : ""}`}
            >
              <TeamSlot
                team={matchup.teamA}
                isWinner={matchup.winner === matchup.teamA}
                onClick={() => {
                  if (matchup.teamA) onTeamSelect(matchup.id, matchup.teamA);
                }}
                reversed={reversed}
                isIncomplete={isIncomplete ?? undefined}
                submitAttempted={submitAttempted}
                readOnly={readOnly}
                isCorrectPick={isCorrectPick(matchup, matchup.teamA)}
              />
              <div className="h-1"></div>
              <TeamSlot
                team={matchup.teamB}
                isWinner={matchup.winner === matchup.teamB}
                onClick={() => {
                  if (matchup.teamB) onTeamSelect(matchup.id, matchup.teamB);
                }}
                reversed={reversed}
                isIncomplete={isIncomplete ?? undefined}
                submitAttempted={submitAttempted}
                readOnly={readOnly}
                isCorrectPick={isCorrectPick(matchup, matchup.teamB)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface ForwardRegionProps {
  bracketData: BracketData;
  firstRoundStart: number;
  firstRoundEnd: number;
  showLabel?: boolean;
  regionName: string;
  onTeamSelect: (matchupId: number, team: Team) => void;
  incompleteMatchups: number[];
  submitAttempted: boolean;
  readOnly?: boolean;
  highlightCorrectPicks?: boolean;
  actualResults?: BracketData;
}

const ForwardRegion: React.FC<ForwardRegionProps> = ({
  bracketData,
  firstRoundStart,
  firstRoundEnd,
  showLabel,
  regionName,
  onTeamSelect,
  incompleteMatchups,
  submitAttempted,
  readOnly = false,
  highlightCorrectPicks = false,
  actualResults
}) => {
  const firstRoundMatchups = bracketData[1].slice(
    firstRoundStart,
    firstRoundEnd
  );

  // Get matchups from other rounds filtered by this region
  const getMatchupsForRound = (round: number) => {
    return bracketData[round].filter((m) => m.region === regionName);
  };

  const secondRoundMatchups = getMatchupsForRound(2);
  const sweetSixteenMatchups = getMatchupsForRound(3);
  const eliteEightMatchups = getMatchupsForRound(4);

  return (
    <div className="flex relative">
      {/* Region name positioned in the gap between games */}
      <div
        className="absolute text-xl font-bold text-blue-800"
        style={{
          left: "225px",
          top: "255px",
        }}
      >
        {regionName} Region
      </div>
      <RegionColumn
        matchups={firstRoundMatchups}
        onTeamSelect={onTeamSelect}
        round={1}
        showLabel={showLabel}
        roundLabel="First Round"
        incompleteMatchups={incompleteMatchups}
        submitAttempted={submitAttempted}
        readOnly={readOnly}
        highlightCorrectPicks={highlightCorrectPicks}
        actualResults={actualResults}
      />
      <RegionColumn
        matchups={secondRoundMatchups}
        onTeamSelect={onTeamSelect}
        round={2}
        showLabel={showLabel}
        roundLabel="Second Round"
        incompleteMatchups={incompleteMatchups}
        submitAttempted={submitAttempted}
        readOnly={readOnly}
        highlightCorrectPicks={highlightCorrectPicks}
        actualResults={actualResults}
      />
      <RegionColumn
        matchups={sweetSixteenMatchups}
        onTeamSelect={onTeamSelect}
        round={3}
        showLabel={showLabel}
        roundLabel="Sweet 16"
        incompleteMatchups={incompleteMatchups}
        submitAttempted={submitAttempted}
        readOnly={readOnly}
        highlightCorrectPicks={highlightCorrectPicks}
        actualResults={actualResults}
      />
      <RegionColumn
        matchups={eliteEightMatchups}
        onTeamSelect={onTeamSelect}
        round={4}
        showLabel={showLabel}
        roundLabel="Elite 8"
        incompleteMatchups={incompleteMatchups}
        submitAttempted={submitAttempted}
        readOnly={readOnly}
        highlightCorrectPicks={highlightCorrectPicks}
        actualResults={actualResults}
      />
    </div>
  );
};

interface ReverseRegionProps {
  bracketData: BracketData;
  firstRoundStart: number;
  firstRoundEnd: number;
  showLabel?: boolean;
  regionName: string;
  onTeamSelect: (matchupId: number, team: Team) => void;
  incompleteMatchups: number[];
  submitAttempted: boolean;
  readOnly?: boolean;
  highlightCorrectPicks?: boolean;
  actualResults?: BracketData;
}

const ReverseRegion: React.FC<ReverseRegionProps> = ({
  bracketData,
  firstRoundStart,
  firstRoundEnd,
  showLabel,
  regionName,
  onTeamSelect,
  incompleteMatchups,
  submitAttempted,
  readOnly = false,
  highlightCorrectPicks = false,
  actualResults
}) => {
  const firstRoundMatchups = bracketData[1].slice(
    firstRoundStart,
    firstRoundEnd
  );

  // Get matchups from other rounds filtered by this region
  const getMatchupsForRound = (round: number) => {
    return bracketData[round].filter((m) => m.region === regionName);
  };

  const secondRoundMatchups = getMatchupsForRound(2);
  const sweetSixteenMatchups = getMatchupsForRound(3);
  const eliteEightMatchups = getMatchupsForRound(4);

  return (
    <div className="flex relative">
      {/* Region name positioned in the gap between games */}
      <div
        className="absolute text-xl font-bold text-blue-800"
        style={{
          right: "225px",
          top: "255px",
        }}
      >
        {regionName} Region
      </div>
      <RegionColumn
        matchups={eliteEightMatchups}
        onTeamSelect={onTeamSelect}
        round={4}
        reversed={true}
        showLabel={showLabel}
        roundLabel="Elite 8"
        incompleteMatchups={incompleteMatchups}
        submitAttempted={submitAttempted}
        readOnly={readOnly}
        highlightCorrectPicks={highlightCorrectPicks}
        actualResults={actualResults}
      />
      <RegionColumn
        matchups={sweetSixteenMatchups}
        onTeamSelect={onTeamSelect}
        round={3}
        reversed={true}
        showLabel={showLabel}
        roundLabel="Sweet 16"
        incompleteMatchups={incompleteMatchups}
        submitAttempted={submitAttempted}
        readOnly={readOnly}
        highlightCorrectPicks={highlightCorrectPicks}
        actualResults={actualResults}
      />
      <RegionColumn
        matchups={secondRoundMatchups}
        onTeamSelect={onTeamSelect}
        round={2}
        reversed={true}
        showLabel={showLabel}
        roundLabel="Second Round"
        incompleteMatchups={incompleteMatchups}
        submitAttempted={submitAttempted}
        readOnly={readOnly}
        highlightCorrectPicks={highlightCorrectPicks}
        actualResults={actualResults}
      />
      <RegionColumn
        matchups={firstRoundMatchups}
        onTeamSelect={onTeamSelect}
        round={1}
        reversed={true}
        showLabel={showLabel}
        roundLabel="First Round"
        incompleteMatchups={incompleteMatchups}
        submitAttempted={submitAttempted}
        readOnly={readOnly}
        highlightCorrectPicks={highlightCorrectPicks}
        actualResults={actualResults}
      />
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
    <div className="flex flex-col items-center mx-2">
      {/* Final Four Matchups */}
      <div className="flex justify-center w-full mb-3">
        <div className="w-32 mr-2">
          <div className="relative">
            <TeamSlot
              team={finalFourMatchups[0].teamA}
              isWinner={
                finalFourMatchups[0].winner === finalFourMatchups[0].teamA
              }
              onClick={() => {
                const team = finalFourMatchups[0].teamA;
                if (team) onTeamSelect(finalFourMatchups[0].id, team);
              }}
              isIncomplete={isFinalFour1Incomplete?? undefined}
              submitAttempted={submitAttempted}
              readOnly={readOnly}
              isCorrectPick={isCorrectPick(finalFourMatchups[0], finalFourMatchups[0].teamA)}
            />
            <div className="h-1"></div>
            <TeamSlot
              team={finalFourMatchups[0].teamB}
              isWinner={
                finalFourMatchups[0].winner === finalFourMatchups[0].teamB
              }
              onClick={() => {
                const team = finalFourMatchups[0].teamB;
                if (team) onTeamSelect(finalFourMatchups[0].id, team);
              }}
              isIncomplete={isFinalFour1Incomplete?? undefined}
              submitAttempted={submitAttempted}
              readOnly={readOnly}
              isCorrectPick={isCorrectPick(finalFourMatchups[0], finalFourMatchups[0].teamB)}
            />
          </div>
        </div>
        <div className="w-32 ml-2">
          <div className="relative">
            <TeamSlot
              team={finalFourMatchups[1].teamA}
              isWinner={
                finalFourMatchups[1].winner === finalFourMatchups[1].teamA
              }
              onClick={() => {
                const team = finalFourMatchups[1].teamA;
                if (team) onTeamSelect(finalFourMatchups[1].id, team);
              }}
              reversed={true}
              isIncomplete={isFinalFour2Incomplete?? undefined}
              submitAttempted={submitAttempted}
              readOnly={readOnly}
              isCorrectPick={isCorrectPick(finalFourMatchups[1], finalFourMatchups[1].teamA)}
            />
            <div className="h-1"></div>
            <TeamSlot
              team={finalFourMatchups[1].teamB}
              isWinner={
                finalFourMatchups[1].winner === finalFourMatchups[1].teamB
              }
              onClick={() => {
                const team = finalFourMatchups[1].teamB;
                if (team) onTeamSelect(finalFourMatchups[1].id, team);
              }}
              reversed={true}
              isIncomplete={isFinalFour2Incomplete?? undefined}
              submitAttempted={submitAttempted}
              readOnly={readOnly}
              isCorrectPick={isCorrectPick(finalFourMatchups[1], finalFourMatchups[1].teamB)}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-center items-start mb-3 w-full max-w-xs">
        {/* Championship */}
        <div className={`border-2 rounded-lg p-1 w-full ${
          isChampionshipIncomplete && submitAttempted
            ? 'border-red-500 bg-red-50 animate-pulse' 
            : 'border-yellow-500 bg-yellow-50'
        }`}>
          <p className="text-center text-xs font-bold text-yellow-800 mb-0.5">
            Championship
          </p>
          <div className="flex justify-center gap-2 items-center">
            <div className="w-32">
              <TeamSlot
                team={championshipMatchup.teamA}
                isWinner={
                  championshipMatchup.winner === championshipMatchup.teamA
                }
                onClick={() => {
                  const team = championshipMatchup.teamA;
                  if (team) onTeamSelect(championshipMatchup.id, team);
                }}
                isIncomplete={isChampionshipIncomplete?? undefined}
                submitAttempted={submitAttempted}
                readOnly={readOnly}
                isCorrectPick={isCorrectPick(championshipMatchup, championshipMatchup.teamA)}
              />
            </div>
            <div className="text-center font-bold text-xs">vs</div>
            <div className="w-32">
              <TeamSlot
                team={championshipMatchup.teamB}
                isWinner={
                  championshipMatchup.winner === championshipMatchup.teamB
                }
                onClick={() => {
                  const team = championshipMatchup.teamB;
                  if (team) onTeamSelect(championshipMatchup.id, team);
                }}
                reversed={true}
                isIncomplete={isChampionshipIncomplete?? undefined}
                submitAttempted={submitAttempted}
                readOnly={readOnly}
                isCorrectPick={isCorrectPick(championshipMatchup, championshipMatchup.teamB)}
              />
            </div>
          </div>

          {/* Champion Display */}
          {championshipMatchup.winner && (
            <div className="mt-2 pt-1 border-t border-yellow-400">
              <p className="text-center text-xs font-bold text-yellow-800 mb-0.5">
                CHAMPION
              </p>
              <div className={`border rounded-md p-1 mx-auto ${
                highlightCorrectPicks && actualResults && actualResults[6][0].winner ? 
                  (actualResults[6][0].winner.name === championshipMatchup.winner.name ? 
                    'bg-green-100 border-green-500' : 'bg-red-50 border-red-300') : 
                  'bg-green-100 border-green-500'
              }`}>
                <div className="flex items-center justify-center">
                  <span className="font-bold text-[10px] w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center mr-1">
                    {championshipMatchup.winner.seed}
                  </span>
                  <span className="font-bold text-xs">
                    {championshipMatchup.winner.name}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface PrintStyleCompactBracketProps {
  bracketData: BracketData;
  onTeamSelect?: (matchupId: number, team: Team) => void;
  incompleteMatchups?: number[];
  submitAttempted?: boolean;
  readOnly?: boolean;
  highlightCorrectPicks?: boolean;
  actualResults?: BracketData;
}

const PrintStyleCompactBracket: React.FC<PrintStyleCompactBracketProps> = ({
  bracketData,
  onTeamSelect = () => {},
  incompleteMatchups = [],
  submitAttempted = false,
  readOnly = false,
  highlightCorrectPicks = false,
  actualResults
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6 overflow-x-auto">
      <h2 className="text-xl font-bold mb-3 text-center">Tournament Bracket</h2>

      <div className="flex justify-center">
        {/* Left side of bracket - South and West regions (flowing left to right) */}
        <div className="flex flex-col">
          <ForwardRegion
            bracketData={bracketData}
            firstRoundStart={0}
            firstRoundEnd={8}
            showLabel={true}
            regionName="South"
            onTeamSelect={onTeamSelect}
            incompleteMatchups={incompleteMatchups}
            submitAttempted={submitAttempted}
            readOnly={readOnly}
            highlightCorrectPicks={highlightCorrectPicks}
            actualResults={actualResults}
          />

          <div className="my-5"></div>

          <ForwardRegion
            bracketData={bracketData}
            firstRoundStart={8}
            firstRoundEnd={16}
            showLabel={false}
            regionName="West"
            onTeamSelect={onTeamSelect}
            incompleteMatchups={incompleteMatchups}
            submitAttempted={submitAttempted}
            readOnly={readOnly}
            highlightCorrectPicks={highlightCorrectPicks}
            actualResults={actualResults}
          />
        </div>

        {/* Center - Final Four & Championship */}
        <div className="flex flex-col justify-center relative min-w-32">
          <div
            className="absolute min-w-70"
            style={{
              left: "-85px",
              width: "300px", // Explicitly set width to cover the entire Final Four area
              zIndex: 10, // Ensure this is above other elements that might block clicks
            }}
          >
            <div className="text-xs font-bold text-center text-red-800 mb-1">
              Final Four
            </div>
            <div>
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
          </div>
        </div>

        {/* Right side of bracket - East and Midwest regions (flowing right to left) */}
        <div className="flex flex-col">
          <ReverseRegion
            bracketData={bracketData}
            firstRoundStart={16}
            firstRoundEnd={24}
            showLabel={true}
            regionName="East"
            onTeamSelect={onTeamSelect}
            incompleteMatchups={incompleteMatchups}
            submitAttempted={submitAttempted}
            readOnly={readOnly}
            highlightCorrectPicks={highlightCorrectPicks}
            actualResults={actualResults}
          />

          <div className="my-5"></div>

          <ReverseRegion
            bracketData={bracketData}
            firstRoundStart={24}
            firstRoundEnd={32}
            showLabel={false}
            regionName="Midwest"
            onTeamSelect={onTeamSelect}
            incompleteMatchups={incompleteMatchups}
            submitAttempted={submitAttempted}
            readOnly={readOnly}
            highlightCorrectPicks={highlightCorrectPicks}
            actualResults={actualResults}
          />
        </div>
      </div>
    </div>
  );
};

export default PrintStyleCompactBracket;