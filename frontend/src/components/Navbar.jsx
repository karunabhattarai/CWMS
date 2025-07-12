import { useState, useEffect } from "react";

export default function Navbar() {
  // Check login state from localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("token")
  );
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    // Listen for login/logout events across tabs
    const syncLogin = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", syncLogin);
    return () => window.removeEventListener("storage", syncLogin);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setShowMobileMenu(false);
    window.location.href = "/"; // Redirect to home after logout
  };

  const menuItems = (
    <>
      <li>
        <a href="#services" className="hover:text-green-600 transition-colors">
          Services
        </a>
      </li>
      <li>
        <a href="#features" className="hover:text-green-600 transition-colors">
          Features
        </a>
      </li>
      <li>
        <a href="#contact" className="hover:text-green-600 transition-colors">
          Contact
        </a>
      </li>
      {!isLoggedIn ? (
        <li>
          <a
            href="/login"
            className="px-4 py-2 rounded bg-green-700 text-white font-medium transition-colors"
          >
            Sign In
          </a>
        </li>
      ) : (
        <>
          <li>
            <a
              href="/dashboard"
              className="hover:text-green-600 transition-colors"
            >
              Dashboard
            </a>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded bg-rose-700 text-white font-medium transition-colors"
            >
              Logout
            </button>
          </li>
        </>
      )}
    </>
  );

  return (
    <nav className="flex items-center justify-between px-6 md:px-12 py-4 bg-white shadow relative">
      <div className="text-2xl font-bold text-green-900">
        <a href="/">CWMS</a>
      </div>
      {/* Desktop Menu */}
      <ul className="hidden md:flex items-center space-x-8 font-sans text-green-900">
        {menuItems}
      </ul>
      {/* Mobile menu button */}
      <button
        className="md:hidden text-3xl text-green-900"
        onClick={() => setShowMobileMenu((prev) => !prev)}
        aria-label="Toggle menu"
      >
        ☰
      </button>
      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <ul className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col items-start space-y-4 px-6 py-4 font-sans text-green-900 md:hidden z-50">
          {menuItems}
        </ul>
      )}
    </nav>
  );
}
