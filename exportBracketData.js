// A script to export the bracket data from BasketballPoolEntryForm.tsx to a JSON file
// Save this as a separate file, e.g., exportBracketData.js

const fs = require('fs');

// This is the regions data from BasketballPoolEntryForm.tsx
const regions = {
  south: {
    name: "South",
    teams: [
      { seed: 1, name: "Auburn" },
      { seed: 16, name: "ALST/SFC" },
      { seed: 8, name: "Louisville" },
      { seed: 9, name: "Creighton" },
      { seed: 5, name: "Michigan" },
      { seed: 12, name: "UC San Diego" },
      { seed: 4, name: "Texas A&M" },
      { seed: 13, name: "Yale" },
      { seed: 6, name: "Mississippi" },
      { seed: 11, name: "SDSU/UNC" },
      { seed: 3, name: "Iowa St." },
      { seed: 14, name: "Lipscomb" },
      { seed: 7, name: "Marquette" },
      { seed: 10, name: "New Mexico" },
      { seed: 2, name: "Michigan St." },
      { seed: 15, name: "Bryant" },
    ],
  },
  west: {
    name: "West",
    teams: [
      { seed: 1, name: "Florida" },
      { seed: 16, name: "Norfolk State" },
      { seed: 8, name: "Connecticut" },
      { seed: 9, name: "Oklahoma" },
      { seed: 5, name: "Memphis" },
      { seed: 12, name: "Colorado St." },
      { seed: 4, name: "Maryland" },
      { seed: 13, name: "Grand Canyon" },
      { seed: 6, name: "Missouri" },
      { seed: 11, name: "Drake" },
      { seed: 3, name: "Texas Tech" },
      { seed: 14, name: "NC-Wilmington" },
      { seed: 7, name: "Kansas" },
      { seed: 10, name: "Arkansas" },
      { seed: 2, name: "St. John's" },
      { seed: 15, name: "Neb. Omaha" },
    ],
  },
  east: {
    name: "East",
    teams: [
      { seed: 1, name: "Duke" },
      { seed: 16, name: "AMER/MSMM" },
      { seed: 8, name: "Mississippi St." },
      { seed: 9, name: "Baylor" },
      { seed: 5, name: "Oregon" },
      { seed: 12, name: "Liberty" },
      { seed: 4, name: "Arizona" },
      { seed: 13, name: "Akron" },
      { seed: 6, name: "BYU" },
      { seed: 11, name: "VCU" },
      { seed: 3, name: "Wisconsin" },
      { seed: 14, name: "Montana" },
      { seed: 7, name: "St. Mary's" },
      { seed: 10, name: "Vanderbilt" },
      { seed: 2, name: "Alabama" },
      { seed: 15, name: "Robert Morris" },
    ],
  },
  midwest: {
    name: "Midwest",
    teams: [
      { seed: 1, name: "Houston" },
      { seed: 16, name: "SIU-Edwardsville" },
      { seed: 8, name: "Gonzaga" },
      { seed: 9, name: "Georgia" },
      { seed: 5, name: "Clemson" },
      { seed: 12, name: "McNeese St." },
      { seed: 4, name: "Purdue" },
      { seed: 13, name: "High Point" },
      { seed: 6, name: "Illinois" },
      { seed: 11, name: "TEX/XAV" },
      { seed: 3, name: "Kentucky" },
      { seed: 14, name: "Troy" },
      { seed: 7, name: "UCLA" },
      { seed: 10, name: "Utah St." },
      { seed: 2, name: "Tennessee" },
      { seed: 15, name: "Wofford" },
    ],
  },
};

// Function to initialize the bracket structure
function initializeBracket() {
  // Create an object to store all matchups by round
  const bracket = {
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
      const matchup = {
        id: index++,
        region: region.name,
        round: 1,
        matchupIndex: i,
        teamA: region.teams[i * 2],
        teamB: region.teams[i * 2 + 1],
        winner: null,
        nextMatchupId: Math.floor(i / 2) + regionIndex * 4 + 32, // Maps to next round
        position: i,
      };
      bracket[1].push(matchup);
    }
  });

  // Second round (assuming 32 first round matchups)
  for (let i = 0; i < 16; i++) {
    const regionIndex = Math.floor(i / 4);
    const regionName = Object.values(regions)[regionIndex].name;
    bracket[2].push({
      id: index++,
      region: regionName,
      round: 2,
      matchupIndex: i,
      teamA: null, // Will be filled by winners
      teamB: null,
      winner: null,
      nextMatchupId: Math.floor(i / 2) + 48, // Maps to Sweet 16
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
      nextMatchupId: Math.floor(i / 2) + 56, // Maps to Elite 8
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
      nextMatchupId: Math.floor(i / 2) + 60, // Maps to Final Four
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
    nextMatchupId: 62, // Championship
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
    nextMatchupId: 62, // Championship
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
    nextMatchupId: null, // End of tournament
    position: 0,
  });

  return bracket;
}

// Generate games from the bracket structure
function generateGames(bracket) {
  const games = [];
  
  // Process each round in the bracket
  for (const [roundStr, matchups] of Object.entries(bracket)) {
    const round = parseInt(roundStr);
    
    // Process each matchup in the round
    for (const matchup of matchups) {
      // Only create games for matchups that have both teams defined (first round)
      if (matchup.teamA && matchup.teamB) {
        games.push({
          matchupId: matchup.id,
          round,
          teamA: matchup.teamA,
          teamB: matchup.teamB,
          winner: null,
          score: {
            teamA: 0,
            teamB: 0
          },
          completed: false
        });
      }
    }
  }
  
  return games;
}

// Create the tournament data structure
const bracketStructure = initializeBracket();
const games = generateGames(bracketStructure);
// Initialize teams object with all teams
const teams = {};

// Process all regions to create teams object
Object.values(regions).forEach(region => {
  region.teams.forEach(team => {
    teams[team.name] = {
      seed: team.seed,
      eliminated: false,
      eliminationRound: null,
      eliminationMatchupId: null
    };
  });
});

// Create the complete tournament data object
const tournamentData = {
  year: new Date().getFullYear(),
  results: bracketStructure,
  completedRounds: [],
  games,
  teams,
  scoringConfig: {
    1: 1,  // First round: 1 point
    2: 2,  // Second round: 2 points
    3: 3,  // Sweet 16: 3 points
    4: 4,  // Elite 8: 4 points
    5: 5, // Final Four: 5 points
    6: 6  // Championship: 6 points
  },
  lastUpdated: new Date()
};

// Export the data to a JSON file
fs.writeFileSync('tournament-data-2025.json', JSON.stringify(tournamentData, null, 2));
console.log('Tournament data exported to tournament-data-2025.json');

// Instructions for importing into MongoDB
console.log('\nTo import this data into MongoDB, you can:');
console.log('1. Use the TournamentInitialize component in the admin panel');
console.log('2. Or use the MongoDB shell or MongoDB Compass to import the file');
console.log('3. Or use the following command to import via the API:');
console.log('\ncurl -X POST http://localhost:5000/api/tournament/results \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -H "x-auth-token: YOUR_ADMIN_TOKEN" \\');
console.log('  -d @tournament-data-2025.json');