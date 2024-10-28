import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './login.css'

const Login = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://ec2-3-109-54-37.ap-south-1.compute.amazonaws.com:5000/api/user/login', formData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      const { role, _id } = user;
      if (role === 'relationshipManager') {
        navigate('/rm-dashboard', { state: { rmId: _id } });
      } else if (role === 'agent') {
        navigate('/agent-dashboard', { state: { agentId: _id } });
      } else {
        navigate('/welcome');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" name="phoneNumber" placeholder="Phone Number" onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
