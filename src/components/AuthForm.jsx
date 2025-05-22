// src/components/AuthForm.jsx
import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import "./AuthForm.css"; // We'll create this next

const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="auth-container">
            <div className={`form-slider ${isLogin ? "show-login" : "show-register"}`}>
                <LoginForm />
                <RegisterForm />
            </div>

            <button className="toggle-button" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>
        </div>
    );
};

export default AuthForm;
