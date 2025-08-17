const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();
const prisma = new PrismaClient();

// Multer configuration for avatar uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// GET /api/users/profile - Get current user profile
router.get('/profile', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', [
  body('firstName').optional().isLength({ max: 50 }).withMessage('First name too long'),
  body('lastName').optional().isLength({ max: 50 }).withMessage('Last name too long'),
  body('username').optional().isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { firstName, lastName, username } = req.body;
    const updateData = {};

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (username !== undefined) {
      // Check if username is already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: req.user.id }
        }
      });

      if (existingUser) {
        return res.status(409).json({
          error: 'Username already taken',
          code: 'USERNAME_TAKEN'
        });
      }

      updateData.username = username;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/avatar - Upload user avatar
router.post('/avatar', upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file provided',
        code: 'FILE_MISSING'
      });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const filename = `${req.user.id}-${Date.now()}.webp`;
    const filepath = path.join(uploadsDir, filename);

    // Process and save image
    await sharp(req.file.buffer)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 90 })
      .toFile(filepath);

    // Delete old avatar if exists
    if (req.user.avatar) {
      const oldPath = path.join(process.cwd(), req.user.avatar);
      try {
        await fs.unlink(oldPath);
      } catch (error) {
        // Ignore if file doesn't exist
      }
    }

    // Update user avatar in database
    const avatarUrl = `/uploads/avatars/${filename}`;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true
      }
    });

    res.json({
      message: 'Avatar uploaded successfully',
      user
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/avatar - Remove user avatar
router.delete('/avatar', async (req, res, next) => {
  try {
    // Delete avatar file if exists
    if (req.user.avatar) {
      const filepath = path.join(process.cwd(), req.user.avatar);
      try {
        await fs.unlink(filepath);
      } catch (error) {
        // Ignore if file doesn't exist
      }
    }

    // Update user avatar in database
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: null },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true
      }
    });

    res.json({
      message: 'Avatar removed successfully',
      user
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/password - Change password
router.put('/password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        error: 'Current password is incorrect',
        code: 'INVALID_PASSWORD'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    // Invalidate all sessions
    await prisma.userSession.updateMany({
      where: { userId: req.user.id },
      data: { isActive: false }
    });

    res.json({
      message: 'Password changed successfully. Please log in again.'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/search - Search users for collaboration
router.get('/search', [
  param('q').optional().isLength({ min: 2 }).withMessage('Search query must be at least 2 characters')
], async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { isActive: true },
          { NOT: { id: req.user.id } }, // Exclude current user
          {
            OR: [
              { username: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
              { firstName: { contains: q, mode: 'insensitive' } },
              { lastName: { contains: q, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true
      },
      take: 10 // Limit results
    });

    res.json({ users });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/account - Delete user account
router.delete('/account', [
  body('password').notEmpty().withMessage('Password is required for account deletion'),
  body('confirmation').equals('DELETE').withMessage('Please type DELETE to confirm')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { password } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        error: 'Password is incorrect',
        code: 'INVALID_PASSWORD'
      });
    }

    // Delete user avatar if exists
    if (user.avatar) {
      const filepath = path.join(process.cwd(), user.avatar);
      try {
        await fs.unlink(filepath);
      } catch (error) {
        // Ignore if file doesn't exist
      }
    }

    // Soft delete user (deactivate instead of hard delete to preserve data integrity)
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        isActive: false,
        email: `deleted_${Date.now()}_${user.email}`,
        username: `deleted_${Date.now()}_${user.username}`
      }
    });

    // Invalidate all sessions
    await prisma.userSession.updateMany({
      where: { userId: req.user.id },
      data: { isActive: false }
    });

    res.json({
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
