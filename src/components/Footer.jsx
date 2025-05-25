import React, { useState } from 'react';
import { FaLinkedin, FaFacebook, FaTwitter } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      // Here you would typically handle the newsletter subscription
      console.log('Newsletter subscription for:', email);
      setEmail('');
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-nav">
          <nav className="footer-links">
            <a href="/about">About us</a>
            <a href="/services">Services</a>
            <a href="/use-cases">Use Cases</a>
            <a href="/pricing">Pricing</a>
            <a href="/blog">Blog</a>
          </nav>
          <div className="social-links">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedin size={24} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebook size={24} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter size={24} />
            </a>
          </div>
        </div>

        <div className="footer-contact">
          <div className="contact-section">
            <h3>Contact us:</h3>
            <p>Email: reach@cwms.com</p>
            <p>Phone: 9800000000</p>
            <p>Address: Butwal-05, Rupandehi</p>
          </div>

          <div className="newsletter-section">
            <form className="newsletter-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email"
                className="email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="subscribe-button">
                Subscribe to our newsletter
              </button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <hr className="footer-divider" />
          <div className="footer-info">
            <p>© 2025 CWMS. All Rights Reserved.</p>
            <a href="/privacy-policy">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 