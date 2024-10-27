import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import AdminDashboard from './components/AdminDashboard';

const PrivateRoute = ({ element: Component, allowedRoles, ...rest }) => {
  const token = localStorage.getItem('token');
  const user = token ? JSON.parse(atob(token.split('.')[1])) : null;

  if (!token || !user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return <Component {...rest} />;
};
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/superadmin-dashboard" element={<PrivateRoute element={SuperAdminDashboard} allowedRoles={['superAdmin']} />} />
        <Route path="/admin-dashboard" element={<PrivateRoute element={AdminDashboard} allowedRoles={['superAdmin', 'admin']} />} />
      </Routes>
    </Router>
  );
};

export default App;