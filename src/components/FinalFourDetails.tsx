import React from 'react';

interface Team {
  seed: number;
  name: string;
}

interface FinalFourDetailsProps {
  champion: Team | undefined;
  runnerUp: Team | undefined;
  finalFourTeams?: Team[];
  tournamentResults: any;
}

const FinalFourDetails: React.FC<FinalFourDetailsProps> = ({
  champion,
  runnerUp,
  finalFourTeams = [],
  tournamentResults
}) => {
  // Check if a team is eliminated
  const isTeamEliminated = (teamName: string): boolean => {
    if (!tournamentResults || !tournamentResults.teams || !teamName) return false;
    return tournamentResults.teams[teamName]?.eliminated === true;
  };

  // Get eliminated round for display purposes
  const getEliminationRound = (teamName: string): string | null => {
    if (!tournamentResults || !tournamentResults.teams || !teamName) return null;
    const round = tournamentResults.teams[teamName]?.eliminationRound;
    if (!round) return null;
    
    switch (round) {
      case 1: return "First Round";
      case 2: return "Second Round";
      case 3: return "Sweet 16";
      case 4: return "Elite 8";
      case 5: return "Final Four";
      case 6: return "Championship";
      default: return `Round ${round}`;
    }
  };

  // Get all Final Four teams including champion and runner-up
  const allFinalFourTeams = React.useMemo(() => {
    const teams = [...(finalFourTeams || [])];
    
    // Make sure champion and runner-up are included
    if (champion && !teams.some(t => t.name === champion.name)) {
      teams.push(champion);
    }
    if (runnerUp && !teams.some(t => t.name === runnerUp.name)) {
      teams.push(runnerUp);
    }
    
    // Remove duplicates and limit to 4 teams
    return teams.filter((team, index, self) => 
      self.findIndex(t => t.name === team.name) === index
    ).slice(0, 4);
  }, [champion, runnerUp, finalFourTeams]);

  // Style based on team status
  const getTeamStyle = (team: Team, isChampion = false, isRunnerUp = false) => {
    const eliminated = isTeamEliminated(team.name);
    
    let baseClasses = "flex items-center justify-between px-4 py-3 rounded-lg";
    let statusClasses = "";
    
    if (isChampion) {
      baseClasses += " bg-yellow-100 border-2 border-yellow-400";
      statusClasses = eliminated ? "line-through italic text-red-600" : "font-bold text-yellow-800";
    } else if (isRunnerUp) {
      baseClasses += " bg-gray-100 border-2 border-gray-400";
      statusClasses = eliminated ? "line-through italic text-red-600" : "font-bold text-gray-800";
    } else {
      baseClasses += " bg-blue-50 border border-blue-200";
      statusClasses = eliminated ? "line-through italic text-red-600" : "font-medium text-blue-800";
    }
    
    return {
      container: baseClasses,
      text: statusClasses
    };
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold mb-3 text-gray-700">Final Four Picks</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {allFinalFourTeams.map(team => {
          const isChamp = champion && team.name === champion.name;
          const isRunner = runnerUp && team.name === runnerUp.name;
          const styles = getTeamStyle(team, isChamp, isRunner);
          const eliminated = isTeamEliminated(team.name);
          const eliminationInfo = getEliminationRound(team.name);
          
          return (
            <div key={team.name} className={styles.container}>
              <div className="flex items-center">
                <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-sm mr-2">
                  {team.seed}
                </div>
                <div>
                  <div className={styles.text}>{team.name}</div>
                  {isChamp && <div className="text-xs text-yellow-600">Champion Pick</div>}
                  {isRunner && <div className="text-xs text-gray-600">Runner-up Pick</div>}
                </div>
              </div>
              
              {eliminated && eliminationInfo && (
                <div className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded">
                  Out in {eliminationInfo}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FinalFourDetails;