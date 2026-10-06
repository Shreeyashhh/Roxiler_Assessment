import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { changePasswordApi } from '../../services/api';
import { Form, FormInput } from '../../components/Form';
import { ErrorMessage } from '../../components/ErrorMessage';
import { validatePassword, validateConfirmPassword } from '../../validations/formValidations';
import { User, KeyRound, CheckCircle, Shield } from 'lucide-react';

export const UserProfile = () => {
  const { user } = useAuth();

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!passwordData.currentPassword) {
      errs.currentPassword = 'Current password is required.';
    }

    const passErr = validatePassword(passwordData.newPassword);
    if (passErr) errs.newPassword = passErr;

    const confirmErr = validateConfirmPassword(passwordData.newPassword, passwordData.confirmPassword);
    if (confirmErr) errs.confirmPassword = confirmErr;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage('');

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await changePasswordApi(user.id, passwordData);
      setSuccessMessage('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update password.';
      const errs = err.response?.data?.errors || [];
      setApiError({ message: msg, errors: errs });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-400" /> Account Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">Manage user account profile details and security settings</p>
      </div>

      {/* Account Info Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" /> Profile Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Full Name</span>
            <span className="font-bold text-slate-200">{user?.name}</span>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Email Address</span>
            <span className="font-bold text-slate-200">{user?.email}</span>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Account Role</span>
            <span className="font-bold text-indigo-400">{user?.role}</span>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Address</span>
            <span className="font-semibold text-slate-300">{user?.address}</span>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-indigo-400" /> Change Password
        </h2>

        {successMessage && (
          <div className="bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 rounded-xl p-4 flex items-center space-x-3 text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {apiError && <ErrorMessage message={apiError.message} errors={apiError.errors} />}

        <Form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <FormInput
            label="Current Password"
            name="currentPassword"
            type="password"
            value={passwordData.currentPassword}
            onChange={handleChange}
            placeholder="Enter current password"
            error={errors.currentPassword}
            required
          />

          <FormInput
            label="New Password (8–16 chars, 1 uppercase, 1 special)"
            name="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={handleChange}
            placeholder="Enter new password"
            error={errors.newPassword}
            required
          />

          <FormInput
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={passwordData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm new password"
            error={errors.confirmPassword}
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all focus:outline-none"
          >
            {submitting ? 'Updating Password...' : 'Update Password'}
          </button>
        </Form>
      </div>
    </div>
  );
};

export default UserProfile;
