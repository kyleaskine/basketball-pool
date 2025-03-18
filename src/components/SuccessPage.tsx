import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const SuccessPage = () => {
  const location = useLocation();
  const { bracketId, editToken, participantName } = location.state || {};
  
  // If no data was passed, show a generic success message
  if (!bracketId || !editToken) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-green-600 mb-4">Success!</h1>
          <p className="mb-4">Your bracket has been submitted successfully.</p>
          <Link to="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Create a URL for editing the bracket
  const editUrl = `${window.location.origin}/bracket/edit/${bracketId}?token=${editToken}`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="bg-green-100 p-4 rounded-lg mb-6">
          <h1 className="text-2xl font-bold text-green-600 mb-2">Bracket Submitted Successfully!</h1>
          <p className="text-green-700">
            Thank you, {participantName}! Your bracket has been received and recorded.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Important: Save Your Edit Link</h2>
          <p className="mb-4">
            You can use the link below to make changes to your bracket before the tournament starts.
          </p>
          
          <div className="bg-gray-100 p-3 rounded border mb-2 break-all">
            <a href={editUrl} className="text-blue-600 hover:underline">{editUrl}</a>
          </div>
          
          <button 
            onClick={() => {
              navigator.clipboard.writeText(editUrl);
              alert("Edit link copied to clipboard!");
            }}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Copy to Clipboard
          </button>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-2">Reminder</h3>
          <p className="text-yellow-700">
            The tournament begins on March 20, 2025. After that date, brackets will be locked and you won't be able to make any changes.
          </p>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-4">
          <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Create Another Bracket
          </Link>
          <a 
            href={editUrl} 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Edit My Bracket
          </a>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;