import React, { useRef, useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../Assets/Navbar/Navbar';
import bg from '../Assets/images/bg.png';

const MainLayout = () => {
  const socketRef = useRef(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if current route is settings page
  const isSettingsPage = location.pathname.includes('/settings');

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem('role');
    setUserRole(role);

    // If no role found, redirect to login
    if (!role) {
      navigate('/');
    }
  }, [navigate]);

  // Handle logout
  const handleLogout = () => {
    // Clear all local storage
    localStorage.clear();
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    // Redirect to login page
    window.location.href = '/';
  };

  return (
    <div className="relative h-screen flex flex-col xl:overflow-hidden">
      {/* Background with blur - separate from content */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px) brightness(0.5)',
          transform: 'scale(1.02)'
        }}
      >
        <div className="absolute inset-0 bg-white/50" />
      </div>
      
      {/* Navbar - fixed at top (hide for admin and superadmin) */}
      {!['admin', 'superadmin'].includes(userRole) ? (
        <div className="flex-shrink-0 z-20">
          <Navbar onLogout={handleLogout} socketRef={socketRef} />
        </div>
      ) : null}
      
      {/* Scrollable content area */}
      <div className="flex-1 xl:overflow-hidden">
        <div className="h-full overflow-y-auto pb-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;



