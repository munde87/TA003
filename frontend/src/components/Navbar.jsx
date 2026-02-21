import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import {
  Home,
  Store,
  Package,
  ShoppingBag,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/shops", label: "Shops", icon: Store },
    { to: "/orders", label: "My Orders", icon: Package },
    { to: "/products", label: "Products", icon: ShoppingBag },
  ];

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-xl"
      style={{
        backgroundColor: "var(--bg-primary)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" onClick={() => setMobileOpen(false)}>
            <Logo size="lg" />
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  color:
                    location.pathname === link.to
                      ? "#f5a623"
                      : "var(--text-secondary)",
                  backgroundColor:
                    location.pathname === link.to
                      ? "var(--accent-light)"
                      : "transparent",
                }}
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}

            {/* Get Started */}
            {!user && (
              <Link to="/auth">
                <button className="ml-2 px-6 py-2 rounded-full text-sm font-bold text-black
                  bg-gradient-to-r from-[#f5a623] to-[#ffb940]
                  hover:shadow-lg hover:scale-[1.03] transition-all">
                  Get Started
                </button>
              </Link>
            )}

            {/* Theme Toggle (icon only) */}
            <ThemeToggle iconOnly />

            {/* Profile */}
            {user && (
              <div
                className="flex items-center gap-3 ml-3 pl-4"
                style={{ borderLeft: "1px solid var(--border)" }}
              >
                <img
                  src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80"
                  alt="profile"
                  className="w-9 h-9 rounded-full object-cover border cursor-pointer hover:scale-105 transition"
                  style={{ borderColor: "var(--border)" }}
                />

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: "rgba(239,68,68,0.1)",
                    color: "#ef4444",
                  }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            )}
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle iconOnly />
            <button onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderTop: "1px solid var(--border)",
            }}
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl text-sm font-semibold"
                  style={{
                    color:
                      location.pathname === link.to
                        ? "#f5a623"
                        : "var(--text-secondary)",
                  }}
                >
                  <link.icon size={16} />
                  {link.label}
                </Link>
              ))}

              {!user && (
                <Link to="/auth" onClick={() => setMobileOpen(false)}>
                  <button className="w-full mt-2 p-3 rounded-xl font-bold text-black
                    bg-gradient-to-r from-[#f5a623] to-[#ffb940]">
                    Get Started
                  </button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
