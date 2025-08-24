import { useState } from "react";
import AuthForm from "../components/AuthForm";

export default function AuthPage() {
  const [currentView, setCurrentView] = useState("login"); // "login", "register", "forgot-password"

  // Swap sides on desktop
  const containerFlex =
    currentView === "register"
      ? "w-full max-w-3xl bg-white rounded-xl shadow-lg flex flex-col md:flex-row-reverse overflow-hidden"
      : "w-full max-w-3xl bg-white rounded-xl shadow-lg flex flex-col md:flex-row overflow-hidden";

  // Animation for the form panel
  const formPanelAnimation =
    currentView === "register"
      ? "animate-slide-in-right"
      : "animate-slide-in-left";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#efeee8] px-2">
      <div className={containerFlex}>
        {/* Info Panel */}
        <div className="hidden md:flex flex-col items-center justify-center bg-cyan-100 w-1/2 p-8 transition-all duration-500 ease-in-out">
          <div className="w-32 h-32 bg-cyan-200 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl text-cyan-800 font-serif">🎨</span>
          </div>
          <h3 className="text-xl font-semibold text-cyan-900 font-serif">
            {currentView === "login"
              ? "New here?"
              : currentView === "register"
              ? "Already have an account?"
              : "Remember your password?"}
          </h3>
          <p className="text-base text-center mt-2 text-cyan-900 font-sans">
            {currentView === "login"
              ? "Register to access all features and manage your creative workflow."
              : currentView === "register"
              ? "Log in to your account to continue your creative journey."
              : "Go back to login to access your account."}
          </p>
        </div>
        {/* Form Panel */}
        <div
          className={`w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-white relative z-10 ${formPanelAnimation}`}
        >
          <div className="w-full max-w-xs">
            {currentView === "login" && (
              <AuthForm
                type="login"
                title="Login to your Account"
                buttonText="Login"
                loadingText="Logging in..."
                showForgotPassword={true}
                onForgotPassword={() => setCurrentView("forgot-password")}
              />
            )}
            {currentView === "register" && (
              <AuthForm
                type="register"
                title="Registration"
                buttonText="Register"
                loadingText="Registering..."
              />
            )}
            {currentView === "forgot-password" && (
              <AuthForm
                type="forgot-password"
                title="Reset Your Password"
                subtitle="Enter your email address and we'll send you a link to reset your password."
                buttonText="Send Reset Link"
                loadingText="Sending..."
              />
            )}
          </div>

          {/* Navigation buttons */}
          <div className="mt-6 text-center">
            {currentView === "login" && (
              <button
                className="text-sm underline text-green-600 font-medium font-sans hover:text-orange-800 transition"
                onClick={() => setCurrentView("register")}
              >
                Don't have an account? Register
              </button>
            )}

            {currentView === "register" && (
              <button
                className="text-sm underline text-green-600 font-medium font-sans hover:text-orange-800 transition"
                onClick={() => setCurrentView("login")}
              >
                Already have an account? Login
              </button>
            )}

            {currentView === "forgot-password" && (
              <button
                className="text-sm underline text-green-600 font-medium font-sans hover:text-orange-800 transition"
                onClick={() => setCurrentView("login")}
              >
                Back to Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
