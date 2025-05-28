import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authServices } from '../services/api';
import { LoadingSpinner, ErrorDisplay } from '../utils/shared';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState<boolean>(false);
  const [isMagicLinkVerifying, setIsMagicLinkVerifying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Check if we're verifying a token
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');
  
  useEffect(() => {
    const verifyToken = async () => {
      if (token && emailParam) {
        setIsMagicLinkVerifying(true);
        setError(null);
        
        try {
          const response = await authServices.verifyToken(token, emailParam);
          
          // Store JWT token
          localStorage.setItem('token', response.token);
          
          // Store email for reference
          localStorage.setItem('userEmail', emailParam);
          
          // Check if user is admin
          try {
            const adminCheck = await authServices.isAdmin();
            if (adminCheck.isAdmin) {
              localStorage.setItem('isAdmin', 'true');
            }
          } catch (adminError) {
            console.error('Error checking admin status:', adminError);
          }
          
          // Redirect to home page instead of directly to brackets
          navigate('/');
        } catch (error) {
          console.error('Error verifying token:', error);
          setError('Invalid or expired login link. Please try again with a new magic link.');
          setIsMagicLinkVerifying(false);
        }
      }
    };
    
    verifyToken();
  }, [token, emailParam, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await authServices.requestMagicLink(email);
      
      // For development, we can use the token directly
      if (process.env.NODE_ENV === 'development' && response.token) {
        localStorage.setItem('token', response.token);
        navigate('/');
        return;
      }
      
      setIsMagicLinkSent(true);
      setEmail(''); // Clear the form
    } catch (error) {
      console.error('Error requesting magic link:', error);
      setError('An error occurred while sending the login link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isMagicLinkVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-blue-800 mb-2">Signing you in...</h1>
            <p className="text-gray-600">Please wait while we verify your login.</p>
          </div>
          <div className="flex justify-center my-8">
            <LoadingSpinner />
          </div>
          {error && <ErrorDisplay error={error} />}
        </div>
      </div>
    );
  }
  
  if (isMagicLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h1 className="text-2xl font-bold text-blue-800 mb-2">Check your email</h1>
            <p className="text-gray-600">
              We've sent a magic link to your email address. Click the link in the email to sign in to your account.
            </p>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded mb-6">
            <p className="font-bold">Important</p>
            <p>The link will expire in 24 hours. If you don't see the email, please check your spam folder.</p>
          </div>
          <div className="text-center">
            <button 
              onClick={() => setIsMagicLinkSent(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors mr-3"
            >
              Use a different email
            </button>
            <Link 
              to="/"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Sign In</h1>
          <p className="text-gray-600">
            Enter your email to receive a magic link for secure, password-free access.
          </p>
        </div>
        
        {error && <ErrorDisplay error={error} />}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending Link...
              </span>
            ) : "Send Magic Link"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            No account? No problem. We'll create one automatically.
          </p>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-center">
            <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;