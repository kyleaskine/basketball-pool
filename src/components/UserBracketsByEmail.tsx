import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { bracketServices, BracketResponse } from '../services/api';
import BracketList from './BracketList';

const UserBracketsByEmail: React.FC = () => {
  const { email } = useParams<{ email: string }>();
  const [searchParams] = useSearchParams();
  const userToken = searchParams.get('token');
  const navigate = useNavigate();
  
  const [brackets, setBrackets] = useState<BracketResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadBrackets = async () => {
      if (!email || !userToken) {
        setError('Invalid email or user token. Please check your link.');
        setIsLoading(false);
        return;
      }
      
      try {
        // Load user's brackets by email using the token
        const response = await bracketServices.getBracketsByEmail(email, userToken);
        setBrackets(response);
        
        // Store token for future use
        localStorage.setItem(`userToken_${email}`, userToken);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading brackets:', error);
        setError('Error loading brackets. Please check your link and try again.');
        setIsLoading(false);
      }
    };
    
    loadBrackets();
  }, [email, userToken, navigate]);
  
  // Create bookmarkable link for future access
  const userBracketsUrl = email && userToken ? 
    `${window.location.origin}/user/brackets/${email}?token=${userToken}` : '';
  
  return (
    <BracketList
      brackets={brackets}
      isLoading={isLoading}
      error={error}
      title={`Brackets for ${email || ''}`}
      subtitle="Showing all your submitted brackets"
      showBookmarkNotice={true}
      bookmarkUrl={userBracketsUrl}
      onNavigateHome={() => navigate('/')}
    />
  );
};

export default UserBracketsByEmail;