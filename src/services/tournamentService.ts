import api from './api';
import { Regions, BracketData } from '../types';

export interface TournamentStructure {
  year: number;
  regions: Regions;
  tournamentName: string;
  entryDeadline: string;
  startDate: string;
  endDate: string;
}

// Cache the tournament structure to avoid repeated API calls
let cachedTournamentStructure: TournamentStructure | null = null;

export const tournamentService = {
  // Get the current tournament structure
  getTournamentStructure: async (): Promise<TournamentStructure> => {
    if (cachedTournamentStructure) {
      return cachedTournamentStructure;
    }

    try {
      const response = await api.get('/tournament/structure');
      cachedTournamentStructure = response.data;
      return response.data;
    } catch (error) {
      console.error('Error fetching tournament structure:', error);
      throw error;
    }
  },

  // Get just the regions data
  getRegions: async (): Promise<Regions> => {
    const structure = await tournamentService.getTournamentStructure();
    return structure.regions;
  },

  // Clear the cache (useful when tournament data changes)
  clearCache: () => {
    cachedTournamentStructure = null;
  },

  // Get tournament info
  getTournamentInfo: async () => {
    const structure = await tournamentService.getTournamentStructure();
    return {
      name: structure.tournamentName,
      year: structure.year,
      deadline: structure.entryDeadline,
      startDate: structure.startDate,
      endDate: structure.endDate
    };
  }
};