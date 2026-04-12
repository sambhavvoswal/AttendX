import { AttendanceValueButtons } from './AttendanceValueButtons';

export function StudentRow({ student, pkColumn, attendanceValues, currentValue, onMark, isProcessing }) {
  const pkValue = student[pkColumn];
  const name = student.Name || student.name || 'Unknown student';

  return (
    <div className="flex items-center gap-4 py-3 px-2 border-b border-border hover:bg-surface-header/50 transition-colors">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent-dim/20 text-accent-primary font-bold text-sm shrink-0 uppercase italic">
        {name.charAt(0)}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-text-primary truncate">{name}</h4>
        <p className="text-[10px] text-text-secondary font-mono tracking-tight uppercase">
          ID: {pkValue}
        </p>
      </div>

      <div className="shrink-0 flex items-center gap-3">
        <AttendanceValueButtons 
          values={attendanceValues} 
          currentValue={currentValue}
          onSelect={(val) => onMark(pkValue, val)}
          disabled={isProcessing}
        />
        
        {currentValue && (
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500/20 text-green-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
