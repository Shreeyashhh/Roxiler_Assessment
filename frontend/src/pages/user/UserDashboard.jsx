import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStoresApi, getRatingsApi } from '../../services/api';
import { DashboardCard } from '../../components/DashboardCard';
import { RatingStars } from '../../components/RatingStars';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Store, Star, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [myRatingsCount, setMyRatingsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await getStoresApi({ limit: 6 });
      if (res.data && res.data.success) {
        const fetchedStores = res.data.data.stores;
        setStores(fetchedStores);
        const ratedCount = fetchedStores.filter((s) => s.myRating !== null).length;
        setMyRatingsCount(ratedCount);
      }
    } catch (err) {
      console.error('Error fetching user dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="large" text="Loading user dashboard..." />;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-700/80 relative overflow-hidden bg-gradient-to-r from-indigo-950/60 to-slate-900/90">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            Normal User Dashboard
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Discover registered stores, view overall ratings from customers, and submit or update your ratings.
          </p>
          <div className="mt-6">
            <Link
              to="/user/stores"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>Explore All Stores</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <DashboardCard
          title="Available Stores"
          value={stores.length}
          icon={Store}
          color="indigo"
          subtitle="Stores ready for customer ratings"
        />
        <DashboardCard
          title="My Submitted Ratings"
          value={myRatingsCount}
          icon={Star}
          color="amber"
          subtitle="Stores you have evaluated"
        />
      </div>

      {/* Featured Stores */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Featured Stores</h2>
          <Link to="/user/stores" className="text-xs text-indigo-400 font-semibold hover:underline">
            View All ({stores.length})
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-indigo-500/50 transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-bold text-white tracking-tight">{store.name}</h3>
                  <Store className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{store.address}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Overall Rating:</span>
                  <RatingStars value={store.overallRating} readOnly size="sm" />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">My Rating:</span>
                  {store.myRating ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                      {store.myRating} / 5
                    </span>
                  ) : (
                    <span className="text-slate-500 italic">Not rated yet</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
