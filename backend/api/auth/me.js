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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Access token required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tomoboard_secret_key');

    // Get user from database
    const users = await sql`
      SELECT id, email, username, "firstName", "lastName", avatar, "isActive", "createdAt", "updatedAt"
      FROM users 
      WHERE id = ${decoded.userId} AND "isActive" = true
    `;

    if (users.length === 0) {
      return res.status(401).json({
        error: 'User not found or inactive'
      });
    }

    const user = users[0];

    res.status(200).json({
      user
    });
  } catch (error) {
    console.error('Auth me error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired'
      });
    }

    res.status(500).json({
      error: 'Internal server error'
    });
  }
}
