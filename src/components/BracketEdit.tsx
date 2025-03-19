import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { bracketServices } from '../services/api';
import ResponsiveBasketballPoolEntryForm from '../BasketballPoolEntryForm';
import { BracketData, UserInfo } from '../types';

interface FormData {
  userInfo: UserInfo;
  bracketData: BracketData;
}

const BracketEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const editToken = searchParams.get('token');
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bracketData, setBracketData] = useState<BracketData | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [entryNumber, setEntryNumber] = useState<number | null>(null);
  const [totalEntries, setTotalEntries] = useState<number | null>(null);
  
  useEffect(() => {
    const loadBracket = async () => {
      if (!id || !editToken) {
        setError('Invalid bracket ID or edit token');
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await bracketServices.getBracket(id, editToken);
        
        // Check if bracket is already locked
        if (response.isLocked) {
          setError('This bracket is locked and cannot be edited (tournament has started)');
          setIsLoading(false);
          return;
        }
        
        // Extract user info from the response
        const extractedUserInfo: UserInfo = {
          firstName: response.participantName.split(' ')[0] || '',
          lastName: response.participantName.split(' ').slice(1).join(' ') || '',
          email: response.userEmail,
          contact: response.contact || ''
        };
        
        // Set entry number information if available
        if (response.entryNumber) {
          setEntryNumber(response.entryNumber);
        }
        
        if (response.totalEntries) {
          setTotalEntries(response.totalEntries);
        }
        
        setUserInfo(extractedUserInfo);
        setBracketData(response.picks);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading bracket:', error);
        setError('Error loading bracket. Please check your edit link and try again.');
        setIsLoading(false);
      }
    };
    
    loadBracket();
  }, [id, editToken]);
  
  const handleSubmit = async (formData: FormData) => {
    if (!id || !editToken) {
      setError('Invalid bracket ID or edit token');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Prepare update data
      const updateData = {
        userEmail: formData.userInfo.email,
        participantName: `${formData.userInfo.firstName} ${formData.userInfo.lastName}`,
        contact: formData.userInfo.contact || '',
        picks: formData.bracketData,
        editToken: editToken
      };
      
      // Submit update
      const response = await bracketServices.updateBracket(id, updateData);
      
      // Navigate to success page
      navigate('/success', {
        state: {
          bracketId: response._id,
          editToken: response.editToken,
          participantName: response.participantName,
          entryNumber: response.entryNumber,
          totalEntries: response.totalEntries,
          userEmail: formData.userInfo.email
        }
      });
    } catch (error) {
      console.error('Error updating bracket:', error);
      setError('An error occurred while updating your bracket. Please try again.');
      setIsSubmitting(false);
    }
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
  
  if (!bracketData || !userInfo) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <p>No bracket data found. Please check your edit link and try again.</p>
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
  
  // Check if this is a multiple entry
  const isMultipleEntry = totalEntries && totalEntries > 1;
  const entryNumberDisplay = isMultipleEntry && entryNumber ? 
    ` (Entry #${entryNumber})` : '';
  
  return (
    <div className="container mx-auto">
      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded mb-6">
        <p className="font-bold">Editing Bracket{entryNumberDisplay}</p>
        <p>You can make changes to your bracket until the tournament begins on March 20, 2025.</p>
      </div>
      
      {/* Pass the preloaded data to the form */}
      <ResponsiveBasketballPoolEntryForm 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        initialUserInfo={userInfo}
        initialBracketData={bracketData}
      />
    </div>
  );
};

export default BracketEdit;