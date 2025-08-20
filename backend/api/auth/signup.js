const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { neon } = require('@neondatabase/serverless');

// Initialize Neon client
const sql = neon(process.env.DATABASE_URL);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true'
};

export default async function handler(req, res) {
  // Add CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, username, password, firstName, lastName } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({
        error: 'Email, username, and password are required'
      });
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users 
      WHERE email = ${email} OR username = ${username}
    `;

    if (existingUsers.length > 0) {
      return res.status(409).json({
        error: 'User already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUsers = await sql`
      INSERT INTO users (id, email, username, password, "firstName", "lastName", "isActive", "createdAt", "updatedAt")
      VALUES (${`user_${Date.now()}`}, ${email}, ${username}, ${hashedPassword}, ${firstName || ''}, ${lastName || ''}, true, NOW(), NOW())
      RETURNING id, email, username, "firstName", "lastName", avatar, "isActive", "createdAt"
    `;

    const newUser = newUsers[0];

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET || 'tomoboard_secret_key',
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_REFRESH_SECRET || 'tomoboard_refresh_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: newUser,
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}
