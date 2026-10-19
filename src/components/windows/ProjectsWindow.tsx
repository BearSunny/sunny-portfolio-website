'use client';

import React, { useState } from 'react';
import { Window } from '@/components/ui/Window';
import type { WindowComponentProps } from '@/types/window';

export interface ProjectItem {
  id: string;
  title: string;
  content: string;
  coverImage: string;
  description?: string;
  link?: string;
}

const DEFAULT_PROJECT_ITEMS: ProjectItem[] = [
  {
    id: 'the-sunny-project',
    title: 'THE SUNNY PROJECT',
    content:
      'Built a voice-first research assistant that analyzes papers from the active screen using Gemini vision, verifies claims, and executes extracted code with automated error diagnosis and retry.',
    coverImage: '/images/the_sunny_project.gif',
    link: 'https://devpost.com/software/the-sunny-project',
  },
  {
    id: 'hallo',
    title: 'HALLO',
    content:
      'Developed an elderly-care application for Alzheimer’s patients, combining medication tracking, emergency handling, family connectivity, and an AI chatbot for personalized care assistance and emotional support.',
    coverImage: '/images/hallo.gif',
    link: 'https://devpost.com/software/hallo-tjmq4n',
  },
  {
    id: 'worldy',
    title: 'WORLDY',
    content:
      'Created a social mapping platform where users share life experiences through location-based blogs and photos, with interactive maps, Google authentication, and friend-based content filtering.',
    coverImage: '/images/worldy.png',
    link: 'https://github.com/BearSunny/Worldy',
  },
];

interface ProjectsWindowProps extends WindowComponentProps {
  items?: ProjectItem[];
  onItemClick?: (item: ProjectItem) => void;
}

export const ProjectsWindow: React.FC<ProjectsWindowProps> = ({
  items = DEFAULT_PROJECT_ITEMS,
  onItemClick,
  onClose,
  onMinimize,
  isActive,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  const currentProject = items[currentIndex] || items[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const toggleLike = () => {
    setIsLiked((prev) => !prev);
  };

  const handleCardClick = () => {
    if (currentProject) {
      onItemClick?.(currentProject);
    }
  };

  return (
    <Window
      id="projects"
      title="Projects"
      icon="/icons/projects.svg"
      isOpen
      isActive={isActive}
      onClose={onClose}
      onMinimize={onMinimize}
      className="!static !inset-auto !top-auto !left-auto !w-[min(540px,calc(100vw-1rem))] !min-w-0 !max-w-none !max-h-none font-pixel select-none"
    >
      <div className="bg-[#c0c0c0] p-3 sm:p-4 flex flex-col items-center">
        {/* TOP COVER DISPLAY - SUNKEN BEVEL WITH AMBIENT BACKGROUND */}
        <div
          onClick={handleCardClick}
          className="relative w-full h-56 sm:h-64 bg-black cursor-pointer flex items-center justify-center overflow-hidden"
          style={{
            boxShadow:
              'inset 1px 1px 0px #808080, inset -1px -1px 0px #ffffff, inset 2px 2px 0px #000000, inset -2px -2px 0px #dfdfdf',
          }}
        >
          {currentProject?.coverImage ? (
            <>
              {/* Blurred background filling side empty spaces seamlessly */}
              <img
                src={currentProject.coverImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-md opacity-35 scale-110 pointer-events-none"
              />
              {/* Crisp main image / GIF preserving original proportions */}
              <img
                src={currentProject.coverImage}
                alt={currentProject.title}
                className="relative z-10 max-w-full max-h-full object-contain p-2 drop-shadow-md pixelated"
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-white">
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
                strokeLinejoin="miter"
                className="text-yellow-300 fill-yellow-300"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            </div>
          )}
        </div>

        {/* BOTTOM METADATA CONTAINER */}
        <div className="relative w-full mt-3 flex flex-col">
          {/* Main Card Upper Body */}
          <div
            className="w-full bg-white p-4 sm:p-5 flex flex-col justify-between"
            style={{
              boxShadow:
                'inset 1px 1px 0px #808080, inset 2px 2px 0px #000000, inset -1px 0px 0px #dfdfdf, inset -2px 0px 0px #ffffff',
            }}
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black tracking-wider text-black uppercase leading-tight">
                    {currentProject?.title}
                  </h3>

                  {/* Project External Link Button */}
                  {currentProject?.link && (
                    <a
                      href={currentProject.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-2 py-0.5 bg-[#c0c0c0] hover:bg-[#d0d0d0] active:bg-[#a0a0a0] text-[10px] font-bold text-black flex items-center gap-1 cursor-pointer"
                      style={{
                        boxShadow:
                          'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080, inset -2px -2px 0px #000000',
                      }}
                      title="View Project Link"
                    >
                      <span>Link</span>
                      <span className="text-[9px]">↗</span>
                    </a>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                  {currentProject?.content}
                </p>
              </div>

              {/* Heart Toggle */}
              <button
                type="button"
                onClick={toggleLike}
                className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none p-1 shrink-0"
                aria-label="Favorite Project"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={isLiked ? '#ef4444' : 'none'}
                  stroke={isLiked ? '#ef4444' : 'currentColor'}
                  strokeWidth="2"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Cutout Notch Row - Continuous Single Bevel */}
          <div className="flex w-full items-stretch">
            {/* Left Fill Segment */}
            <div
              className="flex-1 bg-white h-11"
              style={{
                boxShadow:
                  'inset 1px 0px 0px #808080, inset 2px 0px 0px #000000, inset 0px -1px 0px #dfdfdf, inset 0px -2px 0px #ffffff',
              }}
            />

            {/* Step Junction - Inner Vertical Drop Line */}
            <div className="w-[2px] bg-[#808080] h-11" />

            {/* Win98 Button Controls */}
            <div
              className="bg-[#c0c0c0] p-1 flex items-center justify-center gap-1 shrink-0"
              style={{
                boxShadow:
                  'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080, inset -2px -2px 0px #000000',
              }}
            >
              <button
                type="button"
                onClick={handlePrev}
                className="w-9 h-8 bg-[#c0c0c0] active:bg-[#a0a0a0] flex items-center justify-center font-bold text-xs cursor-pointer"
                style={{
                  boxShadow:
                    'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080, inset -2px -2px 0px #000000',
                }}
                title="Previous Project"
                aria-label="Previous"
              >
                <span className="text-[10px] tracking-tighter text-black">|◄</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-9 h-8 bg-[#c0c0c0] active:bg-[#a0a0a0] flex items-center justify-center font-bold text-xs cursor-pointer"
                style={{
                  boxShadow:
                    'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080, inset -2px -2px 0px #000000',
                }}
                title="Next Project"
                aria-label="Next"
              >
                <span className="text-[10px] tracking-tighter text-black">►|</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Window>
  );
};