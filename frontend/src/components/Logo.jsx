import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const Logo = ({ size = 'md' }) => {
    const sizes = {
        sm: { icon: 16, text: 'text-lg', pad: 'p-1.5', gap: 'gap-1.5' },
        md: { icon: 20, text: 'text-xl', pad: 'p-2', gap: 'gap-2' },
        lg: { icon: 28, text: 'text-3xl', pad: 'p-2.5', gap: 'gap-2' },
    };

    const s = sizes[size] || sizes.md;

    return (
        <motion.div
            className={`flex items-center ${s.gap} select-none`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
        >
            <div className={`bg-[#f5a623] ${s.pad} rounded-xl inline-flex items-center justify-center`}>
                <MapPin size={s.icon} className="text-black" strokeWidth={2.5} />
            </div>
            <span className={`${s.text} font-black tracking-tight`}>
                <span style={{ color: 'var(--text-primary)' }}>Near</span>
                <span className="text-[#f5a623]">U</span>
            </span>
        </motion.div>
    );
};

export default Logo;