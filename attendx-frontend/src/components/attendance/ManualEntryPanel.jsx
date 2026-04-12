import { useState, useMemo } from 'react';
import { groupStudentsBy } from '../../utils/groupBy';
import { StudentRow } from './StudentRow';

export function ManualEntryPanel({ 
  sheet, 
  students, 
  markedValues, 
  onMark, 
  isProcessing 
}) {
  const [groupingKey, setGroupingKey] = useState('');
  const [search, setSearch] = useState('');

  const pkColumn = sheet?.primary_key_column;
  const attendanceValues = sheet?.attendance_values || [];

  const groupedStudents = useMemo(() => {
    let filtered = students;
    if (search) {
      const s = search.toLowerCase();
      filtered = students.filter(p => 
        p.Name?.toLowerCase().includes(s) || 
        p.name?.toLowerCase().includes(s) || 
        String(p[pkColumn] || '').includes(s)
      );
    }
    return groupStudentsBy(filtered, groupingKey);
  }, [students, groupingKey, search, pkColumn]);

  return (
    <div className="flex flex-col h-full bg-surface border-l border-border shadow-2xl">
      <div className="p-4 border-b border-border bg-surface-header/50 backdrop-blur-md sticky top-0 z-10">
        <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354l1.102 1.411 1.411-1.102L13.111 2 12 4.354zM7 7.5L5.5 6 6 5.5 7.5 7M4.354 12l1.411 1.102-1.102 1.411L2 13.111 4.354 12zM17 19.5l1.5 1.5-.5.5-1.5-1.5M19.646 12l-1.411-1.102 1.102-1.411L22 10.889 19.646 12z" />
          </svg>
          Manual Entry
        </h3>
        
        <div className="space-y-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search by name or ID..."
              className="w-full bg-surface-header border border-border rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-accent-primary outline-none text-text-primary pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg className="w-4 h-4 text-text-secondary absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-text-secondary px-1">Group By:</span>
            <select 
              className="bg-surface-header border border-border rounded-lg px-2 py-1 text-[10px] outline-none text-text-primary cursor-pointer hover:bg-surface transition-colors"
              value={groupingKey}
              onChange={(e) => setGroupingKey(e.target.value)}
            >
              <option value="">None</option>
              {Object.keys(students[0] || {}).filter(k => k !== pkColumn && k !== 'Name' && k !== 'name').map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4">
        {Object.entries(groupedStudents).map(([group, people]) => (
          <div key={group} className="mb-6">
            <h4 className="text-[10px] uppercase font-black tracking-widest text-text-secondary mb-3 px-2 flex items-center gap-2 overflow-hidden after:content-[''] after:h-px after:bg-border after:flex-1">
              {group} ({people.length})
            </h4>
            <div className="space-y-1">
              {people.map((student) => (
                <StudentRow 
                  key={student[pkColumn]} 
                  student={student} 
                  pkColumn={pkColumn}
                  attendanceValues={attendanceValues}
                  currentValue={markedValues[student[pkColumn]]}
                  onMark={onMark}
                  isProcessing={isProcessing}
                />
              ))}
            </div>
          </div>
        ))}
        {students.length === 0 && (
          <div className="text-center py-12 px-4 italic text-text-secondary text-sm">
            Roster is empty. Connect a sheet with data.
          </div>
        )}
      </div>
    </div>
  );
}
