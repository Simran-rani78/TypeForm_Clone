import React from 'react';

export function Logo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-zinc-900">
        {/* Approximating Typeform logo from the user's blurry image: A thick vertical line and a square next to it */}
        <rect x="2" y="6" width="4" height="12" rx="1" />
        <rect x="8" y="6" width="12" height="12" rx="3" />
      </svg>
    </div>
  );
}
