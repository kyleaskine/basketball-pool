import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bracketServices, BracketResponse } from '../services/api';
import BracketList from './BracketList';

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
  
  return (
    <BracketList
      brackets={brackets}
      isLoading={isLoading}
      error={error}
      title="My Brackets"
      onNavigateHome={() => navigate('/')}
    />
  );
};

export default UserBrackets;