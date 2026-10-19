'use client';

import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  active = false,
  onClick,
  ...props
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const clickSound = new Audio('/audio/windows-98-click.wav');
    clickSound.volume = 0.5;
    void clickSound.play().catch(() => undefined);
    onClick?.(event);
  };

  return (
    <button
      className={`
        px-3 py-1 font-pixel text-xs sm:text-sm bg-[#c0c0c0] text-black select-none
        border-2
        ${
          active
            ? 'border-t-black border-l-black border-r-white border-b-white bg-[#a0a0a0]'
            : 'border-t-white border-l-white border-r-[#404040] border-b-[#404040]'
        }
        active:border-t-black active:border-l-black active:border-r-white active:border-b-white active:bg-[#a0a0a0]
        focus:outline-none focus:ring-1 focus:ring-black
        ${className}
      `}
      {...props}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};