import React, { useState } from 'react';
import api from '../../services/api';
import { BracketData, Matchup, Regions } from '../../types';
import PrintStyleCompactBracket from '../../PrintStyleCompactBracket';

const TournamentInitialize: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [viewPreview, setViewPreview] = useState<boolean>(false);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [useCustomFile, setUseCustomFile] = useState<boolean>(false);

  // Tournament data with the 2025 teams - this is the same structure from BasketballPoolEntryForm.tsx
  const regions: Regions = {
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

  // Function to initialize the bracket structure based on the regions data
  const initializeBracket = (): BracketData => {
    // Create an object to store all matchups by round
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
  };
  const initializeTeams = () => {
    const teams: { [key: string]: { seed: number; eliminated: boolean; eliminationRound: number | null; eliminationMatchupId: number | null } } = {};
    
    // Populate teams from all regions
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
    
    return teams;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCustomFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const bracket = initializeBracket();
    const dataStr = JSON.stringify(bracket, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `tournament-template-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleInitializeTournament = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let templateBracket: BracketData;
      
      if (useCustomFile && customFile) {
        // Use custom file if selected
        const fileReader = new FileReader();
        const fileContent = await new Promise<string>((resolve, reject) => {
          fileReader.onload = (e) => {
            if (e.target?.result) {
              resolve(e.target.result as string);
            } else {
              reject(new Error('Failed to read file'));
            }
          };
          fileReader.onerror = reject;
          fileReader.readAsText(customFile);
        });
        
        // Parse the template bracket from JSON
        templateBracket = JSON.parse(fileContent);
      } else {
        // Use the default bracket structure
        templateBracket = initializeBracket();
      }

      // Generate games array from the bracket
      const games = [];
      for (const [roundStr, matchups] of Object.entries(templateBracket)) {
        const round = parseInt(roundStr);
        for (const matchup of matchups as Matchup[]) {
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

      // Initialize the tournament with the template bracket
      await api.post('/tournament/results', {
        results: templateBracket,
        completedRounds: [],
        games,
        teams: useCustomFile && customFile ? null : initializeTeams(),
        scoringConfig: {
          1: 1,  // First round: 1 point
          2: 2,  // Second round: 2 points
          3: 4,  // Sweet 16: 4 points
          4: 8,  // Elite 8: 8 points
          5: 16, // Final Four: 16 points
          6: 32  // Championship: 32 points
        }
      });

      setSuccess('Tournament initialized successfully!');
    } catch (err: any) {
      console.error('Error initializing tournament:', err);
      setError(err.response?.data?.msg || 'Failed to initialize tournament. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Initialize Tournament</h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-4">
          <p>{success}</p>
        </div>
      )}
      
      <div className="mb-4">
        <p className="text-gray-700 mb-2">
          The tournament structure is already defined in the code with the teams for March Madness 2025.
          You can initialize the tournament using this structure or upload a custom JSON file.
        </p>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded mb-4">
          <p className="font-bold">Important</p>
          <p>Initializing the tournament should only be done once, before the tournament begins. This will create the official bracket structure for results tracking.</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <button
          onClick={() => setViewPreview(!viewPreview)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {viewPreview ? 'Hide Preview' : 'View Bracket Preview'}
        </button>
        
        <button
          onClick={handleDownloadTemplate}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Download Template JSON
        </button>
      </div>
      
      {/* Toggle between default and custom structure */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="useCustomFile"
            checked={useCustomFile}
            onChange={() => setUseCustomFile(!useCustomFile)}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <label htmlFor="useCustomFile" className="font-medium text-gray-700">
            Use custom bracket structure
          </label>
        </div>
        
        {useCustomFile && (
          <div className="mt-3">
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="mt-1 text-sm text-gray-500">
              Upload a JSON file with a custom bracket structure.
            </p>
          </div>
        )}
      </div>
      
      <button
        onClick={handleInitializeTournament}
        disabled={isLoading || (useCustomFile && !customFile)}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
      >
        {isLoading ? 'Initializing...' : 'Initialize Tournament'}
      </button>
      
      {/* Preview Section */}
      {viewPreview && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-3">Tournament Bracket Preview</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
            <PrintStyleCompactBracket
              bracketData={initializeBracket()}
              readOnly={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentInitialize;