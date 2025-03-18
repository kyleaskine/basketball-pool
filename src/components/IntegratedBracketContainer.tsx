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
      
      // Redirect to success page
      navigate('/success', { 
        state: { 
          bracketId: response._id,
          editToken: response.editToken,
          participantName: response.participantName,
          userEmail: userInfo.email,
          userToken: userToken
        }
      });
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