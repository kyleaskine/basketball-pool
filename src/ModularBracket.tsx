import React from 'react';
import { Team, Matchup, BracketData } from './types';

interface TeamSlotProps {
  team: Team | null;
  isWinner: boolean;
  onClick: () => void;
  horizontal?: boolean;
}

const TeamSlot: React.FC<TeamSlotProps> = ({ team, isWinner, onClick, horizontal = false }) => {
  if (!team) {
    return (
      <div className={`${horizontal ? 'w-40' : 'h-10'} bg-gray-50 border border-gray-200 rounded-md flex items-center px-2 text-gray-400`}>
        TBD
      </div>
    );
  }
  
  return (
    <div 
      className={`${horizontal ? 'w-40' : 'h-10'} border rounded-md flex items-center px-2 cursor-pointer hover:bg-blue-50 ${
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

interface BracketRegionProps {
  title: string;
  bracketData: BracketData;
  firstRoundStart: number; 
  firstRoundEnd: number;
  regionName: string;
  onTeamSelect: (matchupId: number, team: Team) => void;
}

const BracketRegion: React.FC<BracketRegionProps> = ({
  title,
  bracketData,
  firstRoundStart,
  firstRoundEnd,
  regionName,
  onTeamSelect
}) => {
  const firstRoundMatchups = bracketData[1].slice(firstRoundStart, firstRoundEnd);
  
  // Get matchups from other rounds filtered by this region
  const getMatchupsForRound = (round: number) => {
    return bracketData[round].filter(m => m.region === regionName);
  };
  
  const secondRoundMatchups = getMatchupsForRound(2);
  const sweetSixteenMatchups = getMatchupsForRound(3);
  const eliteEightMatchups = getMatchupsForRound(4);
  
  const renderMatchup = (matchup: Matchup, noBorder = false) => {
    return (
      <>
        <TeamSlot 
          team={matchup.teamA} 
          isWinner={matchup.winner === matchup.teamA}
          onClick={() => {
            if (matchup.teamA) onTeamSelect(matchup.id, matchup.teamA);
          }}
        />
        <div className="h-2"></div>
        <TeamSlot 
          team={matchup.teamB} 
          isWinner={matchup.winner === matchup.teamB}
          onClick={() => {
            if (matchup.teamB) onTeamSelect(matchup.id, matchup.teamB);
          }}
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
}

const FinalFour: React.FC<FinalFourProps> = ({ bracketData, onTeamSelect }) => {
  const finalFourMatchups = bracketData[5];
  const championshipMatchup = bracketData[6][0];
  
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
            />
            <div className="h-2"></div>
            <TeamSlot 
              team={finalFourMatchups[0].teamB} 
              isWinner={finalFourMatchups[0].winner === finalFourMatchups[0].teamB}
              onClick={() => {
                const team = finalFourMatchups[0].teamB;
                if (team) onTeamSelect(finalFourMatchups[0].id, team);
              }}
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
            />
            <div className="h-2"></div>
            <TeamSlot 
              team={finalFourMatchups[1].teamB} 
              isWinner={finalFourMatchups[1].winner === finalFourMatchups[1].teamB}
              onClick={() => {
                const team = finalFourMatchups[1].teamB;
                if (team) onTeamSelect(finalFourMatchups[1].id, team);
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Championship Game - Horizontal Layout */}
      <div className="flex flex-col items-center">
        <div className="text-center font-bold mb-3">Championship</div>
        <div className="border-2 border-yellow-500 rounded-lg bg-yellow-50 p-4 w-full max-w-lg">
          <div className="flex justify-center gap-4 items-center">
            <TeamSlot 
              team={championshipMatchup.teamA} 
              isWinner={championshipMatchup.winner === championshipMatchup.teamA}
              onClick={() => {
                const team = championshipMatchup.teamA;
                if (team) onTeamSelect(championshipMatchup.id, team);
              }}
              horizontal={true}
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
            />
          </div>
          
          {/* Champion Display */}
          {championshipMatchup.winner && (
            <div className="mt-4 pt-2 border-t border-yellow-400">
              <p className="text-center text-sm font-bold text-yellow-800 mb-1">CHAMPION</p>
              <div className="bg-green-100 border border-green-500 rounded-md p-2 mx-auto max-w-xs">
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
  onTeamSelect: (matchupId: number, team: Team) => void;
}

const ModularBracket: React.FC<ModularBracketProps> = ({ bracketData, onTeamSelect }) => {
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
      />
      
      {/* East Region */}
      <BracketRegion
        title="East Region"
        bracketData={bracketData}
        firstRoundStart={16}
        firstRoundEnd={24}
        regionName="East"
        onTeamSelect={onTeamSelect}
      />
      
      {/* West Region */}
      <BracketRegion
        title="West Region"
        bracketData={bracketData}
        firstRoundStart={8}
        firstRoundEnd={16}
        regionName="West"
        onTeamSelect={onTeamSelect}
      />
      
      {/* Midwest Region */}
      <BracketRegion
        title="Midwest Region"
        bracketData={bracketData}
        firstRoundStart={24}
        firstRoundEnd={32}
        regionName="Midwest"
        onTeamSelect={onTeamSelect}
      />
      
      {/* Final Four & Championship */}
      <FinalFour 
        bracketData={bracketData}
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

export default ModularBracket;