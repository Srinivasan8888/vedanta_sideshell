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
    <div className="min-h-screen bg-fixed bg-center bg-cover" style={{ backgroundImage: `url(${bg})` }}>
      <div className="w-full">
        <Navbar onLogout={handleLogout} socketRef={socketRef} />
      </div>
      <main className="w-full">
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
