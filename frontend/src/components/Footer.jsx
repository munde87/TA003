import Logo from "./Logo";

const Footer = () => {
  return (
    <footer
      className="mt-20 px-4"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div
        className="max-w-7xl mx-auto pt-14 pb-8"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        {/* TOP PART */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
          
          {/* BRAND */}
          <div>
            <Logo size="sm" />
            <p
              className="mt-4 text-xs leading-relaxed max-w-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              Connecting local shops with nearby customers. Your one-stop
              platform for everything near you.
            </p>
          </div>

          {/* PLATFORM */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-wider mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Platform
            </h4>
            <ul className="space-y-2">
              {["Home", "Products", "For Shop Owners", "About Us"].map(
                (item) => (
                  <li
                    key={item}
                    className="text-xs cursor-pointer hover:text-[#f5a623] transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h4
              className="text-xs font-bold uppercase tracking-wider mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Support
            </h4>
            <ul className="space-y-2">
              {[
                "Help Center",
                "Contact Us",
                "Privacy Policy",
                "Terms",
              ].map((item) => (
                <li
                  key={item}
                  className="text-xs cursor-pointer hover:text-[#f5a623] transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div
          className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <p
            className="text-[11px]"
            style={{ color: "var(--text-secondary)" }}
          >
            © 2025 NearU. All rights reserved.
          </p>
          <p
            className="text-[11px]"
            style={{ color: "var(--text-secondary)" }}
          >
            Made with 💛 in India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
