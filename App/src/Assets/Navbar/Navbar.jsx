import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { IoMdSettings, IoMdLogOut } from 'react-icons/io';
import { IoNotifications } from 'react-icons/io5';

// Assets
import logo from '../../Assets/images/Vedanta-Logo.png';
import xyma_logo from '../../Assets/images/Xyma-Logo.png';

// NavLink component for desktop navigation
const NavLink = ({ to, label, icon, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
        isActive 
          ? 'bg-gray-900 text-white' 
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </Link>
  );
};

// NavButton component for icon buttons
const NavButton = ({ onClick, icon, className = '' }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white ${className}`}
  >
    <span className="sr-only">{icon.props?.['aria-label'] || 'Button'}</span>
    {icon}
  </button>
);

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation handlers
  const goTo = (path) => navigate(path);
  const gotoDashboard = () => navigate('/Dashboard');
  const gotoAnalytics = () => navigate('/Analytics');
  const gotoReport = () => navigate('/Report');
  const gotoSettings = () => navigate('/Settings');
  const gotoHeatmap = () => navigate('/Heatmap');
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Navigation items
  const navItems = [
    { to: '/Dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', onClick: gotoDashboard },
    { to: '/Report', label: 'Report', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', onClick: gotoReport },
    { to: '/Analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', onClick: gotoAnalytics },
    { to: '/Heatmap', label: 'Heatmap', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7', onClick: gotoHeatmap },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#0e0e0e] shadow-lg">
      <div className="px-4 mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/">
                <img className="w-auto h-8" src={logo} alt="Vedanta Logo" />
              </Link>
            </div>
            <div className="hidden ml-6 md:block lg:ml-10">
              <div className="flex space-x-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    icon={
                      <svg
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={item.icon}
                        />
                      </svg>
                    }
                    onClick={item.onClick}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-2 md:ml-6">
              {/* Notifications */}
              <NavButton
                onClick={() => {}}
                icon={<IoNotifications className="w-6 h-6" />}
              />

              {/* Settings */}
              <NavButton
                onClick={gotoSettings}
                icon={
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37 1 .608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                }
              />

              {/* Logout */}
              <NavButton
                onClick={handleLogout}
                icon={<IoMdLogOut className="w-6 h-6" />}
              />

              {/* Xyma Logo */}
              <div className="ml-2">
                <img className="w-auto h-8" src={xyma_logo} alt="Xyma Logo" />
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex -mr-2 md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg
                  className="block w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => {
                  item.onClick();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
              >
                <svg
                  className="w-6 h-6 mr-3 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={item.icon}
                  />
                </svg>
                {item.label}
              </Link>
            ))}
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="flex items-center px-5">
                <div className="ml-3">
                  <div className="text-base font-medium text-white">
                    User Menu
                  </div>
                </div>
                <button
                  onClick={() => {}}
                  className="flex-shrink-0 p-1 ml-auto text-gray-400 bg-gray-800 rounded-full hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                >
                  <span className="sr-only">View notifications</span>
                  <IoNotifications className="w-6 h-6" />
                </button>
              </div>
              <div className="px-2 mt-3 space-y-1">
                <button
                  onClick={() => {
                    gotoSettings();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full px-3 py-2 text-base font-medium text-left text-gray-400 rounded-md hover:text-white hover:bg-gray-700"
                >
                  Settings
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full px-3 py-2 text-base font-medium text-left text-gray-400 rounded-md hover:text-white hover:bg-gray-700"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;