import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { ConfirmationModal } from "./common";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem("token")
  );
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const syncLogin = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", syncLogin);
    return () => window.removeEventListener("storage", syncLogin);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setShowMobileMenu(false);
    setShowLogoutModal(false);
    window.location.href = "/";
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setShowMobileMenu(false);
  };

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

  const loggedInMenuItem = (
    <button
      onClick={handleLogoutClick}
      className="px-4 py-2 rounded bg-rose-700 text-white font-medium transition-colors hover:bg-rose-800"
    >
      Logout
    </button>
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

        {/* Right side */}
        <div className="flex items-center">
          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center space-x-6 font-sans text-green-900">
            {!isLoggedIn ? publicMenuItems : <li>{loggedInMenuItem}</li>}
          </ul>

          {/* Mobile Menu Button */}
          {!isLoggedIn && (
            <button
              className="md:hidden text-3xl text-green-900 ml-4"
              onClick={() => setShowMobileMenu((prev) => !prev)}
              aria-label="Toggle menu"
            >
              ☰
            </button>
          )}

          {/* Mobile Logout Button */}
          {isLoggedIn && (
            <div className="md:hidden ml-2">{loggedInMenuItem}</div>
          )}
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <ul className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col items-start space-y-4 px-6 py-4 font-sans text-green-900 md:hidden list-none">
            {publicMenuItems}
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