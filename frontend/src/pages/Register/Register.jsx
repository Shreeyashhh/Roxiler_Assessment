import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerApi } from '../../services/api';
import { Form, FormInput, FormTextArea } from '../../components/Form';
import { ErrorMessage } from '../../components/ErrorMessage';
import {
  validateEmail,
  validateName,
  validateAddress,
  validatePassword,
  validateConfirmPassword
} from '../../validations/formValidations';
import { UserPlus, Store, CheckCircle } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const nameErr = validateName(formData.name);
    if (nameErr) errors.name = nameErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) errors.email = emailErr;

    const addressErr = validateAddress(formData.address);
    if (addressErr) errors.address = addressErr;

    const passErr = validatePassword(formData.password);
    if (passErr) errors.password = passErr;

    const confirmErr = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (confirmErr) errors.confirmPassword = confirmErr;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage('');

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await registerApi(formData);
      if (res.data && res.data.success) {
        setSuccessMessage('Account registered successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please review input fields.';
      const errs = err.response?.data?.errors || [];
      setApiError({ message: msg, errors: errs });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden py-12">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg glass-panel p-8 rounded-3xl border border-slate-700/80 shadow-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-black text-xl mb-3 shadow-lg shadow-indigo-500/30">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create User Account</h1>
          <p className="text-xs text-slate-400 mt-1">Register to rate & discover top stores</p>
        </div>

        {successMessage && (
          <div className="bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 rounded-xl p-4 mb-4 flex items-center space-x-3 text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {apiError && <ErrorMessage message={apiError.message} errors={apiError.errors} />}

        <Form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Full Name (20–60 characters)"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Jonathan Edward Star User"
            error={formErrors.name}
            required
          />

          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. user@example.com"
            error={formErrors.email}
            required
          />

          <FormTextArea
            label="Address (Max 400 characters)"
            name="address"
            rows={2}
            value={formData.address}
            onChange={handleChange}
            placeholder="e.g. 12 Maple Street, Suburbia, Metro City"
            error={formErrors.address}
            required
          />

          <FormInput
            label="Password (8–16 chars, 1 uppercase, 1 special)"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="e.g. Password123!"
            error={formErrors.password}
            required
          />

          <FormInput
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="e.g. Password123!"
            error={formErrors.confirmPassword}
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-150 flex items-center justify-center space-x-2 focus:outline-none"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Register Account</span>
              </>
            )}
          </button>
        </Form>

        <div className="mt-6 text-center text-xs text-slate-400 pt-4 border-t border-slate-800">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
