import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Store,
} from "lucide-react";

import Logo from "../components/Logo";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";

import {
  dummyProducts,
  stats,
} from "../data/dummyData";

/* ===================== COUNTER ===================== */
const Counter = ({ value, label, emoji }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="text-center p-4"
    >
      <div className="text-3xl mb-1">{emoji}</div>
      <div className="text-2xl sm:text-3xl font-black text-[#f5a623]">
        {value}
      </div>
      <p
        className="text-xs mt-1 font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </p>
    </motion.div>
  );
};

/* ===================== HOME ===================== */
const Home = () => {
  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="relative px-4 pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* glow blobs */}
        <div className="absolute top-10 -left-20 w-64 h-64 bg-[#f5a623] rounded-full blur-[120px] opacity-10" />
        <div className="absolute bottom-10 -right-20 w-80 h-80 bg-[#f5a623] rounded-full blur-[120px] opacity-5" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{
              backgroundColor: "var(--accent-light)",
              border: "1px solid rgba(245,166,35,0.2)",
            }}
          >
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-[#f5a623]">
              Now serving 50+ cities
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black mb-5 leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Everything <span className="gradient-text">Near You</span> 📍
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base max-w-lg mx-auto mb-8"
            style={{ color: "var(--text-secondary)" }}
          >
            Discover amazing products from local shops around you. Support local
            businesses, get what you need — instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link to="/auth">
              <button className="w-full sm:w-auto bg-[#f5a623] text-black px-7 py-3 rounded-full font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-[#e09000] transition-colors">
                Start Shopping <ArrowRight size={16} />
              </button>
            </Link>

            <Link to="/auth">
              <button
                className="w-full sm:w-auto px-7 py-3 rounded-full font-bold text-sm inline-flex items-center justify-center gap-2 transition-colors"
                style={{
                  border: "2px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <Store size={16} /> List Your Shop
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="py-14 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <Counter key={i} {...s} />
          ))}
        </div>
      </section>

      {/* ================= FEATURED PRODUCTS ================= */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-[#f5a623] text-xs font-bold uppercase tracking-widest">
                Featured
              </span>
              <h2
                className="text-2xl sm:text-3xl font-black mt-1"
                style={{ color: "var(--text-primary)" }}
              >
                Trending Products 🔥
              </h2>
            </div>

            <Link
              to="/auth"
              className="text-[#f5a623] text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
            >
              View All <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {dummyProducts.slice(0, 8).map((product, i) => (
              <ProductCard
                key={product._id}
                product={product}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <Footer />
    </div>
  );
};

export default Home;
