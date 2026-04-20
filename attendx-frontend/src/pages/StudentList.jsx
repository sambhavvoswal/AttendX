import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStudents } from '../hooks/useStudents';
import { useSheet } from '../hooks/useSheet';
import { StudentSearch } from '../components/students/StudentSearch';
import { StudentCard } from '../components/students/StudentCard';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';

export function StudentList() {
  const { sheetId } = useParams();
  const { loadSheet, activeSheet } = useSheet();
  const { students, searchQuery, setSearchQuery, fetchData, isLoading } = useStudents(sheetId);
  
  useEffect(() => {
    loadSheet(sheetId);
    fetchData();
  }, [sheetId, loadSheet, fetchData]);

  if (isLoading || !activeSheet) {
    return <div className="text-text-secondary">Loading students...</div>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="pb-24">
      <div className="mb-8">
        <Link to="/dashboard" className="text-accent hover:underline text-sm mb-4 inline-block">&larr; Back to Dashboard</Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-text-secondary">
              student roster
            </div>
            <h1 className="mt-2 font-['Fraunces'] text-3xl md:text-4xl tracking-tight">
              {activeSheet.display_name}
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <Link to={`/sheets/${sheetId}/settings`}>
               <Button variant="secondary">⚙️ Settings</Button>
             </Link>
             <Link to={`/sheets/${sheetId}/attendance`}>
               <Button variant="primary">Add Logs</Button>
             </Link>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
         <StudentSearch value={searchQuery} onChange={setSearchQuery} />
         <div className="text-sm font-semibold text-text-secondary">{students.length} students</div>
      </div>

      <motion.div 
        className="flex flex-col gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
         {students.map((student, idx) => (
           <motion.div key={idx} variants={itemVariants}>
             <StudentCard 
               student={student} 
               primaryKey={activeSheet.primary_key_column} 
               rank={idx + 1}
               attendanceConfig={activeSheet.attendance_values || []}
             />
           </motion.div>
         ))}
         {students.length === 0 && (
           <div className="text-center py-12 text-text-secondary border border-border rounded-xl bg-surface">
             No students found. Add rows to your Google Sheet!
           </div>
         )}
      </motion.div>
    </div>
  );
}
