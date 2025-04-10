"use client";
import React from 'react';
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
}

export const Marquee: React.FC<MarqueeProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn("w-full overflow-hidden relative", className)}>
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-black to-transparent pointer-events-none"></div>

      <div className="relative flex overflow-x-hidden">
        <div className="animate-marquee-slow flex whitespace-nowrap">
          {children}
        </div>
        <div className="animate-marquee-slow flex whitespace-nowrap" aria-hidden="true">
          {children}
        </div>
      </div>

      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-black to-transparent pointer-events-none"></div>
    </div>
  );
};