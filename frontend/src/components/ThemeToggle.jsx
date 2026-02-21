import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative w-14 h-7 rounded-full flex items-center px-0.5 flex-shrink-0"
            style={{
                backgroundColor: isDark ? '#222' : '#f5a623',
                border: `2px solid ${isDark ? '#f5a623' : '#e09000'}`,
            }}
        >
            <motion.div
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: isDark ? '#f5a623' : '#fff' }}
                animate={{ x: isDark ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
                {isDark ? <Moon size={11} className="text-black" /> : <Sun size={11} className="text-[#f5a623]" />}
            </motion.div>
        </button>
    );
};

export default ThemeToggle;