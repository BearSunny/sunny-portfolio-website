'use client';

import { useState, useCallback } from 'react';
import { APP_REGISTRY } from '@/config/appRegistry';
import { WindowState } from '@/types/window';

export function useWindowManager() {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | undefined>(undefined);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  // Focus an existing window or open a new one
  const focusWindow = useCallback((id: string) => {
    setWindows((prevWindows) => {
      const exists = prevWindows.some((w) => w.id === id);

      if (exists) {
        return prevWindows.map((w) =>
          w.id === id ? { ...w, isMinimized: false } : w
        );
      }

      // If window isn't open yet, create it with default metadata
      const appMeta = APP_REGISTRY[id] || {
        title: id.charAt(0).toUpperCase() + id.slice(1),
        icon: '/window.svg',
      };

      return [
        ...prevWindows,
        {
          id,
          title: appMeta.title,
          icon: appMeta.icon,
          isOpen: true,
          isMinimized: false,
        },
      ];
    });

    setActiveWindowId(id);
  }, []);

  // Minimize a window
  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    setActiveWindowId((current) => (current === id ? undefined : current));
  }, []);

  // Toggle the active window from its taskbar button.
  const toggleWindow = useCallback(
    (id: string) => {
      if (activeWindowId === id) {
        minimizeWindow(id);
        return;
      }

      focusWindow(id);
    },
    [activeWindowId, focusWindow, minimizeWindow]
  );

  // Close a window completely
  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    setActiveWindowId((current) => (current === id ? undefined : current));
  }, []);

  // Toggle or force close Start Menu
  const toggleStartMenu = useCallback(() => {
    setIsStartMenuOpen((prev) => !prev);
  }, []);

  const closeStartMenu = useCallback(() => {
    setIsStartMenuOpen(false);
  }, []);

  return {
    openWindows: windows,
    activeWindowId,
    isStartMenuOpen,
    focusWindow,
    minimizeWindow,
    toggleWindow,
    closeWindow,
    toggleStartMenu,
    closeStartMenu,
  };
}