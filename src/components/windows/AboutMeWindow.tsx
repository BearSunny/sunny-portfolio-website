'use client';

import React, { useState, useRef } from 'react';
import { Window } from '@/components/ui/Window';
import { Modal } from '@/components/ui/Modal';
import type { WindowComponentProps } from '@/types/window';

export interface PhotoItem {
  id: string;
  src: string;
  caption: string;
  date?: string;
  location?: string;
  description?: string;
}

const DEFAULT_PHOTOS: PhotoItem[] = [
  {
    id: '1',
    src: '/images/photo1.jpg',
    caption: 'Sakura Science Exchange - Japan',
    date: '2023-06',
    location: 'Japan',
    description:
      'I was selected as a student representative for the Sakura Science Exchange Program in Japan, where I attended university visits, lab tours, and cultural exchange events at a local high school. But the best part was the people. I love making friends and listening to their stories, and that habit has followed me into my work as my third eye for detail: engineering the subtle things that help users from hearing about their experiences. The trip also showed me how small I am next to the world, which is funny, and oddly freeing. I think less about myself and just give my all now.',
  },
  {
    id: '2',
    src: '/images/photo2.jpg',
    caption: 'Google Developer Group on Campus',
    date: '2026-01',
    location: 'HCMUS',
    description:
      'I am part of GDGoC, a student-led developer community that brings students together to learn, build, and use technology to make a positive impact. I contributed to the Study Jam initiative by developing learning materials and supporting peer-to-peer learning, and I helped organize a campus-wide Coding Challenge for over 200 students through game logic development and system debugging. First club ever kinda nervous, but my seniors and friends taught me a lot, and I have grown so much in system design and coding.',
  },
  {
    id: '3',
    src: '/images/photo3.jpg',
    caption: 'GStar Summit Logistics Crew',
    date: '2026-05',
    location: 'Ho Chi Minh City',
    description:
      'Life would be so dull without random side quests, and this was one of mine. I helped run a regional technology summit, coordinating logistics and crowd flow so that hundreds of delegates had a smooth experience. An experience outside of tech ended up teaching me about tech: I got to listen to industry leaders and engineers share real-world engineering practices, emerging technologies, and how their teams approach challenges.',
  },
  {
    id: '4',
    src: '/images/photo4.png',
    caption: 'SAGE-Yoga Research',
    date: '2026-06',
    location: 'HCMUS',
    description:
      'I am part of a team of four researching yoga pose classification and personalized corrective feedback. It began with a problem we had ourselves: struggling to perform exercises with proper form. A yoga pose dataset was available, so we started there and built a system that classifies poses and gives feedback on skeletal alignment. Our paper was eventually accepted at ACOMPA. Research was new to me, and this is my very first paper, so finishing it was one hell of an achievement. I just love the satisfaction of delivering a finished piece of work. Next up, I will be focusing on another research in another domain, and I cannot wait to see how it will figure itself out.',
  },
  {
    id: '5',
    src: '/images/photo5.jpg',
    caption: 'National Students Charity Fund',
    date: '2026-06',
    location: 'Vietnam',
    description:
      'I only played a small part in a larger team, but I’m glad to have helped six children continue their education through our scholarships. My rule is simple: help whenever I can, however small.',
  },
  {
    id: '6',
    src: '/images/photo6.jpg',
    caption: 'National English Competition',
    date: '2025-01',
    location: 'Le Hong Phong High School for the Gifted',
    description:
      'You cannot truly know me without knowing my time on the national English competition team. It is where I met my big bros and sis, my gang and my beloved juniors, and where I grew the most as a person, emotionally and intellectually. A huge shout-out to every teacher and friend who helped me learn, read more, write more, and develop my imagination and critical thinking along the way. Gratitude is the only word I have for it, because there would be no me now without it.',
  },
//   {
//     id: '7',
//     src: '/images/about/photo7.jpg',
//     caption: 'Matcha Club Mobile Project',
//     date: '2026-07',
//     location: 'Personal Project',
//     description:
//       'Designed and developed a retro Jetpack Compose Android app featuring custom UI components, loyalty reward tracking, and Room database persistence.',
//   },
];

// How far (in px) the carousel must be scrolled before the note appears
const SCROLL_TRIGGER_PX = 40;

interface AboutMeWindowProps extends WindowComponentProps {
  photos?: PhotoItem[];
}

export const AboutMeWindow: React.FC<AboutMeWindowProps> = ({
  photos = DEFAULT_PHOTOS,
  onClose,
  onMinimize,
  isActive,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasShownModalRef = useRef(false); // the note appears once per visit

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  // Fires for mouse wheel, touch swipe, and the arrow buttons alike
  const handleCarouselScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (hasShownModalRef.current) return;
    if (e.currentTarget.scrollLeft > SCROLL_TRIGGER_PX) {
      hasShownModalRef.current = true;
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <>
      <Window
        id="about-me"
        title={selectedPhoto ? `About Me - ${selectedPhoto.caption}` : 'About Me'}
        icon="/icons/user.svg"
        isOpen
        isActive={isActive}
        onClose={onClose}
        onMinimize={onMinimize}
        className="!static !inset-auto !top-auto !left-auto !w-[min(680px,calc(100vw-1rem))] !min-w-0 !max-w-none !max-h-none font-pixel select-none"
      >
        <div className="bg-[#c0c0c0] p-3 sm:p-4 flex flex-col relative">
          {selectedPhoto ? (
            /* ================= BLOG / DETAIL VIEW ================= */
            <div className="flex flex-col gap-3">
              {/* Retro Toolbar */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="px-3 py-1 bg-[#c0c0c0] hover:bg-[#d0d0d0] active:bg-[#a0a0a0] flex items-center gap-1.5 text-xs font-bold text-black cursor-pointer"
                  style={{
                    boxShadow:
                      'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080, inset -2px -2px 0px #000000',
                  }}
                >
                  <span>◄ Back to Carousel</span>
                </button>
                <span className="text-[10px] text-gray-700 font-mono">
                  Entry #{selectedPhoto.id} of {photos.length}
                </span>
              </div>

              {/* Split Content View */}
              <div className="flex flex-col sm:flex-row items-start gap-3">
                {/* Polaroid Kích Thước Gốc (Original Size: w-48 sm:w-52) */}
                <div
                  className="shrink-0 w-48 sm:w-52 bg-white p-2.5 pb-8 flex flex-col items-center mx-auto sm:mx-0"
                  style={{
                    boxShadow:
                      'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080, inset -2px -2px 0px #000000',
                  }}
                >
                  <div
                    className="w-full h-52 sm:h-56 bg-[#3891d2] flex items-center justify-center overflow-hidden"
                    style={{
                      boxShadow:
                        'inset 1px 1px 0px #808080, inset 2px 2px 0px #000000, inset -1px -1px 0px #ffffff',
                    }}
                  >
                    <img
                      src={selectedPhoto.src}
                      alt=""
                      className="w-full h-full object-cover pixelated"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="hidden [div:has(img[style*='display: none'])]:flex flex-col items-center justify-center text-white p-2">
                      <svg
                        width="44"
                        height="44"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="square"
                      >
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Khung Đọc Blog (Mở Rộng Tự Động Chiều Rộng) */}
                <div
                  className="flex-1 w-full bg-white p-3.5 h-64 sm:h-[268px] overflow-y-auto flex flex-col justify-between"
                  style={{
                    boxShadow:
                      'inset 1px 1px 0px #808080, inset 2px 2px 0px #000000, inset -1px -1px 0px #ffffff',
                  }}
                >
                  <div className="flex flex-col">
                    <h3 className="text-sm sm:text-base font-black uppercase text-black leading-snug">
                      {selectedPhoto.caption}
                    </h3>
                    <div className="flex gap-2 mt-1">
                      {selectedPhoto.date && (
                        <span className="text-[10px] text-gray-600 font-mono">
                          [{selectedPhoto.date}]
                        </span>
                      )}
                      {selectedPhoto.location && (
                        <span className="text-[10px] text-gray-600 font-mono">
                          • {selectedPhoto.location}
                        </span>
                      )}
                    </div>
                    <hr className="border-t border-[#808080] my-2" />
                    <p className="text-xs text-gray-800 leading-relaxed font-sans">
                      {selectedPhoto.description || 'No detailed log recorded for this photo entry.'}
                    </p>
                  </div>

                </div>
              </div>
            </div>
          ) : (
            /* ================= CAROUSEL VIEW (Clean Polaroids) ================= */
            <div className="relative w-full flex items-center">
              {/* Scroll Left Button */}
              <button
                type="button"
                onClick={handleScrollLeft}
                aria-label="Scroll left"
                className="hidden sm:flex z-10 w-7 h-12 bg-[#c0c0c0] active:bg-[#a0a0a0] items-center justify-center cursor-pointer shrink-0 mr-1"
                style={{
                  boxShadow:
                    'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080, inset -2px -2px 0px #000000',
                }}
              >
                <span className="text-black font-bold text-xs">◄</span>
              </button>

              {/* Scroll Area containing Photo-Only Polaroids */}
              <div
                ref={scrollContainerRef}
                onScroll={handleCarouselScroll}
                className="flex-1 flex gap-3 overflow-x-auto scrollbar-none py-2 px-1 scroll-smooth"
                style={{
                  boxShadow:
                    'inset 1px 1px 0px #808080, inset 2px 2px 0px #000000, inset -1px -1px 0px #ffffff',
                  backgroundColor: '#e6e6e6',
                }}
              >
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className="shrink-0 w-48 sm:w-52 bg-white p-2.5 pb-8 flex flex-col items-center cursor-pointer hover:bg-gray-50 active:translate-y-0.5 transition-transform"
                    style={{
                      boxShadow:
                        'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080, inset -2px -2px 0px #000000',
                    }}
                    title="Click to read blog entry"
                  >
                    {/* Photo Frame (No title, no date underneath) */}
                    <div
                      className="w-full h-52 sm:h-56 bg-[#3891d2] flex items-center justify-center overflow-hidden"
                      style={{
                        boxShadow:
                          'inset 1px 1px 0px #808080, inset 2px 2px 0px #000000, inset -1px -1px 0px #ffffff',
                      }}
                    >
                      <img
                        src={photo.src}
                        alt=""
                        className="w-full h-full object-cover pixelated"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="hidden [div:has(img[style*='display: none'])]:flex flex-col items-center justify-center text-white p-2 text-center">
                        <svg
                          width="44"
                          height="44"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="square"
                        >
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scroll Right Button */}
              <button
                type="button"
                onClick={handleScrollRight}
                aria-label="Scroll right"
                className="hidden sm:flex z-10 w-7 h-12 bg-[#c0c0c0] active:bg-[#a0a0a0] items-center justify-center cursor-pointer shrink-0 ml-1"
                style={{
                  boxShadow:
                    'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080, inset -2px -2px 0px #000000',
                }}
              >
                <span className="text-black font-bold text-xs">►</span>
              </button>
            </div>
          )}
        </div>
      </Window>

      {/* Appears once, the first time the carousel is scrolled */}
      <Modal
        title="About Me"
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        position="bottom-right"
        style={{ bottom: '50px' }}
      >
        <div className="flex gap-3 items-start">
          <img
            src="/icons/mail_stack.svg"
            alt="Mail Icon"
            className="w-10 h-10 shrink-0 pixelated mt-0"
          />
          <div className="space-y-2 text-xs sm:text-sm text-black leading-snug">
            <p>
              I am building the life my four-year-old self would be proud to see.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};