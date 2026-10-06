import React, { useState, useEffect } from 'react';
import { getStoresApi, submitRatingApi, updateRatingApi } from '../../services/api';
import { SortableTable } from '../../components/SortableTable';
import { SearchBar } from '../../components/SearchBar';
import { Pagination } from '../../components/Pagination';
import { Modal } from '../../components/Modal';
import { RatingStars } from '../../components/RatingStars';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Store, Star, Edit3, CheckCircle } from 'lucide-react';

export const UserStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Search & Pagination
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0, limit: 10 });

  // Rating Modal
  const [selectedStore, setSelectedStore] = useState(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    fetchStores();
  }, [search, sortBy, sortOrder, page]);

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

  const handleOpenRatingModal = (store) => {
    setSelectedStore(store);
    setRatingScore(store.myRating || 5);
    setModalError(null);
  };

  const handleCloseModal = () => {
    setSelectedStore(null);
    setModalError(null);
  };

  const handleSort = (key, order) => {
    setSortBy(key);
    setSortOrder(order);
    setPage(1);
  };

  const handleSaveRating = async () => {
    if (!selectedStore) return;
    setModalSubmitting(true);
    setModalError(null);
    setSuccessMessage('');

    try {
      if (selectedStore.myRating !== null && selectedStore.myRatingId) {
        // Edit existing rating
        await updateRatingApi(selectedStore.myRatingId, { rating: ratingScore });
        setSuccessMessage(`Updated rating for ${selectedStore.name} to ${ratingScore} stars!`);
      } else {
        // Submit new rating
        await submitRatingApi({ storeId: selectedStore.id, rating: ratingScore });
        setSuccessMessage(`Submitted ${ratingScore}-star rating for ${selectedStore.name}!`);
      }
      handleCloseModal();
      fetchStores();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save rating.';
      setModalError(msg);
    } finally {
      setModalSubmitting(false);
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
      header: 'Address',
      key: 'address',
      sortable: true,
      render: (row) => <span className="text-slate-400 text-xs max-w-xs block truncate">{row.address}</span>
    },
    {
      header: 'Overall Rating',
      key: 'rating',
      sortable: true,
      render: (row) => (
        <div>
          <RatingStars value={row.overallRating} readOnly size="sm" />
          <div className="text-[11px] text-slate-500 mt-0.5">
            {row.totalRatingsCount} {row.totalRatingsCount === 1 ? 'rating' : 'ratings'}
          </div>
        </div>
      )
    },
    {
      header: 'My Rating',
      key: 'myRating',
      sortable: false,
      render: (row) => (
        <div>
          {row.myRating ? (
            <div className="flex items-center space-x-1 font-bold text-amber-400 text-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{row.myRating} / 5</span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 italic">Not rated</span>
          )}
        </div>
      )
    },
    {
      header: 'Action',
      key: 'actions',
      sortable: false,
      render: (row) => (
        <button
          onClick={() => handleOpenRatingModal(row)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 focus:outline-none ${
            row.myRating
              ? 'bg-slate-800 text-amber-400 border border-amber-800/40 hover:bg-slate-700'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
          }`}
        >
          {row.myRating ? (
            <>
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Rating</span>
            </>
          ) : (
            <>
              <Star className="w-3.5 h-3.5" />
              <span>Rate Store</span>
            </>
          )}
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Explore & Rate Stores</h1>
          <p className="text-xs text-slate-400 mt-1">Browse stores, view average customer ratings, and submit feedback</p>
        </div>
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
        emptyMessage="No stores found matching your search."
      />

      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Rating Modal */}
      <Modal
        isOpen={!!selectedStore}
        onClose={handleCloseModal}
        title={selectedStore?.myRating ? `Edit Rating for ${selectedStore?.name}` : `Submit Rating for ${selectedStore?.name}`}
      >
        <div className="space-y-6 text-center py-2">
          {modalError && <ErrorMessage message={modalError} />}

          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">
              Select Your Rating (1 to 5 Stars)
            </p>
            <div className="flex justify-center">
              <RatingStars
                value={ratingScore}
                onChange={(score) => setRatingScore(score)}
                size="lg"
                showNumber={false}
              />
            </div>
            <div className="text-2xl font-extrabold text-amber-400 mt-3">
              {ratingScore} out of 5 Stars
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveRating}
              disabled={modalSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              {modalSubmitting ? 'Saving...' : selectedStore?.myRating ? 'Update Rating' : 'Submit Rating'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserStores;
