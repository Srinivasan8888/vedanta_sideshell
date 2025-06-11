import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { IoMdSettings, IoMdLogOut } from 'react-icons/io';
import { IoNotifications } from 'react-icons/io5';
import axios from 'axios';
import io from 'socket.io-client';
import API from '../components/Axios/AxiosInterceptor';
import '../components/miscellaneous/Scrollbar.css';
import './Sidebar.css';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const searchResultsRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isHovered, setIsHovered] = useState(false);
  
  // Search functionality
  const handleSearch = (query) => {
    setSearchText(query);
    if (query.trim() === '') {
      setFilteredData([]);
      return;
    }
    
    const searchResults = navItems.filter(item => 
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.to.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredData(searchResults);
    setSelectedIndex(-1);
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (filteredData.length === 0) return;
    
    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredData.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        if (selectedIndex >= 0 && selectedIndex < filteredData.length) {
          navigate(filteredData[selectedIndex].to);
          setSearchText('');
          setFilteredData([]);
          setIsSearchOpen(false);
        }
        break;
      case 'Escape':
        setFilteredData([]);
        setIsSearchOpen(false);
        break;
      default:
        break;
    }
  };
  
  // Close search when clicking outside or when mobile menu closes
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isMobileMenuOpen) {
        setIsSearchOpen(false);
        return;
      }
      
      if (searchRef.current && !searchRef.current.contains(event.target) && 
          (!searchResultsRef.current || !searchResultsRef.current.contains(event.target))) {
        setIsSearchOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileMenuOpen]);
  const navigate = useNavigate();
  const location = useLocation();
  const buttonRef = useRef(null);
  const sidebarRef = useRef(null);

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
  useEffect(() => {
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
    <nav className="sticky top-0 z-40 w-full bg-[#0e0e0e] shadow-lg 4k:py-4">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 2xl:max-w-7xl 4k:max-w-8xl 4k:px-12">
        <div className="flex h-16 4k:h-20 items-center justify-between">
          {/* Mobile menu button */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/">
                <img className="h-8 w-auto 4k:h-12" src={logo} alt="Vedanta Logo" />
              </Link>
            </div>
            <div className="hidden md:block ml-6 lg:ml-10 4k:ml-16">
              <div className="flex space-x-4 2xl:space-x-6 4k:space-x-8">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    icon={
                      <svg
                        className="h-5 w-5"
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
            <div className="flex items-center space-x-2 md:ml-6 4k:space-x-4">
              {/* Search Bar - Desktop */}
              <div className="relative" ref={searchRef}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-48 px-4 py-1.5 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-600 transition-all duration-200"
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => setIsSearchOpen(true)}
                    onKeyDown={handleKeyDown}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                {/* Search Results Dropdown */}
                {isSearchOpen && filteredData.length > 0 && (
                  <div 
                    ref={searchResultsRef}
                    className="absolute z-10 mt-1 w-64 bg-gray-700 rounded-md shadow-lg overflow-hidden"
                  >
                    <div className="py-1">
                      {filteredData.map((item, index) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={`block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 ${selectedIndex === index ? 'bg-gray-600' : ''}`}
                          onClick={() => {
                            setSearchText('');
                            setFilteredData([]);
                            setIsSearchOpen(false);
                          }}
                        >
                          <div className="flex items-center">
                            <svg
                              className="h-4 w-4 mr-2 text-gray-400"
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
                          </div>
                          <div className="text-xs text-gray-400 truncate">{item.to}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Notifications */}
              <NavButton
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                icon={
                  <div className="relative">
                    <IoNotifications className="h-6 w-6" />
                    {alerts.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                        {alerts.length}
                      </span>
                    )}
                  </div>
                }
              />

              {/* Settings */}
              <NavButton
                onClick={gotoSettings}
                icon={
                  <svg
                    className="h-6 w-6"
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
                icon={
                  <IoMdLogOut className="h-6 w-6" />
                }
              />

              {/* Xyma Logo */}
              <div className="ml-2 4k:ml-4">
                <img className="h-8 w-auto 4k:h-12" src={xyma_logo} alt="Xyma Logo" />
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
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
                  className="block h-6 w-6"
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
          <div className="px-4 pt-2 pb-4 space-y-2 sm:px-6 4k:space-y-4 4k:px-8 4k:pt-4 4k:pb-6">
            {/* Mobile Search Bar */}
            <div className="px-3 py-2">
              <div className="relative" ref={searchRef}>
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-600"
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  onKeyDown={handleKeyDown}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                {/* Mobile Search Results */}
                {isSearchOpen && filteredData.length > 0 && (
                  <div 
                    ref={searchResultsRef}
                    className="absolute z-10 mt-1 w-full bg-gray-700 rounded-md shadow-lg overflow-hidden"
                  >
                    <div className="py-1 max-h-60 overflow-y-auto">
                      {filteredData.map((item, index) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={`block px-4 py-3 text-base text-gray-200 hover:bg-gray-600 ${selectedIndex === index ? 'bg-gray-600' : ''}`}
                          onClick={() => {
                            setSearchText('');
                            setFilteredData([]);
                            setIsSearchOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <div className="flex items-center">
                            <svg
                              className="h-5 w-5 mr-3 text-gray-400"
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
                            <div>
                              <div>{item.label}</div>
                              <div className="text-xs text-gray-400">{item.to}</div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => {
                  item.onClick();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <svg
                  className="h-6 w-6 mr-3 text-gray-400"
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
                  onClick={() => {
                    setIsSidebarOpen(!isSidebarOpen);
                    setIsMobileMenuOpen(false);
                  }}
                  className="ml-auto bg-gray-800 flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                >
                  <span className="sr-only">View notifications</span>
                  <div className="relative">
                    <IoNotifications className="h-6 w-6" />
                    {alerts.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                        {alerts.length}
                      </span>
                    )}
                  </div>
                </button>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <button
                  onClick={() => {
                    gotoSettings();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  Settings
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 rounded-md text-lg font-medium text-gray-400 hover:text-white hover:bg-gray-700 4k:text-2xl 4k:px-6 4k:py-4"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="w-screen max-w-md">
                <div className="h-full flex flex-col bg-gray-800 shadow-xl overflow-y-scroll">
                  <div className="flex-1 py-6 overflow-y-auto">
                    <div className="flex items-start justify-between px-4">
                      <h2 className="text-lg font-medium text-white">
                        Notifications
                      </h2>
                      <div className="ml-3 h-7 flex items-center">
                        <button
                          onClick={() => setIsSidebarOpen(false)}
                          className="bg-gray-700 rounded-md text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                        >
                          <span className="sr-only">Close panel</span>
                          <svg
                            className="h-6 w-6"
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
                        </button>
                      </div>
                    </div>

                    <div className="mt-8">
                      {alerts.length > 0 ? (
                        <div className="flow-root">
                          <ul className="-my-5 divide-y divide-gray-700">
                            {alerts.map((alert, index) => (
                              <li key={index} className="py-4">
                                <div className="flex items-center space-x-4">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-300 truncate">
                                      {alert.message}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      {new Date(alert.timestamp).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-white">
                            No notifications
                          </h3>
                          <p className="mt-2 text-base text-gray-400 4k:text-xl">
                            You don't have any notifications yet.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
