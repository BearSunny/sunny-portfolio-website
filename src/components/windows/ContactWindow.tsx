'use client';

import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { Window } from '@/components/ui/Window';
import type { WindowComponentProps } from '@/types/window';

// These three are meant to be public (they end up in the browser bundle).
// Set them in .env.local and in your hosting provider's environment settings.
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

const EMPTY_FORM = { name: '', email: '', company: '', message: '' };

type Status = 'idle' | 'submitting' | 'success' | 'error';

export const ContactWindow: React.FC<WindowComponentProps> = ({
  onClose,
  onMinimize,
  isActive,
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [status, setStatus] = useState<Status>('idle');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    // Typing again clears an old success / error message
    if (status === 'success' || status === 'error') setStatus('idle');

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form || status === 'submitting') return;

    // Honeypot: people never see this field, bots fill it in.
    // Pretend it worked, but don't send anything.
    const trap = new FormData(form).get('website');
    if (trap) {
      setStatus('success');
      setFormData(EMPTY_FORM);
      return;
    }

    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.error('EmailJS environment variables are missing.');
      setStatus('error');
      return;
    }

    setStatus('submitting');

    try {
      await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form, {
        publicKey: EMAILJS_PUBLIC_KEY,
      });
      setStatus('success');
      setFormData(EMPTY_FORM);
    } catch (err) {
      console.error('EmailJS send failed:', err);
      setStatus('error');
    }
  };

  return (
    <Window
      id="contact"
      title="Contact"
      icon="/icons/mail.svg"
      isOpen
      isActive={isActive}
      onClose={onClose}
      onMinimize={onMinimize}
      className="!static !inset-auto !top-auto !left-auto !w-[min(480px,calc(100vw-1rem))] !min-w-0 !max-w-none !max-h-none font-pixel select-none"
    >
      <div className="bg-[#c0c0c0] p-4 sm:p-5 flex flex-col text-black">
        {/* Header Title + Social Icons */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-3xl font-black tracking-wide font-pixel">Contact</h2>
          <div className="flex items-center gap-1.5">
            {/* GitHub */}
            <a
              href="https://github.com/BearSunny"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 bg-[#c0c0c0] hover:bg-[#d0d0d0] active:bg-[#a0a0a0] flex items-center justify-center cursor-pointer"
              style={{
                boxShadow:
                  'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080, inset -2px -2px 0px #000000',
              }}
              title="GitHub"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/khanhminhhuynh/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 bg-[#c0c0c0] hover:bg-[#d0d0d0] active:bg-[#a0a0a0] flex items-center justify-center cursor-pointer"
              style={{
                boxShadow:
                  'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080, inset -2px -2px 0px #000000',
              }}
              title="LinkedIn"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
            {/* Discord */}
            {/* <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 bg-[#c0c0c0] hover:bg-[#d0d0d0] active:bg-[#a0a0a0] flex items-center justify-center cursor-pointer"
              style={{
                boxShadow:
                  'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080, inset -2px -2px 0px #000000',
              }}
              title="Discord"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .079.009c.12.098.245.195.372.288a.077.077 0 0 1-.006.128 12.299 12.299 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </a> */}
          </div>
        </div>

        {/* Intro Paragraph */}
        <p className="text-xs sm:text-sm text-black leading-relaxed font-sans mb-1">
          If you have any opportunities, feel free to reach out - I would love to chat! You can contact me via my personal email or fill in the form below:
        </p>

        {/* Email Direct Link */}
        <div className="mb-4">
          <span className="text-xs sm:text-sm font-bold font-sans">Email: </span>
          <a
            href="mailto:minhsunnybear@gmail.com"
            className="text-xs sm:text-sm text-black underline font-bold hover:text-blue-800 font-sans"
          >
            minhsunnybear@gmail.com
          </a>
        </div>

        {/* Form Fields */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="relative flex flex-col gap-3"
        >
          {/* Your Name */}
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-xs font-bold font-sans">
              Your name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-white px-2 py-1.5 text-xs text-black font-sans focus:outline-none"
              style={{
                boxShadow:
                  'inset 1px 1px 0px #808080, inset 2px 2px 0px #000000, inset -1px -1px 0px #ffffff',
              }}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-xs font-bold font-sans">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-white px-2 py-1.5 text-xs text-black font-sans focus:outline-none"
              style={{
                boxShadow:
                  'inset 1px 1px 0px #808080, inset 2px 2px 0px #000000, inset -1px -1px 0px #ffffff',
              }}
            />
          </div>

          {/* Company */}
          <div className="flex flex-col gap-1">
            <label htmlFor="company" className="text-xs font-bold font-sans">
              Company (optional):
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full bg-white px-2 py-1.5 text-xs text-black font-sans focus:outline-none"
              style={{
                boxShadow:
                  'inset 1px 1px 0px #808080, inset 2px 2px 0px #000000, inset -1px -1px 0px #ffffff',
              }}
            />
          </div>

          {/* Message */}
          <div className="flex flex-col gap-1">
            <label htmlFor="message" className="text-xs font-bold font-sans">
              Messages:
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              value={formData.message}
              onChange={handleChange}
              className="w-full bg-white p-2 text-xs text-black font-sans focus:outline-none resize-none"
              style={{
                boxShadow:
                  'inset 1px 1px 0px #808080, inset 2px 2px 0px #000000, inset -1px -1px 0px #ffffff',
              }}
            />
          </div>

          {/* Honeypot: invisible to people, bots tend to fill it in */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
          />

          {/* Submit Action */}
          <div className="flex items-center justify-between mt-1 gap-3">
            {status === 'success' ? (
              <span className="text-xs text-green-700 font-bold font-sans">
                Message sent successfully!
              </span>
            ) : status === 'error' ? (
              <span className="text-xs text-red-600 font-bold font-sans">
                Couldn&apos;t send that. Please try again or email me directly.
              </span>
            ) : (
              <span className="text-[10px] text-gray-600 font-mono">
                {status === 'submitting' ? 'Sending message...' : ''}
              </span>
            )}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="px-4 py-1.5 bg-[#c0c0c0] hover:bg-[#d0d0d0] active:bg-[#a0a0a0] text-xs font-bold text-black cursor-pointer ml-auto shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                boxShadow:
                  'inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080, inset -2px -2px 0px #000000',
              }}
            >
              Send Message
            </button>
          </div>
        </form>

        {/* Separator Line */}
        <hr className="border-t border-[#808080] my-4" />

        <div className="flex items-center gap-3 px-1">
          <div className="shrink-0 w-10 h-10 flex items-center justify-center">
            <img
              src="/icons/resume.svg"
              alt="Resume"
              className="h-8 w-8 object-contain"
            />
          </div>

          {/* Text & Link */}
          <div className="flex flex-col">
            <span className="text-xs font-bold text-black font-sans">
              Need a copy of my Resume?
            </span>
            <a
              href="/resume.pdf"
              target="_blank"
              download
              className="text-xs text-[#0000ff] underline font-bold hover:text-blue-800 font-sans"
            >
              Click here to download it!
            </a>
          </div>
        </div>
      </div>
    </Window>
  );
};