import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authServices } from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Check if we're verifying a token
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');
  
  useEffect(() => {
    const verifyToken = async () => {
      if (token && emailParam) {
        setIsSubmitting(true);
        
        try {
          const response = await authServices.verifyToken(token, emailParam);
          
          // Store token
          localStorage.setItem('token', response.token);
          
          // Navigate to user brackets
          navigate('/user/brackets');
        } catch (error) {
          console.error('Error verifying token:', error);
          setError('Invalid or expired magic link. Please try logging in again.');
          setIsSubmitting(false);
        }
      }
    };
    
    verifyToken();
  }, [token, emailParam, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await authServices.requestMagicLink(email);
      
      // For development, we can use the token directly
      if (response.token) {
        localStorage.setItem('token', response.token);
        navigate('/user/brackets');
        return;
      }
      
      setIsMagicLinkSent(true);
    } catch (error) {
      console.error('Error requesting magic link:', error);
      setError('An error occurred while sending the magic link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (token && emailParam) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-blue-800 mb-4">Verifying your login...</h1>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (isMagicLinkSent) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-blue-800 mb-4">Check your email</h1>
          <p className="mb-6">
            We've sent a magic link to <strong>{email}</strong>. Click the link in the email to log in.
          </p>
          <button 
            onClick={() => setIsMagicLinkSent(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try a different email
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-blue-800 mb-6">Sign In</h1>
        
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-blue-800">
            Sign in to manage all your brackets in one place. You'll be able to view, edit, and share your brackets.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input 
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md border-gray-300"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <button 
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
        
        <p className="mt-6 text-sm text-gray-600 text-center">
          We'll email you a magic link for password-free sign in.
        </p>
      </div>
    </div>
  );
};

export default Login;