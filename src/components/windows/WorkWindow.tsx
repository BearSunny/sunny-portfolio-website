'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Window } from '@/components/ui/Window';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { WindowComponentProps } from '@/types/window';
import { WORK_ARTICLES, WorkArticle } from '@/data/workArticles';

export interface WorkItem {
  id: string;
  title: string;
  date: string;
  logo: string;
  requiresPassword?: boolean;
  password?: string;
  description?: string;
  onClick?: () => void;
}

const DEFAULT_WORK_ITEMS: WorkItem[] = [
  {
    id: 'open-library',
    title: 'Patron-Centric Carousel Filtering',
    date: 'May 2026',
    logo: '/images/open-library.png',
  },
  {
    id: 'green-ocean',
    title: 'Green Ocean Crew Management App',
    date: 'September 2026',
    logo: '/images/green-ocean-logo.png'
  },
  {
    id: 'apcs-ta',
    title: 'Critical Thinking In Practice',
    date: 'October 2025',
    logo: '/images/apcs-logo.png',
    requiresPassword: true,
    password: '17032006',
  },
];

// Scroll container inner height = container height minus its 2px borders (top + bottom).
// The hero and news section use this so each fills the viewport exactly.
// If you change the scroll container's height classes, change this by the same amount (minus 4px).
const HERO_HEIGHT_CLASS = 'h-[calc(100vh-144px)] max-h-[636px] min-h-[416px]';
const NEWS_MIN_HEIGHT_CLASS = 'min-h-[calc(100vh-144px)]';

type CollageItem = {
  src: string;
  x: number; // center X, % of stage width
  y: number; // center Y, % of stage height
  w: number; // width, % of stage width
  rot?: number;
  z?: number;
  idle?: 'float' | 'spin'; // idle animation (default: float)
  click?: 'wiggle' | 'spin'; // reaction when clicked (default: wiggle)
  locked?: boolean; // true = ignores the mouse (no hover / click reaction)
};

const COLLAGE_ITEMS: CollageItem[] = [
  // Flowers (behind everything)
  { src: '/images/pressed-flower-blue.png', x: 23.3, y: 25.6, w: 4.2, z: 5 },
  { src: '/images/pressed-flower-blue.png', x: 19.9, y: 30.4, w: 3.4, z: 5, rot: 40 },
  { src: '/images/pressed-flower-blue.png', x: 60.9, y: 7.5, w: 4, z: 5, rot: -25 },
  { src: '/images/pressed-flower-blue.png', x: 79, y: 37, w: 4, z: 5, rot: 20 },
  { src: '/images/pressed-flower-yellow.png', x: 78.4, y: 48, w: 20, z: 10 },
  { src: '/images/sakura.png', x: 39.3, y: 17.8, w: 3, z: 5 },
  { src: '/images/sakura.png', x: 23.8, y: 32.6, w: 3.4, z: 5, rot: 30 },

  // Top: envelope, ribbon, stamps
  { src: '/images/letter.png', x: 32, y: 32, w: 22, z: 10, rot: -6 },

  // Stamp stack: sg at the bottom, tokyo in the middle, lhp on top
  { src: '/images/tokyo-stamp.png', x: 69.5, y: 31, w: 14, z: 12, rot: 12 },
  { src: '/images/sg-stamp.png', x: 65, y: 20, w: 14, z: 14, rot: -9 },
  { src: '/images/lhp-stamp.png', x: 55, y: 32, w: 14, z: 16, rot: -15 },

  // Ribbon linking the envelope to the top stamp.
  // Locked: it is wide and mostly transparent, so it would block the stickers under it.
  { src: '/images/tie.png', x: 43, y: 25, w: 24, z: 25, locked: true },

  // Middle: camera, vinyl (spins around when clicked)
  { src: '/images/digicam.png', x: 26, y: 52.2, w: 23, z: 20, rot: -4 },
  { src: '/images/sakura.png', x: 18, y: 45.5, w: 3, z: 22, rot: -20 },
  { src: '/images/vinyl.png', x: 72.7, y: 58.1, w: 10.6, z: 20, click: 'spin' },

  // Bottom right: crossword + cherries
  { src: '/images/sudoku.jpg', x: 78.1, y: 71.5, w: 14, z: 15, rot: 12 },
  { src: '/images/cherry.png', x: 67, y: 75.5, w: 15, z: 25 },

  // Bottom left: clownfish
  { src: '/images/clownfish.png', x: 20.9, y: 71.5, w: 9, z: 25, rot: -10 },

  // Beads: S U N N Y in a gentle smile arc, plus heart / heart / star
  { src: '/images/letter-s.png', x: 30.7, y: 71.1, w: 6.4, z: 25, rot: -8 },
  { src: '/images/letter-u.png', x: 36.6, y: 73.3, w: 6.4, z: 25, rot: 4 },
  { src: '/images/letter-n.png', x: 43.7, y: 74.8, w: 6.4, z: 25, rot: -3 },
  { src: '/images/letter-n.png', x: 50.6, y: 73.7, w: 6.4, z: 25, rot: 5 },
  { src: '/images/letter-y.png', x: 56.8, y: 71.1, w: 6.4, z: 25, rot: -6 },
  { src: '/images/letter-heart.png', x: 42.7, y: 65.6, w: 5.6, z: 25, rot: 6 },
  { src: '/images/letter-heart.png', x: 36.4, y: 84.1, w: 5.6, z: 25, rot: -10 },
  { src: '/images/letter-star.png', x: 42.3, y: 84.8, w: 5.6, z: 25, rot: 8 },
];

// Helper so we can pass CSS custom properties through `style`
const cssVars = (vars: Record<string, string>) => vars as React.CSSProperties;

// All animations live here. Everything is switched off for visitors who
// prefer reduced motion.
const ANIMATION_CSS = `
  /* --- Collage: entrance pop, then idle float / spin --- */
  @keyframes collage-pop {
    0%   { opacity: 0; transform: scale(.3) rotate(-25deg); }
    60%  { opacity: 1; transform: scale(1.12) rotate(6deg); }
    100% { opacity: 1; transform: scale(1) rotate(0); }
  }
  @keyframes collage-float {
    0%, 100% { transform: translateY(0) rotate(0); }
    50%      { transform: translateY(-4px) rotate(1.5deg); }
  }
  @keyframes collage-spin-idle { to { transform: rotate(360deg); } }

  .collage-idle {
    animation:
      collage-pop .55s cubic-bezier(.2,.9,.3,1.2) var(--pop-delay, 0s) both,
      collage-float var(--float-dur, 4s) ease-in-out calc(var(--pop-delay, 0s) + .55s) infinite;
  }
  .collage-spin {
    animation:
      collage-pop .55s cubic-bezier(.2,.9,.3,1.2) var(--pop-delay, 0s) both,
      collage-spin-idle 8s linear calc(var(--pop-delay, 0s) + .55s) infinite;
  }

  /* --- Collage: hover lift + click wiggle (on a wrapper, so the
         entrance/idle animations on the <img> are never restarted) --- */
  @keyframes collage-wiggle {
    0%, 100% { transform: rotate(0); }
    20% { transform: rotate(-12deg) scale(1.08); }
    40% { transform: rotate(9deg) scale(1.08); }
    60% { transform: rotate(-6deg); }
    80% { transform: rotate(3deg); }
  }
  .collage-hover { transition: transform .15s ease; }
  .collage-hover:hover { transform: scale(1.07); }
  .collage-wiggle { animation: collage-wiggle .5s ease; }

  /* Slow continuous turn. Stopping pauses the animation (animation-play-state),
     so the vinyl freezes at its current angle instead of snapping back. */
  @keyframes collage-turn { to { transform: rotate(360deg); } }
  .collage-turn { animation: collage-turn 8s linear infinite; }

  @keyframes collage-fade { from { opacity: 0; } to { opacity: 1; } }
  .collage-title-in { animation: collage-fade .8s ease .4s both; }

  /* --- Views fading in --- */
  @keyframes work-fade {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .work-fade-in { animation: work-fade .3s ease both; }

  /* --- News list: rise in when scrolled into view --- */
  @keyframes work-rise {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .work-rise { animation: work-rise .5s ease both; animation-delay: var(--d, 0s); }

  /* --- Wrong password --- */
  @keyframes work-shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
  .work-shake { animation: work-shake .35s ease; }

  @media (prefers-reduced-motion: reduce) {
    .collage-idle, .collage-spin, .collage-wiggle, .collage-turn, .collage-title-in,
    .work-fade-in, .work-rise, .work-shake { animation: none; }
    .collage-hover:hover { transform: none; }
  }
`;

interface WorkWindowProps extends WindowComponentProps {
  items?: WorkItem[];
  onItemClick?: (item: WorkItem) => void;
}

export const WorkWindow: React.FC<WorkWindowProps> = ({
  items = DEFAULT_WORK_ITEMS,
  onItemClick,
  onClose,
  onMinimize,
  isActive,
}) => {
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [authenticatingItem, setAuthenticatingItem] = useState<WorkItem | null>(null);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [wiggling, setWiggling] = useState<number | null>(null);
  const [spinState, setSpinState] = useState<Record<number, 'running' | 'paused'>>({});
  const [newsVisible, setNewsVisible] = useState<boolean>(false);

  const passwordInputRef = useRef<HTMLInputElement>(null);
  const newsSectionRef = useRef<HTMLDivElement>(null);

  const activeArticle: WorkArticle | undefined = selectedArticleId
    ? WORK_ARTICLES[selectedArticleId]
    : undefined;

  const playPopupSound = () => {
    try {
      const audio = new Audio('/audio/windows-98-notify.mp3');
      audio.volume = 0.8;
      void audio.play().catch(() => {});
    } catch (e) {
      console.warn('Audio playback not supported or file missing.', e);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (authenticatingItem) {
      timer = setTimeout(() => {
        setIsModalOpen(true);
      }, 500);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [authenticatingItem]);

  // Reveal the news list (staggered rise) once it scrolls into view
  useEffect(() => {
    const el = newsSectionRef.current;
    if (!el) return;

    setNewsVisible(false);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNewsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [selectedArticleId, authenticatingItem]);

  const handleItemClick = (item: WorkItem) => {
    item.onClick?.();
    onItemClick?.(item);

    if (item.requiresPassword) {
      playPopupSound();
      setAuthenticatingItem(item);
      setPasswordInput('');
      setPasswordError(false);
      setIsModalOpen(false);
    } else if (WORK_ARTICLES[item.id]) {
      setSelectedArticleId(item.id);
    }
  };

  const handlePasswordSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!authenticatingItem) return;

    const expectedPassword = authenticatingItem.password || '17032006';

    if (passwordInput === expectedPassword) {
      setSelectedArticleId(authenticatingItem.id);
      setAuthenticatingItem(null);
      setPasswordInput('');
      setPasswordError(false);
      setIsModalOpen(false);
    } else {
      setPasswordError(true);
      passwordInputRef.current?.focus();
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 50);
  };

  const returnToNewsRef = useRef(false);

  const scrollToNews = (behavior: ScrollBehavior = 'smooth') => {
    newsSectionRef.current?.scrollIntoView({ behavior });
  };

  const handleBackToList = () => {
    returnToNewsRef.current = true;
    setSelectedArticleId(null);
    setAuthenticatingItem(null);
    setPasswordInput('');
    setPasswordError(false);
    setIsModalOpen(false);
  };

  useLayoutEffect(() => {
    if (returnToNewsRef.current && !selectedArticleId && !authenticatingItem) {
      returnToNewsRef.current = false;
      scrollToNews('instant');
    }
  }, [selectedArticleId, authenticatingItem]);

  return (
    <>
      <style>{ANIMATION_CSS}</style>

      <Window
        id="work"
        title={activeArticle ? `Work - ${activeArticle.title}` : 'Work'}
        icon="/icons/work.svg"
        isOpen
        isActive={isActive}
        onClose={onClose}
        onMinimize={onMinimize}
        className="!static !inset-auto !top-auto !left-auto !w-[min(720px,calc(100vw-1rem))] !min-w-0 !max-w-none !max-h-none font-pixel select-none"
      >
        <div className="bg-[#fcf8f2] border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white h-[calc(100vh-140px)] max-h-[640px] min-h-[420px] overflow-y-auto scroll-smooth snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {activeArticle ? (
            /* 1. BLOG ARTICLE VIEW */
            <div className="work-fade-in p-4 sm:p-6 flex flex-col gap-4">
              <button
                type="button"
                onClick={handleBackToList}
                className="w-fit px-3 py-1 bg-[#ece9d8] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#e4e1d1] cursor-pointer"
              >
                <span>◄ Back to Work News</span>
              </button>

              <div className="border-b-2 border-black pb-3 mt-1">
                <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#000080] block mb-1">
                  {activeArticle.date}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold leading-tight uppercase text-black">
                  {activeArticle.title}
                </h2>
              </div>

              <div className="w-full h-40 sm:h-52 bg-[#f4f0e6] border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white flex items-center justify-center p-3">
                <img
                  src={activeArticle.logo}
                  alt={activeArticle.title}
                  className="max-w-full max-h-full object-contain pixelated"
                />
              </div>

              <div className="mt-2">{activeArticle.content}</div>
            </div>
          ) : authenticatingItem ? (
            /* 2. PASSWORD INPUT VIEW */
            <div className="work-fade-in p-4 sm:p-6 flex flex-col items-center justify-center h-full text-black">
              <form
                onSubmit={handlePasswordSubmit}
                className="flex flex-col items-center gap-5 max-w-xs w-full"
              >
                <label className="text-sm sm:text-base font-bold text-center">
                  Enter password to view the next part
                </label>

                <div
                  className={`flex items-center gap-3 w-full ${
                    passwordError ? 'work-shake' : ''
                  }`}
                >
                  <span className="text-xs sm:text-sm font-bold shrink-0">
                    Password:
                  </span>
                  <input
                    ref={passwordInputRef}
                    type="password"
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setPasswordError(false);
                    }}
                    autoFocus
                    className="flex-1 px-2 py-1 bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white outline-none text-sm font-mono"
                  />
                </div>

                {passwordError && (
                  <p className="text-xs text-red-600 font-bold -mt-2">
                    Incorrect password. Please try again!
                  </p>
                )}

                <div className="flex gap-2">
                  <Button type="submit" className="min-w-[70px]">
                    OK
                  </Button>
                  <Button
                    type="button"
                    onClick={handleBackToList}
                    className="min-w-[70px]"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            /* 3. HERO COLLAGE (FULL WINDOW) + WORK NEWS SECTION */
            <div className="flex flex-col">
              {/* FULL-HEIGHT COLLAGE COVER (clicking empty space scrolls down) */}
              <div
                onClick={() => scrollToNews()}
                className={`relative w-full ${HERO_HEIGHT_CLASS} shrink-0 snap-start bg-[#fcf8f2] overflow-hidden cursor-pointer select-none flex items-center justify-center`}
                style={{ containerType: 'size' }}
              >
                {/* 3:2 stage that always fits inside the hero */}
                <div
                  className="relative"
                  style={{
                    width: 'min(100cqw, 150cqh)',
                    aspectRatio: '3 / 2',
                    containerType: 'inline-size',
                  }}
                >
                  {COLLAGE_ITEMS.map(
                    ({ src, x, y, w, rot = 0, z = 10, idle = 'float', click = 'wiggle', locked }, i) => (
                      /* Layer 1: position + rotation (static) */
                      <div
                        key={`${src}-${i}`}
                        className="absolute"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          width: `${w}%`,
                          zIndex: z,
                          transform: `translate(-50%, -50%) rotate(${rot}deg)`,
                          pointerEvents: locked ? 'none' : 'auto',
                        }}
                        onClick={
                          locked
                            ? undefined
                            : (e) => {
                                e.stopPropagation(); // a sticker click reacts, it doesn't scroll
                                if (click === 'spin') {
                                  // start spinning, then each click pauses / resumes
                                  setSpinState((prev) => ({
                                    ...prev,
                                    [i]: prev[i] === 'running' ? 'paused' : 'running',
                                  }));
                                } else {
                                  setWiggling(i);
                                }
                              }
                        }
                      >
                        {/* Layer 2: hover lift + click wiggle */}
                        <div
                          className={`collage-hover ${
                            click === 'spin'
                              ? spinState[i]
                                ? 'collage-turn'
                                : ''
                              : wiggling === i
                                ? 'collage-wiggle'
                                : ''
                          }`}
                          style={
                            spinState[i] === 'paused'
                              ? { animationPlayState: 'paused' }
                              : undefined
                          }
                          onAnimationEnd={(e) => {
                            if (e.animationName === 'collage-wiggle') setWiggling(null);
                          }}
                        >
                          {/* Layer 3: entrance pop, then idle float / spin */}
                          <img
                            src={src}
                            alt=""
                            aria-hidden
                            draggable={false}
                            className={`block w-full h-auto drop-shadow ${
                              idle === 'spin' ? 'collage-spin' : 'collage-idle'
                            }`}
                            style={cssVars({
                              '--pop-delay': `${0.15 + i * 0.04}s`,
                              '--float-dur': `${3.2 + (i % 5) * 0.55}s`,
                            })}
                          />
                        </div>
                      </div>
                    )
                  )}

                  {/* Central title, sized relative to the stage */}
                  <h1
                    className="collage-title-in absolute left-1/2 top-[51%] -translate-x-1/2 -translate-y-1/2 z-30 text-center pointer-events-none font-bold tracking-widest text-black uppercase leading-tight drop-shadow-[1px_1px_0px_#fff]"
                    style={{ fontSize: '5.2cqw' }}
                  >
                    WORK
                    <br />
                    ARCHIVE
                  </h1>
                </div>

                {/* Scroll prompt stays pinned to the hero corner */}
                <div className="absolute inset-x-0 bottom-3 flex justify-center z-30 pointer-events-none">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest animate-bounce">
                    Scroll down
                  </span>
                </div>
              </div>

              {/* WORK NEWS LIST SECTION */}
              <div
                ref={newsSectionRef}
                className={`p-4 sm:p-6 snap-start pt-6 border-t-2 border-black/10 ${NEWS_MIN_HEIGHT_CLASS}`}
              >
                <div
                  className={`text-center mb-5 ${newsVisible ? 'work-rise' : 'opacity-0'}`}
                  style={cssVars({ '--d': '0s' })}
                >
                  <p className="text-[10px] sm:text-xs font-bold tracking-[0.28em] uppercase text-[#000080]">
                    THE SUNNY JOURNAL
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-[0.12em] uppercase leading-none mt-2">
                    WORK ARCHIVE
                  </h2>
                  <div className="h-[3px] bg-black w-full mx-auto mt-3" />
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] mt-2 text-gray-600">
                    My professional work throughout the years
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleItemClick(item)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleItemClick(item);
                        }
                      }}
                      style={cssVars({ '--d': `${0.15 + idx * 0.12}s` })}
                      className={`group flex items-center gap-4 p-2.5 border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] hover:border-black bg-[#f7f7f2] hover:bg-white cursor-pointer transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-1 focus:ring-black ${
                        newsVisible ? 'work-rise' : 'opacity-0'
                      }`}
                    >
                      <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-[#f4f0e6] border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white flex items-center justify-center overflow-hidden pointer-events-none">
                        <img
                          src={item.logo}
                          alt={item.title}
                          className="max-w-full max-h-full object-contain pixelated"
                        />
                      </div>

                      <div className="flex flex-col justify-center min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-black group-hover:underline leading-snug">
                          {item.title}
                        </h3>
                        <span className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                          {item.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Window>

      {/* MODAL DIALOG */}
      <Modal
        title="ATTENTION VIEWERS!!!"
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
            <p>Xin chào,</p>
            <p>
              I&apos;m Minh and welcome to my personal website. I'm an undergraduate at VNUHCM-US studying Computer Science.
              I’m drawn to problems at the intersection of people and technology. Growing up in Vietnam, 
              I was shaped by the diverse culture around me, and this has inspired me to build thoughtful software for the nuances of people and their experiences.
              
              If you&apos;re still
              reading, {' '}
              <span className="font-bold underline">17032006</span> is the
              password to what&apos;s next.
            </p>
            <p>Thanks for stopping by - Hope we can connect!</p>
            <p className="pt-2">
              Love and kisses,
              <br />
              <span className="font-bold">Minh</span>
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};