import React from 'react';

export const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  helpText,
  ...props
}) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={name} className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-2.5 bg-slate-900 border ${
          error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-700/80 focus:ring-indigo-500'
        } focus:border-indigo-500 focus:ring-1 text-slate-100 placeholder-slate-500 rounded-xl text-sm transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
        {...props}
      />
      {helpText && !error && <p className="text-xs text-slate-500">{helpText}</p>}
      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
    </div>
  );
};

export const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  required = false,
  disabled = false,
  placeholder = 'Select an option'
}) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={name} className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-2.5 bg-slate-900 border ${
          error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-700/80 focus:ring-indigo-500'
        } focus:border-indigo-500 focus:ring-1 text-slate-100 rounded-xl text-sm transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
    </div>
  );
};

export const FormTextArea = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  rows = 3,
  required = false
}) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={name} className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 bg-slate-900 border ${
          error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-700/80 focus:ring-indigo-500'
        } focus:border-indigo-500 focus:ring-1 text-slate-100 placeholder-slate-500 rounded-xl text-sm transition-all outline-none resize-none`}
      />
      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
    </div>
  );
};

export const Form = ({ children, onSubmit, className = '' }) => {
  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
      {children}
    </form>
  );
};
