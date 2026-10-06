const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const config = require('../config');
const { sendSuccess, sendError } = require('../utils/response');
const { validateRegistrationInput } = require('../utils/validators');

/**
 * Register a new Normal User
 */
const register = async (req, res, next) => {
  try {
    const { name, email, address, password, confirmPassword } = req.body;

    const validation = validateRegistrationInput({ name, email, address, password, confirmPassword });
    if (!validation.isValid) {
      return sendError(res, 'Validation error', validation.errors, 422);
    }

    // Check existing email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return sendError(res, 'A user with this email address already exists.', [], 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        address: address.trim(),
        passwordHash,
        role: 'NORMAL_USER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser.id,
        role: newUser.role,
        email: newUser.email,
        name: newUser.name
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return sendSuccess(
      res,
      'User registered successfully.',
      {
        token,
        user: newUser
      },
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * User Login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required.', [], 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return sendError(res, 'Invalid email or password.', [], 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return sendError(res, 'Invalid email or password.', [], 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
        name: user.name
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt
    };

    return sendSuccess(res, 'Login successful.', {
      token,
      user: userResponse
    });
  } catch (err) {
    next(err);
  }
};

/**
 * User Logout
 */
const logout = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * Get Current Authenticated User Profile
 */
const me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
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

    if (!user) {
      return sendError(res, 'User not found.', [], 404);
    }

    return sendSuccess(res, 'Profile retrieved successfully.', { user });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  me
};
