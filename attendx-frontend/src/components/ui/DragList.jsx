import React from 'react';
import { Reorder } from 'framer-motion';

export function DragList({ items, onReorder, renderItem }) {
  return (
    <Reorder.Group axis="y" values={items} onReorder={onReorder} className="flex flex-col gap-2">
      {items.map((item) => (
        <Reorder.Item
          key={item.id || item.value}
          value={item}
          className="bg-surface border border-border p-3 rounded-lg flex items-center gap-3 cursor-grab active:cursor-grabbing"
        >
          {/* Drag Handle Icon (SVG) */}
          <div className="text-text-secondary cursor-grab p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="5" r="1" />
              <circle cx="9" cy="12" r="1" />
              <circle cx="9" cy="19" r="1" />
              <circle cx="15" cy="5" r="1" />
              <circle cx="15" cy="12" r="1" />
              <circle cx="15" cy="19" r="1" />
            </svg>
          </div>
          <div className="flex-1 w-full">
            {renderItem(item)}
          </div>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}
