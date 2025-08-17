// Vercel serverless function entry point
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Mock database for demo
const users = [
  {
    id: 'demo-user-1',
    email: 'demo@tomoboard.com',
    username: 'demo_user',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/jQ3YQZ8YJ8K7Q8j6S', // password123
    firstName: 'Demo',
    lastName: 'User',
    avatar: null,
    isActive: true
  },
  {
    id: 'admin-user-1',
    email: 'admin@tomoboard.com',
    username: 'admin',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/jQ3YQZ8YJ8K7Q8j6S', // password123
    firstName: 'Admin',
    lastName: 'User',
    avatar: null,
    isActive: true
  }
];

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const user = users.find(u => u.email === email && u.isActive);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      tokens: {
        accessToken: `token_${user.id}_${Date.now()}`,
        refreshToken: `refresh_${user.id}_${Date.now()}`
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, username, password, firstName, lastName } = req.body;
    
    if (!email || !username || !password) {
      return res.status(400).json({
        error: 'Email, username, and password are required'
      });
    }

    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
      avatar: null,
      isActive: true
    };

    users.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword,
      tokens: {
        accessToken: `token_${newUser.id}_${Date.now()}`,
        refreshToken: `refresh_${newUser.id}_${Date.now()}`
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      error: 'Access token required'
    });
  }

  // Simple token validation for demo
  const userId = token.split('_')[1];
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(401).json({
      error: 'Invalid token'
    });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({
    user: userWithoutPassword
  });
});

// Default handler
app.get('/', (req, res) => {
  res.json({
    message: 'TomoBoard Backend API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
