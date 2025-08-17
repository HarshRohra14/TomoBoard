const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Validation rules
const createWhiteboardValidation = [
  body('title').isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be boolean')
];

const updateWhiteboardValidation = [
  param('id').isString().withMessage('Invalid whiteboard ID'),
  body('title').optional().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be boolean'),
  body('canvasData').optional().isObject().withMessage('Canvas data must be an object'),
  body('settings').optional().isObject().withMessage('Settings must be an object')
];

// Helper function to check whiteboard access
async function checkWhiteboardAccess(whiteboardId, userId, requiredRole = null) {
  const whiteboard = await prisma.whiteboard.findUnique({
    where: { id: whiteboardId },
    include: {
      owner: {
        select: { id: true, username: true }
      },
      collaborators: {
        where: { userId },
        select: { role: true, permissions: true }
      }
    }
  });

  if (!whiteboard) {
    return { hasAccess: false, error: 'Whiteboard not found' };
  }

  // Owner has full access
  if (whiteboard.ownerId === userId) {
    return { hasAccess: true, whiteboard, role: 'OWNER' };
  }

  // Check if user is a collaborator
  const collaboration = whiteboard.collaborators[0];
  if (!collaboration) {
    // Check if it's a public whiteboard
    if (whiteboard.isPublic) {
      return { hasAccess: true, whiteboard, role: 'VIEWER' };
    }
    return { hasAccess: false, error: 'Access denied' };
  }

  // Check if user has required role
  if (requiredRole) {
    const roleHierarchy = { OWNER: 3, EDITOR: 2, VIEWER: 1 };
    if (roleHierarchy[collaboration.role] < roleHierarchy[requiredRole]) {
      return { hasAccess: false, error: 'Insufficient permissions' };
    }
  }

  return { hasAccess: true, whiteboard, role: collaboration.role };
}

// GET /api/whiteboards - Get user's whiteboards
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', sortBy = 'updatedAt', sortOrder = 'desc' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      OR: [
        { ownerId: req.user.id },
        {
          collaborators: {
            some: { userId: req.user.id }
          }
        },
        {
          AND: [
            { isPublic: true },
            search ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
              ]
            } : {}
          ]
        }
      ]
    };

    if (search) {
      where.OR = where.OR.map(condition => {
        if (condition.ownerId || condition.collaborators) {
          return {
            ...condition,
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } }
            ]
          };
        }
        return condition;
      });
    }

    const [whiteboards, total] = await Promise.all([
      prisma.whiteboard.findMany({
        where,
        include: {
          owner: {
            select: { id: true, username: true, firstName: true, lastName: true, avatar: true }
          },
          collaborators: {
            include: {
              user: {
                select: { id: true, username: true, firstName: true, lastName: true, avatar: true }
              }
            }
          },
          _count: {
            select: { chatMessages: true }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.whiteboard.count({ where })
    ]);

    res.json({
      whiteboards: whiteboards.map(wb => ({
        ...wb,
        canvasData: undefined, // Don't send canvas data in list view
        messageCount: wb._count.chatMessages
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/whiteboards/:id - Get specific whiteboard
router.get('/:id', param('id').isString(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { hasAccess, whiteboard, error, role } = await checkWhiteboardAccess(
      req.params.id,
      req.user.id
    );

    if (!hasAccess) {
      return res.status(404).json({
        error: error || 'Whiteboard not found',
        code: 'NOT_FOUND'
      });
    }

    const whiteboardWithDetails = await prisma.whiteboard.findUnique({
      where: { id: req.params.id },
      include: {
        owner: {
          select: { id: true, username: true, firstName: true, lastName: true, avatar: true }
        },
        collaborators: {
          include: {
            user: {
              select: { id: true, username: true, firstName: true, lastName: true, avatar: true }
            }
          }
        },
        chatMessages: {
          include: {
            user: {
              select: { id: true, username: true, firstName: true, lastName: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'asc' },
          take: 50 // Last 50 messages
        }
      }
    });

    res.json({
      ...whiteboardWithDetails,
      userRole: role
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/whiteboards - Create new whiteboard
router.post('/', createWhiteboardValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { title, description, isPublic = false } = req.body;

    const whiteboard = await prisma.whiteboard.create({
      data: {
        title,
        description,
        isPublic,
        ownerId: req.user.id,
        canvasData: {
          version: '5.3.0',
          objects: []
        },
        settings: {
          backgroundColor: '#ffffff',
          grid: true,
          gridSize: 20,
          zoom: 1
        }
      },
      include: {
        owner: {
          select: { id: true, username: true, firstName: true, lastName: true, avatar: true }
        }
      }
    });

    res.status(201).json({
      message: 'Whiteboard created successfully',
      whiteboard
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/whiteboards/:id - Update whiteboard
router.put('/:id', updateWhiteboardValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { hasAccess, error } = await checkWhiteboardAccess(
      req.params.id,
      req.user.id,
      'EDITOR'
    );

    if (!hasAccess) {
      return res.status(403).json({
        error: error || 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    const updateData = {};
    const allowedFields = ['title', 'description', 'isPublic', 'canvasData', 'settings'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const whiteboard = await prisma.whiteboard.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        owner: {
          select: { id: true, username: true, firstName: true, lastName: true, avatar: true }
        },
        collaborators: {
          include: {
            user: {
              select: { id: true, username: true, firstName: true, lastName: true, avatar: true }
            }
          }
        }
      }
    });

    res.json({
      message: 'Whiteboard updated successfully',
      whiteboard
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/whiteboards/:id - Delete whiteboard
router.delete('/:id', param('id').isString(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const whiteboard = await prisma.whiteboard.findUnique({
      where: { id: req.params.id }
    });

    if (!whiteboard) {
      return res.status(404).json({
        error: 'Whiteboard not found',
        code: 'NOT_FOUND'
      });
    }

    // Only owner can delete
    if (whiteboard.ownerId !== req.user.id) {
      return res.status(403).json({
        error: 'Only the owner can delete this whiteboard',
        code: 'ACCESS_DENIED'
      });
    }

    await prisma.whiteboard.delete({
      where: { id: req.params.id }
    });

    res.json({
      message: 'Whiteboard deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/whiteboards/:id/collaborators - Add collaborator
router.post('/:id/collaborators', [
  param('id').isString(),
  body('email').isEmail().normalizeEmail(),
  body('role').isIn(['EDITOR', 'VIEWER']),
  body('permissions').optional().isArray()
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

    const { hasAccess, error } = await checkWhiteboardAccess(
      req.params.id,
      req.user.id,
      'EDITOR'
    );

    if (!hasAccess) {
      return res.status(403).json({
        error: error || 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    const { email, role, permissions = [] } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, username: true, firstName: true, lastName: true }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if already a collaborator
    const existingCollaboration = await prisma.whiteboardCollaborator.findUnique({
      where: {
        userId_whiteboardId: {
          userId: user.id,
          whiteboardId: req.params.id
        }
      }
    });

    if (existingCollaboration) {
      return res.status(409).json({
        error: 'User is already a collaborator',
        code: 'ALREADY_COLLABORATOR'
      });
    }

    const collaboration = await prisma.whiteboardCollaborator.create({
      data: {
        userId: user.id,
        whiteboardId: req.params.id,
        role,
        permissions
      },
      include: {
        user: {
          select: { id: true, email: true, username: true, firstName: true, lastName: true, avatar: true }
        }
      }
    });

    res.status(201).json({
      message: 'Collaborator added successfully',
      collaboration
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/whiteboards/:id/collaborators/:userId - Remove collaborator
router.delete('/:id/collaborators/:userId', [
  param('id').isString(),
  param('userId').isString()
], async (req, res, next) => {
  try {
    const { hasAccess, error } = await checkWhiteboardAccess(
      req.params.id,
      req.user.id,
      'EDITOR'
    );

    if (!hasAccess) {
      return res.status(403).json({
        error: error || 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    await prisma.whiteboardCollaborator.delete({
      where: {
        userId_whiteboardId: {
          userId: req.params.userId,
          whiteboardId: req.params.id
        }
      }
    });

    res.json({
      message: 'Collaborator removed successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
