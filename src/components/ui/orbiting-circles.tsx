import { cn } from "@/lib/utils";
import React from "react";

export interface OrbitingCirclesProps
    extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    children?: React.ReactNode;
    reverse?: boolean;
    duration?: number;
    delay?: number;
    radius?: number;
    path?: boolean;
    iconSize?: number;
    speed?: number;
    pathColor?: string;
    pathWidth?: number;
}

export function OrbitingCircles({
    className,
    children,
    reverse,
    duration = 20,
    radius = 160,
    path = true,
    iconSize = 30,
    speed = 1,
    pathColor = "rgba(75, 75, 75, 0.4)", // Darker gray with some opacity
    pathWidth = 1.5, // Slightly thicker path
    ...props
}: OrbitingCirclesProps) {
    const calculatedDuration = duration / speed;

    return (
        <>
            {path && (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    version="1.1"
                    className="pointer-events-none absolute inset-0 size-full"
                >
                    <circle
                        style={{ stroke: pathColor, strokeWidth: pathWidth }}
                        cx="50%"
                        cy="50%"
                        r={radius}
                        fill="none"
                    />
                </svg>
            )}

            {React.Children.map(children, (child, index) => {
                const angle = (360 / React.Children.count(children)) * index;

                return (
                    <div
                        style={
                            {
                                "--duration": `${calculatedDuration}s`,
                                "--radius": `${radius}px`,
                                "--angle": angle,
                                "--icon-size": `${iconSize}px`,
                            } as React.CSSProperties
                        }
                        className={cn(
                            `absolute flex size-[var(--icon-size)] transform-gpu animate-orbit items-center justify-center rounded-full`,
                            { "[animation-direction:reverse]": reverse },
                            className,
                        )}
                        {...props}
                    >
                        {child}
                    </div>
                );
            })}
        </>
    );
}