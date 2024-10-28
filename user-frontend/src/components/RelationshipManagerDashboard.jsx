import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const RelationshipManagerDashboard = () => {
  const [rmData, setRmData] = useState(null);
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const rmId = location.state?.rmId;

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  useEffect(() => {
    if (rmId) {
      fetchRmData();
    }
  }, [rmId]);

  const fetchRmData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get(`http://ec2-3-109-54-37.ap-south-1.compute.amazonaws.com:5000/api/rm-data/${rmId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setRmData(response.data.rm);
      setAgents(response.data.agents);
    } catch (error) {
      console.error('Error fetching data:', error);
      navigate('/login');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.phoneNumber.includes(searchTerm)
  );

  return (
    <div className="app">
      <h2>Relationship Manager Panel</h2>
      {rmData && (
        <div className="rm-info">
          <h4>Welcome, {rmData.name}</h4>
          <p>Your Balance: {rmData.balance}</p>
        </div>
      )}
      <button onClick={handleLogout}>Logout</button>
      <div className="agents-list">
        <h4>Agents Under You</h4>
        <input
          type="text"
          placeholder="Search agents..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        {filteredAgents.map((agent, index) => (
          <div key={agent._id} className="agent-item">
            <p>{agent.name} - {agent.email}</p>
            <p>Phone: {agent.phoneNumber}</p>
            <p>Balance: {agent.balance}</p>
            {index < filteredAgents.length - 1 && <hr />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelationshipManagerDashboard;
