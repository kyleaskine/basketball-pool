import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bracketServices, BracketResponse } from '../services/api';

const UserBrackets: React.FC = () => {
  const [brackets, setBrackets] = useState<BracketResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadBrackets = async () => {
      try {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login', { replace: true });
          return;
        }
        
        // Load user's brackets
        const response = await bracketServices.getUserBrackets();
        setBrackets(response);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading brackets:', error);
        setError('Error loading brackets. Please try again or log in.');
        setIsLoading(false);
      }
    };
    
    loadBrackets();
  }, [navigate]);
  
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
        <p className="mt-4">Loading your brackets...</p>
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
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-800">My Brackets</h1>
        <Link 
          to="/"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create New Bracket
        </Link>
      </div>
      
      {brackets.length === 0 ? (
        <div className="bg-yellow-50 p-6 rounded-lg shadow-md">
          <p className="text-lg mb-4">You haven't created any brackets yet.</p>
          <Link 
            to="/"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create a Bracket
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {brackets.map(bracket => (
            <div 
              key={bracket._id} 
              className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <h2 className="text-xl font-semibold text-blue-800">{bracket.participantName}</h2>
                <div className="mt-2 md:mt-0 text-sm text-gray-500">
                  Created: {formatDate(bracket.createdAt)}
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-700">
                  <span className="font-medium">Status:</span> {bracket.isLocked ? 'Locked' : 'Editable'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Score:</span> {bracket.score}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Link 
                  to={`/bracket/view/${bracket._id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  View Bracket
                </Link>
                
                {!bracket.isLocked && (
                  <Link 
                    to={`/bracket/edit/${bracket._id}?token=${bracket.editToken}`}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Edit Bracket
                  </Link>
                )}
                
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/bracket/edit/${bracket._id}?token=${bracket.editToken}`);
                    alert("Edit link copied to clipboard!");
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Copy Edit Link
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBrackets;