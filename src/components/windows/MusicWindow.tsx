'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Window } from '@/components/ui/Window';
import type { WindowComponentProps } from '@/types/window';

export interface TrackItem {
  id: string;
  title: string;
  artist: string;
  src: string;
  coverUrl?: string;
}

const DEFAULT_TRACKS: TrackItem[] = [
  {
    id: '1',
    title: 'Ngày nào',
    artist: 'Cá hồi hoang ft. Datmaniac',
    src: '/audio/Ngay-Nao-DatManiac-Ca-Hoi-Hoang.mp3',
    coverUrl: '/images/ngay-nao.png',
  },
  {
    id: '2',
    title: 'The 1',
    artist: 'Taylor Swift',
    src: '/audio/The 1.mp3',
    coverUrl: '/images/the-1.png',
  },
  {
    id: '3',
    title: 'California',
    artist: 'Lana Del Rey',
    src: '/audio/California.mp3',
    coverUrl: '/images/california.png',
  },
  {
    id: '4',
    title: 'Happen Ending',
    artist: 'Epik High',
    src: '/audio/Happen Ending.mp3',
    coverUrl: '/images/happen-ending.jpg',
  },
  {
    id: '5',
    title: 'Late Night Talking',
    artist: 'Harry Styles',
    src: '/audio/Late Night Talking.mp3',
    coverUrl: '/images/late-night-talking.png',
  },
];

interface MusicWindowProps extends WindowComponentProps {
  tracks?: TrackItem[];
}

export const MusicWindow: React.FC<MusicWindowProps> = ({
  tracks = DEFAULT_TRACKS,
  onClose,
  onMinimize,
  isActive,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(70);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = tracks[currentIndex] || tracks[0];

  // Initialize and Sync Audio Element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleEnded = () => {
      handleNext();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentIndex]);

  // Handle Play/Pause when track changes or user toggles play
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentIndex]);

  // Handle Volume Change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % tracks.length);
    setCurrentTime(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPercentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = newPercentage * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Helper to format seconds into M:SS
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds === 0) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Window
      id="music"
      title="Music I Love"
      icon="/icons/music.svg"
      isOpen
      isActive={isActive}
      onClose={onClose}
      onMinimize={onMinimize}
      className="!static !inset-auto !top-auto !left-auto !w-[min(420px,calc(100vw-1rem))] !min-w-0 !max-w-none !max-h-none font-pixel select-none"
    >
      {/* Hidden Real HTML5 Audio Engine */}
      <audio ref={audioRef} src={currentTrack?.src} preload="metadata" />

      <div className="bg-[#c0c0c0] p-3 flex flex-col gap-3">
        {/* Cover Photo Display Frame (Sunken Windows 98 Inset) */}
        <div className="w-full h-56 bg-black relative overflow-hidden flex items-center justify-center"
          style={{
            boxShadow:
              'inset 1px 1px 0px #808080, inset 2px 2px 0px #000000, inset -1px -1px 0px #ffffff',
          }}
        >
          {currentTrack?.coverUrl ? (
            <>
              {/* Blurred background image to fill rectangle sides */}
              <img
                src={currentTrack.coverUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-md opacity-40 scale-110"
              />
              {/* Square cover image preserved in original proportions */}
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="h-full aspect-square object-contain relative z-10 drop-shadow-md pixelated"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </>
          ) : null}
        </div>

        {/* Track Metadata & Controls */}
        <div className="flex flex-col gap-2">
          {/* Artist Field */}
          <div className="flex items-center gap-2">
            <span className="w-12 text-xs font-bold text-black">Artist:</span>
            <div
              className="flex-1 bg-white px-2 py-1 text-xs text-black font-sans"
              style={{
                boxShadow:
                  'inset 1px 1px 0px #808080, inset 2px 2px 0px #000000, inset -1px -1px 0px #ffffff',
              }}
            >
              {currentTrack.artist}
            </div>
          </div>

          {/* Title Field */}
          <div className="flex items-center gap-2">
            <span className="w-12 text-xs font-bold text-black">Title:</span>
            <div
              className="flex-1 bg-white px-2 py-1 text-xs text-black font-sans border border-[#0000ff]"
              style={{
                boxShadow:
                  'inset 1px 1px 0px #808080, inset 2px 2px 0px #000000, inset -1px -1px 0px #ffffff',
              }}
            >
              {currentTrack.title}
            </div>
          </div>

          {/* Real Audio Progress Bar */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-mono text-gray-800 w-8 text-right">
              {formatTime(currentTime)}
            </span>
            <div
              onClick={handleSeek}
              className="flex-1 h-4 bg-[#dfdfdf] relative flex items-center px-1 cursor-pointer"
              style={{
                boxShadow:
                  'inset 1px 1px 0px #808080, inset 2px 2px 0px #000000, inset -1px -1px 0px #ffffff',
              }}
            >
              {/* Progress Fill */}
              <div
                className="h-2 bg-blue-700"
                style={{ width: `${progressPercent}%` }}
              ></div>
              {/* Retro Thumb Slider */}
              <div
                className="absolute w-3 h-4 bg-[#c0c0c0]"
                style={{
                  left: `calc(${progressPercent}% - 6px)`,
                  boxShadow:
                    'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080, inset -2px -2px 0px #000000',
                }}
              ></div>
            </div>
            <span className="text-[10px] font-mono text-gray-800 w-8">
              {formatTime(duration)}
            </span>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-between pt-2 border-t border-[#808080] mt-1">
            <div className="flex items-center gap-1">
              {/* Play / Pause Toggle */}
              <button
                type="button"
                onClick={togglePlay}
                className="w-7 h-7 bg-[#c0c0c0] hover:bg-[#d0d0d0] active:bg-[#a0a0a0] flex items-center justify-center text-xs font-bold cursor-pointer"
                style={{
                  boxShadow:
                    'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080, inset -2px -2px 0px #000000',
                }}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? '❚❚' : '►'}
              </button>

              {/* Volume Controls */}
              <div className="flex items-center gap-2 ml-2">
                <span className="text-xs">
                  <img
                    src="/icons/loudspeaker.png"
                    alt="Speaker"
                    className="h-4 w-4 object-contain"
                  />
                </span>

                {/* Sound Recorder Style Slider */}
                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const newPercentage = Math.max(0, Math.min(1, clickX / rect.width));
                    setVolume(Math.round(newPercentage * 100));
                  }}
                  className="w-20 h-5 relative flex items-center cursor-pointer"
                >
                  {/* Track Line */}
                  <div className="absolute inset-x-0 h-2 flex items-center">
                    <div 
                      className="w-full h-[2px] bg-[#808080]"
                      style={{
                        boxShadow: '0px 1px 0px #ffffff'
                      }}
                    ></div>
                  </div>

                  {/* SVG Arrow directly on top of the line */}
                  <img
                    src="/icons/arrow-down.svg"
                    alt=""
                    className="absolute w-[15px] h-[15px] object-contain -translate-x-1/2 pointer-events-none"
                    style={{
                      left: `${volume}%`,
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                </div>
              </div>
            </div>
            {/* Previous & Next Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                className="w-7 h-7 bg-[#c0c0c0] hover:bg-[#d0d0d0] active:bg-[#a0a0a0] flex items-center justify-center text-xs font-bold cursor-pointer"
                style={{
                  boxShadow:
                    'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080, inset -2px -2px 0px #000000',
                }}
                title="Previous Track"
              >
                ⏮
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-7 h-7 bg-[#c0c0c0] hover:bg-[#d0d0d0] active:bg-[#a0a0a0] flex items-center justify-center text-xs font-bold cursor-pointer"
                style={{
                  boxShadow:
                    'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080, inset -2px -2px 0px #000000',
                }}
                title="Next Track"
              >
                ⏭
              </button>
            </div>
          </div>
        </div>
      </div>
    </Window>
  );
};