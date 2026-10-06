import React, { useState, useEffect } from 'react';
import { getAdminDashboardApi } from '../../services/api';
import { DashboardCard } from '../../components/DashboardCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Table } from '../../components/Table';
import { RatingStars } from '../../components/RatingStars';
import { Users, Store, Star, Shield, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminDashboardApi();
      if (res.data && res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admin dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="large" text="Loading admin analytics..." />;
  if (error) return <ErrorMessage message={error} />;

  const stats = data?.statistics || { totalUsers: 0, totalStores: 0, totalRatings: 0 };
  const summaries = data?.storeOwnerSummaries || [];

  const columns = [
    {
      header: 'Store Owner',
      key: 'ownerName',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-200">{row.ownerName}</div>
          <div className="text-xs text-slate-400">{row.ownerEmail}</div>
        </div>
      )
    },
    {
      header: 'Store Name',
      key: 'storeName',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-200">{row.storeName}</div>
          <div className="text-xs text-slate-400 truncate max-w-xs">{row.storeAddress}</div>
        </div>
      )
    },
    {
      header: 'Average Rating',
      key: 'averageRating',
      render: (row) => (
        <RatingStars value={row.averageRating} readOnly size="sm" />
      )
    },
    {
      header: 'Total Ratings',
      key: 'totalRatingsCount',
      render: (row) => (
        <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-slate-300">
          {row.totalRatingsCount} {row.totalRatingsCount === 1 ? 'rating' : 'ratings'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8 text-indigo-500" /> Admin Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            System administration metrics, user management, and store rating analytics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/stores"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
          >
            <Store className="w-4 h-4" />
            <span>Manage Stores</span>
          </Link>
          <Link
            to="/admin/users"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center space-x-1.5"
          >
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <DashboardCard
          title="Total Registered Users"
          value={stats.totalUsers}
          icon={Users}
          color="indigo"
          subtitle="Admins, Store Owners & Normal Users"
        />
        <DashboardCard
          title="Total Stores"
          value={stats.totalStores}
          icon={Store}
          color="emerald"
          subtitle="Registered businesses on platform"
        />
        <DashboardCard
          title="Total User Ratings"
          value={stats.totalRatings}
          icon={Star}
          color="amber"
          subtitle="Customer reviews & feedback"
        />
      </div>

      {/* Store Owners & Rating Aggregation Summary Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Store Owner Rating Performance</h2>
          <span className="text-xs text-slate-400 font-medium">{summaries.length} Stores Total</span>
        </div>
        <Table columns={columns} data={summaries} emptyMessage="No store ratings recorded yet." />
      </div>
    </div>
  );
};

export default AdminDashboard;
