import React from 'react';
import { Team, Matchup, BracketData } from './types';

interface TeamSlotProps {
  team: Team | null;
  isWinner: boolean;
  onClick: () => void;
}

const TeamSlot: React.FC<TeamSlotProps> = ({ team, isWinner, onClick }) => {
  if (!team) {
    return (
      <div className="h-10 bg-gray-50 border border-gray-200 rounded-md flex items-center px-2 text-gray-400">
        TBD
      </div>
    );
  }
  
  return (
    <div 
      className={`h-10 border rounded-md flex items-center px-2 cursor-pointer hover:bg-blue-50 ${
        isWinner ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-300'
      }`}
      onClick={onClick}
    >
      <span className="font-bold text-xs w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
        {team.seed}
      </span>
      <span className="text-sm truncate">{team.name}</span>
    </div>
  );
};

interface ConnectorProps {
  direction: 'right' | 'left';
}

const Connector: React.FC<ConnectorProps> = ({ direction }) => {
  return (
    <div className="relative h-full w-full flex items-center">
      <div className={`absolute ${direction === 'right' ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 w-8 h-0.5 bg-gray-300`}></div>
    </div>
  );
};

interface MatchupDisplayProps {
  matchup: Matchup;
  onTeamSelect: (matchupId: number, team: Team) => void;
}

const MatchupDisplay: React.FC<MatchupDisplayProps> = ({ matchup, onTeamSelect }) => {
  return (
    <div className="mb-4">
      <TeamSlot 
        team={matchup.teamA} 
        isWinner={matchup.winner === matchup.teamA}
        onClick={() => matchup.teamA && onTeamSelect(matchup.id, matchup.teamA)}
      />
      <TeamSlot 
        team={matchup.teamB} 
        isWinner={matchup.winner === matchup.teamB}
        onClick={() => matchup.teamB && onTeamSelect(matchup.id, matchup.teamB)}
      />
    </div>
  );
};

interface RegionBracketProps {
  title: string;
  bracketData: BracketData;
  regionSlice: [number, number];
  roundStartIndexes: [number, number, number]; // indexes for rounds 2, 3, 4
  onTeamSelect: (matchupId: number, team: Team) => void;
}

const RegionBracket: React.FC<RegionBracketProps> = ({ 
  title, 
  bracketData, 
  regionSlice, 
  roundStartIndexes,
  onTeamSelect
}) => {
  return (
    <div className="mb-8">
      <h3 className="bg-blue-800 text-white text-center py-2 rounded-t font-bold mb-2">
        {title}
      </h3>
      
      <div className="flex">
        {/* First Round */}
        <div className="w-48 mr-4">
          <div className="text-center font-bold mb-2">First Round</div>
          <div className="space-y-4">
            {bracketData[1].slice(regionSlice[0], regionSlice[1]).map((matchup) => (
              <MatchupDisplay 
                key={matchup.id} 
                matchup={matchup} 
                onTeamSelect={onTeamSelect} 
              />
            ))}
          </div>
        </div>
        
        {/* Connectors */}
        <div className="w-8 relative">
          <div className="space-y-12 mt-12">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={`r1-conn-${index}`} className="h-10">
                <Connector direction="right" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Second Round */}
        <div className="w-48 mr-4">
          <div className="text-center font-bold mb-2">Second Round</div>
          <div className="space-y-28 mt-6">
            {bracketData[2].slice(roundStartIndexes[0], roundStartIndexes[0] + 4).map((matchup) => (
              <MatchupDisplay 
                key={matchup.id} 
                matchup={matchup} 
                onTeamSelect={onTeamSelect} 
              />
            ))}
          </div>
        </div>
        
        {/* Connectors */}
        <div className="w-8 relative">
          <div className="space-y-64 mt-24">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`r2-conn-${index}`} className="h-10">
                <Connector direction="right" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Sweet 16 */}
        <div className="w-48 mr-4">
          <div className="text-center font-bold mb-2">Sweet 16</div>
          <div className="space-y-64 mt-36">
            {bracketData[3].slice(roundStartIndexes[1], roundStartIndexes[1] + 2).map((matchup) => (
              <MatchupDisplay 
                key={matchup.id} 
                matchup={matchup} 
                onTeamSelect={onTeamSelect} 
              />
            ))}
          </div>
        </div>
        
        {/* Connectors */}
        <div className="w-8 relative">
          <div className="space-y-240 mt-60">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={`r3-conn-${index}`} className="h-10">
                <Connector direction="right" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Elite 8 */}
        <div className="w-48">
          <div className="text-center font-bold mb-2">Elite 8</div>
          <div className="mt-84">
            <MatchupDisplay 
              matchup={bracketData[4][roundStartIndexes[2]]} 
              onTeamSelect={onTeamSelect} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface FinalRoundsProps {
  bracketData: BracketData;
  onTeamSelect: (matchupId: number, team: Team) => void;
}

const FinalRounds: React.FC<FinalRoundsProps> = ({ bracketData, onTeamSelect }) => {
  return (
    <div className="mb-8">
      <h3 className="bg-red-800 text-white text-center py-2 rounded-t font-bold mb-4">
        Final Four & Championship
      </h3>
      
      <div className="flex justify-center items-center">
        <div className="w-48">
          <MatchupDisplay 
            matchup={bracketData[5][0]} 
            onTeamSelect={onTeamSelect} 
          />
        </div>
        
        {/* Connector */}
        <div className="w-8">
          <Connector direction="right" />
        </div>
        
        <div className="mx-8 w-64 border-2 border-yellow-500 rounded-lg bg-yellow-50 p-4">
          <h4 className="text-center font-bold mb-2">Championship</h4>
          <MatchupDisplay 
            matchup={bracketData[6][0]} 
            onTeamSelect={onTeamSelect} 
          />
          
          {bracketData[6][0].winner && (
            <div className="mt-4 pt-2 border-t border-yellow-400">
              <p className="text-center text-sm font-bold text-yellow-800 mb-1">CHAMPION</p>
              <div className="bg-green-100 border border-green-500 rounded-md p-2">
                <div className="flex items-center">
                  <span className="font-bold text-xs w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                    {bracketData[6][0].winner.seed}
                  </span>
                  <span className="font-bold">{bracketData[6][0].winner.name}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Connector */}
        <div className="w-8">
          <Connector direction="left" />
        </div>
        
        <div className="w-48">
          <MatchupDisplay 
            matchup={bracketData[5][1]} 
            onTeamSelect={onTeamSelect} 
          />
        </div>
      </div>
      
      {/* Vertical connectors from Elite 8 to Final Four */}
      <div className="flex justify-center mt-4">
        <div className="flex space-x-16">
          <div className="w-16 h-8 relative">
            <div className="absolute inset-0 flex justify-center">
              <div className="w-0.5 h-full bg-gray-300"></div>
            </div>
          </div>
          <div className="w-16 h-8 relative">
            <div className="absolute inset-0 flex justify-center">
              <div className="w-0.5 h-full bg-gray-300"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ImprovedBracketProps {
  bracketData: BracketData;
  onTeamSelect: (matchupId: number, team: Team) => void;
}

const ImprovedBracket: React.FC<ImprovedBracketProps> = ({ bracketData, onTeamSelect }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6 overflow-x-auto min-w-[1200px]">
      <h2 className="text-2xl font-bold mb-6 text-center">Tournament Bracket</h2>
      
      {/* Midwest Region */}
      <RegionBracket 
        title="Midwest Region"
        bracketData={bracketData}
        regionSlice={[0, 8]}
        roundStartIndexes={[0, 0, 0]}
        onTeamSelect={onTeamSelect}
      />
      
      {/* West Region */}
      <RegionBracket 
        title="West Region"
        bracketData={bracketData}
        regionSlice={[8, 16]}
        roundStartIndexes={[4, 2, 1]}
        onTeamSelect={onTeamSelect}
      />
      
      {/* Final Four & Championship */}
      <FinalRounds bracketData={bracketData} onTeamSelect={onTeamSelect} />
      
      {/* East Region */}
      <RegionBracket 
        title="East Region"
        bracketData={bracketData}
        regionSlice={[16, 24]}
        roundStartIndexes={[8, 4, 2]}
        onTeamSelect={onTeamSelect}
      />
      
      {/* South Region */}
      <RegionBracket 
        title="South Region"
        bracketData={bracketData}
        regionSlice={[24, 32]}
        roundStartIndexes={[12, 6, 3]}
        onTeamSelect={onTeamSelect}
      />
      
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-bold text-blue-800 mb-2">How to Complete Your Bracket</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Click on a team name to select it as the winner of that matchup</li>
          <li>Winners automatically advance to the next round</li>
          <li>Complete your bracket by selecting a champion</li>
          <li>Use the buttons below to generate random picks or select all favorites</li>
        </ul>
      </div>
    </div>
  );
};

export default ImprovedBracket;