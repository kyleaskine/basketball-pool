import React from 'react';

const PrizesPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">2025 Tournament Prizes</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Prize Pool Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-5 rounded-lg text-center border border-blue-200">
            <div className="text-4xl font-bold text-blue-800 mb-2">29</div>
            <div className="text-gray-600">Total Entries</div>
          </div>
          
          <div className="bg-blue-50 p-5 rounded-lg text-center border border-blue-200">
            <div className="text-4xl font-bold text-blue-800 mb-2">$5</div>
            <div className="text-gray-600">Entry Fee</div>
          </div>
          
          <div className="bg-blue-50 p-5 rounded-lg text-center border border-blue-200">
            <div className="text-4xl font-bold text-blue-800 mb-2">$145</div>
            <div className="text-gray-600">Total Prize Pool</div>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-4 text-blue-600">Prize Breakdown</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-yellow-50 p-5 rounded-lg text-center border border-yellow-300">
            <div className="mb-2">
              <span className="text-yellow-600 text-3xl">🏆</span>
            </div>
            <div className="text-xl font-bold text-gray-800 mb-1">1st Place</div>
            <div className="text-3xl font-bold text-green-600 mb-1">$80</div>
            <div className="text-sm text-gray-500">(55% of prize pool)</div>
          </div>
          
          <div className="bg-gray-50 p-5 rounded-lg text-center border border-gray-300">
            <div className="mb-2">
              <span className="text-gray-500 text-3xl">🥈</span>
            </div>
            <div className="text-xl font-bold text-gray-800 mb-1">2nd Place</div>
            <div className="text-3xl font-bold text-green-600 mb-1">$40</div>
            <div className="text-sm text-gray-500">(28% of prize pool)</div>
          </div>
          
          <div className="bg-amber-50 p-5 rounded-lg text-center border border-amber-300">
            <div className="mb-2">
              <span className="text-amber-700 text-3xl">🥉</span>
            </div>
            <div className="text-xl font-bold text-gray-800 mb-1">3rd Place</div>
            <div className="text-3xl font-bold text-green-600 mb-1">$25</div>
            <div className="text-sm text-gray-500">(17% of prize pool)</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Scoring System</h2>
        
        <div className="mb-6">
          <p className="mb-4">Points are awarded for each correct pick based on the round:</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
              <div className="text-lg font-bold text-gray-800 mb-1">Round 1</div>
              <div className="text-2xl font-bold text-blue-600">1 point</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
              <div className="text-lg font-bold text-gray-800 mb-1">Round 2</div>
              <div className="text-2xl font-bold text-blue-600">2 points</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
              <div className="text-lg font-bold text-gray-800 mb-1">Sweet 16</div>
              <div className="text-2xl font-bold text-blue-600">3 points</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
              <div className="text-lg font-bold text-gray-800 mb-1">Elite 8</div>
              <div className="text-2xl font-bold text-blue-600">4 points</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
              <div className="text-lg font-bold text-gray-800 mb-1">Final Four</div>
              <div className="text-2xl font-bold text-blue-600">5 points</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
              <div className="text-lg font-bold text-gray-800 mb-1">Championship</div>
              <div className="text-2xl font-bold text-blue-600">6 points</div>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded">
          <h3 className="font-bold mb-2">Tiebreaker Information</h3>
          <p>In the event of a tie, the prize money for the tied positions will be split equally among the tied participants. No tiebreaker rounds or additional criteria will be used.</p>
        </div>
      </div>
    </div>
  );
};

export default PrizesPage;