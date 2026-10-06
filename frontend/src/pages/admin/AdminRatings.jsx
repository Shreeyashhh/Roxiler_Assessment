import React, { useState, useEffect } from 'react';
import { getRatingsApi, getStoresApi } from '../../services/api';
import { Table } from '../../components/Table';
import { RatingStars } from '../../components/RatingStars';
import { Pagination } from '../../components/Pagination';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Star, Store } from 'lucide-react';

export const AdminRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0, limit: 10 });

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    fetchRatings();
  }, [selectedStoreId, page]);

  const fetchStores = async () => {
    try {
      const res = await getStoresApi({ limit: 100 });
      if (res.data && res.data.success) {
        setStores(res.data.data.stores);
      }
    } catch (err) {
      console.error('Failed to fetch store dropdown options', err);
    }
  };

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const res = await getRatingsApi({
        storeId: selectedStoreId || undefined,
        page,
        limit: 10
      });
      if (res.data && res.data.success) {
        setRatings(res.data.data.ratings);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch rating records.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Store Name',
      key: 'storeName',
      render: (row) => (
        <div className="flex items-center space-x-2 font-bold text-slate-100">
          <Store className="w-4 h-4 text-indigo-400" />
          <span>{row.store?.name}</span>
        </div>
      )
    },
    {
      header: 'Customer User',
      key: 'user',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-200 text-xs">{row.user?.name}</div>
          <div className="text-xs text-slate-500">{row.user?.email}</div>
        </div>
      )
    },
    {
      header: 'Submitted Rating',
      key: 'rating',
      render: (row) => <RatingStars value={row.rating} readOnly size="sm" />
    },
    {
      header: 'Submission Date',
      key: 'createdAt',
      render: (row) => (
        <span className="text-xs text-slate-400">
          {new Date(row.createdAt).toLocaleDateString()} {new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-400" /> Store Rating Information
          </h1>
          <p className="text-xs text-slate-400 mt-1">Detailed rating logs submitted by normal users for all stores</p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-400 font-semibold">Filter Store:</label>
          <select
            value={selectedStoreId}
            onChange={(e) => {
              setSelectedStoreId(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            <option value="">All Stores</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <Table
        columns={columns}
        data={ratings}
        isLoading={loading}
        emptyMessage="No rating records found."
      />

      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
};

export default AdminRatings;
