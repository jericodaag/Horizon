"use client";
import { Marquee } from '@/components/ui/marquee';

interface TechIconProps {
    src: string;
    alt: string;
}

function TechIcon({ src, alt }: TechIconProps) {
    return (
        <img
            src={src}
            alt={alt}
            className="w-full h-full object-contain"
        />
    );
}

export function TechStackMarquee() {
    const techStack = [
        { icon: "https://cdn.simpleicons.org/react/61DAFB", name: "React" },
        { icon: "https://cdn.simpleicons.org/typescript/3178C6", name: "TypeScript" },
        { icon: "https://cdn.simpleicons.org/tailwindcss/06B6D4", name: "Tailwind CSS" },
        { icon: "https://vitejs.dev/logo-with-shadow.png", name: "Vite" },
        { icon: "https://cdn.simpleicons.org/appwrite/FD366E", name: "Appwrite" },
        { icon: "https://cdn.simpleicons.org/github/181717", name: "GitHub" },
        { icon: "https://cdn.simpleicons.org/reactrouter/CA4245", name: "React Router" },
        { icon: "https://cdn.simpleicons.org/socket.io/ffffff", name: "Socket.io" },
        { icon: "https://cdn.simpleicons.org/reactquery/FF4154", name: "React Query" },
        { icon: "https://cdn.simpleicons.org/zod/3E67B1", name: "Zod" },
        { icon: "https://cdn.simpleicons.org/reacthookform/EC5990", name: "React Hook Form" },
        { icon: "https://cdn.simpleicons.org/git/F05032", name: "Git" },
        { icon: "https://cdn.simpleicons.org/jest/C21325", name: "Jest" },
        { icon: "https://cdn.simpleicons.org/vercel/ffffff", name: "Vercel" },
    ];

    return (
        <div className="h-[180px] flex items-center justify-center">
            <Marquee className="py-6">
                {techStack.map((tech, index) => (
                    <div
                        key={index}
                        className="flex items-center mx-16"
                    >
                        <div className="w-14 h-14 flex-shrink-0 mr-4">
                            <TechIcon src={tech.icon} alt={tech.name} />
                        </div>
                        <span className="text-white text-xl font-medium">{tech.name}</span>
                    </div>
                ))}
            </Marquee>
        </div>
    );
}