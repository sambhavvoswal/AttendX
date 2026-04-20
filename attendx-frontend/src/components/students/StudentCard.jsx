import React from 'react';
import { Badge } from '../ui/Badge';
import { motion } from 'framer-motion';

import { calcAttendancePercent } from '../../utils/attendanceCalc';

export function StudentCard({ student, primaryKey, rank, attendanceConfig }) {
  const pkValue = student[primaryKey] || 'N/A';
  const entries = Object.entries(student).filter(([k]) => k !== primaryKey);
  
  const percentage = calcAttendancePercent(student, attendanceConfig);

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-surface border border-border rounded-xl p-4 flex gap-4 items-center transition-colors hover:border-[#666]"
    >
      <div className="font-['Fraunces'] text-xl text-text-secondary w-8 text-center bg-bg rounded-lg py-1">
        #{rank}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
           <div className="text-lg font-bold text-text-primary mr-2 truncate">
             {pkValue}
           </div>
           <Badge percentage={percentage} />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary">
          {entries.map(([k, v]) => (
            <span key={k} className="truncate max-w-[200px]">
              <span className="font-medium mr-1">{k}:</span> {v}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
