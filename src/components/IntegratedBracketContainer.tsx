import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ResponsiveBasketballPoolEntryForm from '../BasketballPoolEntryForm';
import { BracketData, UserInfo } from '../types';
import { bracketServices, authServices } from '../services/api';

interface FormData {
  userInfo: UserInfo;
  bracketData: BracketData;
}

const IntegratedBracketContainer: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState<boolean>(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState<string>('');
  // Store bracket details to use later after showing magic link screen
  const [submittedBracketDetails, setSubmittedBracketDetails] = useState<{
    bracketId: string;
    editToken: string;
    participantName: string;
    userEmail: string;
    userToken: string | null;
  } | null>(null);
  
  const navigate = useNavigate();

  const handleSubmitBracket = async (formData: FormData): Promise<void> => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Extract user info and bracket data from the form
      const { userInfo, bracketData } = formData;
      
      // First, check if this user exists and create if not
      const userToken = await authServices.createOrGetUser(userInfo.email);
      
      // Prepare data for API
      const bracketSubmission = {
        userEmail: userInfo.email,
        participantName: `${userInfo.firstName} ${userInfo.lastName}`,
        contact: userInfo.contact || '',
        picks: bracketData
      };
      
      // Submit to API
      const response = await bracketServices.createBracket(bracketSubmission);
      
      // Store edit token in local storage for easy access
      localStorage.setItem('bracketEditToken', response.editToken);
      
      // Store user token if we have it
      if (userToken) {
        localStorage.setItem(`userToken_${userInfo.email}`, userToken);
      }
      
      // Store bracket details for later use
      const bracketDetails = {
        bracketId: response._id,
        editToken: response.editToken,
        participantName: response.participantName,
        userEmail: userInfo.email,
        userToken: userToken
      };
      
      setSubmittedBracketDetails(bracketDetails);
      
      // Check if user is logged in
      const isLoggedIn = authServices.isLoggedIn();
      
      // Only attempt to send magic link if not logged in
      if (!isLoggedIn) {
        try {
          // Request a magic link for the user
          const magicLinkResponse = await authServices.requestMagicLink(userInfo.email);
          
          if (magicLinkResponse.success) {
            // Set magic link status and email
            setMagicLinkEmail(userInfo.email);
            setIsMagicLinkSent(true);
            setIsSubmitting(false);
            // Important: return early to prevent navigation to success page
            return;
          }
        } catch (authError) {
          console.error('Error sending magic link:', authError);
          // Continue to success page if magic link fails
        }
      }
      
      // If magic link wasn't sent or we're already logged in, navigate directly to success page
      navigate('/success', { state: bracketDetails });
      
    } catch (error) {
      console.error('Error submitting bracket:', error);
      let errorMessage = 'An error occurred while submitting your bracket. Please try again.';
      
      if (axios.isAxiosError(error) && error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      
      setSubmitError(errorMessage);
      setIsSubmitting(false);
    }
  };

  // Handle continuing to success page after acknowledging magic link
  const handleContinue = () => {
    if (submittedBracketDetails) {
      navigate('/success', { state: submittedBracketDetails });
    } else {
      // Fallback to home if no details available
      navigate('/');
    }
  };

  // If magic link was sent, show acknowledgment
  if (isMagicLinkSent) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h1 className="text-2xl font-bold text-green-600 mb-2">Bracket Submitted!</h1>
            <p className="mb-4">Your bracket has been successfully saved.</p>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded mb-6">
            <p className="font-bold">Login Link Sent</p>
            <p>We've sent a magic login link to <strong>{magicLinkEmail}</strong>. This link will let you access all your brackets in the future.</p>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded mb-6">
            <p className="font-medium">Note</p>
            <p>If you don't see the email in your inbox, please check your spam folder. Some email providers (including Yahoo) may delay delivery.</p>
          </div>
          
          <div className="text-center">
            <button 
              onClick={handleContinue}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue to Bracket Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p>{submitError}</p>
        </div>
      )}
      
      {/* Use your existing form component with the new submit handler */}
      <ResponsiveBasketballPoolEntryForm 
        onSubmit={handleSubmitBracket}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default IntegratedBracketContainer;