import React from 'react';
import { AlertCircle } from 'lucide-react';

export const ErrorMessage = ({ title = 'Error', message, errors = [] }) => {
  if (!message && (!errors || errors.length === 0)) return null;

  return (
    <div className="bg-rose-950/60 border border-rose-800/60 text-rose-200 rounded-xl p-4 my-4 flex items-start space-x-3 shadow-lg">
      <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 text-sm">
        {title && <h4 className="font-semibold text-rose-300 mb-1">{title}</h4>}
        {message && <p>{message}</p>}
        {errors && errors.length > 0 && (
          <ul className="list-disc list-inside mt-2 space-y-1 text-xs text-rose-300/90">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
