'use client';

import React, { useEffect } from 'react';

export function GlobalAudioProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const clickSound = new Audio('/audio/windows-98-click.wav');
    clickSound.volume = 0.35;

    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const interactiveElement = target.closest('button, a, [role="button"]');
      if (interactiveElement) {
        const soundClone = clickSound.cloneNode() as HTMLAudioElement;
        soundClone.volume = 0.5;
        void soundClone.play().catch(() => {
          // Ignore autoplay restrictions prior to initial user gesture
        });
      }
    };

    window.addEventListener('click', handleGlobalClick, true);

    return () => {
      window.removeEventListener('click', handleGlobalClick, true);
    };
  }, []);

  return <>{children}</>;
}