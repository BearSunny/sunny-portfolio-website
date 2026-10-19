'use client';

import React, { useState } from 'react';

// Bevels (full class strings so Tailwind can see them)
const WIN_WINDOW =
  'shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#dfdfdf,inset_-2px_-2px_#808080,inset_2px_2px_#fff]';
const WIN_RAISED =
  'shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#fff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] active:shadow-[inset_-1px_-1px_#fff,inset_1px_1px_#0a0a0a,inset_-2px_-2px_#dfdfdf,inset_2px_2px_#808080]';

// Covers the whole screen on small screens only (below Tailwind's md breakpoint, 768px).
export const MobileNotice: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="md:hidden fixed inset-0 z-[100] bg-[#008080] flex items-center justify-center p-4">
      <div
        role="alertdialog"
        aria-labelledby="mobile-notice-title"
        aria-describedby="mobile-notice-text"
        className={`w-full max-w-xs bg-[#c0c0c0] p-[3px] drop-shadow-2xl ${WIN_WINDOW}`}
        style={{ fontFamily: "Tahoma, 'MS Sans Serif', Geneva, sans-serif" }}
      >
        {/* Title bar */}
        <div
          className="px-[3px] py-[2px] text-white text-xs font-bold cursor-default"
          style={{ background: 'linear-gradient(90deg, #000080, #1084d0)' }}
        >
          <span id="mobile-notice-title" className="pl-1">
            Best viewed on a computer
          </span>
        </div>

        {/* Body */}
        <div className="px-4 pt-5 pb-3 flex flex-col gap-5 text-black">
          <div className="flex items-start gap-4">
            {/* Warning triangle */}
            <svg width="32" height="32" viewBox="0 0 32 32" className="shrink-0" aria-hidden="true">
              <polygon
                points="16,2 30,29 2,29"
                fill="#ffd400"
                stroke="#000"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <rect x="14.5" y="11" width="3" height="10" fill="#000" />
              <rect x="14.5" y="23" width="3" height="3" fill="#000" />
            </svg>
            <p id="mobile-notice-text" className="text-xs leading-relaxed pt-1">
              This portfolio is built like a desktop, so it works best on a computer. For the full
              experience, please open it on a larger screen.
            </p>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className={`px-4 py-[5px] bg-[#c0c0c0] text-black text-xs ${WIN_RAISED}`}
            >
              Continue anyway
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};