import React from 'react';
import { Link } from 'react-router-dom';
import { BracketResponse } from '../services/api';

interface BracketListProps {
  brackets: BracketResponse[];
  title: string;
  subtitle?: string;
  showBookmarkNotice?: boolean;
  bookmarkUrl?: string;
  isLoading: boolean;
  error: string | null;
  onNavigateHome: () => void;
  createNewBracketText?: string;
}

const BracketList: React.FC<BracketListProps> = ({
  brackets,
  title,
  subtitle,
  showBookmarkNotice = false,
  bookmarkUrl,
  isLoading,
  error,
  onNavigateHome,
  createNewBracketText = "Create New Bracket"
}) => {
  
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
            onClick={onNavigateHome}
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-800">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
        <Link 
          to="/"
          className="mt-2 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {createNewBracketText}
        </Link>
      </div>
      
      {/* Bookmark Notice */}
      {showBookmarkNotice && bookmarkUrl && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <h2 className="font-bold text-yellow-800">Bookmark This Page!</h2>
          <p className="mb-2">
            Save or bookmark this URL to easily access all your brackets in the future:
          </p>
          <div className="bg-white p-2 rounded border border-yellow-200 break-all">
            <a href={bookmarkUrl} className="text-blue-600 hover:underline">
              {bookmarkUrl}
            </a>
          </div>
        </div>
      )}
      
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
                        to={`/bracket/view/${bracket._id}?token=${bracket.editToken}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        View Bracket
                      </Link>
                      
                      {!bracket.isLocked && (
                        <>
                          <Link 
                            to={`/bracket/edit/${bracket._id}?token=${bracket.editToken}`}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Edit Bracket
                          </Link>
                          
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/bracket/edit/${bracket._id}?token=${bracket.editToken}`);
                              alert("Edit link copied to clipboard!");
                            }}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                          >
                            Copy Edit Link
                          </button>
                        </>
                      )}
                      
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/bracket/view/${bracket._id}?token=${bracket.editToken}`);
                          alert("View link copied to clipboard!");
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Copy View Link
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

export default BracketList;