import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authServices } from '../services/api';

const VerifyLogin: React.FC = () => {
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !email) {
        setError('Invalid verification link. Please request a new login link.');
        setIsVerifying(false);
        return;
      }
      
      try {
        const response = await authServices.verifyToken(token, email);
        
        // Store JWT token
        localStorage.setItem('token', response.token);
        
        // Store email for reference
        localStorage.setItem('userEmail', email);
        
        // Check if user is admin
        try {
          const adminCheck = await authServices.isAdmin();
          if (adminCheck.isAdmin) {
            localStorage.setItem('isAdmin', 'true');
          }
        } catch (adminError) {
          console.error('Error checking admin status:', adminError);
        }
        
        setSuccess(true);
        
        // Redirect after a short delay to home page instead of directly to brackets
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } catch (error) {
        console.error('Error verifying token:', error);
        setError('Invalid or expired login link. Please request a new magic link.');
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyToken();
  }, [token, email, navigate]);
  
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-blue-800 mb-2">Verifying your login</h1>
            <p className="text-gray-600">Please wait while we sign you in...</p>
          </div>
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h1 className="text-2xl font-bold text-blue-800 mb-2">Login Successful!</h1>
            <p className="text-gray-600">You are now signed in. Redirecting you to the home page...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Verification Failed</h1>
          <p className="text-gray-600">{error}</p>
        </div>
        <div className="flex justify-center mt-6">
          <Link 
            to="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyLogin;