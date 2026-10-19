'use client';

import React, { useState } from 'react';
import { CRTMonitor } from '@/components/onboarding/CRTMonitor';
import { DesktopGrid } from '@/components/desktop/DesktopGrid';
import { Taskbar } from '@/components/ui/Taskbar';
import { StartMenu } from '@/components/desktop/StartMenu';
import { useWindowManager } from '@/hooks/useWindowManager';
import { MobileNotice } from '@/components/onboarding/MobileNotice';

export default function Home() {
  // 1. Initial State: Always false so Onboarding renders FIRST on page load
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Custom hook for active floating windows & taskbar/start menu states
  const {
    openWindows,
    activeWindowId,
    focusWindow,
    minimizeWindow,
    toggleWindow,
    closeWindow,
    toggleStartMenu,
    isStartMenuOpen,
    closeStartMenu,
  } = useWindowManager();

  // 2. Renders Onboarding Screen First
  return (
    <>
      {!hasCompletedOnboarding ? (
      <CRTMonitor onStart={() => setHasCompletedOnboarding(true)} />
    ) : (
      <DesktopGrid
      onOpenApp={focusWindow}
      openWindows={openWindows}
      activeWindowId={activeWindowId}
      onFocusApp={focusWindow}
      onMinimizeApp={minimizeWindow}
      onCloseApp={closeWindow}
    >
        {/* Start Menu Overlay */}
        <StartMenu
          isOpen={isStartMenuOpen}
          onClose={closeStartMenu}
          onSelectApp={(appId) => {
            focusWindow(appId);
            closeStartMenu();
          }}
        />

        {/* Bottom Taskbar */}
        <Taskbar
          openWindows={openWindows}
          activeWindowId={activeWindowId}
          onSelectWindow={toggleWindow}
          onToggleStartMenu={toggleStartMenu}
        />
      </DesktopGrid>
    )}

    <MobileNotice />
    </>
  );
}