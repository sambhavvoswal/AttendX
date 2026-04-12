import React from 'react';

export const Select = React.forwardRef(({ label, error, options, className = '', ...props }, ref) => {
  return (
    <div className="w-full flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-text-secondary">{label}</label>}
      <select
        ref={ref}
        className={`bg-bg border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent appearance-none ${className}`}
        {...props}
      >
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
});
