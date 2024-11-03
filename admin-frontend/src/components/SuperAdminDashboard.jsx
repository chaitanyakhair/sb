import React, { useState, useEffect } from 'react';
import LogoutButton from './LogoutButton';
import axios from 'axios';
import './admin.css'

function SuperAdminDashboard() {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', phoneNumber: '', email: '', address: '', password: '', role: '' });
  const [activeTab, setActiveTab] = useState('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Fetch users and admins when search term or role filter changes
  useEffect(() => {
    fetchAdmins();
    fetchUsers();
  }, [searchTerm, roleFilter]);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://tt3iyqgys4tifb6dk3vpmg5gii0qjffr.lambda-url.ap-south-1.on.aws/api/admins?search=${searchTerm}&role=${roleFilter}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAdmins(response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://tt3iyqgys4tifb6dk3vpmg5gii0qjffr.lambda-url.ap-south-1.on.aws/api/users?search=${searchTerm}&role=${roleFilter}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('https://tt3iyqgys4tifb6dk3vpmg5gii0qjffr.lambda-url.ap-south-1.on.aws/api/users', newUser);
    setNewUser({ name: '', phoneNumber: '', email: '', address: '', password: '', role: '' });
    fetchUsers();
    fetchAdmins();
  };

  // Handle RM assign
  const handleAssign = async (agentId, relationshipManagerId) => {
    await axios.put(`https://tt3iyqgys4tifb6dk3vpmg5gii0qjffr.lambda-url.ap-south-1.on.aws/api/users/${agentId}/assign`, { relationshipManagerId });
    fetchUsers();
  };

  // Balance update
  const handleBalanceUpdate = async (userId, balance) => {
    await axios.put(`https://tt3iyqgys4tifb6dk3vpmg5gii0qjffr.lambda-url.ap-south-1.on.aws/api/users/${userId}/balance`, { balance });
    fetchUsers();
  };

  // If ever role changes
  const handleRoleChange = async (userId, role) => {
    await axios.put(`https://tt3iyqgys4tifb6dk3vpmg5gii0qjffr.lambda-url.ap-south-1.on.aws/api/users/${userId}/role`, { role });
    fetchUsers();
  };

  return (
    <div className="app">
      <div className="sidebar">
        <h2>Super Admin Panel</h2>
        <button className={activeTab === 'create' ? 'active' : ''} onClick={() => setActiveTab('create')}>Create User</button>
        <button className={activeTab === 'list' ? 'active' : ''} onClick={() => setActiveTab('list')}>User List</button>
        <LogoutButton />
      </div>
      <div className="main-content">
        {activeTab === 'create' && (
          <form onSubmit={handleSubmit} className="create-user-form">
            <input name="name" value={newUser.name} onChange={handleInputChange} placeholder="Name" required />
            <input name="phoneNumber" value={newUser.phoneNumber} onChange={handleInputChange} placeholder="Phone Number" required />
            <input name="email" value={newUser.email} onChange={handleInputChange} placeholder="Email" required type="email" />
            <input name="address" value={newUser.address} onChange={handleInputChange} placeholder="Address" required />
            <input name="password" value={newUser.password} onChange={handleInputChange} placeholder="Password" required type="password" />
            <select name="role" value={newUser.role} onChange={handleInputChange} required>
              <option value="">Select Role</option>
              {/*<option value="superAdmin">Super Admin</option>*/}
              <option value="admin">Admin</option>
              <option value="relationshipManager">Relationship Manager</option>
              <option value="agent">Agent</option>
            </select>
            <button type="submit">Create User</button>
          </form>
        )}
        {activeTab === 'list' && (
          <div className="user-list">
            <div className="filters">
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
                className="role-filter"
              >
                <option value="all">All Roles</option>
                {/*<option value="superAdmin">Super Admin</option>*/}
                <option value="admin">Admin</option>
                <option value="relationshipManager">Relationship Manager</option>
                <option value="agent">Agent</option>
              </select>
            </div>
            {admins.map(admin => (
              <div key={admin._id} className="user-item">
                <div className="user-info">
                  <p>{admin.name} - {admin.role}</p>
                  <div className="user-actions">
                    <select 
                      value={admin.role} 
                      onChange={(e) => handleRoleChange(admin._id, e.target.value)}
                      className="role-select"
                    >
                      {/*<option value="superAdmin">Super Admin</option>*/}
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            {users.map(user => (
              <div key={user._id} className="user-item">
                <div className="user-info">
                  <p>
                    {user.name} - {user.role}
                    {user.role === 'agent' && user.relationshipManager && ` (${user.relationshipManager.name})`}
                  </p>
                  <div className="user-actions">
                    {user.role === 'agent' && (
                      <select 
                        onChange={(e) => handleAssign(user._id, e.target.value)}
                        value={user.relationshipManager ? user.relationshipManager._id : ''}
                      >
                        <option value="">Assign Relationship Manager</option>
                        {users.filter(u => u.role === 'relationshipManager').map(rm => (
                          <option key={rm._id} value={rm._id}>{rm.name}</option>
                        ))}
                      </select>
                    )}
                    <input 
                      type="number" 
                      placeholder="Balance" 
                      value={user.balance} 
                      onChange={(e) => handleBalanceUpdate(user._id, e.target.value)}
                      className="balance-input"
                    />
                    <button onClick={() => handleBalanceUpdate(user._id, user.balance)} className="update-balance-btn">Update Balance</button>
                    <select 
                      value={user.role} 
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="role-select"
                    >
                      <option value="relationshipManager">Relationship Manager</option>
                      <option value="agent">Agent</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
