import React, { useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Assets/Navbar/Navbar';
import bg from '../Assets/images/bg.png';

const MainLayout = () => {
  const socketRef = useRef(null);

  const handleLogout = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  return (
    <div className="relative h-screen flex flex-col lg:overflow-hidden">
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
        <div className="absolute inset-0 bg-black/10" />
      </div>
      
      {/* Navbar - fixed at top */}
      <div className="flex-shrink-0 z-20">
        <Navbar onLogout={handleLogout} socketRef={socketRef} />
      </div>
      
      {/* Scrollable content area */}
      <div className="flex-1 lg:overflow-hidden">
        <div className="h-full overflow-y-auto pb-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;



