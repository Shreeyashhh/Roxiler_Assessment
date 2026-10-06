import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Store,
  Users,
  Star,
  UserCheck,
  KeyRound,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, isStoreOwner, isNormalUser } = useAuth();

  const getNavLinks = () => {
    if (isAdmin) {
      return [
        { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/admin/stores', label: 'Stores Management', icon: Store },
        { to: '/admin/users', label: 'Users Management', icon: Users },
        { to: '/admin/ratings', label: 'Owner Ratings', icon: Star }
      ];
    }

    if (isStoreOwner) {
      return [
        { to: '/store-owner/dashboard', label: 'Store Overview', icon: LayoutDashboard },
        { to: '/store-owner/ratings', label: 'Customer Ratings', icon: Star },
        { to: '/store-owner/profile', label: 'Account & Password', icon: KeyRound }
      ];
    }

    if (isNormalUser) {
      return [
        { to: '/user/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/user/stores', label: 'Explore Stores', icon: Store },
        { to: '/user/profile', label: 'Account & Password', icon: KeyRound }
      ];
    }

    return [];
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between md:hidden pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Navigation</span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {user && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 m-3 rounded-xl">
            <div className="text-xs text-slate-400 truncate font-medium">Logged in as</div>
            <div className="text-sm font-bold text-slate-200 truncate">{user.email}</div>
          </div>
        )}
      </aside>
    </>
  );
};
