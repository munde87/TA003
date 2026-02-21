import { motion } from 'framer-motion';
import { MapPin, Store, Tag, ShoppingBag } from 'lucide-react';

const ProductCard = ({ product, index = 0 }) => {
    const placeholders = [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
        'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400',
        'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400',
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400',
    ];

    const imgSrc = product.productImage || placeholders[index % placeholders.length];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={{ y: -4 }}
            className="rounded-2xl overflow-hidden transition-all duration-300"
            style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
            }}
        >
            {/* Image */}
            <div className="relative h-44 overflow-hidden bg-gray-100">
                <img
                    src={imgSrc}
                    alt={product.productName}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => { e.target.src = placeholders[0]; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                <span className="absolute top-2.5 right-2.5 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                    LIVE
                </span>

                <span className="absolute top-2.5 left-2.5 bg-[#f5a623] text-black text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <Tag size={8} />
                    {product.category}
                </span>

                <span className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white text-sm font-extrabold px-2.5 py-1 rounded-lg">
                    ₹{product.productPrice}
                </span>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="text-sm font-bold truncate mb-1" style={{ color: 'var(--text-primary)' }}>
                    {product.productName}
                </h3>
                <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {product.productDescription || 'Fresh product available near you'}
                </p>

                <div className="pt-3 space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
                    <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                        <Store size={11} className="text-[#f5a623] flex-shrink-0" />
                        <span className="truncate">{product.shopName}</span>
                    </p>
                    <p className="text-[11px] flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                        <MapPin size={10} className="text-[#f5a623] flex-shrink-0" />
                        <span className="truncate">{product.shopAddress}</span>
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;