'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Window } from '@/components/ui/Window';
import type { WindowComponentProps } from '@/types/window';

// I intend to hand-draw the sprites but alas, I could not find the time
const FISH_ART: string[] = [
  '/images/fish/fish-1.png',
  '/images/fish/fish-2.png',
  '/images/fish/fish-3.png',
  '/images/fish/fish-4.png',
  '/images/fish/fish-5.png',
  '/images/fish/fish-6.png',
];

const FORTUNES: string[] = [
  'A small current carries you farther than a big splash.',
  'Today, trust the slow tide.',
  'The thing you are afraid to start is shallower than it looks.',
  'Someone is quietly rooting for you right now.',
  'Change can hurt, but it leads a path to something better.',
  'You are allowed to change direction mid-swim.',
  'Rest is part of the journey, not a detour from it.',
  'A kind word sent today will reach farther than you think.',
  'The best view is often one turn past where you almost stopped.',
  'Let the little wins float; you do not have to hold them down.',
  'Curiosity will find you a better path than certainty.',
  'Your next idea is already circling nearby. Be still and let it come.',
  'Even the biggest ocean is made of small, patient drops.',
  'Today you will be exactly as brave as you need to be.',
  'You already know the answer to the questions lingering inside your head.',
  'What feels like drifting might be you finding the current.',
  'Someone will thank you for something you have already forgotten.',
  'Good things nibble before they bite. Stay patient.',
  'Our deeds determine us, as much as we determine our deeds.',
  'Say yes to the invitation you were about to ignore.',
  'You do not need the whole map to take the next stroke.',
  'Be soft with yourself; the sea is rough enough already.',
  'An unexpected message brings a pleasant ripple.',
  'The answer you want is hiding in the question you keep avoiding.',
  'Share what you know. Someone is looking for exactly that.',
  'Tomorrow-you will be glad you did the small thing today.',
  'Shine a little, even when no one is looking.',
  'The tide goes out so that it can come back with more.',
  'Hold your plans loosely and your people tightly.',
  'Luck favors the one who keeps swimming.',
];

/* ------------------------------------------------------------------ */
/* Tuning                                                              */
/* ------------------------------------------------------------------ */

const OCEAN_FISH_COUNT = 32; 
const MAX_FISH_H = 40;
const CATCH_ANIM_SECONDS = 0.9;
const STORAGE_KEY = 'fishu-fishi:fortune';

const PLACEHOLDER_COLORS = [
  '#ff6b6b',
  '#4d94ff',
  '#ffd24d',
  '#6bd6a0',
  '#c58bff',
  '#ff9f5a',
];

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Sprite {
  source: CanvasImageSource;
  w: number;
  h: number;
}

interface SwimmingFish {
  id: string;
  sprite: Sprite;
  x: number;
  y: number;
  w: number;
  h: number;
  depth: number; // 0.8 (far/dim) to 1.0 (near/bright)
  speed: number; // px per second
  dir: 1 | -1;
  facing: number; // eases between 1 and -1 when turning around
  baseY: number;
  targetY: number;
  bobAmp: number;
  bobFreq: number;
  phase: number;
  turnMargin: number;
  caught: number | null; // null = swimming, 0..1 = catch animation progress
}

interface FortuneRecord {
  date: string; // YYYY-MM-DD (local)
  fortune: string;
  lucky: number[];
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const todayKey = () => new Date().toLocaleDateString('en-CA'); 

const formatDate = (key: string) =>
  new Date(`${key}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

const timeUntilTomorrow = () => {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  const mins = Math.max(1, Math.round((next.getTime() - now.getTime()) / 60000));
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

const readStoredCatch = (): FortuneRecord | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FortuneRecord) : null;
  } catch {
    return null;
  }
};

const writeStoredCatch = (record: FortuneRecord) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // storage blocked: the fortune just won't persist across reloads
  }
};

const pickFortune = (avoid?: string): FortuneRecord => {
  const pool = FORTUNES.filter((f) => f !== avoid);
  const list = pool.length ? pool : FORTUNES;
  const lucky = new Set<number>();
  while (lucky.size < 3) lucky.add(1 + Math.floor(Math.random() * 60));
  return {
    date: todayKey(),
    fortune: list[Math.floor(Math.random() * list.length)],
    lucky: [...lucky].sort((a, b) => a - b),
  };
};

// Simple fish, FACING RIGHT
const createPlaceholderSprite = (color: string): Sprite => {
  const c = document.createElement('canvas');
  c.width = 100;
  c.height = 60;
  const g = c.getContext('2d')!;

  g.fillStyle = color;
  g.beginPath();
  g.ellipse(50, 30, 35, 20, 0, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.moveTo(15, 30);
  g.lineTo(2, 15);
  g.lineTo(2, 45);
  g.closePath();
  g.fill();

  g.fillStyle = '#ffffff';
  g.beginPath();
  g.arc(75, 22, 5, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#000000';
  g.beginPath();
  g.arc(77, 22, 2.5, 0, Math.PI * 2);
  g.fill();

  return { source: c, w: c.width, h: c.height };
};

const loadImage = (src: string): Promise<Sprite | null> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () =>
      resolve({ source: img, w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = src;
  });

const loadSprites = async (): Promise<Sprite[]> => {
  const loaded = (await Promise.all(FISH_ART.map(loadImage))).filter(
    (s): s is Sprite => s !== null
  );
  if (loaded.length > 0) return loaded;
  return PLACEHOLDER_COLORS.map(createPlaceholderSprite);
};

const randomLane = (h: number, areaH: number) =>
  h / 2 + 12 + Math.random() * Math.max(0, areaH - h - 24);

const makeFish = (
  id: string,
  sprite: Sprite,
  areaW: number,
  areaH: number
): SwimmingFish => {
  const depth = 0.8 + Math.random() * 0.2;
  const targetW = 34 + Math.random() * 30;
  const scale = Math.min(targetW / sprite.w, MAX_FISH_H / sprite.h) * depth;
  const w = sprite.w * scale;
  const h = sprite.h * scale;
  const y = randomLane(h, areaH);
  const dir: 1 | -1 = Math.random() > 0.5 ? 1 : -1;

  return {
    id,
    sprite,
    x: w / 2 + Math.random() * Math.max(0, areaW - w),
    y,
    w,
    h,
    depth,
    speed: 30 + Math.random() * 35,
    dir,
    facing: dir,
    baseY: y,
    targetY: y,
    bobAmp: 3 + Math.random() * 4,
    bobFreq: 0.9 + Math.random() * 0.8,
    phase: Math.random() * Math.PI * 2,
    turnMargin: Math.random() * 40,
    caught: null,
  };
};

const turnFish = (fish: SwimmingFish, dir: 1 | -1, areaH: number) => {
  fish.dir = dir;
  fish.turnMargin = Math.random() * 40;
  fish.targetY = randomLane(fish.h, areaH);
};

const sortByDepth = (list: SwimmingFish[]) =>
  [...list].sort((a, b) => a.depth - b.depth);

const BEVEL_RAISED =
  'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080, inset -2px -2px 0px #000000';
const BEVEL_SUNKEN =
  'inset 1px 1px 0px #808080, inset 2px 2px 0px #000000, inset -1px -1px 0px #ffffff';

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export const GameWindow: React.FC<WindowComponentProps> = ({
  onClose,
  onMinimize,
  isActive,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fishesRef = useRef<SwimmingFish[]>([]);
  const previousFortuneRef = useRef<string | undefined>(undefined);
  const cardTimerRef = useRef<number | null>(null);

  const [todayCatch, setTodayCatch] = useState<FortuneRecord | null>(null);
  const [showCard, setShowCard] = useState(false);

  // Restore today's catch (if any) after mount
  useEffect(() => {
    const stored = readStoredCatch();
    if (!stored) return;
    if (stored.date === todayKey()) {
      setTodayCatch(stored);
    } else {
      previousFortuneRef.current = stored.fortune; // avoid repeating yesterday's
    }
  }, []);

  useEffect(
    () => () => {
      if (cardTimerRef.current) window.clearTimeout(cardTimerRef.current);
    },
    []
  );

  /* ---------------- Ocean setup + swimming loop ---------------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !container || !ctx) return;

    // Keep canvas pixels in sync with its box so fish never stretch
    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        canvas.width = w;
        canvas.height = h;
      }
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    let cancelled = false;
    let rafId = 0;

    const drawFish = (
      fish: SwimmingFish,
      x: number,
      y: number,
      scale: number,
      rot: number,
      alpha: number
    ) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(fish.facing * scale, scale); // sprites face right; negative = mirrored
      ctx.drawImage(fish.sprite.source, -fish.w / 2, -fish.h / 2, fish.w, fish.h);
      ctx.restore();
    };

    const start = async () => {
      const sprites = await loadSprites();
      if (cancelled) return;

      fishesRef.current = sortByDepth(
        Array.from({ length: OCEAN_FISH_COUNT }, (_, i) =>
          makeFish(
            `fish-${i}`,
            sprites[Math.floor(Math.random() * sprites.length)],
            canvas.width,
            canvas.height
          )
        )
      );

      let last = performance.now();
      let t = 0;

      const render = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        t += dt;

        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        // Background bubbles
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        for (let i = 0; i < 10; i++) {
          const bx = (Math.sin(t + i * 2) * 20 + i * 45 + 30) % W;
          const by = H - ((t * 25 + i * 35) % H);
          ctx.beginPath();
          ctx.arc(bx, by, (i % 3) + 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        const catching: SwimmingFish[] = [];

        for (const fish of fishesRef.current) {
          if (fish.caught !== null) {
            fish.caught = Math.min(1, fish.caught + dt / CATCH_ANIM_SECONDS);
            catching.push(fish);
            continue;
          }

          const halfW = fish.w / 2;

          // Swim straight until near a wall, then turn back
          if (fish.dir === 1 && fish.x >= W - halfW - fish.turnMargin) {
            turnFish(fish, -1, H);
          } else if (fish.dir === -1 && fish.x <= halfW + fish.turnMargin) {
            turnFish(fish, 1, H);
          }

          // Ease through the turn: slow down, flip, speed up again
          fish.facing += (fish.dir - fish.facing) * (1 - Math.exp(-dt * 3));
          fish.x = clamp(fish.x + fish.speed * fish.facing * dt, halfW, W - halfW);

          // Gentle vertical drift + bobbing
          fish.baseY += (fish.targetY - fish.baseY) * (1 - Math.exp(-dt * 0.4));
          const prevY = fish.y;
          fish.y = fish.baseY + Math.sin(t * fish.bobFreq + fish.phase) * fish.bobAmp;
          const vy = dt > 0 ? (fish.y - prevY) / dt : 0;

          const tilt =
            clamp(Math.atan2(vy, 60), -0.3, 0.3) * fish.facing +
            Math.sin(t * 7 + fish.phase) * 0.04 * Math.abs(fish.facing);

          drawFish(fish, fish.x, fish.y, 1, tilt, fish.depth);
        }

        // Caught fish: swim to the middle, grow, wiggle, sparkle, fade
        for (const fish of catching) {
          const p = fish.caught as number;
          const e = 1 - Math.pow(1 - p, 3);
          const cx = fish.x + (W / 2 - fish.x) * e;
          const cy = fish.y + (H / 2 - fish.y) * e;
          const alpha = p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3;

          drawFish(
            fish,
            cx,
            cy,
            1 + 1.4 * e,
            Math.sin(p * 18) * 0.25 * (1 - p),
            alpha
          );

          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
          for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(
              cx + Math.cos(a) * e * 55,
              cy + Math.sin(a) * e * 55,
              2.5 * (1 - p) + 0.5,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }

        if (catching.some((f) => (f.caught as number) >= 1)) {
          fishesRef.current = fishesRef.current.filter(
            (f) => f.caught === null || f.caught < 1
          );
        }

        rafId = requestAnimationFrame(render);
      };

      rafId = requestAnimationFrame(render);
    };

    void start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  /* ---------------- Interaction ---------------- */

  const findFishAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    // Front-most fish first (list is sorted far -> near)
    return [...fishesRef.current]
      .reverse()
      .find(
        (fish) =>
          fish.caught === null &&
          Math.abs(fish.x - x) <= fish.w / 2 + 6 &&
          Math.abs(fish.y - y) <= fish.h / 2 + 6
      );
  };

  const handleOceanMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = findFishAt(e.clientX, e.clientY) ? 'pointer' : 'default';
    }
  };

  const handleOceanClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (showCard) return;
    const fish = findFishAt(e.clientX, e.clientY);
    if (!fish) return;

    // Already caught today: just show today's fortune again
    if (todayCatch && todayCatch.date === todayKey()) {
      setShowCard(true);
      return;
    }

    // Fresh catch
    const record = pickFortune(previousFortuneRef.current);
    fish.caught = 0;
    writeStoredCatch(record);
    setTodayCatch(record);

    cardTimerRef.current = window.setTimeout(
      () => setShowCard(true),
      CATCH_ANIM_SECONDS * 1000 - 100
    );
  };

  const caughtToday = !!todayCatch && todayCatch.date === todayKey();

  /* ---------------- Render ---------------- */

  return (
    <Window
      id="game"
      title="Fishu Fishi"
      icon="/icons/drawing.png"
      isOpen
      isActive={isActive}
      onClose={onClose}
      onMinimize={onMinimize}
      className="!static !inset-auto !top-auto !left-auto !w-[min(440px,calc(100vw-1rem))] !min-w-0 !max-w-none !max-h-none font-pixel select-none"
    >
      <div className="bg-[#c0c0c0] p-3 flex flex-col gap-2.5 text-black">
        {/* Ocean */}
        <div
          ref={containerRef}
          className="w-full h-72 relative overflow-hidden bg-cover bg-center rounded-sm"
          style={{
            backgroundImage: "url('/images/coral_reef.png')",
            backgroundColor: '#1b639e',
            boxShadow: BEVEL_SUNKEN,
          }}
        >
          <canvas
            ref={canvasRef}
            width={410}
            height={288}
            onClick={handleOceanClick}
            onMouseMove={handleOceanMove}
            className="w-full h-full relative z-10"
          />

          {/* Fortune slip */}
          {showCard && todayCatch && (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/30">
              <div className="w-full max-w-[320px] bg-[#fff8dc] border-2 border-black shadow-[3px_3px_0px_#000] flex flex-col animate-in fade-in zoom-in duration-150">
                <div className="flex items-center justify-between bg-[#000080] text-white px-2 py-1">
                  <span className="text-[11px] font-bold font-pixel tracking-wider">
                    TODAY&apos;S FORTUNE
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCard(false)}
                    className="w-4 h-4 bg-[#c0c0c0] text-black hover:bg-red-500 hover:text-white flex items-center justify-center text-[10px] font-bold border border-black"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-4 flex flex-col gap-3 text-center">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-bold">
                    {formatDate(todayCatch.date)}
                  </p>
                  <p className="text-sm leading-relaxed text-black font-sans">
                    &ldquo;{todayCatch.fortune}&rdquo;
                  </p>
                  <div className="border-t border-dashed border-gray-500 pt-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">
                      Lucky numbers
                    </p>
                    <p className="text-xs font-bold mt-0.5">
                      {todayCatch.lucky.join(' · ')}
                    </p>
                  </div>
                  <p className="text-[10px] text-gray-600">
                    Come back tomorrow for a new catch!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status strip */}
        <div
          className="bg-white px-3 py-2 flex items-center justify-between gap-2"
          style={{ boxShadow: BEVEL_SUNKEN }}
        >
          <span className="text-xs font-bold font-pixel leading-snug">
            {caughtToday
              ? `Caught today's fortune! Next catch in ${timeUntilTomorrow()}`
              : "Click a fish to catch today's fortune"}
          </span>
          {caughtToday && (
            <button
              type="button"
              onClick={() => setShowCard(true)}
              className="px-2 py-0.5 text-xs font-bold bg-[#c0c0c0] hover:bg-[#d0d0d0] active:bg-[#a0a0a0] cursor-pointer shrink-0"
              style={{ boxShadow: BEVEL_RAISED }}
            >
              read again
            </button>
          )}
        </div>
      </div>
    </Window>
  );
};