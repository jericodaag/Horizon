"use client";
import React from "react";
import { cn } from "@/lib/utils";
export const SimplifiedBackground = ({
    children,
    className,
    containerClassName,
}: {
    children?: React.ReactNode;
    className?: string;
    containerClassName?: string;
}) => {
    return (
        <div
            className={cn(
                "relative h-screen flex flex-col items-center justify-center overflow-hidden bg-black w-full rounded-md z-0",
                containerClassName
            )}
        >
            {/* Static background with subtle animation */}
            <div
                className="absolute inset-0 w-full h-full"
                style={{
                    background:
                        "radial-gradient(circle at 25% 30%, rgba(108, 0, 162, 0.5) 0%, transparent 50%), " +
                        "radial-gradient(circle at 80% 20%, rgba(0, 17, 82, 0.5) 0%, transparent 50%)",
                    backgroundSize: "cover",
                }}>
            </div>
            {/* Subtle moving gradient overlay with CSS animation only */}
            <div
                className="absolute inset-0 opacity-30 animate-subtle-float"
                style={{
                    background:
                        "linear-gradient(45deg, rgba(120, 58, 180, 0.2) 0%, rgba(29, 38, 113, 0.2) 50%, rgba(221, 74, 255, 0.2) 100%)",
                    filter: "blur(40px)",
                }}
            ></div>
            {/* Optional noise texture for added depth */}
            <div
                className="absolute inset-0 z-10 h-full w-full bg-black opacity-70"
                style={{
                    backgroundImage: "url('/assets/images/noise.png')",
                    backgroundRepeat: "repeat",
                }}
            ></div>

            {/* Explicit black gradient at the bottom */}
            <div
                className="absolute bottom-0 left-0 right-0 z-20 h-1/3 w-full"
                style={{
                    background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)",
                }}
            ></div>
            {/* Content container */}
            <div
                className={cn(
                    "absolute inset-0 flex items-center justify-center h-full w-full",
                    className
                )}
            >
                {children}
            </div>
        </div>
    );
};