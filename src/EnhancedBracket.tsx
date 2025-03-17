import React from 'react';
import { Team, Matchup, BracketData } from './types';

interface TeamSlotProps {
  team: Team | null;
  isWinner: boolean;
  onClick: () => void;
  seed?: boolean;
}

const TeamSlot: React.FC<TeamSlotProps> = ({ team, isWinner, onClick, seed = true }) => {
  if (!team) {
    return (
      <div className="h-10 bg-gray-50 border border-gray-200 rounded-md flex items-center px-2 text-gray-400 font-medium">
        TBD
      </div>
    );
  }
  
  return (
    <div 
      className={`h-10 border rounded-md flex items-center px-2 cursor-pointer transition-all hover:shadow-md ${
        isWinner 
          ? 'bg-blue-100 border-blue-500 font-medium' 
          : 'bg-white border-gray-300 hover:bg-blue-50'
      }`}
      onClick={onClick}
    >
      {seed && (
        <span className="font-bold text-xs w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
          {team.seed}
        </span>
      )}
      <span className="text-sm truncate flex-grow">{team.name}</span>
    </div>
  );
};

interface MatchupProps {
  matchup: Matchup;
  onSelect: (matchupId: number, team: Team) => void;
  connectorStyle?: 'top' | 'bottom' | 'both' | 'none';
}

const MatchupComponent: React.FC<MatchupProps> = ({ 
  matchup, 
  onSelect,
  connectorStyle = 'both'
}) => {
  return (
    <div className="matchup-container relative">
      {/* Connector line from previous round */}
      {(connectorStyle === 'top' || connectorStyle === 'both') && (
        <div className="absolute -left-8 top-5 h-0.5 w-8 bg-gray-300"></div>
      )}
      
      {/* Matchup teams */}
      <div className="matchup flex flex-col gap-1">
        <TeamSlot 
          team={matchup.teamA} 
          isWinner={matchup.winner === matchup.teamA}
          onClick={() => matchup.teamA && onSelect(matchup.id, matchup.teamA)}
        />
        <TeamSlot 
          team={matchup.teamB} 
          isWinner={matchup.winner === matchup.teamB}
          onClick={() => matchup.teamB && onSelect(matchup.id, matchup.teamB)}
        />
      </div>
      
      {/* Line to next round if there's a winner */}
      {matchup.winner && matchup.round < 6 && (
        <div className="absolute -right-8 top-5 h-0.5 w-8 bg-gray-300"></div>
      )}
      
      {/* Connector line to bottom team */}
      {(connectorStyle === 'bottom' || connectorStyle === 'both') && (
        <div className="absolute -left-8 top-5 h-0.5 w-8 bg-gray-300"></div>
      )}
    </div>
  );
};

// A single matchup group showing a matchup and its connections
interface MatchupGroupProps {
  round: number;
  matchup: Matchup;
  onSelect: (matchupId: number, team: Team) => void;
}

const MatchupGroup: React.FC<MatchupGroupProps> = ({ round, matchup, onSelect }) => {
  return (
    <div className="relative">
      {/* Connector lines */}
      {round > 1 && (
        <div className="absolute inset-0 -left-8">
          {/* Vertical connector line */}
          <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-300"></div>
          
          {/* Horizontal connector to current matchup */}
          <div className="absolute left-0 top-1/2 w-8 h-0.5 bg-gray-300 -translate-y-1/2"></div>
        </div>
      )}
      
      {/* Actual matchup */}
      <div className="ml-8">
        <MatchupComponent 
          matchup={matchup} 
          onSelect={onSelect} 
        />
      </div>
    </div>
  );
};

// Single column of matchups for a particular round
interface RoundColumnProps {
  title: string;
  matchups: Matchup[];
  round: number;
  onSelect: (matchupId: number, team: Team) => void;
  spacing: number;
}

const RoundColumn: React.FC<RoundColumnProps> = ({ 
  title, 
  matchups, 
  round, 
  onSelect,
  spacing
}) => {
  return (
    <div className="flex flex-col">
      <div className="text-center font-bold text-gray-700 mb-4">{title}</div>
      <div 
        className="flex flex-col" 
        style={{ 
          gap: `${spacing}px` 
        }}
      >
        {matchups.map(matchup => (
          <MatchupGroup 
            key={matchup.id} 
            round={round} 
            matchup={matchup} 
            onSelect={onSelect} 
          />
        ))}
      </div>
    </div>
  );
};

interface RegionBracketProps {
  name: string;
  bracketData: BracketData;
  regionStartIndex: number;
  onSelect: (matchupId: number, team: Team) => void;
}

const RegionBracket: React.FC<RegionBracketProps> = ({ 
  name, 
  bracketData, 
  regionStartIndex, 
  onSelect 
}) => {
  // Get the matchups for this region
  const round1Matchups = bracketData[1].slice(regionStartIndex, regionStartIndex + 8);
  const round2Matchups = bracketData[2].slice(regionStartIndex / 2, regionStartIndex / 2 + 4);
  const round3Matchups = bracketData[3].slice(regionStartIndex / 4, regionStartIndex / 4 + 2);
  const round4Matchup = bracketData[4][regionStartIndex / 8];
  
  return (
    <div className="mb-12">
      <div className="bg-blue-800 text-white font-bold py-2 px-4 rounded-t text-center mb-4">
        {name} Region
      </div>
      <div className="flex space-x-16">
        {/* Round 1 */}
        <RoundColumn 
          title="First Round" 
          matchups={round1Matchups} 
          round={1} 
          onSelect={onSelect}
          spacing={16}
        />
        
        {/* Round 2 */}
        <RoundColumn 
          title="Second Round" 
          matchups={round2Matchups} 
          round={2} 
          onSelect={onSelect}
          spacing={60}
        />
        
        {/* Round 3 */}
        <RoundColumn 
          title="Sweet 16" 
          matchups={round3Matchups} 
          round={3} 
          onSelect={onSelect}
          spacing={148}
        />
        
        {/* Round 4 */}
        <div className="flex flex-col">
          <div className="text-center font-bold text-gray-700 mb-4">Elite 8</div>
          <div className="mt-80">
            <MatchupGroup 
              round={4} 
              matchup={round4Matchup} 
              onSelect={onSelect} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface FinalFourProps {
  bracketData: BracketData;
  onSelect: (matchupId: number, team: Team) => void;
}

const FinalFour: React.FC<FinalFourProps> = ({ bracketData, onSelect }) => {
  const finalFourMatchups = bracketData[5];
  const championship = bracketData[6][0];
  
  return (
    <div className="mb-12">
      <div className="bg-red-800 text-white font-bold py-2 px-4 rounded-t text-center mb-4">
        Final Four & Championship
      </div>
      
      <div className="flex items-center justify-center">
        <div className="w-52">
          <MatchupComponent 
            matchup={finalFourMatchups[0]} 
            onSelect={onSelect}
          />
        </div>
        
        <div className="mx-16 relative">
          {/* Championship connector lines */}
          <div className="absolute left-0 top-1/2 -translate-x-full w-16 h-0.5 bg-gray-300"></div>
          <div className="absolute right-0 top-1/2 translate-x-full w-16 h-0.5 bg-gray-300"></div>
          
          <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-4 shadow-lg">
            <h3 className="text-center font-bold text-gray-800 mb-2">Championship</h3>
            <MatchupComponent 
              matchup={championship} 
              onSelect={onSelect}
              connectorStyle="none"
            />
            
            {/* Champion display */}
            {championship.winner && (
              <div className="mt-4 text-center">
                <div className="font-bold text-green-800">Champion</div>
                <div className="bg-green-100 border border-green-500 rounded-md p-2 mt-1">
                  <TeamSlot 
                    team={championship.winner} 
                    isWinner={true}
                    onClick={() => {}}
                    seed={false}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="w-52">
          <MatchupComponent 
            matchup={finalFourMatchups[1]} 
            onSelect={onSelect}
          />
        </div>
      </div>
    </div>
  );
};

interface EnhancedBracketProps {
  bracketData: BracketData;
  onTeamSelect: (matchupId: number, team: Team) => void;
}

const EnhancedBracket: React.FC<EnhancedBracketProps> = ({ 
  bracketData, 
  onTeamSelect 
}) => {
  return (
    <div className="bracket-container bg-white p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Tournament Bracket</h2>
      
      <div className="overflow-x-auto">
        <div className="min-w-[1100px] px-4">
          {/* Midwest Region */}
          <RegionBracket 
            name="Midwest" 
            bracketData={bracketData} 
            regionStartIndex={0} 
            onSelect={onTeamSelect} 
          />
          
          {/* West Region */}
          <RegionBracket 
            name="West" 
            bracketData={bracketData} 
            regionStartIndex={8} 
            onSelect={onTeamSelect} 
          />
          
          {/* Final Four and Championship */}
          <FinalFour 
            bracketData={bracketData} 
            onSelect={onTeamSelect} 
          />
          
          {/* East Region */}
          <RegionBracket 
            name="East" 
            bracketData={bracketData} 
            regionStartIndex={16} 
            onSelect={onTeamSelect} 
          />
          
          {/* South Region */}
          <RegionBracket 
            name="South" 
            bracketData={bracketData} 
            regionStartIndex={24} 
            onSelect={onTeamSelect} 
          />
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h3 className="font-bold text-blue-800 mb-2">How to Complete Your Bracket</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>Click on a team to select it as the winner of that matchup</li>
          <li>Winners will automatically advance to the next round</li>
          <li>Complete your bracket by selecting a champion</li>
          <li>Use the "Random Picks" or "All Favorites" buttons for quick selections</li>
        </ul>
      </div>
    </div>
  );
};

export default EnhancedBracket;