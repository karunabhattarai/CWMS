import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">
          <img src="/logo.svg" alt="Logo" className="logo" />
        </Link>
      </div>
      
      <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
        <Link to="/services">Services</Link>
        <Link to="/use-cases">Use Cases</Link>
        <Link to="/pricing">Pricing</Link>
        <Link to="/newsletter">Newsletter</Link>
        <Link to="/login">Login</Link>
        <Link to="/signin" className="signup-btn">Sign In</Link>
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