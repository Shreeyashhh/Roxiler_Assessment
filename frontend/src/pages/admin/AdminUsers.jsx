import React, { useState, useEffect } from 'react';
import { getUsersApi, createUserApi, updateUserApi } from '../../services/api';
import { SortableTable } from '../../components/SortableTable';
import { SearchBar } from '../../components/SearchBar';
import { Pagination } from '../../components/Pagination';
import { Modal } from '../../components/Modal';
import { Form, FormInput, FormSelect, FormTextArea } from '../../components/Form';
import { ErrorMessage } from '../../components/ErrorMessage';
import { validateCreateUserInput } from '../../validations/formValidations';
import { Users, UserPlus, Shield, Store, User, CheckCircle, Edit2 } from 'lucide-react';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Query states
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0, limit: 10 });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'NORMAL_USER'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, sortBy, sortOrder, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsersApi({
        search,
        role: roleFilter,
        sortBy,
        sortOrder,
        page,
        limit: 10
      });
      if (res.data && res.data.success) {
        setUsers(res.data.data.users);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users list.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key, order) => {
    setSortBy(key);
    setSortOrder(order);
    setPage(1);
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      address: '',
      password: '',
      role: 'NORMAL_USER'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      address: user.address,
      password: '',
      role: user.role
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setSuccessMessage('');

    if (editingUser) {
      setSubmitting(true);
      try {
        await updateUserApi(editingUser.id, {
          name: formData.name,
          email: formData.email,
          address: formData.address,
          role: formData.role
        });
        setSuccessMessage('User updated successfully!');
        setIsModalOpen(false);
        fetchUsers();
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to update user.';
        setError(msg);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const validation = validateCreateUserInput(formData);
    if (!validation.isValid) {
      const errObj = {};
      validation.errors.forEach((err) => {
        if (err.includes('Name')) errObj.name = err;
        if (err.includes('Email')) errObj.email = err;
        if (err.includes('Address')) errObj.address = err;
        if (err.includes('Password')) errObj.password = err;
        if (err.includes('role')) errObj.role = err;
      });
      setFormErrors(errObj);
      return;
    }

    setSubmitting(true);
    try {
      await createUserApi(formData);
      setSuccessMessage('New user created successfully!');
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create user.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const renderRoleBadge = (role) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-800/60">
            <Shield className="w-3 h-3 mr-1" /> Admin
          </span>
        );
      case 'STORE_OWNER':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/60">
            <Store className="w-3 h-3 mr-1" /> Store Owner
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950/80 text-indigo-400 border border-indigo-800/60">
            <User className="w-3 h-3 mr-1" /> Normal User
          </span>
        );
    }
  };

  const columns = [
    {
      header: 'Full Name',
      key: 'name',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-slate-100">{row.name}</div>
          <div className="text-xs text-slate-400">ID: #{row.id}</div>
        </div>
      )
    },
    {
      header: 'Email Address',
      key: 'email',
      sortable: true,
      render: (row) => <span className="text-slate-200 text-xs font-medium">{row.email}</span>
    },
    {
      header: 'Address',
      key: 'address',
      sortable: true,
      render: (row) => <span className="text-slate-400 text-xs max-w-xs block truncate">{row.address}</span>
    },
    {
      header: 'Application Role',
      key: 'role',
      sortable: true,
      render: (row) => renderRoleBadge(row.role)
    },
    {
      header: 'Joined Date',
      key: 'createdAt',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-400">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      sortable: false,
      render: (row) => (
        <button
          onClick={() => handleOpenEditModal(row)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-indigo-400 hover:bg-slate-700 transition-colors"
          title="Edit User"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">User Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage system administrators, store owners, and normal user accounts
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {successMessage && (
        <div className="bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 rounded-xl p-4 flex items-center space-x-3 text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search by name, email, or address..."
            className="w-full sm:w-80"
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none w-full sm:w-auto"
          >
            <option value="">All User Roles</option>
            <option value="NORMAL_USER">Normal Users</option>
            <option value="STORE_OWNER">Store Owners</option>
            <option value="SYSTEM_ADMIN">System Admins</option>
          </select>
        </div>
        <div className="text-xs text-slate-400">
          Showing {users.length} of {pagination.total} registered users
        </div>
      </div>

      <SortableTable
        columns={columns}
        data={users}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        isLoading={loading}
        emptyMessage="No users found matching search or role filter."
      />

      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User Details' : 'Add New User Account'}
      >
        <Form onSubmit={handleSubmit}>
          <FormInput
            label="Full Name (20–60 chars)"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Elizabeth Grace Bennett User"
            error={formErrors.name}
            required
          />

          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. user@example.com"
            error={formErrors.email}
            required
          />

          <FormTextArea
            label="Address (Max 400 chars)"
            name="address"
            rows={2}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g. 45 Oak Avenue, Suburbia, Metro City"
            error={formErrors.address}
            required
          />

          {!editingUser && (
            <FormInput
              label="Password (8–16 chars, 1 uppercase, 1 special)"
              name="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="e.g. Password123!"
              error={formErrors.password}
              required
            />
          )}

          <FormSelect
            label="User Role"
            name="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={[
              { value: 'NORMAL_USER', label: 'NORMAL_USER' },
              { value: 'STORE_OWNER', label: 'STORE_OWNER' },
              { value: 'SYSTEM_ADMIN', label: 'SYSTEM_ADMIN' }
            ]}
            error={formErrors.role}
            required
          />

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30"
            >
              {submitting ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUsers;
