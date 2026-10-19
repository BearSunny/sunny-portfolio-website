'use client';

import React, { CSSProperties, ReactNode } from 'react';

interface WindowProps {
  id: string;
  title: string;
  icon?: string;
  isOpen: boolean;
  isMinimized?: boolean;
  isActive?: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  onFocus?: () => void;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export const Window: React.FC<WindowProps> = ({
  title,
  icon,
  isOpen,
  isMinimized,
  isActive = true,
  onClose,
  onMinimize,
  onFocus,
  className = '',
  style,
  children,
}) => {
  if (!isOpen || isMinimized) return null;

  const handleWindowClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent event bubbling so outer desktop click handlers don't immediately unfocus this window
    e.stopPropagation();
    if (onFocus) {
      onFocus();
    }
  };

  return (
    <div
      onClick={handleWindowClick}
      style={{
        ...style,
        // When active, boost z-index so it sits in front of other windows
        zIndex: isActive ? 50 : 20,
      }}
      className={`
        fixed inset-2 sm:inset-auto sm:top-12 sm:left-12 sm:min-w-[340px] sm:max-w-[85vw] sm:max-h-[80vh]
        bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040]
        shadow-[inset_1px_1px_0_#dfdfdf,inset_-1px_-1px_0_#808080,2px_2px_0_#000]
        flex flex-col select-none transition-shadow duration-75
        ${className}
      `}
    >
      {/* OS Title Bar - turns active blue (#000080) when clicked/focused, gray (#808080) when blurred */}
      <div
        className={`
          window-titlebar
          flex items-center justify-between px-1.5 py-1 text-xs sm:text-sm text-white font-bold cursor-default
          ${isActive ? 'bg-[#000080]' : 'bg-[#808080]'}
        `}
      >
        <div className="flex items-center gap-1.5 overflow-hidden">
          {icon && <img src={icon} alt="" className="w-4 h-4 pixelated" />}
          <span className="truncate">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          {onMinimize && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMinimize();
              }}
              className="w-5 h-5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-black font-mono text-xs flex items-center justify-center active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white cursor-pointer"
            >
              <img
                src="/icons/minimize_icon.svg"
                alt="Minimize"
                className="w-3 h-3"
              />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-5 h-5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] text-black font-mono text-xs font-bold flex items-center justify-center active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white cursor-pointer"
          >
            <img
              src="/icons/x_icon.svg"
              alt="Close"
              className="w-3 h-3"
            />
          </button>
        </div>
      </div>

      {/* Window Inner Content Area */}
      <div className="flex-1 p-1 overflow-auto text-black bg-[#c0c0c0]">
        {children}
      </div>
    </div>
  );
};