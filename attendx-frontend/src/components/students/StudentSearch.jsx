import React from 'react';
import { Input } from '../ui/Input';

export function StudentSearch({ value, onChange }) {
  return (
    <div className="w-full max-w-md">
      <Input
        placeholder="Filter by name, ID, or any field..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface"
      />
    </div>
  );
}
