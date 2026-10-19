'use client';

import React, { ReactNode, useEffect, useState, useRef } from 'react';
import { APP_REGISTRY, DESKTOP_APPS } from '@/config/appRegistry';
import { DesktopIcon } from '@/components/ui/DesktopIcon';
import { WindowState } from '@/types/window';
import type { WorkItem } from '../windows/WorkWindow';

export interface DesktopIconData {
  id: string;
  label: string;
  icon: string;
}

interface DesktopGridProps {
  icons?: DesktopIconData[];
  onOpenApp: (id: string) => void;
  openWindows: WindowState[];
  activeWindowId?: string;
  onMinimizeApp: (id: string) => void;
  onCloseApp: (id: string) => void;
  onFocusApp: (id: string) => void;
  onWorkItemClick?: (item: WorkItem) => void;
  children?: ReactNode; // Active Window components & Modals passed here
}

export const DesktopGrid: React.FC<DesktopGridProps> = ({
  icons = DESKTOP_APPS,
  onOpenApp,
  openWindows,
  activeWindowId,
  onMinimizeApp,
  onCloseApp,
  onFocusApp,
  onWorkItemClick,
  children,
}) => {
  useEffect(() => {
    onOpenApp('work');
  }, [onOpenApp]);

  const [windowPositions, setWindowPositions] = useState<Record<string, { x: number; y: number }>>({
    work: { x: 280, y: 40 },
  });
  const [draggingWindowId, setDraggingWindowId] = useState<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    // Focus before handling drag so a window behind another one comes forward
    // as soon as it is clicked.
    onFocusApp(id);

    const target = e.target as HTMLElement;
    if (target.closest('.window-titlebar')) {
      setDraggingWindowId(id);
      dragOffsetRef.current = {
        x: e.clientX - (windowPositions[id]?.x ?? 280),
        y: e.clientY - (windowPositions[id]?.y ?? 40),
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingWindowId) return;
    setWindowPositions((previous) => ({
      ...previous,
      [draggingWindowId]: {
        x: e.clientX - dragOffsetRef.current.x,
        y: e.clientY - dragOffsetRef.current.y,
      },
    }));
  };

  const handleMouseUp = () => setDraggingWindowId(null);

  const handleOpenApp = (id: string) => onOpenApp(id);

  return (
    <main
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative w-screen h-screen bg-[#f6d5d5] overflow-hidden p-3 pt-4 sm:p-6 pb-14 select-none"
    >
      {/* Desktop Icons Container */}
      <div className="flex gap-6">
        {/* First Column (4 icons) */}
        <div className="flex flex-col gap-6">
          {icons.slice(0, 4).map((icon) => (
            <DesktopIcon
              key={icon.id}
              id={icon.id}
              label={icon.label}
              icon={icon.icon}
              onOpen={handleOpenApp}
            />
          ))}
        </div>

        {/* Second Column (3 icons) */}
        <div className="flex flex-col gap-6 mt-[calc(1.5rem+0px)]">
          {icons.slice(4, 7).map((icon) => (
            <DesktopIcon
              key={icon.id}
              id={icon.id}
              label={icon.label}
              icon={icon.icon}
              onOpen={handleOpenApp}
            />
          ))}
        </div>
      </div>

      {/* Registered application windows */}
      {openWindows.map((window) => {
        if (window.isMinimized) return null;

        const app = APP_REGISTRY[window.id];
        const WindowContent = app?.component;
        if (!WindowContent) return null;

        const position = windowPositions[window.id] ?? { x: 280, y: 40 };

        return (
          <div
            key={window.id}
            onMouseDown={(event) => handleMouseDown(window.id, event)}
            style={{ left: `${position.x}px`, top: `${position.y}px` }}
            className={`absolute cursor-grab active:cursor-grabbing ${
              window.id === activeWindowId ? 'z-40' : 'z-10'
            }`}
          >
            <WindowContent
              onClose={() => onCloseApp(window.id)}
              onMinimize={() => onMinimizeApp(window.id)}
              onFocus={() => onFocusApp(window.id)}
              isActive={window.id === activeWindowId}
              {...(window.id === 'work' ? { onItemClick: onWorkItemClick } : {})}
            />
          </div>
        );
      })}

      {/* Render Active Windows & Overlays */}
      {children}
    </main>
  );
};