import React from 'react';
import { useLocation } from 'react-router-dom';
import AdminSidebar from './sidebar-admins/adminsidebar';
import Sidebar from '../Sidebar/Sidebar';

const ConditionalSidebar = () => {
  const location = useLocation();
  const userRole = localStorage.getItem('role');

  // Don't show any sidebar in Settings page
  if (location.pathname === '/Settings') {
    return null;
  }

  // Show AdminSidebar only for admin and superadmin roles
  if (userRole === 'admin' || userRole === 'superadmin') {
    return <AdminSidebar />;
  }

  // Show regular Sidebar for other users
  return <Sidebar />;
};

export default ConditionalSidebar; 