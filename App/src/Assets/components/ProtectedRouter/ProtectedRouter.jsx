import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import API from '../Axios/AxiosInterceptor';

const ProtectedRoute = () => {
  const [isValidToken, setIsValidToken] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    setIsValidToken(false);
    window.location.href = '/';
  };

  const storeNewToken = (accessToken) => {
    // Store in localStorage
    localStorage.setItem('accessToken', accessToken);
    
    // Store in cookie with 1 day expiration
    const date = new Date();
    date.setTime(date.getTime() + (24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    
    document.cookie = `accessToken=${accessToken}; ${expires}; path=/; ${
      process.env.NODE_ENV === 'production' ? 'Secure; SameSite=Strict' : ''
    }`;
  };

  useEffect(() => {
    const verifyAndRefreshToken = async () => {
      try {
        // Initial check with current access token
        await API.get(`${process.env.REACT_APP_SERVER_URL}api/auth/access-token`, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('accessToken')}` 
          }
        });
        
      } catch (error) {
        if (error.response?.status === 401) {
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              handleLogout();
              return;
            }

            // Generate new access token using refresh token
            const response = await API.post(
              `${process.env.REACT_APP_SERVER_URL}api/auth/access-token-generate`,
              { refreshToken }
            );

            if (response.data.accessToken) {
              storeNewToken(response.data.accessToken);
              setIsValidToken(true);
            } else {
              handleLogout();
            }
          } catch (refreshError) {
            if (refreshError.response?.status === 401) {
              handleLogout();
            } else {
              console.error('Token refresh failed:', refreshError);
              handleLogout();
            }
          }
        } else {
          handleLogout();
        }
      }
    };

    verifyAndRefreshToken();
    const interval = setInterval(verifyAndRefreshToken, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  if (localStorage.getItem('accessToken') && localStorage.getItem('refreshToken')) {
    return isValidToken ? <Outlet /> : <Navigate to="/" />;
  }
  return <Navigate to="/" />;
};

export default ProtectedRoute;