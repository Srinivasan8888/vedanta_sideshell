import React, { useRef, useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Navbar from '../Assets/Navbar/Navbar';
import bg from '../Assets/images/bg.png';
import API from '../Assets/components/Axios/AxiosInterceptor'
const MainLayout = () => {
  const socketRef = useRef(null);
  const [userRole, setUserRole] = useState(null);
  const [isValidToken, setIsValidToken] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  const isSettingsPage = location.pathname.includes('/Settings');
 
  useEffect(() => {
    const verifyUser = async () => {
      const isTokenValid = await verifyAndRefreshToken();
      if (!isTokenValid) return;

      const userData = localStorage.getItem('userData');
      let role = null;
      
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          role = parsedUserData.role;
        } catch (error) {
          console.error('Error parsing userData:', error);
        }
      }
      
      if (!role) {
        role = localStorage.getItem('role');
      }
      
      console.log('User role from localStorage:', role); // Debug log
      setUserRole(role);

      if (!role) {
        navigate('/');
      }
    };

    verifyUser();
    
    const interval = setInterval(verifyAndRefreshToken, 300000);
    return () => clearInterval(interval);
  }, [navigate]);

  console.log('isSettingsPage:', isSettingsPage);
  console.log('userRole:', userRole);
  console.log('Should hide navbar:', (isSettingsPage && (userRole === 'admin' || userRole === 'superadmin')));

  const storeNewToken = (accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    
    const date = new Date();
    date.setTime(date.getTime() + (24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    
    document.cookie = `accessToken=${accessToken}; ${expires}; path=/; ${
      process.env.NODE_ENV === 'production' ? 'Secure; SameSite=Strict' : ''
    }`;
  };

  const verifyAndRefreshToken = async () => {
    try {
      await API.get(`${process.env.REACT_APP_SERVER_URL}api/auth/access-token`, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('accessToken')}` 
        }
      });
      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            handleLogout();
            return false;
          }

          const response = await API.post(
            `${process.env.REACT_APP_SERVER_URL}/api/auth/access-token-generate`,
            { refreshToken }
          );

          if (response.data.accessToken) {
            storeNewToken(response.data.accessToken);
            setIsValidToken(true);
            return true;
          } else {
            handleLogout();
            return false;
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          handleLogout();
          return false;
        }
      } else {
        handleLogout();
        return false;
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    setIsValidToken(false);
    window.location.href = '/';
  };
  if (!localStorage.getItem('accessToken') || !localStorage.getItem('refreshToken') || !isValidToken) {
    return <Navigate to="/" />;
  }

  return (
    <div className="relative h-screen flex flex-col xl:overflow-hidden">
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          // filter: 'blur(2px) brightness(1.5)',
          filter: 'brightness(1.5)',
          transform: 'scale(1.02)'
        }}
      >
        {/* <div className="absolute inset-0 bg-white/50" /> */}
      </div>
      
      {!(isSettingsPage && (userRole === 'admin' || userRole === 'superadmin')) && (
        <div className="flex-shrink-0 z-20">
          <Navbar onLogout={handleLogout} socketRef={socketRef} />
        </div>
      )}
      
      <div className="flex-1 xl:overflow-hidden">
        <div className="h-full overflow-y-auto pb-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;