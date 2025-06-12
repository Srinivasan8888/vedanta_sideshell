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
    <div className="bg-fixed bg-center bg-cover h-screen overflow-hidden" style={{ backgroundImage: `url(${bg})` }}>
      <div className="w-full">
        <Navbar onLogout={handleLogout} socketRef={socketRef} />
      </div>
      <div className="h-[calc(100vh-64px)] overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
