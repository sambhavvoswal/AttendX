import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export function SheetCard({ sheet, isSelected, onToggleSelect, onDelete }) {
  // Graceful fallback for timestamp parsing
  let createdStr = '--/--/--';
  let modifiedStr = '--/--/--';
  try {
    if (sheet.created_at) createdStr = format(new Date(sheet.created_at), 'dd/MM/yy');
    if (sheet.last_accessed) modifiedStr = format(new Date(sheet.last_accessed), 'dd/MM/yy');
  } catch (e) {
    // Ignore invalid dates
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="bg-surface border border-border rounded-full py-3 px-5 flex items-center gap-4 transition-colors hover:border-[#666]"
    >
      <input
        type="checkbox"
        className="w-5 h-5 accent-accent shrink-0 cursor-pointer"
        checked={isSelected}
        onChange={() => onToggleSelect(sheet.sheet_id)}
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-['Fraunces'] text-xl truncate text-text-primary mr-4">
            {sheet.display_name}
          </h3>
          <div className="flex items-center gap-4 text-sm font-medium shrink-0">
            <Link to={`/sheets/${sheet.sheet_id}/students`} className="text-text-primary hover:text-accent transition-colors">
              view
            </Link>
            <Link to={`/sheets/${sheet.sheet_id}/attendance`} className="text-accent hover:text-accent-hover transition-colors">
              add+
            </Link>
            <button
               type="button"
               onClick={() => onDelete(sheet)}
               className="text-danger hover:opacity-80 p-1 bg-transparent border-none"
               title="Delete Sheet"
            >
              🗑️
            </button>
          </div>
        </div>
        <div className="flex gap-4 text-xs text-text-secondary mt-1">
          <span>created: {createdStr}</span>
          <span>modified: {modifiedStr}</span>
        </div>
      </div>
    </motion.div>
  );
}
