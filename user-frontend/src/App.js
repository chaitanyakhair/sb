import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import RelationshipManagerDashboard from './components/RelationshipManagerDashboard';
import AgentDashboard from './components/AgentDashboard';

const PrivateRoute = ({ element: Component, ...rest }) => {
  const token = localStorage.getItem('token');
  return token ? <Component {...rest} /> : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/rm-dashboard" element={<PrivateRoute element={RelationshipManagerDashboard} />} />
        <Route path="/agent-dashboard" element={<PrivateRoute element={AgentDashboard} />} />
      </Routes>
    </Router>
  );
};

export default App;