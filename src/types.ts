// types.ts
export interface Team {
    seed: number;
    name: string;
  }
  
  export interface Matchup {
    id: number;
    region: string;
    round: number;
    matchupIndex: number;
    teamA: Team | null;
    teamB: Team | null;
    winner: Team | null;
    nextMatchupId: number | null;
    position: number;
  }
  
  export interface UserInfo {
    firstName: string;
    lastName: string;
    email: string;
    contact: string;
  }
  
  export interface BracketData {
    [round: number]: Matchup[];
    teams?: {
      [teamName: string]: {
        seed: number;
        eliminated: boolean;
        eliminationRound: number | null;
        eliminationMatchupId: number | null;
      }
    };
  }
  
  export interface RegionData {
    name: string;
    teams: Team[];
  }
  
  export interface Regions {
    [key: string]: RegionData;
  }