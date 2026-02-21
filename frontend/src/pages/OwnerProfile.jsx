import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { User, Mail, MapPin, ShoppingBag, Hash, Calendar, Package } from 'lucide-react';

const OwnerProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/owners/profile', { headers: { Authorization: `Bearer ${user.token}` } })
            .then(res => setProfile(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center min-h-[70vh]">
            <div className="w-10 h-10 border-4 border-[#f5a623]/20 border-t-[#f5a623] rounded-full animate-spin" />
        </div>
    );

    if (!profile) return <div className="text-center py-16" style={{ color: 'var(--text-secondary)' }}>Profile not found</div>;

    const items = [
        { icon: Hash, label: 'Unique ID', value: profile.uniqueId, yellow: true },
        { icon: Mail, label: 'Email', value: profile.email },
        { icon: MapPin, label: 'Address', value: profile.address },
        { icon: ShoppingBag, label: 'Shop Type', value: profile.shopType },
        { icon: Package, label: 'Products', value: profile.products?.length || 0, big: true },
        { icon: Calendar, label: 'Member Since', value: new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) },
    ];

    return (
        <div className="max-w-3xl mx-auto px-4 py-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>

                {/* Banner */}
                <div className="h-36 relative" style={{ background: 'linear-gradient(135deg, #f5a623, #e09000, #ff6b35)' }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                        className="absolute -bottom-8 left-6">
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center border-4 text-2xl"
                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bg-card)' }}>
                            🏪
                        </div>
                    </motion.div>
                </div>

                <div className="pt-12 px-6 pb-6">
                    <h1 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{profile.username}</h1>
                    <span className={`inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${profile.isShopOpen ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${profile.isShopOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        Shop {profile.isShopOpen ? 'Open' : 'Closed'}
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                        {items.map((item, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                className="rounded-xl p-3.5 flex items-center gap-3"
                                style={{ backgroundColor: 'var(--bg-secondary)', border: item.yellow ? '1px solid rgba(245,166,35,0.2)' : '1px solid var(--border)' }}>
                                <div className="p-2.5 rounded-lg flex-shrink-0" style={{ backgroundColor: 'var(--accent-light)' }}>
                                    <item.icon size={15} className="text-[#f5a623]" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{item.label}</p>
                                    <p className={`font-bold truncate ${item.big ? 'text-lg text-[#f5a623]' : 'text-xs'}`}
                                        style={item.big ? {} : { color: item.yellow ? '#f5a623' : 'var(--text-primary)' }}>
                                        {item.value}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default OwnerProfile;