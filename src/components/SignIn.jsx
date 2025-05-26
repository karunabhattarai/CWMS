import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import skeletonImg from '/image.png';
import './SignIn.css';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Form submitted:', formData);
    // Here you would typically handle the registration logic
  };

  return (
    <div className="signup-container">
      <div className="signup-content">
        <div className="signup-form">
          <div className="brand">
            <Link to="/">
              <img src="/logo.svg" alt="Logo" className="logo" />
            </Link>
            <h1>Registration</h1>
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
                placeholder="mail@whyshailesh.com"
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

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="register-btn">
              Register
            </button>
          </form>

          <p className="login-link">
            Already Have an Account? <Link to="/login">Login</Link>
          </p>
        </div>

        <div className="signup-image">
          <img src={skeletonImg} alt="Sign up illustration" className="auth-illustration" />
          <div className="content">
            <h2>Manage your Team With Ease</h2>
            <p>Highest Level of Assistance for Creative Teams</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn; 