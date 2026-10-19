'use client';

import React, { useRef, useEffect } from 'react';

interface StartMenuItem {
  id: string;
  label: string;
  icon?: string;
}

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectApp: (id: string) => void;
  items?: StartMenuItem[];
}

export const StartMenu: React.FC<StartMenuProps> = ({
  isOpen,
  onClose,
  onSelectApp,
  items = [
    { id: 'about', label: 'About Me', icon: '/icons/user.svg' },
    { id: 'projects', label: 'Projects', icon: '/icons/projects.svg' },
    { id: 'work', label: 'Work', icon: '/icons/work.svg' },
    { id: 'writing', label: 'Writing', icon: '/icons/blog.svg' },
    { id: 'drawing', label: 'Fishu Fishi', icon: '/icons/drawing.png' },
    { id: 'music', label: 'Music', icon: '/icons/music.svg' },
    { id: 'contact', label: 'Contact', icon: '/icons/mail.svg' },
  ],
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close Start menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed bottom-10 left-1 z-50 flex bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-black border-b-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] select-none w-56"
    >
      {/* OS Side Banner */}
      <div className="bg-[#000080] w-7 flex items-end justify-center py-2 shrink-0">
        <span className="font-bold text-white text-xs sm:text-sm tracking-wider -rotate-90 whitespace-nowrap origin-center -translate-y-[20px]">
          SunnyOS
        </span>
      </div>

      {/* Menu Options List */}
      <div className="flex-1 py-1 flex flex-col">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onSelectApp(item.id);
              onClose();
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#000080] hover:text-white text-black text-xs sm:text-sm text-left group transition-colors"
          >
            {item.icon ? (
              <img src={item.icon} alt="" className="w-4 h-4 pixelated" />
            ) : (
              <span className="w-4 h-4 bg-gray-400 inline-block border border-black" />
            )}
            <span className="truncate">{item.label}</span>
          </button>
        ))}

        <div className="h-[2px] bg-gray-400 border-b border-white my-1 mx-1" />

        <a
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#000080] hover:text-white text-black text-xs sm:text-sm text-left group transition-colors"
        >
          <span className="w-4 h-4 flex items-center justify-center text-xs font-bold">
            <img
                src="/icons/resume.svg"
                alt="Download resume"
                className="w-3 h-3"
            />
          </span>
          <span>Download My Resume</span>
        </a>
      </div>
    </div>
  );
};