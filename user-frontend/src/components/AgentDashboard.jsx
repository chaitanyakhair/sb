import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const AgentDashboard = () => {
  const [agentData, setAgentData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const agentId = location.state?.agentId;

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  useEffect(() => {
    if (agentId) {
      fetchAgentData();
    }
  }, [agentId]);

  const fetchAgentData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get(`/api/agent/${agentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAgentData(response.data);
    } catch (error) {
      console.error('Error fetching agent data:', error);
      navigate('/login');
    }
  };

  return (
    <div className="agent-dashboard">
      <h2>Agent Dashboard</h2>
      {agentData && (
        <div className="agent-info">
          <h4>Welcome, {agentData.name}</h4>
          <p>Email: {agentData.email}</p>
          <p>Phone: {agentData.phoneNumber}</p>
          <p>Address: {agentData.address}</p>
          <p>Balance: {agentData.balance}</p>
        </div>
      )}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default AgentDashboard;