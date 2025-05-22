// src/components/LoginForm.jsx
import React from "react";

const LoginForm = () => {
    return (
        <div className="form login-form">
            <h2>Login to your Account</h2>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button>Login</button>
        </div>
    );
};

export default LoginForm;
