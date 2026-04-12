import { TAILWIND_SAFE_BG } from '../../constants';

export function AttendanceValueButtons({ values, currentValue, onSelect, disabled }) {
  if (!values?.length) return null;

  return (
    <div className="flex gap-2">
      {values.map((v) => {
        const isActive = currentValue === v.value;
        const colorClass = TAILWIND_SAFE_BG[v.color] || 'bg-slate-500';

        return (
          <button
            key={v.value}
            disabled={disabled}
            onClick={() => onSelect(v.value)}
            className={`
              relative w-10 h-10 rounded-xl font-bold transition-all text-xs
              ${isActive 
                ? `${colorClass} text-white shadow-lg ring-2 ring-offset-2 ring-offset-bg ring-accent/30` 
                : 'bg-surface-header border border-border text-text-secondary hover:text-text-primary hover:bg-surface'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title={v.label}
          >
            {v.value}
            {isActive && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
