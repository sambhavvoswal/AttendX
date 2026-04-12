import React, { useState } from 'react';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Select } from '../../ui/Select';
import { DragList } from '../../ui/DragList';
import { ColorSwatch } from '../../ui/ColorSwatch';
import { Badge } from '../../ui/Badge';
import { MAX_ATTENDANCE_VALUES, MIN_ATTENDANCE_VALUES } from '../../../constants';
import api from '../../../services/api';

export function StepConnectSheet({ data, updateData, nextStep }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!data.sheet_url.includes('docs.google.com/spreadsheets/')) {
      setError('Must be a valid Google Sheet URL.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/sheets/verify-access', { sheet_url: data.sheet_url });
      if (!res.data.writable) {
        setError('Service account does not have Editor access to this sheet. Please share it with the service account email.');
        return;
      }
      updateData({ _columns: res.data.columns || [] });
      nextStep();
    } catch (err) {
      setError(err.response?.data?.detail || 'Cannot verify sheet access. Check the URL and sharing permissions.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 mb-6">
        <p className="text-text-secondary mb-6">Paste the URL of your Google Sheet. Ensure it's shared with the service account email as Editor.</p>
        <Input 
          label="Google Sheet URL"
          placeholder="https://docs.google.com/spreadsheets/d/..."
          value={data.sheet_url}
          onChange={(e) => updateData({ sheet_url: e.target.value })}
          error={error}
        />
      </div>
      <div className="flex justify-end pt-4 border-t border-border">
        <Button onClick={handleNext} disabled={!data.sheet_url || loading}>
          {loading ? 'Verifying...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}

export function StepNameSheet({ data, updateData, nextStep, prevStep }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 mb-6">
        <Input 
          label="Display Name"
          placeholder="e.g., SE Morning Batch 2024"
          value={data.display_name}
          onChange={(e) => updateData({ display_name: e.target.value })}
        />
      </div>
      <div className="flex justify-between pt-4 border-t border-border">
        <Button variant="ghost" onClick={prevStep}>Back</Button>
        <Button onClick={nextStep} disabled={!data.display_name}>Continue</Button>
      </div>
    </div>
  );
}

export function StepSetPK({ data, updateData, nextStep, prevStep }) {
  // Use columns fetched from the actual Google Sheet
  const cols = data._columns || [];
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 mb-6">
        <p className="text-text-secondary mb-6">Select the column that corresponds to the student's unique identifier (e.g., Roll No).</p>
        {cols.length === 0 ? (
          <div className="text-amber-400 text-sm bg-amber-400/10 border border-amber-400/30 rounded-lg p-3">
            No columns found in this sheet. Make sure the first row has headers.
          </div>
        ) : (
          <Select 
            label="Primary Key Column"
            value={data.primary_key_column}
            onChange={(e) => updateData({ primary_key_column: e.target.value })}
            options={[{label: 'Select a column...', value: ''}, ...cols.map(c => ({label: c, value: c}))]}
          />
        )}
      </div>
      <div className="flex justify-between pt-4 border-t border-border">
        <Button variant="ghost" onClick={prevStep}>Back</Button>
        <Button onClick={nextStep} disabled={!data.primary_key_column}>Continue</Button>
      </div>
    </div>
  );
}

export function StepMapQR({ data, updateData, nextStep, prevStep }) {
  // Build initial mapping from existing data or empty
  const cols = data._columns || [];
  const pk = data.primary_key_column;
  const [mapping, setMapping] = useState(() => {
    // Initialize with existing mapping or default
    if (data.qr_key_mapping && Object.keys(data.qr_key_mapping).length > 0) {
      return data.qr_key_mapping;
    }
    // Auto-map: set the PK column with a default key
    const auto = {};
    if (pk) {
      auto[pk.toLowerCase().replace(/\s+/g, '_')] = pk;
    }
    return auto;
  });

  const [newJsonKey, setNewJsonKey] = useState('');
  const [newColHeader, setNewColHeader] = useState('');

  const handleAddMapping = () => {
    if (!newJsonKey || !newColHeader) return;
    const updated = { ...mapping, [newJsonKey]: newColHeader };
    setMapping(updated);
    updateData({ qr_key_mapping: updated });
    setNewJsonKey('');
    setNewColHeader('');
  };

  const handleRemoveKey = (key) => {
    const updated = { ...mapping };
    delete updated[key];
    setMapping(updated);
    updateData({ qr_key_mapping: updated });
  };

  const handleNext = () => {
    updateData({ qr_key_mapping: mapping });
    nextStep();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 mb-6">
        <p className="text-text-secondary mb-4">
          Map the JSON keys from your QR code to the column headers in your Google Sheet.
          At minimum, map the key that represents the student ID to your Primary Key column (<strong>{pk}</strong>).
        </p>

        {/* Current mappings */}
        {Object.keys(mapping).length > 0 && (
          <div className="space-y-2 mb-4">
            {Object.entries(mapping).map(([jsonKey, colHeader]) => (
              <div key={jsonKey} className="flex items-center justify-between bg-surface-header border border-border rounded-lg px-3 py-2 text-sm">
                <span><code className="text-accent">{jsonKey}</code> → <strong>{colHeader}</strong></span>
                <button onClick={() => handleRemoveKey(jsonKey)} className="text-text-secondary hover:text-red-400 text-xs">Remove</button>
              </div>
            ))}
          </div>
        )}

        {/* Add new mapping */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-bg border border-border rounded-lg">
          <Input 
            label="QR JSON Key" 
            placeholder="e.g., roll_no" 
            value={newJsonKey} 
            onChange={(e) => setNewJsonKey(e.target.value)} 
          />
          <Select
            label="Sheet Column"
            value={newColHeader}
            onChange={(e) => setNewColHeader(e.target.value)}
            options={[{label: 'Select...', value: ''}, ...cols.map(c => ({label: c, value: c}))]}
          />
          <div className="col-span-2 text-right">
            <Button variant="secondary" onClick={handleAddMapping} disabled={!newJsonKey || !newColHeader}>Add Mapping</Button>
          </div>
        </div>
      </div>
      <div className="flex justify-between pt-4 border-t border-border">
        <Button variant="ghost" onClick={prevStep}>Back</Button>
        <Button onClick={handleNext} disabled={Object.keys(mapping).length === 0}>Continue</Button>
      </div>
    </div>
  );
}

export function StepAttendanceValues({ data, updateData, nextStep, prevStep }) {
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newColor, setNewColor] = useState('blue');
  const [isPositive, setIsPositive] = useState(true);

  const values = data.attendance_values || [];

  const handleAdd = () => {
    if (!newLabel || !newValue) return;
    if (values.length >= MAX_ATTENDANCE_VALUES) return;
    const item = { label: newLabel, value: newValue, color: newColor, is_positive: isPositive };
    updateData({ attendance_values: [...values, item] });
    setNewLabel(''); setNewValue('');
  };

  const handleRemove = (valToRemove) => {
    if (values.length <= MIN_ATTENDANCE_VALUES) return;
    updateData({ attendance_values: values.filter(v => v.value !== valToRemove.value) });
  };

  const isValid = values.length >= MIN_ATTENDANCE_VALUES && 
                  values.some(v => v.is_positive) && 
                  values.some(v => !v.is_positive);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 mb-6">
        <p className="text-text-secondary mb-4">Define the letters/values logged into the Sheet columns. (Min 2, Max 8, Must have at least 1 positive and 1 negative).</p>
        
        <div className="mb-6">
          <DragList 
            items={values} 
            onReorder={(newOrder) => updateData({ attendance_values: newOrder })}
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
          <div className="p-4 bg-bg border border-border rounded-lg grid grid-cols-2 gap-4">
             <Input label="Label" value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="e.g. Late" />
             <Input label="Value" value={newValue} onChange={e=>setNewValue(e.target.value)} placeholder="e.g. L" maxLength={3} />
             <div className="col-span-2">
               <label className="text-sm font-medium text-text-secondary mb-1 block">Color Marker</label>
               <ColorSwatch value={newColor} onChange={setNewColor} />
             </div>
             <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" checked={isPositive} onChange={e=>setIsPositive(e.target.checked)} className="w-4 h-4 accent-accent" />
                <span className="text-sm">Counts positively toward attendance percentage</span>
             </div>
             <div className="col-span-2 text-right">
                <Button variant="secondary" onClick={handleAdd}>Add Value</Button>
             </div>
          </div>
        )}
      </div>
      <div className="flex justify-between pt-4 border-t border-border">
        <Button variant="ghost" onClick={prevStep}>Back</Button>
        <Button onClick={nextStep} disabled={!isValid}>Continue</Button>
      </div>
    </div>
  );
}

export function StepConfirm({ data, onSubmit, prevStep }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 mb-6 space-y-4">
        <div className="p-4 bg-surface rounded-lg border border-border">
          <div className="text-xs text-text-secondary uppercase mb-1">Sheet Name</div>
          <div className="font-medium text-lg">{data.display_name}</div>
        </div>
        <div className="p-4 bg-surface rounded-lg border border-border flex flex-col gap-2">
          <div><span className="text-text-secondary mr-2">URL:</span> <span className="text-xs truncate">{data.sheet_url}</span></div>
          <div><span className="text-text-secondary mr-2">Primary Key:</span> {data.primary_key_column}</div>
        </div>
      </div>
      <div className="flex justify-between pt-4 border-t border-border">
        <Button variant="ghost" onClick={prevStep}>Back</Button>
        <Button onClick={onSubmit}>Create Sheet</Button>
      </div>
    </div>
  );
}
