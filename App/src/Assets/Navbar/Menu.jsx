import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { FiMenu } from 'react-icons/fi';
import axios from 'axios';

export function Menus() {
  const handleLogout = async () => {
    try {
    
      const refreshToken = localStorage.getItem('refreshToken');
      // const accessToken = localStorage.getItem('accessToken');

      // Make logout request first
      const response = await axios.delete(
        `${process.env.REACT_APP_SERVER_URL}auth/logout`, 
        {
          data: { refreshToken },
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      
      // Clear storage only after successful response
      if (response.status === 200) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace(`/`);
        
      }
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      sessionStorage.clear();
      document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.replace(`/`);
    }
  };
  return (
    <div className="relative">
      <Menu>
        {({ open }) => (
          <>
            <MenuButton className="p-2 rounded-md hover:bg-gray-800 transition-colors">
              <FiMenu className="w-6 h-6 text-white" />
            </MenuButton>
            {open && (
              <div className='absolute right-0 z-50 w-56 mt-2 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-xl overflow-hidden'>
                <MenuItems className="divide-y divide-gray-700">

                  <MenuItem>
                    {({ active }) => (
                      <a
                        className={`${active ? 'bg-gray-800 text-white' : 'text-gray-300'} 
                          block px-4 py-3 text-sm font-medium transition-colors`}
                        href="/Dashboard"
                      >
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          <span>Home</span>
                        </div>
                      </a>
                    )}
                  </MenuItem>

                  <MenuItem>
                    {({ active }) => (
                      <a
                        className={`${active ? 'bg-gray-800 text-white' : 'text-gray-300'} 
                          block px-4 py-3 text-sm font-medium transition-colors`}
                        href="/Report"
                      >
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Report</span>
                        </div>
                      </a>
                    )}
                  </MenuItem>

                  <MenuItem>
                    {({ active }) => (
                      <a
                        className={`${active ? 'bg-gray-800 text-white' : 'text-gray-300'} 
                          block px-4 py-3 text-sm font-medium transition-colors`}
                        href="/Analytics"
                      >
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span>Analytics</span>
                        </div>
                      </a>
                    )}
                  </MenuItem>

                  <MenuItem>
                    {({ active }) => (
                      <a
                        className={`${active ? 'bg-gray-800 text-white' : 'text-gray-300'} 
                          block px-4 py-3 text-sm font-medium transition-colors`}
                        href="/Heatmap"
                      >
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          <span>Heatmap</span>
                        </div>
                      </a>
                    )}
                  </MenuItem>
                  
                  <MenuItem>
                    {({ active }) => (
                      <a
                        className={`${active ? 'bg-gray-800 text-white' : 'text-gray-300'} 
                          block px-4 py-3 text-sm font-medium transition-colors`}
                        href="/Settings"
                      >
                       <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          <span>Settings</span>
                        </div>
                      </a>
                    )}
                  </MenuItem>

                  <MenuItem>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${active ? 'bg-gray-800 text-white' : 'text-gray-300'} 
                          w-full text-left px-4 py-3 text-sm font-medium transition-colors`}
                      >
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Logout</span>
                        </div>
                      </button>
                    )}
                  </MenuItem>

                </MenuItems>
              </div>
            )}
          </>
        )}
      </Menu>
    </div>
  )
}