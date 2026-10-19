'use client';

import React, { useEffect } from 'react';
import type { WindowComponentProps } from '@/types/window';

const SUBSTACK_URL = 'https://sunny1703.substack.com/';

export const WritingWindow: React.FC<WindowComponentProps> = ({ onClose }) => {
  useEffect(() => {
    // Immediately open Substack in a new tab upon clicking/opening the Writing icon
    window.open(SUBSTACK_URL, '_blank', 'noopener,noreferrer');
    
    // Automatically close state so no empty window remains open
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  return null; // Direct link redirect with no UI rendered
};