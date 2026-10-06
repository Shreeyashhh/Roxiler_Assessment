import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RatingStars } from '../components/RatingStars';
import { validateName, validatePassword, validateEmail } from '../validations/formValidations';

describe('Frontend Component & Form Validation Unit Tests', () => {
  describe('Form Validation Utilities', () => {
    it('validateName should require length between 20 and 60 characters', () => {
      expect(validateName('Short Name')).toBe('Name must be between 20 and 60 characters.');
      expect(validateName('Jonathan Edward Star User Account')).toBeNull();
    });

    it('validateEmail should reject invalid email format', () => {
      expect(validateEmail('invalid-email')).toBe('Please enter a valid email address.');
      expect(validateEmail('valid@example.com')).toBeNull();
    });

    it('validatePassword should require 8-16 chars with uppercase and special char', () => {
      expect(validatePassword('weak')).toBe('Password must be between 8 and 16 characters.');
      expect(validatePassword('password123')).toBe('Password must contain at least one uppercase letter and one special character.');
      expect(validatePassword('Password123!')).toBeNull();
    });
  });

  describe('RatingStars UI Component', () => {
    it('should render 5 stars and highlight given value', () => {
      render(<RatingStars value={4} readOnly />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(5);
      expect(screen.getByText('4.0')).toBeInTheDocument();
    });

    it('should trigger onChange callback when clicked in interactive mode', () => {
      const handleChange = vi.fn();
      render(<RatingStars value={0} onChange={handleChange} />);
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[4]); // Click 5th star
      expect(handleChange).toHaveBeenCalledWith(5);
    });
  });
});
