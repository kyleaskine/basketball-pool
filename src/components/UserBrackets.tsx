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
  
  // Group brackets by participant name
  const participantGroups: { [key: string]: BracketResponse[] } = {};
  brackets.forEach(bracket => {
    if (!participantGroups[bracket.participantName]) {
      participantGroups[bracket.participantName] = [];
    }
    participantGroups[bracket.participantName].push(bracket);
  });
  
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
          {Object.entries(participantGroups).map(([name, groupBrackets]) => (
            <div key={name} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-blue-800">{name}</h2>
                {groupBrackets.length > 1 && (
                  <p className="text-sm text-gray-600">{groupBrackets.length} entries</p>
                )}
              </div>
              
              <div className="divide-y divide-gray-200">
                {groupBrackets.map(bracket => (
                  <div 
                    key={bracket._id} 
                    className="bg-white p-6"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                      <div>
                        <h3 className="font-semibold">
                          {bracket.entryNumber && groupBrackets.length > 1 ? `Entry #${bracket.entryNumber}` : 'Bracket'}
                        </h3>
                        <div className="mt-1 text-sm text-gray-500">
                          Created: {formatDate(bracket.createdAt)}
                        </div>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                          bracket.isLocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {bracket.isLocked ? 'Locked' : 'Editable'}
                        </span>
                        {bracket.isLocked && (
                          <span className="ml-2 font-medium">
                            Score: {bracket.score}
                          </span>
                        )}
                      </div>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBrackets;