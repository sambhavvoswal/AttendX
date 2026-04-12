import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudents } from '../hooks/useStudents';
import { useAttendance } from '../hooks/useAttendance';
import { QRScanner } from '../components/attendance/QRScanner';
import { ScannerOverlay } from '../components/attendance/ScannerOverlay';
import { ScannedCard } from '../components/attendance/ScannedCard';
import { ManualEntryPanel } from '../components/attendance/ManualEntryPanel';
import { NewStudentModal } from '../components/attendance/NewStudentModal';
import { useSheetStore } from '../store/sheetStore';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function TakeAttendance() {
  const { sheetId } = useParams();
  const navigate = useNavigate();
  const { sheets } = useSheetStore();
  const activeSheet = sheets.find(s => s.sheet_id === sheetId);

  const { 
    sessionId, 
    date, 
    scannedIds, 
    markedValues, 
    isProcessing,
    hasUnsavedChanges,
    handleStartSession, 
    validateAndMark, 
    markManually, 
    handleEndSession,
    addNewStudent
  } = useAttendance(sheetId);

  const { students, columns, fetchData, loading: studentsLoading } = useStudents(sheetId);

  const [scanMessage, setScanMessage] = useState({ text: '', type: 'info' });
  const [lastScannedStudent, setLastScannedStudent] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Warn on navigation if session unsaved
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onScan = async (rawString) => {
    const result = await validateAndMark(rawString);
    if (!result.success) {
      setScanMessage({ text: result.error, type: 'error' });
      return;
    }

    setScanMessage({ text: `Check! ${result.pkValue}`, type: 'success' });
    setLastScannedStudent({
      ...result.studentData,
      pk_value: result.pkValue
    });
    
    // Auto-clear message
    setTimeout(() => setScanMessage({ text: '', type: 'info' }), 3000);
  };

  if (!activeSheet) return <div className="p-8 text-center">Sheet not found</div>;

  return (
    <div className="flex h-screen bg-bg overflow-hidden relative">
      {/* Main Scanner Section */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Top Header */}
        <div className="p-4 border-b border-border bg-surface/50 backdrop-blur-md flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-surface-header rounded-full text-text-secondary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="font-bold text-text-primary leading-tight">{activeSheet.display_name}</h1>
              <p className="text-[10px] text-accent-primary font-black uppercase tracking-widest italic">
                {sessionId ? `Session Active: ${date}` : 'Pre-Session Setup'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowAddModal(true)}
              className="p-2 rounded-xl border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-header transition-all"
              title="Add New Student"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v8m0 0v8m0-8h8m-8 0H4" />
              </svg>
            </button>
            <button 
              onClick={() => setShowManual(!showManual)}
              className={`p-2 rounded-xl border transition-all ${showManual ? 'bg-accent-primary text-black border-accent-primary' : 'bg-surface border-border text-text-secondary hover:text-text-primary'}`}
              title="Toggle Manual List"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            {sessionId && (
              <button 
                onClick={() => handleEndSession()}
                className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all shadow-lg"
              >
                End Session
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            {!sessionId ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex items-center justify-center h-full p-6 text-center"
              >
                <div className="max-w-xs w-full p-8 rounded-3xl border border-border bg-surface shadow-2xl space-y-6">
                  <div className="w-16 h-16 bg-accent-dim/10 rounded-2xl mx-auto flex items-center justify-center text-accent-primary">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-primary mb-1 italic uppercase">Start Session</h2>
                    <p className="text-xs text-text-secondary">Pick a date to start taking attendance</p>
                  </div>
                  <input 
                    type="date"
                    className="w-full bg-surface-header border border-border rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:ring-1 focus:ring-accent-primary"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                  <button 
                    onClick={() => handleStartSession(selectedDate)}
                    disabled={isProcessing}
                    className="w-full bg-accent-primary text-black font-black uppercase text-sm py-3 rounded-xl hover:shadow-xl active:scale-95 transition-all shadow-accent-primary/20"
                  >
                    {isProcessing ? 'Starting...' : 'Go Live'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="scanner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full w-full"
              >
                <QRScanner onScan={onScan} active={!showManual}>
                  <ScannerOverlay message={scanMessage.text} type={scanMessage.type} />
                  
                  <AnimatePresence>
                    {lastScannedStudent && (
                      <ScannedCard 
                        student={lastScannedStudent} 
                        attendanceValue={markedValues[lastScannedStudent.pk_value]}
                        onDismiss={() => setLastScannedStudent(null)} 
                      />
                    )}
                  </AnimatePresence>

                  {/* Stats overlay */}
                  <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10 flex items-center gap-2 pointer-events-none">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-white text-[10px] font-bold uppercase tracking-tighter">
                      {scannedIds.length} Scanned
                    </span>
                  </div>
                </QRScanner>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Manual Roster Side Panel */}
      <AnimatePresence>
        {showManual && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full md:w-96 h-full fixed md:relative z-30"
          >
            <ManualEntryPanel 
              sheet={activeSheet}
              students={students}
              markedValues={markedValues}
              onMark={markManually}
              isProcessing={isProcessing}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <NewStudentModal 
            columns={columns.non_attendance}
            isProcessing={isProcessing}
            onCancel={() => setShowAddModal(false)}
            onSubmit={async (data) => {
              const success = await addNewStudent(data);
              if (success) {
                setShowAddModal(false);
                fetchData(); // Refresh roster
              }
            }}
          />
        )}
      </AnimatePresence>

      {studentsLoading && (
        <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-accent-dim border-t-accent-primary rounded-full animate-spin" />
              <span className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em] italic">Accessing Roster</span>
            </div>
        </div>
      )}
    </div>
  );
}
