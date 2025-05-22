// src/components/RegisterForm.jsx
import React from "react";

const RegisterForm = () => {
    return (
        <div className="form register-form">
            <h2>Registration</h2>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <input type="password" placeholder="Confirm Password" />
            <button>Register</button>
        </div>
    );
};

export default RegisterForm;
