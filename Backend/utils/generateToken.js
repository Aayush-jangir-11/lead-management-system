const jwt = require('jsonwebtoken');
require('dotenv').config();

// ─── Generate JWT Token ───────────────────────────────────────────────────────
const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || 'leadflow_jwt_secret_key_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    { id: userId, role },
    secret,
    { expiresIn }
  );
};

// ─── Verify JWT Token ─────────────────────────────────────────────────────────
const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'leadflow_jwt_secret_key_2026';
  return jwt.verify(token, secret);
};

module.exports = { generateToken, verifyToken };
