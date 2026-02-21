import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { dummyProducts } from '../data/dummyData';
import { Search, ShoppingBag, Sparkles } from 'lucide-react';

const UserDashboard = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');

    const cats = ['All', 'Grocery', 'Electronics', 'Clothing', 'Food', 'Pharmacy', 'Stationery', 'Hardware', 'Other'];

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get('/api/owners/all-products');
                const data = res.data.data.length > 0 ? res.data.data : dummyProducts;
                setProducts(data);
                setFiltered(data);
            } catch {
                setProducts(dummyProducts);
                setFiltered(dummyProducts);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    useEffect(() => {
        let f = [...products];
        if (search) f = f.filter(p =>
            p.productName.toLowerCase().includes(search.toLowerCase()) ||
            p.shopName?.toLowerCase().includes(search.toLowerCase())
        );
        if (category !== 'All') f = f.filter(p => p.category === category);
        setFiltered(f);
    }, [search, category, products]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={16} className="text-[#f5a623]" />
                    <span className="text-[#f5a623] text-xs font-bold">Discover</span>
                </div>
                <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                    Hey, <span className="text-[#f5a623]">{user.username}</span>! 👋
                </h1>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Find products from local shops</p>
            </motion.div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl p-4 mb-6"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
                <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f5a623]" />
                    <input
                        type="text" placeholder="Search products, shops..."
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#f5a623]/40 transition-all"
                        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    />
                </div>

                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {cats.map((c) => (
                        <button
                            key={c} onClick={() => setCategory(c)}
                            className="px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex-shrink-0"
                            style={{
                                backgroundColor: category === c ? '#f5a623' : 'var(--bg-secondary)',
                                color: category === c ? '#000' : 'var(--text-secondary)',
                                border: category === c ? 'none' : '1px solid var(--border)',
                            }}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </motion.div>

            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                Showing <span className="font-bold text-[#f5a623]">{filtered.length}</span> products
            </p>

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-10 h-10 border-4 border-[#f5a623]/20 border-t-[#f5a623] rounded-full animate-spin" />
                </div>
            ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filtered.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
                </div>
            ) : (
                <div className="text-center py-16">
                    <ShoppingBag size={48} className="mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} />
                    <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>No products found</p>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;