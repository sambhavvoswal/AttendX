import { motion } from 'framer-motion';

export function ScannedCard({ student, attendanceValue, onDismiss }) {
  if (!student) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-24 inset-x-4 bg-surface/90 backdrop-blur-xl border border-border p-5 rounded-3xl shadow-2xl z-20 md:max-w-md md:mx-auto"
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-accent-dim/30 flex items-center justify-center text-accent-primary font-bold text-xl uppercase italic">
          {student.name?.charAt(0) || student.roll_no?.charAt(0) || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-text-primary truncate">
            {student.name || 'Unknown Student'}
          </h3>
          <p className="text-sm text-text-secondary font-mono">
            ID: {student.roll_no || student.pk_value || 'None'}
          </p>
          <div className="flex gap-2 mt-2">
            {student.batch && (
              <span className="px-2 py-0.5 rounded-md bg-surface-header border border-border text-[10px] uppercase font-bold text-text-secondary tracking-wider">
                {student.batch}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/20 text-[10px] uppercase font-bold text-green-500 tracking-wider">
              Marked {attendanceValue}
            </span>
          </div>
        </div>
        <button 
          onClick={onDismiss}
          className="p-2 hover:bg-surface-header rounded-full transition-colors text-text-secondary"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
