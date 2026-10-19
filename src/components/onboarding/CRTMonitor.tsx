'use client';

import React, { useEffect, useRef, useState } from 'react';

// Images shown on the monitor once the disk is loaded
const AVATAR_POOL = [
  '/images/user-1.jpg',
  '/images/user-2.jpg',
  '/images/user-3.jpg',
  '/images/user-4.jpg',
  '/images/user-5.jpg',
];

// Text written on the floppy label (edit here)
const DISK_TITLE = 'Huynh Khanh Minh - Portfolio';

// Windows 98 bevels (full class strings so Tailwind can see them)
const WIN_WINDOW =
  'shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#dfdfdf,inset_-2px_-2px_#808080,inset_2px_2px_#fff]';
const WIN_RAISED =
  'shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#fff,inset_-2px_-2px_#808080,inset_2px_2px_#dfdfdf] active:shadow-[inset_-1px_-1px_#fff,inset_1px_1px_#0a0a0a,inset_-2px_-2px_#dfdfdf,inset_2px_2px_#808080]';

// idle     -> waiting for the disk to be inserted
// inserting-> disk is sliding into the slot
// booting  -> screen powers on
// loading  -> images shown full screen, one after another
// flash    -> black screen flash after the last image
// ready    -> black screen with the Windows 98 warning dialog
type Phase = 'idle' | 'inserting' | 'booting' | 'loading' | 'flash' | 'ready';
type DiskStage = 'rest' | 'drag' | 'return' | 'snap' | 'turn' | 'slide' | 'gone';

const SNAP_MS = 280;
const TURN_MS = 450; // disk flips from face-on to lying flat
const SLIDE_MS = 1000; // disk is pushed into the slit lengthwise
const TILT_DEG = 80; // how far the disk is turned (90 = perfectly edge-on)
const PERSPECTIVE_PX = 700;
const RETURN_MS = 350;
const BOOT_MS = 900;
const REVEAL_MS = 900;
const FLASH_MS = 450;

interface CRTMonitorProps {
  onStart: () => void;
}

/* ---------------- Floppy disk ---------------- */
const FloppyDisk: React.FC = () => (
  <div
    className="relative w-full aspect-square bg-[#1b1b1b] shadow-[0_3px_6px_rgba(0,0,0,0.35)]"
    style={{ clipPath: 'polygon(0 0, 90% 0, 100% 10%, 100% 100%, 0 100%)', borderRadius: 3 }}
  >
    {/* Metal shutter */}
    <div className="absolute left-[22%] right-[22%] top-0 h-[34%] bg-gradient-to-b from-[#e9e9e6] to-[#b9b9b4] border-x border-b border-[#8d8d88]">
      <div className="absolute right-[14%] top-[10%] bottom-0 w-[24%] bg-[#1b1b1b] border-x border-[#6f6f6a]" />
      <div className="absolute left-[14%] top-[16%] text-[6px] leading-none font-bold tracking-wider text-[#333] font-pixel">
        1.44MB
      </div>
    </div>

    {/* Paper label */}
    <div
      className="absolute left-[9%] right-[9%] top-[46%] bottom-[6%] bg-[#f5f0e2] border border-[#d8d0ba] px-[6%] pt-[4%]"
      style={{
        backgroundImage:
          'repeating-linear-gradient(to bottom, transparent 0, transparent 13px, rgba(0,0,0,0.18) 13px, rgba(0,0,0,0.18) 14px)',
      }}
    >
      <p
        className="text-[12px] sm:text-[14px] leading-[14px] text-[#2a2a2a] italic"
        style={{ fontFamily: "'Segoe Script','Brush Script MT','Snell Roundhand',cursive" }}
      >
        {DISK_TITLE}
      </p>
    </div>

    {/* Write-protect notch */}
    <div className="absolute right-[5%] bottom-[1.5%] w-[6%] h-[4%] bg-[#f5f0e2]/80" />
  </div>
);

export const CRTMonitor: React.FC<CRTMonitorProps> = ({ onStart }) => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [revealed, setRevealed] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const clickedRef = useRef(false);

  // Disk drag state
  const [stage, setStage] = useState<DiskStage>('rest');
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  // a = degrees the disk is turned about its top edge, t = push along its own length (negative = into the slit)
  const [tilt, setTilt] = useState({ a: 0, t: 0 });
  const [near, setNear] = useState(false);

  const restRef = useRef<HTMLDivElement>(null); // untransformed disk position
  const bezelRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const diskHRef = useRef(0); // disk height, used to sync the slot clip with the slide
  const dragRef = useRef({ sx: 0, sy: 0, ox: 0, oy: 0, moved: false, active: false });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const screenOn = phase === 'loading' || phase === 'flash' || phase === 'ready';
  const isBlack = phase === 'flash' || phase === 'ready';
  const inserted = phase !== 'idle';

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // booting -> loading
  useEffect(() => {
    if (phase !== 'booting') return;
    const t = setTimeout(() => setPhase('loading'), BOOT_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // Show each image full screen, one after another; after the last one, flash black
  useEffect(() => {
    if (phase !== 'loading') return;
    const t = setTimeout(() => {
      if (revealed >= AVATAR_POOL.length - 1) setPhase('flash');
      else setRevealed((n) => n + 1);
    }, REVEAL_MS);
    return () => clearTimeout(t);
  }, [phase, revealed]);

  // flash -> ready
  useEffect(() => {
    if (phase !== 'flash') return;
    const t = setTimeout(() => setPhase('ready'), FLASH_MS);
    return () => clearTimeout(t);
  }, [phase]);

  /* ---------------- Disk dragging ---------------- */
  const isNearSlot = (x: number, y: number) => {
    const rest = restRef.current?.getBoundingClientRect();
    const slot = slotRef.current?.getBoundingClientRect();
    if (!rest || !slot) return false;
    const cx = rest.left + rest.width / 2 + x;
    const cy = rest.top + rest.height / 2 + y;
    const dist = Math.hypot(cx - (slot.left + slot.width / 2), cy - (slot.top + slot.height / 2));
    return dist < Math.max(120, rest.width * 0.9);
  };

  // 1. Dock: the disk's leading (shutter) edge sits on the slot line, face-on.
  // 2. Turn: the disk flips about that edge until it lies flat, pointing into the slit.
  // 3. Push: it slides in along its own length. The part that has passed the slot
  //    plane is clipped away, so the disk is swallowed by the slit edge-first.
  const insertDisk = () => {
    const rest = restRef.current?.getBoundingClientRect();
    const slot = slotRef.current?.getBoundingClientRect();
    if (!rest || !slot) return;

    diskHRef.current = rest.height;
    const snapX = slot.left + slot.width / 2 - rest.width / 2 - rest.left;
    const snapY = slot.top + slot.height / 2 - rest.top;

    const turnAt = SNAP_MS + 40;
    const slideAt = turnAt + TURN_MS + 60;

    setNear(false);
    setPhase('inserting');
    setStage('snap');
    setOffset({ x: snapX, y: snapY });

    later(() => {
      setStage('turn');
      setTilt({ a: TILT_DEG, t: 0 });
    }, turnAt);

    later(() => {
      setStage('slide');
      setTilt({ a: TILT_DEG, t: -rest.height }); // negative = into the monitor
    }, slideAt);

    later(() => {
      setStage('gone');
      setPhase('booting');
    }, slideAt + SLIDE_MS);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (stage !== 'rest' && stage !== 'return') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y, moved: false, active: true };
    setStage('drag');
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d.active) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (Math.hypot(dx, dy) > 5) d.moved = true;
    const x = d.ox + dx;
    const y = d.oy + dy;
    setOffset({ x, y });
    setNear(isNearSlot(x, y));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d.active) return;
    d.active = false;
    e.currentTarget.releasePointerCapture(e.pointerId);

    // A plain tap also inserts the disk (keyboard / touch friendly)
    if (!d.moved || isNearSlot(offset.x, offset.y)) {
      insertDisk();
    } else {
      setNear(false);
      setStage('return');
      setOffset({ x: 0, y: 0 });
      later(() => setStage((s) => (s === 'return' ? 'rest' : s)), RETURN_MS);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && stage === 'rest') {
      e.preventDefault();
      insertDisk();
    }
  };

  const diskTransition =
    stage === 'drag'
      ? 'none'
      : stage === 'return'
      ? `transform ${RETURN_MS}ms cubic-bezier(0.3, 1.4, 0.5, 1)`
      : stage === 'snap'
      ? `transform ${SNAP_MS}ms ease-out`
      : stage === 'turn'
      ? `transform ${TURN_MS}ms ease-in-out`
      : stage === 'slide'
      ? `transform ${SLIDE_MS}ms cubic-bezier(0.45, 0, 0.2, 1), clip-path ${SLIDE_MS}ms cubic-bezier(0.45, 0, 0.2, 1)`
      : 'none';

  // The push moves the disk along its own length by up to its full height (tilt.t), so
  // clipping the same amount off its leading end (same duration and easing) hides
  // exactly the part that has passed the slot plane.
  const diskClip =
    stage === 'snap' || stage === 'turn'
      ? 'inset(0px 0px 0px 0px)'
      : stage === 'slide'
      ? `inset(${diskHRef.current}px 0px 0px 0px)`
      : 'none';

  // The disk stays in front of the bezel the whole time
  const diskZ = stage === 'gone' ? 10 : 30;

  /* ---------------- Start ---------------- */
  // Play boot sound, zoom into the screen, then navigate
  const handleStart = () => {
    if (clickedRef.current) return;
    clickedRef.current = true;

    const audio = new Audio('/audio/boot.mp3');
    audio.volume = 0.5;
    audio.play().catch((err) => {
      console.warn('Audio playback prevented by browser:', err);
    });

    setIsZooming(true);
    setTimeout(onStart, 6000);
  };

  // The warning replaces the START button: it appears once the screen is ready
  // and disappears when the zoom begins
  const showWarning = phase === 'ready' && !isZooming;

  // Both "Yes" buttons lead into the portfolio
  const confirmEntry = handleStart;

  return (
    <div
      className={`
        w-screen h-screen bg-[#faf1e6]
        flex items-center justify-center p-4
        select-none overflow-hidden
        ${isZooming ? 'animate-zoom-in pointer-events-none' : ''}
      `}
    >
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
        {/* ================= Monitor (original size) ================= */}
        {/* No filter on this wrapper so the disk can slide between the stand and the bezel */}
        <div className="flex flex-col items-center w-[min(88vw,460px)]">
          {/* Bezel */}
          <div
            ref={bezelRef}
            className="relative z-20 w-full aspect-[1.21/1] rounded-[6px] bg-gradient-to-b from-[#d9d3bf] to-[#cdc6ae] border border-[#b9b29a] drop-shadow-md"
          >
            {/* Inner recess */}
            <div className="absolute left-[7%] right-[7%] top-[8%] bottom-[11%] rounded-[3px] bg-[#bdb69e] shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]" />

            {/* Screen */}
            <div
              className={`absolute left-[11.3%] right-[11.3%] top-[12.5%] bottom-[15%] overflow-hidden rounded-[10px] flex items-center justify-center shadow-[inset_0_0_6px_rgba(0,0,0,0.15)] ${isBlack ? '' : 'transition-colors duration-700'} ${
                isBlack ? 'bg-black' : screenOn ? 'bg-[#f6d3d1]' : phase === 'booting' ? 'bg-[#8d7e7d]' : 'bg-[#232323]'
              }`}
            >
              {!screenOn && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
              )}

              {screenOn && (
                <>
                  {/* One full-screen image at a time */}
                  {AVATAR_POOL.map((src, i) => (
                    <img
                      key={src}
                      src={src}
                      alt={`Avatar ${i + 1}`}
                      className={`absolute inset-0 w-full h-full object-cover pixelated ${
                        phase === 'loading' && i === revealed ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Floppy slot (glows when the disk is close enough to drop) */}
            <div
              ref={slotRef}
              className={`absolute left-1/2 -translate-x-1/2 bottom-[3.5%] w-[34%] h-[6px] rounded-[1px] bg-[#1d1b16] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.4)] transition-shadow ${
                near ? '' : ''
              }`}
            />

            {/* Power LED + button */}
            <div className="absolute right-[8%] bottom-[3.5%] flex items-center gap-[6px]">
              <div
                className={`w-[4px] h-[4px] rounded-full transition-colors duration-500 ${
                  inserted ? 'bg-[#4fe08a] shadow-[0_0_4px_#4fe08a]' : 'bg-[#8a846f]'
                }`}
              />
              <div className="w-[16px] h-[7px] rounded-[2px] bg-[#cfc8b2] border border-[#a29b84]" />
            </div>
          </div>

          {/* Neck */}
          <div className="w-[30%] h-[14px] bg-gradient-to-b from-[#cdc6ae] to-[#bfb8a0] border-x border-[#b0a98f]" />
          {/* Base */}
          <div className="w-[38%] h-[18px] rounded-b-[50%] bg-gradient-to-b from-[#c8c1a9] to-[#a9a28a]" />
        </div>

        {/* ================= Floppy disk, next to the computer ================= */}
        <div className="flex flex-col items-center gap-3">
          <div ref={restRef} className="relative w-[clamp(110px,24vw,170px)] aspect-square">
            <div
              role="button"
              tabIndex={0}
              aria-label={`Insert disk: ${DISK_TITLE}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onKeyDown={onKeyDown}
              className={`absolute inset-0 touch-none ${
                stage === 'drag' ? 'cursor-grabbing' : stage === 'rest' || stage === 'return' ? 'cursor-grab' : ''
              }`}
              style={{
                // Same function list in every stage so the transition can interpolate.
                // The pivot is the top edge, so the disk turns about the slot line.
                transform: `translate3d(${offset.x}px, ${offset.y}px, 0) perspective(${PERSPECTIVE_PX}px) rotateX(${tilt.a}deg) translateY(${tilt.t}px)`,
                transformOrigin: '50% 0%',
                transition: diskTransition,
                clipPath: diskClip,
                zIndex: diskZ,
                visibility: stage === 'gone' ? 'hidden' : 'visible',
              }}
            >
              <FloppyDisk />
            </div>
          </div>

          <p
            className={`font-pixel text-[8px] sm:text-[10px] text-[#6b6455] whitespace-nowrap transition-opacity ${
              inserted ? 'opacity-0' : 'opacity-100'
            }`}
          >
            Drag the disk into the slot
          </p>
        </div>
      </div>

      {/* ================= Windows 98 warning dialog ================= */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div
            role="alertdialog"
            aria-labelledby="warning-title"
            aria-describedby="warning-text"
            className={`w-full max-w-sm bg-[#c0c0c0] p-[3px] drop-shadow-2xl ${WIN_WINDOW}`}
            style={{ fontFamily: "Tahoma, 'MS Sans Serif', Geneva, sans-serif" }}
          >
            {/* Title bar */}
            <div
              className="flex items-center justify-between px-[3px] py-[2px] text-white text-xs font-bold cursor-default"
              style={{ background: 'linear-gradient(90deg, #000080, #1084d0)' }}
            >
              <span id="warning-title" className="pl-1">
                Warning
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
                <div id="warning-text" className="text-xs sm:text-sm leading-relaxed pt-1">
                  <p>You are about to enter Minh&apos;s portfolio.</p>
                  <p>Are you ready?</p>
                </div>
              </div>

              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  autoFocus
                  onClick={confirmEntry}
                  className={`min-w-[84px] px-3 py-[5px] bg-[#c0c0c0] text-black text-xs focus:outline focus:outline-1 focus:outline-dotted focus:outline-black focus:outline-offset-[-5px] ${WIN_RAISED}`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={confirmEntry}
                  className={`min-w-[84px] px-3 py-[5px] bg-[#c0c0c0] text-black text-xs focus:outline focus:outline-1 focus:outline-dotted focus:outline-black focus:outline-offset-[-5px] ${WIN_RAISED}`}
                >
                  Yes, I am
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};