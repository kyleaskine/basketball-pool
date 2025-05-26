import { Team, BracketData } from '../types';

// Date formatting - used in 10+ components
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Round name mapping - used in 8+ components
export const getRoundName = (round: number | string): string => {
  const roundNum = typeof round === 'string' ? parseInt(round) : round;
  switch (roundNum) {
    case 1: return 'First Round';
    case 2: return 'Second Round';
    case 3: return 'Sweet 16';
    case 4: return 'Elite 8';
    case 5: return 'Final Four';
    case 6: return 'Championship';
    default: return `Round ${round}`;
  }
};

// Team elimination checking - used in multiple components
export const isTeamEliminated = (teamName: string, tournamentResults: any): boolean => {
  if (!tournamentResults?.teams || !teamName) return false;
  return tournamentResults.teams[teamName]?.eliminated === true;
};

export const getEliminationRound = (teamName: string, tournamentResults: any): string | null => {
  if (!tournamentResults?.teams || !teamName) return null;
  const round = tournamentResults.teams[teamName]?.eliminationRound;
  return round ? getRoundName(round) : null;
};

// Ordinal suffix helper - used in multiple components
export const getOrdinalSuffix = (num: number): string => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
};

// Common loading spinner component
export const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center p-12">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Common error display
export const ErrorDisplay: React.FC<{ error: string }> = ({ error }) => (
  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
    <p>{error}</p>
  </div>
);

// Common success display
export const SuccessDisplay: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6">
    <p>{message}</p>
  </div>
);

// Check if teams match by value
export const isSameTeam = (a: Team | null, b: Team | null): boolean => {
  if (!a || !b) return false;
  return a.name === b.name && a.seed === b.seed;
};

// Get percentage width for progress bars
export const getPercentageWidth = (percentage: number): string => {
  return `${Math.max(percentage, 1)}%`; // Minimum 1% width for visibility
};

// Format percentage with one decimal place
export const formatPercentage = (value: number): string => {
  return value.toFixed(1) + '%';
};