import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSheet } from '../hooks/useSheet';
import { SheetCard } from '../components/sheets/SheetCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export function Dashboard() {
  const { sheets, fetchSheets, deleteSheet, isLoading } = useSheet();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sheetToDelete, setSheetToDelete] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSheets();
  }, [fetchSheets]);

  const recentSheets = useMemo(() => sheets.slice(0, 5), [sheets]);
  const filteredSheets = useMemo(() => {
    if (!search) return sheets;
    return sheets.filter(s => s.display_name.toLowerCase().includes(search.toLowerCase()));
  }, [sheets, search]);

  const handleToggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await deleteSheet(id);
    }
    setSelectedIds(new Set());
    setBulkDeleting(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="pb-24">
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="text-xs uppercase tracking-widest text-text-secondary">
            existing sheets
          </div>
          <div className="mt-2 font-['Fraunces'] text-3xl md:text-4xl tracking-tight">
            Your workspace
          </div>
        </div>
        <Button onClick={() => navigate('/sheets/new')}>
          + New Sheet
        </Button>
      </div>

      {isLoading && sheets.length === 0 ? (
        <div className="text-text-secondary">Loading your sheets...</div>
      ) : sheets.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center text-text-secondary">
          No sheets yet. Create one to get started!
        </div>
      ) : (
        <>
          {/* Recent Sheets */}
          {recentSheets.length > 0 && (
            <div className="mb-12">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Recent</h2>
              <motion.div 
                className="flex flex-col gap-3"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {recentSheets.map(s => (
                  <motion.div key={s.sheet_id} variants={itemVariants}>
                    <SheetCard 
                      sheet={s} 
                      isSelected={selectedIds.has(s.sheet_id)}
                      onToggleSelect={handleToggleSelect}
                      onDelete={(sheet) => setSheetToDelete(sheet)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {/* All Sheets */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-text-primary">All Sheets</h2>
              <div className="w-64">
                <Input 
                  placeholder="Search sheets..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            <motion.div 
              className="flex flex-col gap-3"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {filteredSheets.map(s => (
                <motion.div key={s.sheet_id} variants={itemVariants}>
                  <SheetCard 
                    sheet={s} 
                    isSelected={selectedIds.has(s.sheet_id)}
                    onToggleSelect={handleToggleSelect}
                    onDelete={(sheet) => setSheetToDelete(sheet)}
                  />
                </motion.div>
              ))}
              {filteredSheets.length === 0 && search && (
                <div className="text-text-secondary text-sm">No sheets match your search.</div>
              )}
            </motion.div>
          </div>
        </>
      )}

      {/* Bulk Delete Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4 flex justify-between items-center z-30 lg:left-[240px]">
          <span className="text-text-primary font-medium">{selectedIds.size} selected</span>
          <Button variant="danger" onClick={() => setBulkDeleting(true)}>
            Delete Selected
          </Button>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!sheetToDelete || bulkDeleting}
        onClose={() => { setSheetToDelete(null); setBulkDeleting(false); }}
        title="Remove Sheet(s)"
        message={
          bulkDeleting 
            ? `Remove ${selectedIds.size} sheets from AttendX? (This will NOT delete the Google Sheets themselves.)`
            : `Remove "${sheetToDelete?.display_name}" from AttendX? (This will NOT delete the Google Sheet itself.)`
        }
        confirmText="Remove"
        danger
        onConfirm={bulkDeleting ? handleBulkDelete : () => deleteSheet(sheetToDelete.sheet_id)}
      />
    </div>
  );
}
