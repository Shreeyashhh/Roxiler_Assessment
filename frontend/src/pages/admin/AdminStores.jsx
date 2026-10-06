import React, { useState, useEffect } from 'react';
import { getStoresApi, createStoreApi, updateStoreApi, deleteStoreApi, getUsersApi } from '../../services/api';
import { SortableTable } from '../../components/SortableTable';
import { SearchBar } from '../../components/SearchBar';
import { Pagination } from '../../components/Pagination';
import { Modal } from '../../components/Modal';
import { Form, FormInput, FormSelect, FormTextArea } from '../../components/Form';
import { ErrorMessage } from '../../components/ErrorMessage';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { RatingStars } from '../../components/RatingStars';
import { validateStoreInput } from '../../validations/formValidations';
import { Store, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';

export const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [storeOwners, setStoreOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Query state
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0, limit: 10 });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete Dialog State
  const [deleteStoreId, setDeleteStoreId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchStores();
  }, [search, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchStoreOwners();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await getStoresApi({ search, sortBy, sortOrder, page, limit: 10 });
      if (res.data && res.data.success) {
        setStores(res.data.data.stores);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch stores list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreOwners = async () => {
    try {
      const res = await getUsersApi({ role: 'STORE_OWNER', limit: 100 });
      if (res.data && res.data.success) {
        setStoreOwners(res.data.data.users);
      }
    } catch (err) {
      console.error('Failed to fetch store owners list', err);
    }
  };

  const handleSort = (key, order) => {
    setSortBy(key);
    setSortOrder(order);
    setPage(1);
  };

  const handleOpenAddModal = () => {
    setEditingStore(null);
    setFormData({ name: '', email: '', address: '', ownerId: storeOwners[0]?.id || '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      email: store.email,
      address: store.address,
      ownerId: store.ownerId || store.owner?.id || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setSuccessMessage('');

    if (!formData.name || !formData.email || !formData.address || !formData.ownerId) {
      setFormErrors({
        name: !formData.name ? 'Store Name is required.' : null,
        email: !formData.email ? 'Store Email is required.' : null,
        address: !formData.address ? 'Store Address is required.' : null,
        ownerId: !formData.ownerId ? 'Store Owner is required.' : null
      });
      return;
    }

    setSubmitting(true);
    try {
      if (editingStore) {
        await updateStoreApi(editingStore.id, formData);
        setSuccessMessage('Store updated successfully!');
      } else {
        await createStoreApi(formData);
        setSuccessMessage('Store added successfully!');
      }
      setIsModalOpen(false);
      fetchStores();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save store details.';
      const errs = err.response?.data?.errors || [];
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteStoreId) return;
    setDeleting(true);
    try {
      await deleteStoreApi(deleteStoreId);
      setSuccessMessage('Store deleted successfully.');
      setDeleteStoreId(null);
      fetchStores();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete store.');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Store Name',
      key: 'name',
      sortable: true,
      render: (row) => (
        <div className="font-bold text-slate-100 flex items-center space-x-2">
          <Store className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span>{row.name}</span>
        </div>
      )
    },
    {
      header: 'Store Email',
      key: 'email',
      sortable: true,
      render: (row) => <span className="text-slate-300 text-xs">{row.email}</span>
    },
    {
      header: 'Address',
      key: 'address',
      sortable: true,
      render: (row) => <span className="text-slate-400 text-xs max-w-xs block truncate">{row.address}</span>
    },
    {
      header: 'Store Owner',
      key: 'owner',
      sortable: false,
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-200 text-xs">{row.owner?.name || 'Unassigned'}</div>
          <div className="text-xs text-slate-500">{row.owner?.email}</div>
        </div>
      )
    },
    {
      header: 'Overall Rating',
      key: 'rating',
      sortable: true,
      render: (row) => (
        <RatingStars value={row.overallRating} readOnly size="sm" />
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-indigo-400 hover:bg-slate-700 transition-colors"
            title="Edit Store"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteStoreId(row.id)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-rose-950/50 transition-colors"
            title="Delete Store"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Store Management</h1>
          <p className="text-xs text-slate-400 mt-1">Add new stores, manage assignments, and monitor overall ratings</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Store</span>
        </button>
      </div>

      {successMessage && (
        <div className="bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 rounded-xl p-4 flex items-center space-x-3 text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by store name or address..."
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-400">
          Showing {stores.length} of {pagination.total} stores
        </div>
      </div>

      <SortableTable
        columns={columns}
        data={stores}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        isLoading={loading}
        emptyMessage="No stores found matching criteria."
      />

      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Add / Edit Store Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStore ? 'Edit Store Details' : 'Add New Store'}
      >
        <Form onSubmit={handleSubmit}>
          <FormInput
            label="Store Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. TechHub Electronics Store"
            error={formErrors.name}
            required
          />

          <FormInput
            label="Store Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. contact@techhub.com"
            error={formErrors.email}
            required
          />

          <FormTextArea
            label="Store Address (Max 400 chars)"
            name="address"
            rows={2}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g. 101 Tech Street, Silicon Valley"
            error={formErrors.address}
            required
          />

          <FormSelect
            label="Assign Store Owner"
            name="ownerId"
            value={formData.ownerId}
            onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
            options={storeOwners.map((o) => ({
              value: o.id,
              label: `${o.name} (${o.email})`
            }))}
            error={formErrors.ownerId}
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
              {submitting ? 'Saving...' : editingStore ? 'Update Store' : 'Create Store'}
            </button>
          </div>
        </Form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deleteStoreId}
        onClose={() => setDeleteStoreId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Store"
        message="Are you sure you want to delete this store? All associated ratings will be permanently removed."
        confirmText="Delete Store"
        isDanger
        isLoading={deleting}
      />
    </div>
  );
};

export default AdminStores;
