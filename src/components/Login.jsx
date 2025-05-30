import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import skeletonImg from '/image.png';
import './SignIn.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would typically handle the login logic
  };

  return (
    <div className="signup-container">
      <div className="signup-content">
        <div className="signup-form">
          <div className="brand">
            <Link to="/">
              <img src="/logo.svg" alt="Logo" className="logo" />
            </Link>
            <h1>Login to your Account</h1>
            <p className="subtitle">See what is going on with your business</p>
          </div>

          <button className="google-btn">
            <FcGoogle size={20} />
            <span>Continue with Google</span>
          </button>

          <div className="divider">
            <span>or Sign in with Email</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="mail@abc.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>Remember Me</span>
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="login-btn">
              Login
            </button>
          </form>

          <p className="signup-link">
            Not Registered Yet? <Link to="/signin">Create an account</Link>
          </p>
        </div>

        <div className="signup-image">
          <img src={skeletonImg} alt="Login illustration" className="auth-illustration" />
          <div className="content">
            <h2>Manage your Team With Ease</h2>
            <p>Highest Level of Assistance for Creative Teams</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 