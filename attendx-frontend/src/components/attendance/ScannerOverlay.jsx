import { motion, AnimatePresence } from 'framer-motion';

export function ScannerOverlay({ message, type = 'info' }) {
  if (!message) return null;

  const colors = {
    success: 'bg-green-500/90 text-white',
    error: 'bg-red-500/90 text-white',
    info: 'bg-accent/90 text-white',
  };

  return (
    <div className="absolute inset-x-0 top-10 flex justify-center px-4 pointer-events-none z-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`px-6 py-3 rounded-full shadow-2xl backdrop-blur-md font-medium text-sm border border-white/20 ${colors[type]}`}
        >
          {message}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
