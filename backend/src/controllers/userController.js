const bcrypt = require('bcryptjs');
const prisma = require('../prisma');
const { sendSuccess, sendError } = require('../utils/response');
const { validateCreateUserInput, validatePasswordChangeInput, validateEmail, validateName, validateAddress } = require('../utils/validators');

/**
 * Get all users with searching, role filtering, sorting, and pagination.
 * Accessible by: SYSTEM_ADMIN
 */
const getUsers = async (req, res, next) => {
  try {
    const {
      search = '',
      role,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Validate sort fields to prevent invalid field injection
    const allowedSortFields = ['name', 'email', 'address', 'role', 'createdAt', 'updatedAt'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    // Build filter conditions
    const where = {};

    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { address: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }

    if (role && ['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'].includes(role)) {
      where.role = role;
    }

    const [totalUsers, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          role: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          [safeSortBy]: safeSortOrder
        },
        skip,
        take: limitNum
      })
    ]);

    return sendSuccess(res, 'Users retrieved successfully.', {
      users,
      pagination: {
        total: totalUsers,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalUsers / limitNum)
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new user (Admin)
 * Accessible by: SYSTEM_ADMIN
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, address, password, role } = req.body;

    const validation = validateCreateUserInput({ name, email, address, password, role });
    if (!validation.isValid) {
      return sendError(res, 'Validation error', validation.errors, 422);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return sendError(res, 'A user with this email address already exists.', [], 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        address: address.trim(),
        passwordHash,
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return sendSuccess(res, 'User created successfully.', { user: newUser }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Get single user by ID
 */
const getUserById = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    // Authorization check: Admin or Self
    if (req.user.role !== 'SYSTEM_ADMIN' && req.user.userId !== userId) {
      return sendError(res, 'Forbidden: You can only view your own profile.', [], 403);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        stores: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true
          }
        }
      }
    });

    if (!user) {
      return sendError(res, 'User not found.', [], 404);
    }

    return sendSuccess(res, 'User details retrieved successfully.', { user });
  } catch (err) {
    next(err);
  }
};

/**
 * Update user profile
 */
const updateUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    if (req.user.role !== 'SYSTEM_ADMIN' && req.user.userId !== userId) {
      return sendError(res, 'Forbidden: You can only update your own profile.', [], 403);
    }

    const { name, email, address, role } = req.body;
    const errors = [];

    if (name && !validateName(name)) {
      errors.push('Name must be between 20 and 60 characters.');
    }
    if (email && !validateEmail(email)) {
      errors.push('Email must be a valid email address.');
    }
    if (address && !validateAddress(address)) {
      errors.push('Address must be provided and cannot exceed 400 characters.');
    }

    if (errors.length > 0) {
      return sendError(res, 'Validation error', errors, 422);
    }

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      return sendError(res, 'User not found.', [], 404);
    }

    // Email duplication check if changing email
    if (email && email.toLowerCase().trim() !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      });
      if (emailTaken) {
        return sendError(res, 'Email address is already in use.', [], 409);
      }
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (address) updateData.address = address.trim();

    // Only Admin can change user roles
    if (role && req.user.role === 'SYSTEM_ADMIN') {
      if (['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'].includes(role)) {
        updateData.role = role;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        updatedAt: true
      }
    });

    return sendSuccess(res, 'User updated successfully.', { user: updatedUser });
  } catch (err) {
    next(err);
  }
};

/**
 * Change Password
 * Accessible by: Any authenticated user updating their own password
 */
const changePassword = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    if (req.user.userId !== userId && req.user.role !== 'SYSTEM_ADMIN') {
      return sendError(res, 'Forbidden: You can only change your own password.', [], 403);
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    const validation = validatePasswordChangeInput({ currentPassword, newPassword, confirmPassword });
    if (!validation.isValid) {
      return sendError(res, 'Validation error', validation.errors, 422);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return sendError(res, 'User not found.', [], 404);
    }

    // Verify current password (if not Admin overriding password)
    if (req.user.userId === userId) {
      const isPasswordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isPasswordMatch) {
        return sendError(res, 'Current password is incorrect.', [], 400);
      }
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });

    return sendSuccess(res, 'Password changed successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  changePassword
};
