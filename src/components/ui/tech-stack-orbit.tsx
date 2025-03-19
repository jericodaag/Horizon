import { OrbitingCircles } from "@/components/ui/orbiting-circles";

interface TechIconProps {
    src: string;
    alt: string;
}

function TechIcon({ src, alt }: TechIconProps) {
    return (
        <div className="flex items-center justify-center w-full h-full rounded-full overflow-hidden bg-black/10 dark:bg-white/10 p-1.5 hover:bg-violet-500/20 transition-colors duration-300">
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-contain"
            />
        </div>
    );
}

export function TechStackOrbit() {
    // Charcoal/graphite darker color for the orbit paths
    const orbitPathColor = "rgba(50, 50, 50, 0.6)";

    return (
        <div className="relative h-[460px] w-full flex items-center justify-center">
            {/* Primary orbit - larger radius */}
            <OrbitingCircles
                iconSize={48}
                radius={180}
                speed={1}
                pathColor={orbitPathColor}
                pathWidth={1.5}
                className="bg-black/5 dark:bg-white/5 backdrop-blur-sm"
            >
                <TechIcon src="https://cdn.simpleicons.org/react/61DAFB" alt="React" />
                <TechIcon src="https://cdn.simpleicons.org/typescript/3178C6" alt="TypeScript" />
                <TechIcon src="https://cdn.simpleicons.org/tailwindcss/06B6D4" alt="Tailwind CSS" />
                <TechIcon src="https://vitejs.dev/logo-with-shadow.png" alt="Vite" />
                <TechIcon src="https://cdn.simpleicons.org/appwrite/FD366E" alt="Appwrite" />
                <TechIcon src="https://cdn.simpleicons.org/github/181717" alt="GitHub" />
            </OrbitingCircles>

            {/* Secondary orbit - smaller radius, different direction */}
            <OrbitingCircles
                iconSize={38}
                radius={110}
                reverse
                speed={1.5}
                pathColor={orbitPathColor}
                pathWidth={1.5}
                className="bg-black/5 dark:bg-white/5 backdrop-blur-sm"
            >
                <TechIcon src="https://cdn.simpleicons.org/reactrouter/CA4245" alt="React Router" />
                <TechIcon src="https://cdn.simpleicons.org/socket.io/ffffff" alt="Socket.io" />
                <TechIcon src="https://cdn.simpleicons.org/reactquery/FF4154" alt="React Query" />
                <TechIcon src="https://cdn.simpleicons.org/zod/3E67B1" alt="Zod" />
            </OrbitingCircles>

            {/* Inner orbit - smallest radius, third direction */}
            <OrbitingCircles
                iconSize={32}
                radius={50}
                speed={2}
                pathColor={orbitPathColor}
                pathWidth={1.5}
                className="bg-black/5 dark:bg-white/5 backdrop-blur-sm"
            >
                <TechIcon src="https://cdn.simpleicons.org/reacthookform/EC5990" alt="React Hook Form" />
                <TechIcon src="https://cdn.simpleicons.org/git/F05032" alt="Git" />
                <TechIcon src="https://cdn.simpleicons.org/jest/C21325" alt="Jest" />
                <TechIcon src="https://cdn.simpleicons.org/vercel/ffffff" alt="Vercel" />
            </OrbitingCircles>
        </div>
    );
}