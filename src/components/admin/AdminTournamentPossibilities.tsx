import React, { useState } from 'react';
import { tournamentPossibilitiesServices } from '../../services/api';
import { LoadingSpinner, ErrorDisplay, SuccessDisplay } from '../../utils/shared';

const AdminTournamentPossibilities: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisTime, setAnalysisTime] = useState<string | null>(null);

  const generateFreshAnalysis = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setMessage(null);
    setError(null);
    
    try {
      const response = await tournamentPossibilitiesServices.generateFreshAnalysis();
      
      if (response.success) {
        setMessage(`Analysis generated successfully at ${new Date(response.timestamp).toLocaleString()}`);
        setAnalysisTime(response.timestamp);
      } else {
        setError('Failed to generate analysis. Please try again.');
      }
    } catch (err) {
      console.error('Error generating analysis:', err);
      setError('An error occurred while generating the analysis. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-blue-700 mb-4">Tournament Possibilities Analysis</h2>
      
      <p className="mb-6">
        This feature analyzes all possible remaining tournament outcomes and generates statistics about 
        each bracket's chances of winning, potential scores, and other interesting metrics.
      </p>
      
      <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h3 className="font-bold text-blue-800 mb-2">Important Notes</h3>
        <ul className="list-disc list-inside text-blue-700 space-y-1">
          <li>Analysis can take several minutes to complete, especially for early rounds</li>
          <li>Sweet 16: 2^15 = 32,768 possible outcomes</li>
          <li>Elite 8: 2^7 = 128 possible outcomes</li>
          <li>Final Four: 2^3 = 8 possible outcomes</li>
          <li>Championship: 2^1 = 2 possible outcomes</li>
        </ul>
      </div>
      
      {message && <SuccessDisplay message={message} />}
      {error && <ErrorDisplay error={error} />}
      
      <div className="flex items-center">
        <button
          onClick={generateFreshAnalysis}
          disabled={isLoading}
          className={`px-4 py-2 ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white rounded`}
        >
          {isLoading ? 'Generating Analysis...' : 'Generate Fresh Analysis'}
        </button>
        
        {isLoading && (
          <div className="ml-4 flex items-center">
            <LoadingSpinner />
            <span className="text-gray-600">This may take several minutes</span>
          </div>
        )}
      </div>
      
      {analysisTime && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-semibold mb-2">Latest Analysis</h3>
          <p className="text-gray-600">Generated at: {new Date(analysisTime).toLocaleString()}</p>
          <div className="mt-2">
            <a 
              href="/tournament/possibilities" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View Analysis Results
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTournamentPossibilities;