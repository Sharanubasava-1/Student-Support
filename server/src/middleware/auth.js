import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'edumerge_super_secret_jwt_key_2026');
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true, department: true, avatar: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token session' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Forbidden: Invalid JWT token' });
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: Unauthorized role permissions' });
    }
    next();
  };
};
