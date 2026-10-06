import React from 'react';

export const DashboardCard = ({ title, value, icon: Icon, color = 'indigo', subtitle }) => {
  const colorStyles = {
    indigo: {
      bg: 'bg-indigo-950/40 border-indigo-800/40',
      iconBg: 'bg-indigo-600/20 text-indigo-400',
      text: 'text-indigo-400'
    },
    emerald: {
      bg: 'bg-emerald-950/40 border-emerald-800/40',
      iconBg: 'bg-emerald-600/20 text-emerald-400',
      text: 'text-emerald-400'
    },
    amber: {
      bg: 'bg-amber-950/40 border-amber-800/40',
      iconBg: 'bg-amber-600/20 text-amber-400',
      text: 'text-amber-400'
    },
    sky: {
      bg: 'bg-sky-950/40 border-sky-800/40',
      iconBg: 'bg-sky-600/20 text-sky-400',
      text: 'text-sky-400'
    },
    purple: {
      bg: 'bg-purple-950/40 border-purple-800/40',
      iconBg: 'bg-purple-600/20 text-purple-400',
      text: 'text-purple-400'
    }
  };

  const currentStyle = colorStyles[color] || colorStyles.indigo;

  return (
    <div className={`p-6 rounded-2xl border ${currentStyle.bg} glass-card relative overflow-hidden group`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-4 rounded-xl ${currentStyle.iconBg} transform group-hover:scale-110 transition-transform`}>
            <Icon className="w-8 h-8" />
          </div>
        )}
      </div>
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/5 blur-xl pointer-events-none group-hover:bg-white/10 transition-colors" />
    </div>
  );
};
