import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <img src="/logo.svg" alt="Logo" className="logo" />
      </div>
      
      <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
        <a href="#services">Services</a>
        <a href="#use-cases">Use Cases</a>
        <a href="#pricing">Pricing</a>
        <a href="#newsletter">Newsletter</a>
        <a href="#login">Login</a>
        <a href="#signup" className="signup-btn">SignUp</a>
      </div>

      <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  );
};

export default Navbar; 