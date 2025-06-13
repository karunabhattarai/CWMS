import { useState } from "react";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  // Swap sides on desktop
  const containerFlex = isLogin
    ? "w-full max-w-3xl bg-white rounded-xl shadow-lg flex flex-col md:flex-row overflow-hidden"
    : "w-full max-w-3xl bg-white rounded-xl shadow-lg flex flex-col md:flex-row-reverse overflow-hidden";

  // Animation for the form panel
  const formPanelAnimation = isLogin
    ? "animate-slide-in-left"
    : "animate-slide-in-right";

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyan-50 px-2">
      <div className={containerFlex}>
        {/* Info Panel */}
        <div className="hidden md:flex flex-col items-center justify-center bg-cyan-100 w-1/2 p-8 transition-all duration-500 ease-in-out">
          <div className="w-32 h-32 bg-cyan-200 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl text-cyan-800 font-serif">🎨</span>
          </div>
          <h3 className="text-xl font-semibold text-cyan-900 font-serif">
            {isLogin ? "New here?" : "Already have an account?"}
          </h3>
          <p className="text-base text-center mt-2 text-cyan-900 font-sans">
            {isLogin
              ? "Register to access all features and manage your creative workflow."
              : "Log in to your account to continue your creative journey."}
          </p>
        </div>
        {/* Form Panel */}
        <div
          className={`w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-white relative z-10 ${formPanelAnimation}`}
        >
          <div className="w-full max-w-xs">
            {isLogin ? <LoginForm /> : <RegisterForm />}
          </div>
          <button
            className="mt-6 text-sm underline text-green-600 font-medium font-sans hover:text-orange-800 transition"
            onClick={() => setIsLogin((prev) => !prev)}
          >
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
