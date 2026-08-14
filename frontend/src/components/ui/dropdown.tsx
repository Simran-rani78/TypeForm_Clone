"use client";

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MoreVertical } from 'lucide-react';

export function Dropdown({ 
  triggerIcon = <MoreVertical className="h-5 w-5" />,
  children,
  className,
  triggerClassName
}: { 
  triggerIcon?: React.ReactNode,
  children: React.ReactNode,
  className?: string,
  triggerClassName?: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative inline-block text-left", className)} ref={ref}>
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }}
        className={triggerClassName || "p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500 transition-colors"}
      >
        {triggerIcon}
      </button>
      
      {isOpen && (
        <div 
          onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
          className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 flex flex-col py-1"
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ 
  children, 
  onClick,
  className,
  danger = false
}: { 
  children: React.ReactNode, 
  onClick?: (e: React.MouseEvent) => void,
  className?: string,
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2",
        danger ? "text-red-600 hover:bg-red-50" : "text-zinc-700 hover:bg-zinc-100",
        className
      )}
    >
      {children}
    </button>
  );
}
