import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { IoMdSettings, IoMdLogOut } from 'react-icons/io';
import { IoNotifications } from 'react-icons/io5';
import { Menus } from './Menu';
import logo from '../../Assets/images/Vedanta-Logo.png';

// NavLink component for desktop navigation
const NavLink = ({ to, label, icon, onClick, isMobile = false }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  const baseClasses = isMobile 
    ? 'block px-3 py-2 rounded-md text-base font-medium'
    : 'flex items-center px-3 py-2 text-sm font-medium rounded-md';
  
  const activeClasses = isActive 
    ? 'bg-gray-900 text-white' 
    : 'text-gray-300 hover:bg-gray-700 hover:text-white';
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`${baseClasses} ${activeClasses}`}
    >
      {!isMobile && <span className="mr-2">{icon}</span>}
      {label}
    </Link>
  );
};

const ResponsiveNavbar = () => {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 1024);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 1024;
      setIsMobileView(isMobile);
      if (!isMobile) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigation handlers
  const gotoDashboard = () => navigate('/Dashboard');
  const gotoAnalytics = () => navigate('/Analytics');
  const gotoReport = () => navigate('/Report');
  const gotoSettings = () => navigate('/Settings');
  const gotoHeatmap = () => navigate('/Heatmap');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Navigation items
  const navItems = [
    { 
      to: '/Dashboard', 
      label: 'Dashboard', 
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ), 
      onClick: gotoDashboard 
    },
    { 
      to: '/Report', 
      label: 'Report', 
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ), 
      onClick: gotoReport 
    },
    { 
      to: '/Analytics', 
      label: 'Analytics', 
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ), 
      onClick: gotoAnalytics 
    },
    { 
      to: '/Heatmap', 
      label: 'Heatmap', 
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ), 
      onClick: gotoHeatmap 
    },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#0e0e0e] shadow-lg">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img className="h-8 w-auto" src={logo} alt="Vedanta Logo" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          {!isMobileView && (
            <div className="hidden lg:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    icon={item.icon}
                    onClick={item.onClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Right side controls */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            {isMobileView ? (
              <div className="lg:hidden">
                <Menus />
              </div>
            ) : (
              <div className="ml-4 flex items-center md:ml-6">
                {/* Settings */}
                <button
                  onClick={gotoSettings}
                  className="p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                >
                  <IoMdSettings className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="ml-3 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                >
                  <IoMdLogOut className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMobileView && isMobileMenuOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                label={item.label}
                onClick={() => {
                  item.onClick();
                  setIsMobileMenuOpen(false);
                }}
                isMobile={true}
              />
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default ResponsiveNavbar;
