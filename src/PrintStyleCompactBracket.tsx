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
  isIncorrectPick?: boolean;
  onMatchupClick?: () => void;
  isClickable?: boolean;
}

// Helper function to check if teams match by value
const isSameTeam = (a: Team | null, b: Team | null): boolean => {
  if (!a || !b) return false;
  return a.name === b.name && a.seed === b.seed;
};

// Updated correct pick logic
const isCorrectPickShared = (
  matchup: Matchup,
  team: Team | null,
  actualResults?: BracketData & { teams?: Record<string, any> },
  highlightCorrectPicks?: boolean
): boolean => {
  // Don't highlight anything in round 1
  if (matchup.round === 1 || !highlightCorrectPicks || !actualResults || !team)
    return false;

  // If we have the teams object, use the simpler logic
  if (actualResults.teams && team) {
    // Find previous round matchups
    const prevRound = matchup.round - 1;
    const prevMatchups =
      actualResults[prevRound]?.filter((m) => m.nextMatchupId === matchup.id) ||
      [];

    if (prevMatchups.length === 0) return false;

    // Get team info
    const teamInfo = actualResults.teams[team.name];
    if (!teamInfo) return false;
    
    // For eliminated teams, only return false if they were eliminated before or during this round
    if (teamInfo.eliminated && teamInfo.eliminationRound < matchup.round) {
      return false;
    }

    // Look for a matchup where this team won in the previous round
    return prevMatchups.some(
      (prevMatchup) =>
        prevMatchup.winner &&
        prevMatchup.winner.name === team.name &&
        prevMatchup.winner.seed === team.seed
    );
  }

  return false;
};

// Updated incorrect pick logic - much simpler with teams object
const isIncorrectPickShared = (
  matchup: Matchup,
  team: Team | null,
  actualResults?: BracketData,
  highlightCorrectPicks?: boolean
): boolean => {
  // Skip basic cases
  if (!team || !highlightCorrectPicks || !actualResults) return false;

  // Only check for teams selected as winners
  //if (!matchup.winner || matchup.winner.name !== team.name) return false;

  // If we have teams object, use it for a simple check
  if (actualResults.teams && team.name in actualResults.teams) {
    const teamInfo = actualResults.teams[team.name];

    // Is the team eliminated and do we have valid elimination data?
    if (teamInfo.eliminated && teamInfo.eliminationRound !== null) {
      // Now TypeScript knows eliminationRound isn't null
      return (
        teamInfo.eliminationRound < matchup.round ||
        (teamInfo.eliminationRound === matchup.round &&
          teamInfo.eliminationMatchupId !== matchup.id)
      );
    }
  }

  return false;
};

const TeamSlot: React.FC<TeamSlotProps> = ({
  team,
  isWinner,
  onClick,
  reversed = false,
  isIncomplete = false,
  submitAttempted = false,
  readOnly = false,
  isCorrectPick = false,
  isIncorrectPick = false,
  onMatchupClick,
  isClickable = false,
}) => {
  // Only show incomplete highlight if submitAttempted is true
  const showIncompleteHighlight = isIncomplete && submitAttempted;

  // Determine cursor style based on props
  const cursorStyle =
    onMatchupClick || (!readOnly && team) ? "cursor-pointer" : "cursor-default";

  // Determine hover style based on whether the slot is clickable
  const hoverStyle =
    onMatchupClick || (!readOnly && team) ? "hover:bg-blue-50" : "";

  if (!team) {
    return (
      <div
        className={`h-7 bg-gray-50 border border-gray-200 rounded-md flex items-center px-2 text-gray-400 text-xs ${
          reversed ? "flex-row-reverse" : ""
        } ${
          showIncompleteHighlight ? "border-red-400 border-2 bg-red-50" : ""
        } ${cursorStyle} ${hoverStyle}`}
        onClick={onMatchupClick}
      >
        TBD
      </div>
    );
  }

  // Determine the background and border based on various states
  let bgAndBorderClasses = "bg-white border-gray-300";
  let textClasses = "";

  //if (isWinner) {
  if (isCorrectPick) {
    bgAndBorderClasses = "bg-green-100 border-green-500"; // Correct pick
    textClasses = "font-bold text-green-600"; // Bold text
  } else if (isIncorrectPick) {
    bgAndBorderClasses = "bg-red-100 border-red-300"; // Incorrect pick
    textClasses = "line-through italic text-red-600"; // Strikethrough text
  } else if (readOnly) {
    //bgAndBorderClasses = "bg-gray-100 border-gray-400"; // Unknown result
  } else {
    bgAndBorderClasses = "bg-blue-100 border-blue-500"; // Standard selection
  }
  //}
  //else
  if (isClickable) {
    // Add subtle highlight for clickable matchups in admin mode
    bgAndBorderClasses = "bg-white border-blue-200";
  }

  return (
    <div
      className={`h-7 border rounded-md flex items-center px-2 text-xs ${cursorStyle} ${bgAndBorderClasses} ${
        reversed ? "flex-row-reverse" : ""
      } ${
        showIncompleteHighlight
          ? "border-red-400 border-2 animate-pulse shadow-md"
          : ""
      }`}
      onClick={onMatchupClick || (readOnly ? undefined : onClick)}
    >
      <span
        className={`font-bold text-[10px] w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center ${
          reversed ? "ml-1" : "mr-1"
        }`}
      >
        {team.seed}
      </span>
      <span className={`text-xs truncate ${textClasses}`}>{team.name}</span>
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
  onMatchupClick?: (matchup: Matchup, slot: "A" | "B") => void;
  highlightIncomplete?: boolean;
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
  actualResults,
  onMatchupClick,
  highlightIncomplete = false,
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
    return isCorrectPickShared(
      matchup,
      team,
      actualResults,
      highlightCorrectPicks
    );
  };

  const isIncorrectPick = (matchup: Matchup, team: Team | null): boolean => {
    return isIncorrectPickShared(
      matchup,
      team,
      actualResults,
      highlightCorrectPicks
    );
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
          const isIncomplete =
            matchup.teamA &&
            matchup.teamB &&
            !matchup.winner &&
            incompleteMatchups.includes(matchup.id);

          // Determine if this matchup is clickable (for admin functions or stats view)
          const isClickable =
            !!onMatchupClick && !!matchup.teamA && !!matchup.teamB;

          // Create matchup click handler
          const handleMatchupClick = (matchup: Matchup, slot: "A" | "B") => {
            if (onMatchupClick) {
              onMatchupClick(matchup, slot);
            }
          };

          // Check if this is round 2 or later (for stats view)
          const isRound2OrAbove = round >= 2;
          const shouldHandleClick = isRound2OrAbove && onMatchupClick;

          return (
            <div
              key={matchup.id}
              className={`relative ${index === 0 ? getFirstItemMargin() : ""} ${
                shouldHandleClick ? "cursor-pointer" : ""
              }`}
            >
              <TeamSlot
                team={matchup.teamA}
                isWinner={Boolean(
                  matchup.winner &&
                    matchup.teamA &&
                    matchup.winner.name === matchup.teamA.name &&
                    matchup.winner.seed === matchup.teamA.seed
                )}
                onClick={() => {
                  if (matchup.teamA) onTeamSelect(matchup.id, matchup.teamA);
                }}
                reversed={reversed}
                isIncomplete={isIncomplete ?? undefined}
                submitAttempted={submitAttempted}
                readOnly={readOnly}
                isCorrectPick={isCorrectPick(matchup, matchup.teamA)}
                isIncorrectPick={isIncorrectPick(matchup, matchup.teamA)}
                onMatchupClick={
                  shouldHandleClick
                    ? () => handleMatchupClick(matchup, "A")
                    : undefined
                }
                isClickable={isClickable}
              />
              <div className="h-1"></div>
              <TeamSlot
                team={matchup.teamB}
                isWinner={Boolean(
                  matchup.winner &&
                    matchup.teamB &&
                    matchup.winner.name === matchup.teamB.name &&
                    matchup.winner.seed === matchup.teamB.seed
                )}
                onClick={() => {
                  if (matchup.teamB) onTeamSelect(matchup.id, matchup.teamB);
                }}
                reversed={reversed}
                isIncomplete={isIncomplete ?? undefined}
                submitAttempted={submitAttempted}
                readOnly={readOnly}
                isCorrectPick={isCorrectPick(matchup, matchup.teamB)}
                isIncorrectPick={isIncorrectPick(matchup, matchup.teamB)}
                onMatchupClick={
                  shouldHandleClick
                    ? () => handleMatchupClick(matchup, "B")
                    : undefined
                }
                isClickable={isClickable}
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
  onMatchupClick?: (matchup: Matchup, slot: "A" | "B") => void;
  highlightIncomplete?: boolean;
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
  actualResults,
  onMatchupClick,
  highlightIncomplete = false,
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
        onMatchupClick={onMatchupClick}
        highlightIncomplete={highlightIncomplete}
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
        onMatchupClick={onMatchupClick}
        highlightIncomplete={highlightIncomplete}
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
        onMatchupClick={onMatchupClick}
        highlightIncomplete={highlightIncomplete}
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
        onMatchupClick={onMatchupClick}
        highlightIncomplete={highlightIncomplete}
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
  onMatchupClick?: (matchup: Matchup, slot: "A" | "B") => void;
  highlightIncomplete?: boolean;
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
  actualResults,
  onMatchupClick,
  highlightIncomplete = false,
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
        onMatchupClick={onMatchupClick}
        highlightIncomplete={highlightIncomplete}
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
        onMatchupClick={onMatchupClick}
        highlightIncomplete={highlightIncomplete}
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
        onMatchupClick={onMatchupClick}
        highlightIncomplete={highlightIncomplete}
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
        onMatchupClick={onMatchupClick}
        highlightIncomplete={highlightIncomplete}
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
  onMatchupClick?: (matchup: Matchup, slot: "A" | "B") => void;
  highlightIncomplete?: boolean;
}

const FinalFour: React.FC<FinalFourProps> = ({
  bracketData,
  onTeamSelect,
  incompleteMatchups,
  submitAttempted,
  readOnly = false,
  highlightCorrectPicks = false,
  actualResults,
  onMatchupClick,
  highlightIncomplete = false,
}) => {
  const finalFourMatchups = bracketData[5];
  const championshipMatchup = bracketData[6][0];

  // Check if matchups are incomplete
  const isFinalFour1Incomplete =
    finalFourMatchups[0].teamA &&
    finalFourMatchups[0].teamB &&
    !finalFourMatchups[0].winner &&
    incompleteMatchups.includes(finalFourMatchups[0].id);

  const isFinalFour2Incomplete =
    finalFourMatchups[1].teamA &&
    finalFourMatchups[1].teamB &&
    !finalFourMatchups[1].winner &&
    incompleteMatchups.includes(finalFourMatchups[1].id);

  const isChampionshipIncomplete =
    championshipMatchup.teamA &&
    championshipMatchup.teamB &&
    !championshipMatchup.winner &&
    incompleteMatchups.includes(championshipMatchup.id);

  // Function to check if a pick is correct
  const isCorrectPick = (matchup: Matchup, team: Team | null): boolean => {
    return isCorrectPickShared(
      matchup,
      team,
      actualResults,
      highlightCorrectPicks
    );
  };

  const isIncorrectPick = (matchup: Matchup, team: Team | null): boolean => {
    return isIncorrectPickShared(
      matchup,
      team,
      actualResults,
      highlightCorrectPicks
    );
  };

  // Determine if matchups should be clickable
  const isFF1Clickable = onMatchupClick && finalFourMatchups[0];

  const isFF2Clickable = onMatchupClick && finalFourMatchups[1];

  const isChampClickable = onMatchupClick && championshipMatchup;

  const handleFF1Click = (slot: "A" | "B") => {
    if (isFF1Clickable) {
      onMatchupClick(finalFourMatchups[0], slot);
    }
  };

  const handleFF2Click = (slot: "A" | "B") => {
    if (isFF2Clickable) {
      onMatchupClick(finalFourMatchups[1], slot);
    }
  };

  const handleChampClick = (slot: "A" | "B") => {
    if (isChampClickable) {
      onMatchupClick(championshipMatchup, slot);
    }
  };

  return (
    <div className="flex flex-col items-center mx-2">
      {/* Final Four Matchups */}
      <div className="flex justify-center w-full mb-3">
        <div className="w-32 mr-2">
          <div
            className={`relative ${
              isFF1Clickable ? "cursor-pointer hover:bg-blue-50/30" : ""
            }`}
          >
            <TeamSlot
              team={finalFourMatchups[0].teamA}
              isWinner={Boolean(
                finalFourMatchups[0].winner &&
                  finalFourMatchups[0].teamA &&
                  finalFourMatchups[0].winner.name ===
                    finalFourMatchups[0].teamA.name &&
                  finalFourMatchups[0].winner.seed ===
                    finalFourMatchups[0].teamA.seed
              )}
              onClick={() => {
                const team = finalFourMatchups[0].teamA;
                if (team) onTeamSelect(finalFourMatchups[0].id, team);
              }}
              isIncomplete={isFinalFour1Incomplete ?? undefined}
              submitAttempted={submitAttempted}
              readOnly={readOnly}
              isCorrectPick={isCorrectPick(
                finalFourMatchups[0],
                finalFourMatchups[0].teamA
              )}
              isIncorrectPick={isIncorrectPick(
                finalFourMatchups[0],
                finalFourMatchups[0].teamA
              )}
              onMatchupClick={
                isFF1Clickable ? () => handleFF1Click("A") : undefined
              }
              isClickable={!!isFF1Clickable}
            />
            <div className="h-1"></div>
            <TeamSlot
              team={finalFourMatchups[0].teamB}
              isWinner={Boolean(
                finalFourMatchups[0].winner &&
                  finalFourMatchups[0].teamB &&
                  finalFourMatchups[0].winner.name ===
                    finalFourMatchups[0].teamB.name &&
                  finalFourMatchups[0].winner.seed ===
                    finalFourMatchups[0].teamB.seed
              )}
              onClick={() => {
                const team = finalFourMatchups[0].teamB;
                if (team) onTeamSelect(finalFourMatchups[0].id, team);
              }}
              isIncomplete={isFinalFour1Incomplete ?? undefined}
              submitAttempted={submitAttempted}
              readOnly={readOnly}
              isCorrectPick={isCorrectPick(
                finalFourMatchups[0],
                finalFourMatchups[0].teamB
              )}
              isIncorrectPick={isIncorrectPick(
                finalFourMatchups[0],
                finalFourMatchups[0].teamB
              )}
              onMatchupClick={
                isFF1Clickable ? () => handleFF1Click("B") : undefined
              }
              isClickable={!!isFF1Clickable}
            />
          </div>
        </div>
        <div className="w-32 ml-2">
          <div
            className={`relative ${
              isFF2Clickable ? "cursor-pointer hover:bg-blue-50/30" : ""
            }`}
          >
            <TeamSlot
              team={finalFourMatchups[1].teamA}
              isWinner={Boolean(
                finalFourMatchups[1].winner &&
                  finalFourMatchups[1].teamA &&
                  finalFourMatchups[1].winner.name ===
                    finalFourMatchups[1].teamA.name &&
                  finalFourMatchups[1].winner.seed ===
                    finalFourMatchups[1].teamA.seed
              )}
              onClick={() => {
                const team = finalFourMatchups[1].teamA;
                if (team) onTeamSelect(finalFourMatchups[1].id, team);
              }}
              reversed={true}
              isIncomplete={isFinalFour2Incomplete ?? undefined}
              submitAttempted={submitAttempted}
              readOnly={readOnly}
              isCorrectPick={isCorrectPick(
                finalFourMatchups[1],
                finalFourMatchups[1].teamA
              )}
              isIncorrectPick={isIncorrectPick(
                finalFourMatchups[1],
                finalFourMatchups[1].teamA
              )}
              onMatchupClick={
                isFF2Clickable ? () => handleFF2Click("A") : undefined
              }
              isClickable={!!isFF2Clickable}
            />
            <div className="h-1"></div>
            <TeamSlot
              team={finalFourMatchups[1].teamB}
              isWinner={Boolean(
                finalFourMatchups[1].winner &&
                  finalFourMatchups[1].teamB &&
                  finalFourMatchups[1].winner.name ===
                    finalFourMatchups[1].teamB.name &&
                  finalFourMatchups[1].winner.seed ===
                    finalFourMatchups[1].teamB.seed
              )}
              onClick={() => {
                const team = finalFourMatchups[1].teamB;
                if (team) onTeamSelect(finalFourMatchups[1].id, team);
              }}
              reversed={true}
              isIncomplete={isFinalFour2Incomplete ?? undefined}
              submitAttempted={submitAttempted}
              readOnly={readOnly}
              isCorrectPick={isCorrectPick(
                finalFourMatchups[1],
                finalFourMatchups[1].teamB
              )}
              isIncorrectPick={isIncorrectPick(
                finalFourMatchups[1],
                finalFourMatchups[1].teamB
              )}
              onMatchupClick={
                isFF2Clickable ? () => handleFF2Click("B") : undefined
              }
              isClickable={!!isFF2Clickable}
            />
          </div>
        </div>
      </div>

      {/* Championship */}
      <div className="flex justify-center items-start mb-3 w-full max-w-xs">
        <div
          className={`border-2 rounded-lg p-1 w-full ${
            isChampionshipIncomplete && submitAttempted
              ? "border-red-500 bg-red-50 animate-pulse"
              : "border-yellow-500 bg-yellow-50"
          } ${isChampClickable ? "cursor-pointer hover:bg-yellow-100" : ""}`}
        >
          <p className="text-center text-xs font-bold text-yellow-800 mb-0.5">
            Championship
          </p>
          <div className="flex justify-center gap-2 items-center">
            <div className="w-32">
              <TeamSlot
                team={championshipMatchup.teamA}
                isWinner={Boolean(
                  championshipMatchup.winner &&
                    championshipMatchup.teamA &&
                    championshipMatchup.winner.name ===
                      championshipMatchup.teamA.name &&
                    championshipMatchup.winner.seed ===
                      championshipMatchup.teamA.seed
                )}
                onClick={() => {
                  const team = championshipMatchup.teamA;
                  if (team) onTeamSelect(championshipMatchup.id, team);
                }}
                isIncomplete={isChampionshipIncomplete ?? undefined}
                submitAttempted={submitAttempted}
                readOnly={readOnly}
                isCorrectPick={isCorrectPick(
                  championshipMatchup,
                  championshipMatchup.teamA
                )}
                isIncorrectPick={isIncorrectPick(
                  championshipMatchup,
                  championshipMatchup.teamA
                )}
                onMatchupClick={
                  isChampClickable ? () => handleChampClick("A") : undefined
                }
                isClickable={!!isChampClickable}
              />
            </div>
            <div className="text-center font-bold text-xs">vs</div>
            <div className="w-32">
              <TeamSlot
                team={championshipMatchup.teamB}
                isWinner={Boolean(
                  championshipMatchup.winner &&
                    championshipMatchup.teamB &&
                    championshipMatchup.winner.name ===
                      championshipMatchup.teamB.name &&
                    championshipMatchup.winner.seed ===
                      championshipMatchup.teamB.seed
                )}
                onClick={() => {
                  const team = championshipMatchup.teamB;
                  if (team) onTeamSelect(championshipMatchup.id, team);
                }}
                reversed={true}
                isIncomplete={isChampionshipIncomplete ?? undefined}
                submitAttempted={submitAttempted}
                readOnly={readOnly}
                isCorrectPick={isCorrectPick(
                  championshipMatchup,
                  championshipMatchup.teamB
                )}
                isIncorrectPick={isIncorrectPick(
                  championshipMatchup,
                  championshipMatchup.teamB
                )}
                onMatchupClick={
                  isChampClickable ? () => handleChampClick("B") : undefined
                }
                isClickable={!!isChampClickable}
              />
            </div>
          </div>

          {/* Champion Display - Always show this section */}
          <div className="mt-2 pt-1 border-t border-yellow-400">
            <p className="text-center text-xs font-bold text-yellow-800 mb-0.5">
              CHAMPION
            </p>
            <div
              className={`border rounded-md p-1 mx-auto ${
                championshipMatchup.winner
                  ? isCorrectPick(
                      championshipMatchup,
                      championshipMatchup.winner
                    )
                    ? "bg-green-100 border-green-500"
                    : isIncorrectPick(
                        championshipMatchup,
                        championshipMatchup.winner
                      )
                    ? "bg-red-50 border-red-300"
                    : "bg-yellow-50 border-yellow-400"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-center min-h-7">
                {championshipMatchup.winner ? (
                  <>
                    <span className="font-bold text-[10px] w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center mr-1">
                      {championshipMatchup.winner.seed}
                    </span>
                    <span className="font-bold text-xs">
                      {championshipMatchup.winner.name}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-400 text-xs">Not Selected</span>
                )}
              </div>
            </div>
          </div>
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
  actualResults?: BracketData; // This now includes the teams property
  onMatchupClick?: (matchup: Matchup, slot: "A" | "B") => void;
  highlightIncomplete?: boolean;
}

// Main component
const PrintStyleCompactBracket: React.FC<PrintStyleCompactBracketProps> = ({
  bracketData,
  onTeamSelect = () => {},
  incompleteMatchups = [],
  submitAttempted = false,
  readOnly = false,
  highlightCorrectPicks = false,
  actualResults,
  onMatchupClick,
  highlightIncomplete = false,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6 overflow-x-auto">
      <h2 className="text-xl font-bold mb-3 text-center">Tournament Bracket</h2>

      <div className="overflow-x-auto" style={{ minWidth: "100%" }}>
        <div className="flex px-4 min-w-[1200px] justify-start md:justify-center">
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
              onMatchupClick={onMatchupClick}
              highlightIncomplete={highlightIncomplete}
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
              onMatchupClick={onMatchupClick}
              highlightIncomplete={highlightIncomplete}
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
                  onMatchupClick={onMatchupClick}
                  highlightIncomplete={highlightIncomplete}
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
              onMatchupClick={onMatchupClick}
              highlightIncomplete={highlightIncomplete}
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
              onMatchupClick={onMatchupClick}
              highlightIncomplete={highlightIncomplete}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintStyleCompactBracket;
