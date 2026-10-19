'use client';

import React, { ReactNode, CSSProperties } from 'react';
import { Button } from './Button';

interface ModalProps {
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  position?: 'center' | 'bottom-right';
  style?: CSSProperties; // Allow custom inline style override
}

export const Modal: React.FC<ModalProps> = ({
  title = 'Dialog',
  isOpen,
  onClose,
  children,
  position = 'center',
  style,
}) => {
  if (!isOpen) return null;

  const containerClasses =
    position === 'bottom-right'
      ? 'fixed right-6 z-50 p-2 pointer-events-auto' // Removed hardcoded bottom-6
      : 'fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4';

  return (
    <div
      className={containerClasses}
      style={{
        ...(position === 'bottom-right' && { bottom: '50px' }), // Default fallback if no style provided
        ...style,
      }}
    >
      <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-black border-b-black shadow-2xl w-full max-w-sm flex flex-col select-none">
        {/* Titlebar */}
        <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center text-xs font-bold cursor-default">
          <span>{title}</span>
          <button
            type="button"
            onClick={onClose}
            className="w-4 h-4 bg-[#c0c0c0] text-black border border-t-white border-l-white border-r-black border-b-black font-mono text-[10px] flex items-center justify-center hover:bg-[#d4d4d4]"
          >
            <img
              src="/icons/x_icon.svg"
              alt="Close icon"
              className="w-3 h-3"
            />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 text-xs sm:text-sm text-black flex flex-col gap-3">
          {children}
          <div className="flex justify-end gap-2 mt-2">
            <Button onClick={onClose}>OK</Button>
          </div>
        </div>
      </div>
    </div>
  );
};