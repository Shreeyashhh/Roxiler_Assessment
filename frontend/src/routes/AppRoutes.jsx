import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute, RoleProtectedRoute } from '../components/ProtectedRoute';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Public Pages
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminStores from '../pages/admin/AdminStores';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminRatings from '../pages/admin/AdminRatings';

// Normal User Pages
import UserDashboard from '../pages/user/UserDashboard';
import UserStores from '../pages/user/UserStores';
import UserProfile from '../pages/user/UserProfile';

// Store Owner Pages
import StoreOwnerDashboard from '../pages/storeOwner/StoreOwnerDashboard';
import StoreOwnerRatings from '../pages/storeOwner/StoreOwnerRatings';
import StoreOwnerProfile from '../pages/storeOwner/StoreOwnerProfile';

export const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  const getDefaultRoute = () => {
    if (!isAuthenticated || !user) return '/login';
    switch (user.role) {
      case 'SYSTEM_ADMIN':
        return '/admin/dashboard';
      case 'STORE_OWNER':
        return '/store-owner/dashboard';
      default:
        return '/user/dashboard';
    }
  };

  return (
    <Routes>
      {/* Public Unauthenticated Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Register />}
      />

      {/* Authenticated Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* SYSTEM_ADMIN Role Protected Routes */}
          <Route element={<RoleProtectedRoute allowedRoles={['SYSTEM_ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/stores" element={<AdminStores />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/ratings" element={<AdminRatings />} />
          </Route>

          {/* NORMAL_USER Role Protected Routes */}
          <Route element={<RoleProtectedRoute allowedRoles={['NORMAL_USER']} />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/stores" element={<UserStores />} />
            <Route path="/user/profile" element={<UserProfile />} />
          </Route>

          {/* STORE_OWNER Role Protected Routes */}
          <Route element={<RoleProtectedRoute allowedRoles={['STORE_OWNER']} />}>
            <Route path="/store-owner/dashboard" element={<StoreOwnerDashboard />} />
            <Route path="/store-owner/ratings" element={<StoreOwnerRatings />} />
            <Route path="/store-owner/profile" element={<StoreOwnerProfile />} />
          </Route>
        </Route>
      </Route>

      {/* Root & Catch-all Fallback */}
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
      <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
    </Routes>
  );
};

export default AppRoutes;
