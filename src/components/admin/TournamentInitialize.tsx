import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BracketData, Matchup, Regions } from '../../types';
import PrintStyleCompactBracket from '../../PrintStyleCompactBracket';
import { tournamentService } from '../../services/tournamentService';
import { initializeBracket } from '../../utils/bracketUtils';
import { LoadingSpinner, ErrorDisplay, SuccessDisplay } from '../../utils/shared';

const TournamentInitialize: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [viewPreview, setViewPreview] = useState<boolean>(false);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [useCustomFile, setUseCustomFile] = useState<boolean>(false);
  const [regions, setRegions] = useState<Regions | null>(null);
  const [isLoadingRegions, setIsLoadingRegions] = useState<boolean>(true);

  // Load regions from API
  useEffect(() => {
    const loadRegions = async () => {
      try {
        setIsLoadingRegions(true);
        const regionsData = await tournamentService.getRegions();
        setRegions(regionsData);
      } catch (err) {
        console.error('Error loading regions:', err);
        setError('Failed to load tournament structure. Please refresh the page.');
      } finally {
        setIsLoadingRegions(false);
      }
    };

    loadRegions();
  }, []);

  const initializeTeams = (regions: Regions) => {
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
    if (!regions) {
      setError('Tournament structure not loaded yet');
      return;
    }
    
    const bracket = initializeBracket(regions);
    const dataStr = JSON.stringify(bracket, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `tournament-template-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleInitializeTournament = async () => {
    if (!regions) {
      setError('Tournament structure not loaded yet');
      return;
    }

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
        // Use the default bracket structure from API regions
        templateBracket = initializeBracket(regions);
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
        teams: useCustomFile && customFile ? null : initializeTeams(regions),
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

  if (isLoadingRegions) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Initialize Tournament</h2>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Initialize Tournament</h2>
      
      {error && <ErrorDisplay error={error} />}
      {success && <SuccessDisplay message={success} />}
      
      <div className="mb-4">
        <p className="text-gray-700 mb-2">
          The tournament structure is loaded from the database. You can initialize the tournament 
          using this structure or upload a custom JSON file.
        </p>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded mb-4">
          <p className="font-bold">Important</p>
          <p>Initializing the tournament should only be done once, before the tournament begins. 
          This will create the official bracket structure for results tracking.</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <button
          onClick={() => setViewPreview(!viewPreview)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={!regions}
        >
          {viewPreview ? 'Hide Preview' : 'View Bracket Preview'}
        </button>
        
        <button
          onClick={handleDownloadTemplate}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          disabled={!regions}
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
        disabled={isLoading || (useCustomFile && !customFile) || !regions}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
      >
        {isLoading ? 'Initializing...' : 'Initialize Tournament'}
      </button>
      
      {/* Preview Section */}
      {viewPreview && regions && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-3">Tournament Bracket Preview</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
            <PrintStyleCompactBracket
              bracketData={initializeBracket(regions)}
              readOnly={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentInitialize;