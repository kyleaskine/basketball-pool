import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bracketServices } from '../services/api';
import { BracketData } from '../types';
import PrintStyleCompactBracket from '../PrintStyleCompactBracket';

const BracketView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bracketData, setBracketData] = useState<BracketData | null>(null);
  const [bracketInfo, setBracketInfo] = useState<{
    participantName: string;
    isLocked: boolean;
    score: number;
    createdAt: string;
    editToken: string;
    entryNumber?: number;
    totalEntries?: number;
  } | null>(null);
  
  useEffect(() => {
    const loadBracket = async () => {
      if (!id) {
        setError('Invalid bracket ID');
        setIsLoading(false);
        return;
      }
      
      try {
        // Try to get the token from localStorage
        const token = localStorage.getItem('token');
        
        // First try with auth token if available
        let response;
        try {
          // For authenticated users viewing their own brackets
          response = await bracketServices.getBracket(id, null);
        } catch (authError) {
          // If not authorized, try with edit token from URL (if present)
          const urlParams = new URLSearchParams(window.location.search);
          const editToken = urlParams.get('token');
          
          if (editToken) {
            response = await bracketServices.getBracket(id, editToken);
          } else {
            throw new Error('You do not have permission to view this bracket.');
          }
        }
        
        setBracketData(response.picks);
        setBracketInfo({
          participantName: response.participantName,
          isLocked: response.isLocked,
          score: response.score,
          createdAt: response.createdAt,
          editToken: response.editToken,
          entryNumber: response.entryNumber,
          totalEntries: response.totalEntries
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading bracket:', error);
        setError(error instanceof Error ? error.message : 'Error loading bracket. Please check your link and try again.');
        setIsLoading(false);
      }
    };
    
    loadBracket();
  }, [id]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Loading bracket...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <div className="mt-4">
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  
  if (!bracketData || !bracketInfo) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <p>No bracket data found. Please check your link and try again.</p>
        </div>
        <div className="mt-4">
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  
  // Get the edit token from the URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const editToken = urlParams.get('token');

  // Check if this is a multiple entry
  const isMultipleEntry = bracketInfo.totalEntries && bracketInfo.totalEntries > 1;
  const entryNumberDisplay = isMultipleEntry && bracketInfo.entryNumber ? 
    ` (Entry #${bracketInfo.entryNumber})` : '';
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800 mb-2">
          {bracketInfo.participantName}'s Bracket
          {isMultipleEntry && (
            <span className="text-lg font-normal text-gray-600 italic ml-1">
              {entryNumberDisplay}
            </span>
          )}
        </h1>
        <div className="flex flex-wrap gap-4">
          <p className="text-gray-600">
            Created: {formatDate(bracketInfo.createdAt)}
          </p>
          <p className="text-gray-600">
            Status: <span className={bracketInfo.isLocked ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
              {bracketInfo.isLocked ? 'Locked' : 'Editable'}
            </span>
          </p>
          {bracketInfo.isLocked && (
            <p className="text-gray-600">
              Score: <span className="font-semibold">{bracketInfo.score}</span>
            </p>
          )}
        </div>
      </div>
      
      {!bracketInfo.isLocked && editToken && (
        <div className="mb-6">
          <button 
            onClick={() => navigate(`/bracket/edit/${id}?token=${editToken}`)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Edit Bracket
          </button>
        </div>
      )}
      
      {/* Display the bracket in view-only mode */}
      <PrintStyleCompactBracket
        bracketData={bracketData}
        readOnly={true}
        highlightCorrectPicks={bracketInfo.isLocked}
      />
    </div>
  );
};

export default BracketView;