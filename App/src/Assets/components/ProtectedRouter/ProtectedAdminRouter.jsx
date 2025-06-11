import React, { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import API from '../Axios/AxiosInterceptor';

const ProtectedAdminRoute = ({ children }) => {
  const [isValidToken, setIsValidToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState('');


  const storeNewToken = (accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    const date = new Date();
    date.setTime(date.getTime() + (24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    
    document.cookie = `accessToken=${accessToken}; ${expires}; path=/; ${
      process.env.NODE_ENV === 'production' ? 'Secure; SameSite=Strict' : ''
    }`;
  };

  const verifyUserRole = async () => {
    try {
      const userEmail = localStorage.getItem('email'); // Changed from 'userEmail' to 'email' to match your storage
      console.log('Verifying role for email:', userEmail);
      
      if (!userEmail) {
        console.error('No email found in localStorage');
        return;
      }

      const response = await API.post(`${process.env.REACT_APP_SERVER_URL}auth/get-role`, {
        email: userEmail
      });
      
      console.log('Role verification response:', response.data);
      
      if (response.data.success) {
        const role = response.data.role?.toLowerCase(); // Ensure case insensitivity
        if (['admin', 'superadmin'].includes(role)) {
          console.log('User has valid admin role:', role);
          setUserRole(role);
          setIsValidToken(true);
          return true;
        }
      }
      console.error('Invalid or missing admin role');
      
      return false;
    } catch (error) {
      console.error('Role verification failed:', error);
     
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let refreshInterval;
  
    const verifyAndRefreshToken = async () => {
      if (!isMounted) return;
      
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
  
      if (!accessToken || !refreshToken) {
        console.log('Missing tokens, redirecting to login');
        return;
      }
  
      try {
        // Verify access token
        await API.get(`${process.env.REACT_APP_SERVER_URL}auth/access-token`, {
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        console.log('Access token is valid, verifying role...');
        await verifyUserRole();
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('Access token expired, attempting refresh...');
          try {
            const refreshResponse = await API.post(
              `${process.env.REACT_APP_SERVER_URL}auth/access-token-generate`,
              { refreshToken }
            );
  
            if (refreshResponse.data?.accessToken) {
              console.log('Token refresh successful');
              storeNewToken(refreshResponse.data.accessToken);
              const roleVerified = await verifyUserRole();
              if (!roleVerified) {
                throw new Error('Role verification failed after token refresh');
              }
            } else {
              throw new Error('No access token in refresh response');
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
        } else {
          console.error('Token verification failed:', error);
        }
      }
    };
  
    verifyAndRefreshToken();
    refreshInterval = setInterval(verifyAndRefreshToken, 5 * 60 * 1000);
  
    return () => {
      isMounted = false;
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [verifyUserRole]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!localStorage.getItem('accessToken') || !localStorage.getItem('refreshToken')) {
    return <Navigate to="/" replace />;
  }

  if (!isValidToken || !['admin', 'superadmin'].includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;