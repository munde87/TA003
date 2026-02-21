import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Plus, Trash2, Eye, EyeOff, Package, DollarSign, FileText, Image, Tag, Power, X } from 'lucide-react';

const OwnerDashboard = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [shopOpen, setShopOpen] = useState(user?.isShopOpen ?? true);
    const [form, setForm] = useState({ productName: '', productPrice: '', productDescription: '', productImage: '', category: 'General' });

    const config = { headers: { Authorization: `Bearer ${user?.token}` } };

    useEffect(() => {
        axios.get('/api/owners/my-products', config)
            .then(res => setProducts(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const addProduct = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/owners/products', { ...form, productPrice: Number(form.productPrice) }, config);
            setProducts([...products, res.data.data]);
            setForm({ productName: '', productPrice: '', productDescription: '', productImage: '', category: 'General' });
            setShowForm(false);
            toast.success('Product added! ✅');
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const toggleProduct = async (id) => {
        try {
            const res = await axios.put(`/api/owners/products/${id}/toggle`, {}, config);
            setProducts(products.map(p => p._id === id ? { ...p, isLive: res.data.data.isLive } : p));
            toast.success(res.data.message);
        } catch { toast.error('Error'); }
    };

    const deleteProduct = async (id) => {
        if (!confirm('Delete this product?')) return;
        try {
            await axios.delete(`/api/owners/products/${id}`, config);
            setProducts(products.filter(p => p._id !== id));
            toast.success('Deleted! 🗑️');
        } catch { toast.error('Error'); }
    };

    const toggleShop = async () => {
        try {
            const res = await axios.put('/api/owners/toggle-shop', {}, config);
            setShopOpen(res.data.isShopOpen);
            toast.success(res.data.message);
        } catch { toast.error('Error'); }
    };

    const inputClass = "w-full rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#f5a623]/40 transition-all";
    const inputStyle = { backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' };

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                        🏪 <span className="text-[#f5a623]">{user.username}</span>
                    </h1>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Manage your products</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={toggleShop}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                        style={{
                            backgroundColor: shopOpen ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                            color: shopOpen ? '#22c55e' : '#ef4444',
                            border: `1px solid ${shopOpen ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        }}>
                        <Power size={13} /> Shop {shopOpen ? 'Open' : 'Closed'}
                    </button>
                    <button onClick={() => setShowForm(!showForm)}
                        className="bg-[#f5a623] text-black px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <Plus size={13} /> Add Product
                    </button>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                    { label: 'Total', val: products.length, emoji: '📦', color: '#f5a623' },
                    { label: 'Live', val: products.filter(p => p.isLive).length, emoji: '🟢', color: '#22c55e' },
                    { label: 'Closed', val: products.filter(p => !p.isLive).length, emoji: '🔴', color: '#ef4444' },
                ].map((s, i) => (
                    <div key={i} className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <p className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-2xl font-black" style={{ color: s.color }}>{s.val}</span>
                            <span className="text-xl">{s.emoji}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-6">
                        <div className="p-5 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                                    <Plus size={14} className="text-[#f5a623]" /> New Product
                                </h3>
                                <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-secondary)' }}><X size={16} /></button>
                            </div>
                            <form onSubmit={addProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="relative">
                                    <Package size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f5a623]" />
                                    <input type="text" placeholder="Product Name" value={form.productName}
                                        onChange={e => setForm({ ...form, productName: e.target.value })}
                                        className={inputClass} style={inputStyle} required />
                                </div>
                                <div className="relative">
                                    <DollarSign size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f5a623]" />
                                    <input type="number" placeholder="Price (₹)" value={form.productPrice}
                                        onChange={e => setForm({ ...form, productPrice: e.target.value })}
                                        className={inputClass} style={inputStyle} required />
                                </div>
                                <div className="relative sm:col-span-2">
                                    <FileText size={13} className="absolute left-3.5 top-3 text-[#f5a623]" />
                                    <textarea placeholder="Description" value={form.productDescription}
                                        onChange={e => setForm({ ...form, productDescription: e.target.value })}
                                        className={`${inputClass} resize-none`} style={inputStyle} rows={2} />
                                </div>
                                <div className="relative">
                                    <Image size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f5a623]" />
                                    <input type="url" placeholder="Image URL (optional)" value={form.productImage}
                                        onChange={e => setForm({ ...form, productImage: e.target.value })}
                                        className={inputClass} style={inputStyle} />
                                </div>
                                <div className="relative">
                                    <Tag size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f5a623]" />
                                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                                        className={`${inputClass} appearance-none`} style={inputStyle}>
                                        {['General', 'Grocery', 'Electronics', 'Clothing', 'Food', 'Pharmacy', 'Stationery', 'Hardware', 'Other'].map(c =>
                                            <option key={c} value={c}>{c}</option>
                                        )}
                                    </select>
                                </div>
                                <div className="sm:col-span-2 flex gap-2">
                                    <button type="submit" className="bg-[#f5a623] text-black px-6 py-2.5 rounded-xl text-xs font-bold">Add Product</button>
                                    <button type="button" onClick={() => setShowForm(false)}
                                        className="px-6 py-2.5 rounded-xl text-xs font-bold"
                                        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Product List */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-10 h-10 border-4 border-[#f5a623]/20 border-t-[#f5a623] rounded-full animate-spin" />
                </div>
            ) : products.length > 0 ? (
                <div className="space-y-2.5">
                    {products.map((p, i) => (
                        <motion.div key={p._id}
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                            className="rounded-xl p-3.5 flex items-center justify-between gap-3 transition-all"
                            style={{
                                backgroundColor: 'var(--bg-card)',
                                border: `1px solid ${p.isLive ? 'var(--border)' : 'rgba(239,68,68,0.15)'}`,
                                opacity: p.isLive ? 1 : 0.5,
                            }}>
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                    {p.productImage
                                        ? <img src={p.productImage} alt="" className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center"><Package size={16} style={{ color: 'var(--text-secondary)' }} /></div>
                                    }
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{p.productName}</h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[#f5a623] font-black text-xs">₹{p.productPrice}</span>
                                        <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{p.category}</span>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${p.isLive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {p.isLive ? '● LIVE' : '● CLOSED'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button onClick={() => toggleProduct(p._id)}
                                    className="p-2 rounded-lg transition-all"
                                    style={{
                                        backgroundColor: p.isLive ? 'rgba(234,179,8,0.1)' : 'rgba(34,197,94,0.1)',
                                        color: p.isLive ? '#eab308' : '#22c55e',
                                    }}>
                                    {p.isLive ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                                <button onClick={() => deleteProduct(p._id)}
                                    className="p-2 rounded-lg bg-red-500/10 text-red-500">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <Package size={40} className="mx-auto mb-2" style={{ color: 'var(--text-secondary)' }} />
                    <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>No products yet</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Click "Add Product" to start</p>
                </div>
            )}
        </div>
    );
};

export default OwnerDashboard;