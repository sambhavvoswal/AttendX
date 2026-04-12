import React from 'react';

export const Button = React.forwardRef(({ children, className = '', variant = 'primary', ...props }, ref) => {
  const base = "inline-flex items-center justify-center font-medium transition-colors rounded-lg px-4 py-2 disabled:opacity-50 disabled:pointer-events-none";
  let variantClasses = "";
  if (variant === 'primary') variantClasses = "bg-accent hover:bg-accent-hover text-black";
  else if (variant === 'secondary') variantClasses = "bg-surface hover:bg-[#333] border border-border text-text-primary";
  else if (variant === 'danger') variantClasses = "bg-danger hover:opacity-90 text-white";
  else if (variant === 'ghost') variantClasses = "hover:bg-surface text-text-secondary hover:text-text-primary";
  
  return (
    <button ref={ref} className={`${base} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
});
