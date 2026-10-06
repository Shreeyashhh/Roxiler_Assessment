/**
 * Backend Input Validation Utilities
 * Strictly enforces Section 8 of requirement specifications.
 */

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const validateName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= 20 && trimmed.length <= 60;
};

const validateAddress = (address) => {
  if (!address || typeof address !== 'string') return false;
  const trimmed = address.trim();
  return trimmed.length > 0 && trimmed.length <= 400;
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  if (password.length < 8 || password.length > 16) return false;
  // Must contain at least 1 uppercase letter and 1 special character
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  return hasUppercase && hasSpecial;
};

const validateRating = (rating) => {
  if (rating === undefined || rating === null) return false;
  const num = Number(rating);
  return Number.isInteger(num) && num >= 1 && num <= 5;
};

/**
 * Validate Registration Input
 */
const validateRegistrationInput = ({ name, email, address, password, confirmPassword }) => {
  const errors = [];

  if (!validateName(name)) {
    errors.push('Name must be between 20 and 60 characters.');
  }

  if (!validateEmail(email)) {
    errors.push('Email must be a valid email address.');
  }

  if (!validateAddress(address)) {
    errors.push('Address must be provided and cannot exceed 400 characters.');
  }

  if (!validatePassword(password)) {
    errors.push('Password must be 8-16 characters and contain at least one uppercase letter and one special character.');
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.push('Password and Confirm Password do not match.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate User Creation Input (Admin)
 */
const validateCreateUserInput = ({ name, email, address, password, role }) => {
  const errors = [];

  if (!validateName(name)) {
    errors.push('Name must be between 20 and 60 characters.');
  }

  if (!validateEmail(email)) {
    errors.push('Email must be a valid email address.');
  }

  if (!validateAddress(address)) {
    errors.push('Address must be provided and cannot exceed 400 characters.');
  }

  if (!validatePassword(password)) {
    errors.push('Password must be 8-16 characters and contain at least one uppercase letter and one special character.');
  }

  const validRoles = ['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'];
  if (!role || !validRoles.includes(role)) {
    errors.push('Invalid role. Role must be SYSTEM_ADMIN, NORMAL_USER, or STORE_OWNER.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate Store Input
 */
const validateStoreInput = ({ name, email, address, ownerId }) => {
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0 || name.trim().length > 100) {
    errors.push('Store Name is required and must be under 100 characters.');
  }

  if (!validateEmail(email)) {
    errors.push('Store Email must be a valid email address.');
  }

  if (!validateAddress(address)) {
    errors.push('Store Address must be provided and cannot exceed 400 characters.');
  }

  if (!ownerId || isNaN(Number(ownerId))) {
    errors.push('Store Owner ID is required.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate Rating Input
 */
const validateRatingInput = ({ rating, storeId }) => {
  const errors = [];

  if (!validateRating(rating)) {
    errors.push('Rating must be an integer value between 1 and 5.');
  }

  if (!storeId || isNaN(Number(storeId))) {
    errors.push('Store ID is required.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate Password Change Input
 */
const validatePasswordChangeInput = ({ currentPassword, newPassword, confirmPassword }) => {
  const errors = [];

  if (!currentPassword) {
    errors.push('Current password is required.');
  }

  if (!validatePassword(newPassword)) {
    errors.push('New password must be 8-16 characters and contain at least one uppercase letter and one special character.');
  }

  if (newPassword !== confirmPassword) {
    errors.push('New password and Confirm Password do not match.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateEmail,
  validateName,
  validateAddress,
  validatePassword,
  validateRating,
  validateRegistrationInput,
  validateCreateUserInput,
  validateStoreInput,
  validateRatingInput,
  validatePasswordChangeInput
};
