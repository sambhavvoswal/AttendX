import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSheet } from '../hooks/useSheet';
import { DragList } from '../components/ui/DragList';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ColorSwatch } from '../components/ui/ColorSwatch';
import { MAX_ATTENDANCE_VALUES, MIN_ATTENDANCE_VALUES } from '../constants';

export function SheetSettings() {
  const { sheetId } = useParams();
  const { loadSheet, activeSheet, updateAttendanceValues } = useSheet();
  const [values, setValues] = useState([]);
  
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newColor, setNewColor] = useState('blue');
  const [isPositive, setIsPositive] = useState(true);

  useEffect(() => {
    loadSheet(sheetId).then(sheet => {
      if(sheet) setValues(sheet.attendance_values || []);
    });
  }, [sheetId, loadSheet]);

  const handleAdd = () => {
    if (!newLabel || !newValue) return;
    if (values.length >= MAX_ATTENDANCE_VALUES) return;
    const item = { label: newLabel, value: newValue, color: newColor, is_positive: isPositive };
    setValues([...values, item]);
    setNewLabel(''); setNewValue('');
  };

  const handleRemove = (valToRemove) => {
    if (values.length <= MIN_ATTENDANCE_VALUES) return;
    setValues(values.filter(v => v.value !== valToRemove.value));
  };

  const handleSave = async () => {
     try {
       await updateAttendanceValues(sheetId, values);
       alert("Saved successfully!");
     } catch (e) {
       console.error(e);
     }
  };

  const isValid = values.length >= MIN_ATTENDANCE_VALUES && 
                  values.some(v => v.is_positive) && 
                  values.some(v => !v.is_positive);

  if (!activeSheet) return <div className="text-text-secondary">Loading settings...</div>;

  return (
    <div className="pb-24 max-w-3xl mx-auto">
      <Link to={`/sheets/${sheetId}/students`} className="text-accent hover:underline text-sm mb-4 inline-block">&larr; Back to {activeSheet.display_name}</Link>
      <h1 className="font-['Fraunces'] text-3xl mb-8">Sheet Settings</h1>

      <div className="bg-surface border border-border p-6 rounded-2xl mb-8">
         <h2 className="text-xl font-semibold mb-4">Attendance Values</h2>
         <p className="text-text-secondary mb-6 text-sm">
           Configure the distinct values inserted into your Google Sheet to represent attendance statuses. 
           Must contain at least 1 positive and 1 negative value.
         </p>

         <div className="mb-6">
          <DragList 
            items={values} 
            onReorder={setValues}
            renderItem={(item) => (
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full bg-${item.color}`} />
                  <span className="font-semibold">{item.label} ({item.value})</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-text-secondary border border-border">
                    {item.is_positive ? '+ Positive' : '- Negative'}
                  </span>
                </div>
                <button 
                  type="button" 
                  onClick={() => handleRemove(item)}
                  disabled={values.length <= MIN_ATTENDANCE_VALUES}
                  className="p-1 px-2 text-text-secondary hover:text-danger hover:bg-surface rounded disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            )}
          />
        </div>

        {values.length < MAX_ATTENDANCE_VALUES && (
          <div className="p-4 bg-bg border border-border rounded-lg grid grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-6">
             <Input label="Label" value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="e.g. Leave" />
             <Input label="Value" value={newValue} onChange={e=>setNewValue(e.target.value)} placeholder="e.g. L" maxLength={3} />
             <div className="col-span-2 lg:col-span-2">
               <label className="text-sm font-medium text-text-secondary mb-1 block">Color Marker</label>
               <ColorSwatch value={newColor} onChange={setNewColor} />
             </div>
             <div className="col-span-2 lg:col-span-4 flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={isPositive} onChange={e=>setIsPositive(e.target.checked)} className="w-4 h-4 accent-accent" />
                  <span className="text-sm">Counts positively toward attendance percentage</span>
                </div>
                <Button variant="secondary" onClick={handleAdd}>Add</Button>
             </div>
          </div>
        )}

        <div className="pt-6 border-t border-border flex justify-end">
           <Button onClick={handleSave} disabled={!isValid}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
