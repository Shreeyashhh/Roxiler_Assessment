import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStoreOwnerDashboardApi } from '../../services/api';
import { DashboardCard } from '../../components/DashboardCard';
import { RatingStars } from '../../components/RatingStars';
import { Table } from '../../components/Table';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Store, Star, Users, Award } from 'lucide-react';

export const StoreOwnerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStoreOwnerDashboard();
  }, []);

  const fetchStoreOwnerDashboard = async () => {
    setLoading(true);
    try {
      const res = await getStoreOwnerDashboardApi();
      if (res.data && res.data.success) {
        setDashboardData(res.data.data.stores || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch store owner dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="large" text="Loading store owner analytics..." />;
  if (error) return <ErrorMessage message={error} />;

  const columns = [
    {
      header: 'Customer Name',
      key: 'userName',
      render: (row) => <span className="font-bold text-slate-100">{row.userName}</span>
    },
    {
      header: 'Customer Email',
      key: 'userEmail',
      render: (row) => <span className="text-slate-300 text-xs">{row.userEmail}</span>
    },
    {
      header: 'Rating Score',
      key: 'rating',
      render: (row) => <RatingStars value={row.rating} readOnly size="sm" />
    },
    {
      header: 'Rating Date',
      key: 'createdAt',
      render: (row) => (
        <span className="text-xs text-slate-400">
          {new Date(row.createdAt).toLocaleDateString()} {new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Store className="w-6 h-6 text-amber-400" /> Store Owner Dashboard
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor your store performance, average customer ratings, and user reviews
        </p>
      </div>

      {dashboardData.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center text-slate-400">
          <p>No stores are currently assigned to your account.</p>
        </div>
      ) : (
        dashboardData.map((store) => (
          <div key={store.storeId} className="space-y-6">
            {/* Store Overview Card */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 bg-gradient-to-r from-slate-900 to-indigo-950/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Owned Store</span>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1">{store.storeName}</h2>
                  <p className="text-xs text-slate-400 mt-1">{store.storeAddress} | {store.storeEmail}</p>
                </div>
                <div className="flex items-center space-x-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Rating</div>
                    <div className="text-2xl font-extrabold text-amber-400">{store.averageRating} / 5.0</div>
                  </div>
                  <RatingStars value={store.averageRating} readOnly size="lg" showNumber={false} />
                </div>
              </div>

              {/* Stats Sub-row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800">
                <DashboardCard
                  title="Average Calculated Rating"
                  value={`${store.averageRating} Stars`}
                  icon={Star}
                  color="amber"
                  subtitle="Dynamic aggregation from ratings table"
                />
                <DashboardCard
                  title="Total Ratings Received"
                  value={store.totalRatingsCount}
                  icon={Users}
                  color="emerald"
                  subtitle="Unique customer ratings submitted"
                />
              </div>
            </div>

            {/* User Ratings Breakdown Table */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white tracking-tight">Customer Rating Submissions</h3>
              <Table
                columns={columns}
                data={store.ratings}
                emptyMessage="No ratings have been submitted for this store yet."
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default StoreOwnerDashboard;
