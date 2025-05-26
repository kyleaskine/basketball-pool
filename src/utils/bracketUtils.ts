import { BracketData, Matchup, Team, Regions } from '../types';

export const initializeBracket = (regions: Regions): BracketData => {
  const bracket: BracketData = {
    1: [], // First round - 32 matchups
    2: [], // Second round - 16 matchups
    3: [], // Sweet 16 - 8 matchups
    4: [], // Elite 8 - 4 matchups
    5: [], // Final Four - 2 matchups
    6: [], // Championship - 1 matchup
  };

  let index = 0;

  // First round - populate from the regions data
  Object.entries(regions).forEach(([regionKey, region], regionIndex) => {
    for (let i = 0; i < 8; i++) {
      const matchup: Matchup = {
        id: index++,
        region: region.name,
        round: 1,
        matchupIndex: i,
        teamA: region.teams[i * 2],
        teamB: region.teams[i * 2 + 1],
        winner: null,
        nextMatchupId: Math.floor(i / 2) + regionIndex * 4 + 32,
        position: i,
      };
      bracket[1].push(matchup);
    }
  });

  // Second round
  for (let i = 0; i < 16; i++) {
    const regionIndex = Math.floor(i / 4);
    const regionName = Object.values(regions)[regionIndex].name;
    bracket[2].push({
      id: index++,
      region: regionName,
      round: 2,
      matchupIndex: i,
      teamA: null,
      teamB: null,
      winner: null,
      nextMatchupId: Math.floor(i / 2) + 48,
      position: i,
    });
  }

  // Sweet 16
  for (let i = 0; i < 8; i++) {
    const regionIndex = Math.floor(i / 2);
    const regionName = Object.values(regions)[regionIndex].name;
    bracket[3].push({
      id: index++,
      region: regionName,
      round: 3,
      matchupIndex: i,
      teamA: null,
      teamB: null,
      winner: null,
      nextMatchupId: Math.floor(i / 2) + 56,
      position: i,
    });
  }

  // Elite 8
  for (let i = 0; i < 4; i++) {
    const regionName = Object.values(regions)[i].name;
    bracket[4].push({
      id: index++,
      region: regionName,
      round: 4,
      matchupIndex: i,
      teamA: null,
      teamB: null,
      winner: null,
      nextMatchupId: Math.floor(i / 2) + 60,
      position: i,
    });
  }

  // Final Four
  bracket[5].push({
    id: index++,
    region: "Final Four",
    round: 5,
    matchupIndex: 0,
    teamA: null,
    teamB: null,
    winner: null,
    nextMatchupId: 62,
    position: 0,
  });

  bracket[5].push({
    id: index++,
    region: "Final Four",
    round: 5,
    matchupIndex: 1,
    teamA: null,
    teamB: null,
    winner: null,
    nextMatchupId: 62,
    position: 1,
  });

  // Championship
  bracket[6].push({
    id: index++,
    region: "Championship",
    round: 6,
    matchupIndex: 0,
    teamA: null,
    teamB: null,
    winner: null,
    nextMatchupId: null,
    position: 0,
  });

  return bracket;
};

export const findMatchup = (
  matchupId: number,
  bracketData: BracketData
): { matchup: Matchup; round: number } | null => {
  for (let round = 1; round <= 6; round++) {
    const matchupIndex = bracketData[round].findIndex(m => m.id === matchupId);
    if (matchupIndex !== -1) {
      return {
        matchup: bracketData[round][matchupIndex],
        round,
      };
    }
  }
  return null;
};

export const clearTeamFromSubsequentRounds = (
  team: Team,
  currentRound: number,
  currentMatchupId: number,
  newBracketData: BracketData,
  findMatchupFn: typeof findMatchup
): void => {
  if (currentRound >= 7) return;

  const matchupInfo = findMatchupFn(currentMatchupId, newBracketData);
  if (!matchupInfo) return;

  const { matchup } = matchupInfo;

  if (matchup.nextMatchupId !== null) {
    const nextMatchupInfo = findMatchupFn(matchup.nextMatchupId, newBracketData);
    if (nextMatchupInfo) {
      const { matchup: nextMatchup, round: nextRound } = nextMatchupInfo;

      // Check if this team is in the next matchup
      if (nextMatchup.teamA?.name === team.name && nextMatchup.teamA?.seed === team.seed) {
        // Clear teamA
        const nextMatchupIndex = newBracketData[nextRound].findIndex(m => m.id === nextMatchup.id);
        if (nextMatchupIndex !== -1) {
          newBracketData[nextRound][nextMatchupIndex] = {
            ...newBracketData[nextRound][nextMatchupIndex],
            teamA: null,
          };

          if (nextMatchup.winner?.name === team.name && nextMatchup.winner?.seed === team.seed) {
            newBracketData[nextRound][nextMatchupIndex] = {
              ...newBracketData[nextRound][nextMatchupIndex],
              winner: null,
            };
            clearTeamFromSubsequentRounds(team, nextRound, nextMatchup.id, newBracketData, findMatchupFn);
          }
        }
      } else if (nextMatchup.teamB?.name === team.name && nextMatchup.teamB?.seed === team.seed) {
        // Clear teamB
        const nextMatchupIndex = newBracketData[nextRound].findIndex(m => m.id === nextMatchup.id);
        if (nextMatchupIndex !== -1) {
          newBracketData[nextRound][nextMatchupIndex] = {
            ...newBracketData[nextRound][nextMatchupIndex],
            teamB: null,
          };

          if (nextMatchup.winner?.name === team.name && nextMatchup.winner?.seed === team.seed) {
            newBracketData[nextRound][nextMatchupIndex] = {
              ...newBracketData[nextRound][nextMatchupIndex],
              winner: null,
            };
            clearTeamFromSubsequentRounds(team, nextRound, nextMatchup.id, newBracketData, findMatchupFn);
          }
        }
      }
    }
  }
};

export const findIncompleteMatchups = (bracketData: BracketData): number[] => {
  const incomplete: number[] = [];

  for (let round = 1; round <= 6; round++) {
    const matchupsInRound = bracketData[round];
    matchupsInRound.forEach((matchup) => {
      if (matchup.teamA && matchup.teamB && !matchup.winner) {
        incomplete.push(matchup.id);
      }
    });
  }

  return incomplete;
};

export const validateBracket = (bracketData: BracketData): string[] => {
  const incompleteRounds: string[] = [];

  for (let round = 1; round <= 6; round++) {
    const matchupsInRound = bracketData[round];
    const incompleteMatchups = matchupsInRound.filter(
      (matchup) => matchup.teamA && matchup.teamB && !matchup.winner
    );

    if (incompleteMatchups.length > 0) {
      switch (round) {
        case 1: incompleteRounds.push("First Round"); break;
        case 2: incompleteRounds.push("Second Round"); break;
        case 3: incompleteRounds.push("Sweet 16"); break;
        case 4: incompleteRounds.push("Elite 8"); break;
        case 5: incompleteRounds.push("Final Four"); break;
        case 6: incompleteRounds.push("Championship"); break;
      }
    }
  }

  return incompleteRounds;
};