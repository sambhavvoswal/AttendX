import React from 'react';
import { COLOR_OPTIONS } from '../../constants';

export function ColorSwatch({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_OPTIONS.map((color) => (
        <button
          key={color.name}
          type="button"
          onClick={() => onChange(color.name)}
          title={color.name}
          className={`w-8 h-8 rounded-full border-2 transition-transform ${
            value === color.name ? 'border-text-primary scale-110' : 'border-transparent hover:scale-105'
          }`}
          style={{ backgroundColor: color.hex }}
        />
      ))}
    </div>
  );
}
