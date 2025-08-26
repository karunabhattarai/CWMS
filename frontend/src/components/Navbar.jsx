import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { ConfirmationModal } from "./common";

export default function Navbar() {
  // Check login state from localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("token")
  );
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user } = useAuth();

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
    setShowLogoutModal(false);
    window.location.href = "/"; // Redirect to home after logout
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setShowMobileMenu(false); // Close mobile menu if open
  };

  // Menu items for public (non-logged in) users
  const publicMenuItems = (
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
      <li>
        <a
          href="/login"
          className="px-4 py-2 rounded bg-green-700 text-white font-medium transition-colors"
        >
          Sign In
        </a>
      </li>
    </>
  );

  // Menu items for logged-in users (only logout)
  const loggedInMenuItems = (
    <li>
      <button
        onClick={handleLogoutClick}
        className="px-4 py-2 rounded bg-rose-700 text-white font-medium transition-colors hover:bg-rose-800"
      >
        Logout
      </button>
    </li>
  );

  return (
    <>
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 bg-white shadow relative">
        {/* Left side - Logo or empty for logged in users */}
        <div className="text-2xl font-bold text-green-900">
          {!isLoggedIn && <a href="/">CWMS</a>}
        </div>

        {/* Center - Company name when logged in */}
        {isLoggedIn && (
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-xl md:text-2xl font-bold text-green-900 font-serif">
              {user?.companyName || "CWMS"}
            </h1>
          </div>
        )}

        {/* Right side - Menu items */}
        <div className="flex items-center">
          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center space-x-8 font-sans text-green-900">
            {!isLoggedIn ? publicMenuItems : loggedInMenuItems}
          </ul>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-3xl text-green-900 ml-4"
            onClick={() => setShowMobileMenu((prev) => !prev)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <ul className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col items-start space-y-4 px-6 py-4 font-sans text-green-900 md:hidden z-50">
            {!isLoggedIn ? publicMenuItems : loggedInMenuItems}
          </ul>
        )}
      </nav>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        confirmButtonClass="bg-rose-600 hover:bg-rose-700 text-white"
        isDestructive={true}
      />
    </>
  );
}
