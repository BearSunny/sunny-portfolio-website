'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './Button';

interface TaskbarItem {
  id: string;
  title: string;
  icon?: string;
  isOpen: boolean;
  isMinimized?: boolean;
}

interface TaskbarProps {
  openWindows: TaskbarItem[];
  activeWindowId?: string;
  onSelectWindow: (id: string) => void;
  onToggleStartMenu?: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  openWindows,
  activeWindowId,
  onSelectWindow,
  onToggleStartMenu,
}) => {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const updateClock = () => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-10 bg-[#c0c0c0] border-t-2 border-white flex items-center justify-between px-1 z-50 select-none">
      {/* Left Area: Start Button + Taskbar Badges Container */}
      <div className="flex items-center gap-1 flex-1 min-w-0 mr-2 overflow-hidden">
        {/* Start Button */}
        <Button
          onClick={onToggleStartMenu}
          className="flex items-center gap-1 font-bold px-2 py-0.5 text-xs sm:text-sm shrink-0"
        >
          <span className="text-blue-700">
            <img
              src="/icons/start_icon.svg"
              alt="Start icon"
              className="inline-block w-4 h-4"
            />
          </span>{' '}
          Start
        </Button>

        {/* Separator Divider */}
        <div className="h-6 w-[2px] bg-gray-400 border-r border-white mx-1 shrink-0" />

        {/* Taskbar Window Badges Wrapper */}
        <div className="flex items-center gap-1 overflow-x-auto min-w-0 flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {openWindows.map((win) => {
            const isActive = activeWindowId === win.id && !win.isMinimized;
            return (
              <Button
                key={win.id}
                active={isActive}
                onClick={() => onSelectWindow(win.id)}
                className="flex items-center gap-1 text-xs min-w-[100px] max-w-[120px] sm:max-w-[160px] py-0.5 px-2 shrink-0"
              >
                {win.icon && (
                  <img
                    src={win.icon}
                    alt=""
                    className="w-3.5 h-3.5 pixelated shrink-0"
                  />
                )}
                <span className="truncate min-w-0">{win.title}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* System Tray Clock */}
      <div className="border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-2 py-0.5 text-xs font-pixel text-black bg-[#c0c0c0] shrink-0 flex items-center gap-1">
        <img
          src="/icons/clock_icon.svg"
          alt="Clock icon"
          className="inline-block w-4 h-4"
        />
        <span>{time ?? '--:--'}</span>
      </div>
    </div>
  );
};