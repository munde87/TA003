import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import Logo from '../components/Logo';
import { User, Mail, Lock, Eye, EyeOff, MapPin, Hash, ArrowRight, ShoppingBag, Store } from 'lucide-react';

const AuthPage = () => {
    const [accountType, setAccountType] = useState('user');
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [address, setAddress] = useState('');
    const [shopType, setShopType] = useState('');
    const [uniqueId, setUniqueId] = useState('');
    const [registeredUniqueId, setRegisteredUniqueId] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const reset = () => {
        setUsername(''); setEmail(''); setPassword('');
        setAddress(''); setShopType(''); setUniqueId('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (accountType === 'user') {
                if (isLogin) {
                    const res = await axios.post('/api/users/login', { email, password });
                    login(res.data.data); toast.success('Welcome back! 🎉'); navigate('/dashboard');
                } else {
                    const res = await axios.post('/api/users/register', { username, email, password });
                    login(res.data.data); toast.success('Account created! 🎉'); navigate('/dashboard');
                }
            } else {
                if (isLogin) {
                    const res = await axios.post('/api/owners/login', { uniqueId, password });
                    login(res.data.data); toast.success('Welcome back! 🏪'); navigate('/owner/dashboard');
                } else {
                    const res = await axios.post('/api/owners/register', { username, email, password, address, shopType });
                    setRegisteredUniqueId(res.data.data.uniqueId); toast.success('Shop registered! 🎉');
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#f5a623]/40 transition-all";
    const inputStyle = { backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' };

    if (registeredUniqueId) {
        return (
            <div className="min-h-[85vh] flex items-center justify-center px-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-sm w-full p-8 rounded-2xl text-center"
                    style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                    <div className="text-5xl mb-4">🎉</div>
                    <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Registration Successful!</h2>
                    <p className="text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>Here's your unique login ID:</p>

                    <div className="rounded-xl p-5 mb-5" style={{ backgroundColor: 'var(--accent-light)', border: '2px dashed rgba(245,166,35,0.3)' }}>
                        <p className="text-[10px] text-[#f5a623] mb-1 font-medium">Your Unique ID</p>
                        <p className="text-2xl font-black text-[#f5a623] tracking-wider">{registeredUniqueId}</p>
                    </div>

                    <p className="text-[11px] text-yellow-600 mb-5">⚠️ Save this ID! Login with ID + password</p>

                    <button
                        onClick={() => { setRegisteredUniqueId(''); setIsLogin(true); reset(); }}
                        className="w-full bg-[#f5a623] text-black py-2.5 rounded-xl font-bold text-sm"
                    >
                        Go to Login →
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-sm w-full p-6 rounded-2xl"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
                <div className="flex justify-center mb-5">
                    <Logo size="md" />
                </div>

                {/* Toggle */}
                <div className="flex rounded-xl p-1 mb-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    {[
                        { type: 'user', label: 'User', icon: User },
                        { type: 'owner', label: 'Shop Owner', icon: Store },
                    ].map((tab) => (
                        <button
                            key={tab.type}
                            onClick={() => { setAccountType(tab.type); reset(); setIsLogin(true); }}
                            className="flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                            style={{
                                backgroundColor: accountType === tab.type ? '#f5a623' : 'transparent',
                                color: accountType === tab.type ? '#000' : 'var(--text-secondary)',
                            }}
                        >
                            <tab.icon size={13} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Title */}
                <div className="text-center mb-5">
                    <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {accountType === 'user'
                            ? isLogin ? 'Login to explore products' : 'Sign up to start shopping'
                            : isLogin ? 'Login with your Unique ID' : 'Register your shop'
                        }
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                    {!isLogin && (
                        <div className="relative">
                            <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f5a623]" />
                            <input type="text" placeholder={accountType === 'owner' ? 'Shop Name' : 'Username'}
                                value={username} onChange={(e) => setUsername(e.target.value)}
                                className={inputClass} style={inputStyle} required />
                        </div>
                    )}

                    {(!isLogin || (isLogin && accountType === 'user')) && (
                        <div className="relative">
                            <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f5a623]" />
                            <input type="email" placeholder="Email address"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                className={inputClass} style={inputStyle} required />
                        </div>
                    )}

                    {isLogin && accountType === 'owner' && (
                        <div className="relative">
                            <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f5a623]" />
                            <input type="text" placeholder="Unique ID (NEARU-XXX-XXXXX)"
                                value={uniqueId} onChange={(e) => setUniqueId(e.target.value.toUpperCase())}
                                className={`${inputClass} uppercase`} style={inputStyle} required />
                        </div>
                    )}

                    {!isLogin && accountType === 'owner' && (
                        <>
                            <div className="relative">
                                <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f5a623]" />
                                <input type="text" placeholder="Shop Address"
                                    value={address} onChange={(e) => setAddress(e.target.value)}
                                    className={inputClass} style={inputStyle} required />
                            </div>
                            <div className="relative">
                                <ShoppingBag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f5a623]" />
                                <select value={shopType} onChange={(e) => setShopType(e.target.value)}
                                    className={`${inputClass} appearance-none`} style={inputStyle} required>
                                    <option value="" disabled>Select Shop Type</option>
                                    <option value="Grocery">🛒 Grocery</option>
                                    <option value="Electronics">📱 Electronics</option>
                                    <option value="Clothing">👕 Clothing</option>
                                    <option value="Food">🍕 Food</option>
                                    <option value="Pharmacy">💊 Pharmacy</option>
                                    <option value="Stationery">📝 Stationery</option>
                                    <option value="Hardware">🔧 Hardware</option>
                                    <option value="Other">📦 Other</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div className="relative">
                        <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f5a623]" />
                        <input type={showPassword ? 'text' : 'password'} placeholder="Password"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            className={`${inputClass} pr-10`} style={inputStyle} required minLength={6} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }}>
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full bg-[#f5a623] text-black py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#e09000] transition-colors disabled:opacity-50 mt-1">
                        {loading
                            ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            : <>{isLogin ? 'Login' : 'Create Account'} <ArrowRight size={15} /></>
                        }
                    </button>
                </form>

                <p className="text-center text-xs mt-5" style={{ color: 'var(--text-secondary)' }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => { setIsLogin(!isLogin); reset(); }}
                        className="text-[#f5a623] font-bold hover:underline">
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </p>
            </motion.div>
        </div>
    );
};

export default AuthPage;