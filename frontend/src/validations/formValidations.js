/**
 * Frontend Form Validations
 * Strictly matching backend validation constraints
 */

export const validateEmail = (email) => {
  if (!email) return 'Email is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address.';
  }
  return null;
};

export const validateName = (name) => {
  if (!name) return 'Name is required.';
  const trimmed = name.trim();
  if (trimmed.length < 20 || trimmed.length > 60) {
    return 'Name must be between 20 and 60 characters.';
  }
  return null;
};

export const validateAddress = (address) => {
  if (!address) return 'Address is required.';
  const trimmed = address.trim();
  if (trimmed.length === 0 || trimmed.length > 400) {
    return 'Address must not exceed 400 characters.';
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required.';
  if (password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters.';
  }
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  if (!hasUppercase || !hasSpecial) {
    return 'Password must contain at least one uppercase letter and one special character.';
  }
  return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password.';
  if (password !== confirmPassword) {
    return 'Password and Confirm Password do not match.';
  }
  return null;
};

export const validateRating = (rating) => {
  if (!rating) return 'Rating is required.';
  const num = Number(rating);
  if (!Number.isInteger(num) || num < 1 || num > 5) {
    return 'Rating must be between 1 and 5.';
  }
  return null;
};

export const validateCreateUserInput = ({ name, email, address, password, role }) => {
  const errors = [];
  const nameErr = validateName(name);
  if (nameErr) errors.push(nameErr);

  const emailErr = validateEmail(email);
  if (emailErr) errors.push(emailErr);

  const addressErr = validateAddress(address);
  if (addressErr) errors.push(addressErr);

  const passErr = validatePassword(password);
  if (passErr) errors.push(passErr);

  if (!role || !['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'].includes(role)) {
    errors.push('Invalid user role.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateStoreInput = ({ name, email, address, ownerId }) => {
  const errors = [];
  if (!name || name.trim().length === 0) errors.push('Store Name is required.');
  const emailErr = validateEmail(email);
  if (emailErr) errors.push(emailErr);
  const addressErr = validateAddress(address);
  if (addressErr) errors.push(addressErr);
  if (!ownerId) errors.push('Store Owner is required.');

  return {
    isValid: errors.length === 0,
    errors
  };
};
