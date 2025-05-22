import React, { useState } from "react";
import "./AuthPage.css";

export default function AuthPage() {
    const [isSignup, setIsSignup] = useState(false);

    return (
        <div className={`container ${isSignup ? "signup-mode" : ""}`}>
            {/* LEFT FORM (LOGIN) */}
            <div className="form-container login-container">
                <form>
                    <h2>Login</h2>
                    <input type="email" placeholder="Email" />
                    <input type="password" placeholder="Password" />
                    <button>Login</button>
                    <p>
                        Not Registered Yet?{" "}
                        <span onClick={() => setIsSignup(true)}>Create Account</span>
                    </p>
                </form>
            </div>

            {/* RIGHT FORM (SIGNUP) */}
            <div className="form-container signup-container">
                <form>
                    <h2>Register</h2>
                    <input type="text" placeholder="Name" />
                    <input type="email" placeholder="Email" />
                    <input type="password" placeholder="Password" />
                    <button>Register</button>
                    <p>
                        Already have an account?{" "}
                        <span onClick={() => setIsSignup(false)}>Login</span>
                    </p>
                </form>
            </div>

            {/* IMAGE PANEL */}
            <div className="image-panel">
                <div className="content">
                    <img src="/skeleton.png" alt="Skeleton" />
                    <h3>Manage your Team With Ease</h3>
                    <p>Highest Level of Assistance for Creative Teams</p>
                </div>
            </div>
        </div>
    );
}
