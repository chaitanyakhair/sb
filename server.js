const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const SECRET_KEY = "QWERTY";

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://chaitanyakhaircomp:chaitanyakhaircomp@sb.pqn8u.mongodb.net/?retryWrites=true&w=majority&appName=sb || mongodb://localhost:27017/user_management_panel', { useNewUrlParser: true, useUnifiedTopology: true });

//schemas
const userSchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
  email: String,
  address: String,
  password: String,
  role: { type: String, enum: ['superAdmin', 'admin', 'relationshipManager', 'agent'] },
  relationshipManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  balance: { type: Number, default: 0 }
});

const adminSchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
  email: String,
  address: String,
  password: String,
  role: { type: String, enum: ['superAdmin', 'admin'] }
});

const User = mongoose.model('User', userSchema);
const Admin = mongoose.model('Admin', adminSchema);


// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};


// Routes

// Admin login route
app.post('/api/admin/login', async (req, res) => {
  const { phoneNumber, password } = req.body;
  try {
    const user = await Admin.findOne({ phoneNumber });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (password !== user.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User login route
app.post('/api/user/login', async (req, res) => {
  const { phoneNumber, password } = req.body;
  try {
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (password !== user.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new user
app.post('/api/users', async (req, res) => {
  try {
    const { name, phoneNumber, email, address, password, role } = req.body;
    let user;
    if (role === 'superAdmin' || role === 'admin') {
      user = new Admin({ name, phoneNumber, email, address, password, role });
    } else {
      user = new User({ name, phoneNumber, email, address, password, role });
    }
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get users with optional search and role filters
app.get('/api/users', authenticateJWT, async (req, res) => {
  try {
    const { search, role } = req.query;
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' }; // search filter
    }
    if (role && role !== 'all') {
      query.role = role; // role filter
    }
    const users = await User.find(query).populate('relationshipManager');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/admins', authenticateJWT, async (req, res) => {
  try {
    const { search, role } = req.query;
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' }; // search filter
    }
    if (role && role !== 'all') {
      query.role = role; // role filter
    }
    const admins = await Admin.find(query);
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Assign a relationship manager to a user
app.put('/api/users/:id/assign', async (req, res) => {
  try {
    const { relationshipManagerId } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { relationshipManager: relationshipManagerId }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update user's balance
app.put('/api/users/:id/balance', async (req, res) => {
  try {
    const { balance } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { balance }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update user's role
app.put('/api/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route to Fetch Data for RM Using RM's Object ID
app.get('/api/rm-data/:rmId', authenticateJWT, async (req, res) => {
  try {
    const { rmId } = req.params;

    // Fetch the RM's own data
    const rm = await User.findById(rmId);
    if (!rm || rm.role !== 'relationshipManager') {
      return res.status(404).json({ message: 'Relationship Manager not found' });
    }

    // Fetch all agents under this RM
    const agents = await User.find({ relationshipManager: rmId, role: 'agent' });

    res.json({ rm, agents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to fetch agent's own data
app.get('/api/agent/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await User.findById(id);
    if (!agent || agent.role !== 'agent') {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Backend running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));