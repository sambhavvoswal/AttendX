import { useState } from 'react';
import { motion } from 'framer-motion';

export function NewStudentModal({ columns, onSubmit, onCancel, isProcessing }) {
  const [formData, setFormData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-surface w-full max-w-sm rounded-[2rem] border border-border shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-border bg-surface-header/50">
          <h3 className="text-lg font-bold text-text-primary italic uppercase">Add New Student</h3>
          <p className="text-[10px] text-text-secondary font-medium uppercase tracking-widest">Registering into Google Sheet</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-4">
            {columns.map(col => (
              <div key={col} className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-text-secondary px-1 tracking-tighter">
                  {col}
                </label>
                <input 
                  type="text"
                  required
                  placeholder={`Enter ${col.toLowerCase()}...`}
                  className="w-full bg-surface-header border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary outline-none focus:ring-1 focus:ring-accent-primary transition-all"
                  value={formData[col] || ''}
                  onChange={(e) => setFormData({ ...formData, [col]: e.target.value })}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-xl border border-border text-xs font-bold text-text-secondary hover:bg-surface-header transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isProcessing}
              className="flex-1 px-4 py-3 rounded-xl bg-accent-primary text-black text-xs font-black uppercase shadow-lg shadow-accent-primary/20 hover:shadow-xl active:scale-95 transition-all disabled:opacity-50"
            >
              {isProcessing ? 'Adding...' : 'Add Student'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
