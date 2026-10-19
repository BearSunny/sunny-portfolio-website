'use client';

import React, { useState } from 'react';

interface DesktopIconProps {
  id: string;
  label: string;
  icon: string;
  onOpen: (id: string) => void;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({
  id,
  label,
  icon,
  onOpen,
}) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // Single click on mobile screen (<= 640px) or double click on desktop screen opens window
    if (window.innerWidth <= 640 || e.detail === 2) {
      onOpen(id);
    }
  };

  
  return (
    <button
      type="button"
      onClick={handleClick}
      onFocus={() => setIsSelected(true)}
      onBlur={() => setIsSelected(false)}
      className="group flex flex-col items-center justify-center w-20 p-1 rounded focus:outline-none select-none text-center cursor-pointer"
    >
      {/* Icon Image Container */}
      <div className="relative w-8 h-8 sm:w-10 sm:h-10 mb-1 shrink-0">
        <img
          src={icon}
          alt={label}
          className={`
            w-full h-full pixelated transition-transform group-hover:scale-105
            ${isSelected ? 'brightness-90 contrast-125' : ''}
          `}
        />

        {/* Windows 98 Selection Dither Mask */}
        {isSelected && (
          <div
            className="absolute inset-0 bg-[#010081] opacity-50 mix-blend-color pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#010081 50%, transparent 50%)',
              backgroundSize: '2px 2px',
            }}
          />
        )}
      </div>

      {/* Icon Label */}
      <span
        className={`
          text-xs font-pixel px-1 line-clamp-2 transition-colors
          ${
            isSelected
              ? 'bg-[#010081] text-white border border-dotted border-white/60'
              : 'text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]'
          }
        `}
      >
        {label}
      </span>
    </button>
  );
};