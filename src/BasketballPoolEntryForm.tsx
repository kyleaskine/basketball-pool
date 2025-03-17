import React, { useState, useEffect } from 'react';
import { Team, Matchup, UserInfo, BracketData, Regions } from './types';
import ModularBracket from './ModularBracket';
import PrintStyleCompactBracket from './PrintStyleCompactBracket';

const ResponsiveBasketballPoolEntryForm: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: '',
    lastName: '',
    email: '',
    contact: ''
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitAttempted, setSubmitAttempted] = useState<boolean>(false);
  const [isLargeScreen, setIsLargeScreen] = useState<boolean>(false);
  const [preferCompact, setPreferCompact] = useState<boolean | null>(null);

  // Tournament data with the 2025 teams
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
      ]
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
      ]
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
      ]
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
      ]
    }
  };

  // Initialize bracket data for all rounds
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
          nextMatchupId: Math.floor(i / 2) + (regionIndex * 4) + 32, // Maps to next round
          position: i
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
        position: i
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
        position: i
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
        position: i
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
      position: 0
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
      position: 1
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
      position: 0
    });
    
    return bracket;
  };

  // Initialize the bracket data
  const [bracketData, setBracketData] = useState<BracketData>(initializeBracket);

  // Check screen size on component mount and when window is resized
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1400 && window.innerHeight >= 900);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user edits a field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Find a matchup by ID in the bracket data
  const findMatchup = (matchupId: number): { matchup: Matchup, round: number } | null => {
    for (let round = 1; round <= 6; round++) {
      const matchupIndex = bracketData[round].findIndex(m => m.id === matchupId);
      if (matchupIndex !== -1) {
        return {
          matchup: bracketData[round][matchupIndex],
          round
        };
      }
    }
    return null;
  };
  
  // Recursive function to clear a team from subsequent rounds
  const clearTeamFromSubsequentRounds = (
    team: Team, 
    currentRound: number, 
    currentMatchupId: number,
    newBracketData: BracketData
  ): void => {
    // Base case: we've reached the end of the tournament
    if (currentRound >= 7) return;
    
    // Find the current matchup
    const matchupInfo = findMatchup(currentMatchupId);
    if (!matchupInfo) return;
    
    const { matchup } = matchupInfo;
    
    // If this matchup has a next matchup ID, process it recursively
    if (matchup.nextMatchupId !== null) {
      const nextMatchupInfo = findMatchup(matchup.nextMatchupId);
      if (nextMatchupInfo) {
        const { matchup: nextMatchup, round: nextRound } = nextMatchupInfo;
        
        // Check if this team is in the next matchup
        if (nextMatchup.teamA?.name === team.name && nextMatchup.teamA?.seed === team.seed) {
          // Clear teamA
          const nextMatchupIndex = newBracketData[nextRound].findIndex(m => m.id === nextMatchup.id);
          if (nextMatchupIndex !== -1) {
            newBracketData[nextRound][nextMatchupIndex] = {
              ...newBracketData[nextRound][nextMatchupIndex],
              teamA: null
            };
            
            // If this team was also the winner, clear that too and continue recursively
            if (nextMatchup.winner?.name === team.name && nextMatchup.winner?.seed === team.seed) {
              newBracketData[nextRound][nextMatchupIndex] = {
                ...newBracketData[nextRound][nextMatchupIndex],
                winner: null
              };
              
              // Continue recursively to clear subsequent rounds
              clearTeamFromSubsequentRounds(team, nextRound, nextMatchup.id, newBracketData);
            }
          }
        } else if (nextMatchup.teamB?.name === team.name && nextMatchup.teamB?.seed === team.seed) {
          // Clear teamB
          const nextMatchupIndex = newBracketData[nextRound].findIndex(m => m.id === nextMatchup.id);
          if (nextMatchupIndex !== -1) {
            newBracketData[nextRound][nextMatchupIndex] = {
              ...newBracketData[nextRound][nextMatchupIndex],
              teamB: null
            };
            
            // If this team was also the winner, clear that too and continue recursively
            if (nextMatchup.winner?.name === team.name && nextMatchup.winner?.seed === team.seed) {
              newBracketData[nextRound][nextMatchupIndex] = {
                ...newBracketData[nextRound][nextMatchupIndex],
                winner: null
              };
              
              // Continue recursively to clear subsequent rounds
              clearTeamFromSubsequentRounds(team, nextRound, nextMatchup.id, newBracketData);
            }
          }
        } else if (nextMatchup.winner?.name === team.name && nextMatchup.winner?.seed === team.seed) {
          // If only the winner matches (odd case), clear it and continue
          const nextMatchupIndex = newBracketData[nextRound].findIndex(m => m.id === nextMatchup.id);
          if (nextMatchupIndex !== -1) {
            newBracketData[nextRound][nextMatchupIndex] = {
              ...newBracketData[nextRound][nextMatchupIndex],
              winner: null
            };
            
            // Continue recursively to clear subsequent rounds
            clearTeamFromSubsequentRounds(team, nextRound, nextMatchup.id, newBracketData);
          }
        }
      }
    }
  };
  
  // This would handle selecting a team to advance
  const handleTeamSelect = (matchupId: number, team: Team): void => {
    // Find the matchup
    const matchupInfo = findMatchup(matchupId);
    if (!matchupInfo) return;
    
    const { matchup, round } = matchupInfo;
    
    // Create a deep copy of the bracket data
    const newBracketData = JSON.parse(JSON.stringify(bracketData)) as BracketData;
    
    // Find the index of the matchup in the current round
    const matchupIndex = newBracketData[round].findIndex(m => m.id === matchupId);
    if (matchupIndex === -1) return;
    
    // Check if there was a previous winner that's different from the new selection
    const previousWinner = matchup.winner;
    if (previousWinner && previousWinner.name !== team.name) {
      // Clear the previous winner from all subsequent rounds
      clearTeamFromSubsequentRounds(previousWinner, round, matchupId, newBracketData);
    }
    
    // Update the current matchup's winner
    newBracketData[round][matchupIndex] = {
      ...newBracketData[round][matchupIndex],
      winner: team
    };
    
    // If there's a next matchup, update it too
    if (matchup.nextMatchupId !== null) {
      const nextMatchupInfo = findMatchup(matchup.nextMatchupId);
      if (nextMatchupInfo) {
        const { round: nextRound } = nextMatchupInfo;
        const nextMatchupIndex = newBracketData[nextRound].findIndex(m => m.id === matchup.nextMatchupId);
        
        if (nextMatchupIndex !== -1) {
          // Determine if this winner goes into teamA or teamB slot
          const isTeamA = matchup.position % 2 === 0;
          
          newBracketData[nextRound][nextMatchupIndex] = {
            ...newBracketData[nextRound][nextMatchupIndex],
            teamA: isTeamA ? team : newBracketData[nextRound][nextMatchupIndex].teamA,
            teamB: isTeamA ? newBracketData[nextRound][nextMatchupIndex].teamB : team
          };
        }
      }
    }
    
    setBracketData(newBracketData);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate user info
    if (!userInfo.firstName.trim()) errors.firstName = "First name is required";
    if (!userInfo.lastName.trim()) errors.lastName = "Last name is required";
    if (!userInfo.email.trim()) errors.email = "Email is required";
    if (!userInfo.email.includes('@')) errors.email = "Please enter a valid email address";
    if (!userInfo.contact.trim()) errors.contact = "Please tell us who told you about this pool";
    
    // Check if the bracket is completely filled out
    // For simplicity, we'll just check if the championship has a winner
    const championship = bracketData[6][0];
    if (!championship.winner) {
      errors.bracket = "Please complete your bracket by selecting a champion";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = (): void => {
    setSubmitAttempted(true);
    if (validateForm()) {
      // In a real implementation, you'd submit the form data
      alert("Entry submitted successfully!");
    } else {
      alert("Please fix the errors in the form before submitting.");
    }
  };
  
  const handleRandomPicks = (): void => {
    // Generate random picks by simulating selections through the bracket
    const newBracketData = { ...bracketData };
    
    // First round - randomly select winners
    newBracketData[1] = bracketData[1].map(matchup => {
      const winner = Math.random() > 0.5 ? matchup.teamA : matchup.teamB;
      return {
        ...matchup,
        winner
      };
    });
    
    // Process subsequent rounds
    for (let round = 2; round <= 6; round++) {
      newBracketData[round] = bracketData[round].map(matchup => {
        // Find the previous matchups that feed into this one
        const prevRound = round - 1;
        const feedingMatchups = newBracketData[prevRound].filter(
          m => m.nextMatchupId === matchup.id
        );
        
        // Get the winners from previous matchups
        const teamA = feedingMatchups[0]?.winner || null;
        const teamB = feedingMatchups[1]?.winner || null;
        
        // Randomly select a winner if both teams are available
        let winner = null;
        if (teamA && teamB) {
          winner = Math.random() > 0.5 ? teamA : teamB;
        }
        
        return {
          ...matchup,
          teamA,
          teamB,
          winner
        };
      });
    }
    
    setBracketData(newBracketData);
  };
  
  const handleFavoritesPicks = (): void => {
    // Always select higher seeds (favorites)
    const newBracketData = { ...bracketData };
    
    // First round - select higher seeds
    newBracketData[1] = bracketData[1].map(matchup => {
      // Lower seed number is higher seed (e.g., 1 is higher than 16)
      const winner = matchup.teamA && matchup.teamB ? 
        (matchup.teamA.seed < matchup.teamB.seed ? matchup.teamA : matchup.teamB) : null;
      
      return {
        ...matchup,
        winner
      };
    });
    
    // Process subsequent rounds
    for (let round = 2; round <= 6; round++) {
      newBracketData[round] = bracketData[round].map(matchup => {
        // Find the previous matchups that feed into this one
        const prevRound = round - 1;
        const feedingMatchups = newBracketData[prevRound].filter(
          m => m.nextMatchupId === matchup.id
        );
        
        // Get the winners from previous matchups
        const teamA = feedingMatchups[0]?.winner || null;
        const teamB = feedingMatchups[1]?.winner || null;
        
        // Select the higher seed if both teams are available
        let winner = null;
        if (teamA && teamB) {
          winner = teamA.seed < teamB.seed ? teamA : teamB;
        }
        
        return {
          ...matchup,
          teamA,
          teamB,
          winner
        };
      });
    }
    
    setBracketData(newBracketData);
  };
  
  const handleClearForm = (): void => {
    if (window.confirm("Are you sure you want to clear all your picks and personal information?")) {
      setUserInfo({
        firstName: '',
        lastName: '',
        email: '',
        contact: ''
      });
      setBracketData(initializeBracket());
      setValidationErrors({});
      setSubmitAttempted(false);
    }
  };

  // Toggle between compact and regular view
  const toggleViewMode = () => {
    setPreferCompact(prev => prev === null ? isLargeScreen : !prev);
  };
  
  // Determine if we should use compact mode
  const useCompactView = () => {
    if (preferCompact !== null) {
      return preferCompact;
    }
    return isLargeScreen;
  };

  // Render the UserInfoForm component
  const UserInfoForm: React.FC = () => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Your Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={userInfo.firstName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md ${
              validationErrors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {validationErrors.firstName && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.firstName}</p>
          )}
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={userInfo.lastName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md ${
              validationErrors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {validationErrors.lastName && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.lastName}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={userInfo.email}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md ${
              validationErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
            Who told you about this pool? *
          </label>
          <input
            type="text"
            id="contact"
            name="contact"
            value={userInfo.contact}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md ${
              validationErrors.contact ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {validationErrors.contact && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.contact}</p>
          )}
        </div>
      </div>
    </div>
  );

  // Control buttons
  const ControlButtons: React.FC = () => (
    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
      >
        Submit Entry
      </button>
      <button
        onClick={handleClearForm}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        Clear Form
      </button>
      <button
        onClick={handleRandomPicks}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Random Picks
      </button>
      <button
        onClick={handleFavoritesPicks}
        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
      >
        All Favorites
      </button>
      <button
        onClick={toggleViewMode}
        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
      >
        {useCompactView() ? "Switch to Regular View" : "Switch to Compact View"}
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-800">
          March Madness Basketball Pool 2025
        </h1>
        <p className="text-gray-600 mt-2">
          Fill out your bracket and submit your entry before the tournament begins!
        </p>
        <div className="mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded">
          <p className="font-medium">Entry Deadline: March 20, 2025 at 12:00 PM ET</p>
        </div>
      </header>
      
      <UserInfoForm />
      
      {useCompactView() ? (
        <PrintStyleCompactBracket bracketData={bracketData} onTeamSelect={handleTeamSelect} />
      ) : (
        <ModularBracket bracketData={bracketData} onTeamSelect={handleTeamSelect} />
      )}
      
      <ControlButtons />
      
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>© 2025 Basketball Pool. All rights reserved.</p>
        <p className="mt-1">Tournament games: March 20-April 7, 2025 • Championship: April 7 at Alamodome</p>
      </footer>
    </div>
  );
};

export default ResponsiveBasketballPoolEntryForm;