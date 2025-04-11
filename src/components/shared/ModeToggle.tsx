import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const ModeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 rounded-full 
        transition-colors hover:bg-primary-500/20"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDark ? (
                <Sun className="w-5 h-5 text-light-1" />
            ) : (
                <Moon className="w-5 h-5 text-light-text-1" />
            )}
        </button>
    );
};

export default ModeToggle;