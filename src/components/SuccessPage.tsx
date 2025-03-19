import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const SuccessPage = () => {
  const location = useLocation();
  const { bracketId, editToken, participantName, userEmail, userToken, emailSent, entryNumber, totalEntries } = location.state || {};
  
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

  // Create URLs for editing and viewing
  const editUrl = `${window.location.origin}/bracket/edit/${bracketId}?token=${editToken}`;
  const viewUrl = `${window.location.origin}/bracket/view/${bracketId}?token=${editToken}`;
  
  // Create URL for user's brackets if we have user token
  const userBracketsUrl = userEmail && userToken ? 
    `${window.location.origin}/user/brackets/${userEmail}?token=${userToken}` : null;

  // Determine entry number display
  const showEntryNumber = entryNumber && totalEntries && totalEntries > 1;
  const entryText = showEntryNumber ? ` (Entry #${entryNumber} of ${totalEntries})` : '';

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="bg-green-100 p-4 rounded-lg mb-6">
          <h1 className="text-2xl font-bold text-green-600 mb-2">Bracket Submitted Successfully!</h1>
          <p className="text-green-700">
            Thank you, {participantName}!{showEntryNumber && <span className="italic ml-2">Entry #{entryNumber}</span>} Your bracket has been received and recorded.
          </p>
        </div>

        {emailSent && (
          <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded mb-6">
            <p className="font-bold">Confirmation Email Sent</p>
            <p>
              We've sent a confirmation email to <strong>{userEmail}</strong> with all your bracket links.
              Please save this email for future reference.
            </p>
            <p className="mt-2 text-sm">
              If you don't see the email in your inbox, please check your spam folder.
            </p>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Important: Save Your Links</h2>
          <p className="mb-4">
            You can use the links below to view or edit your bracket before the tournament starts.
            {!emailSent && " We recommend bookmarking these links or saving them somewhere safe."}
          </p>
          
          {/* Edit Link */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700">Edit Link (before tournament starts)</h3>
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
          
          {/* View Link */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700">View Link (works during tournament)</h3>
            <div className="bg-gray-100 p-3 rounded border mb-2 break-all">
              <a href={viewUrl} className="text-blue-600 hover:underline">{viewUrl}</a>
            </div>
            
            <button 
              onClick={() => {
                navigator.clipboard.writeText(viewUrl);
                alert("View link copied to clipboard!");
              }}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Copy to Clipboard
            </button>
          </div>
          
          {/* All User's Brackets Link - only if we have user token */}
          {userBracketsUrl && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700">Access All Your Brackets</h3>
              <div className="bg-gray-100 p-3 rounded border mb-2 break-all">
                <a href={userBracketsUrl} className="text-blue-600 hover:underline">
                  {userBracketsUrl}
                </a>
              </div>
              
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(userBracketsUrl);
                  alert("User brackets link copied to clipboard!");
                }}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Copy to Clipboard
              </button>
              
              <p className="mt-2 text-sm text-gray-600">
                Bookmark this link to access all your brackets from this email address.
              </p>
            </div>
          )}
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
          {userBracketsUrl && (
            <a 
              href={userBracketsUrl} 
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              View All My Brackets
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;