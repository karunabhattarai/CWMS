import { useState, useEffect } from "react";
import AuthForm from "../components/AuthForm";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [isWelcome, setIsWelcome] = useState(false);

  useEffect(() => {
    // Get token from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");
    const typeFromUrl = urlParams.get("type");

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }

    if (typeFromUrl === "welcome") {
      setIsWelcome(true);
    }
  }, []);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#efeee8] px-2">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-cyan-900 font-serif mb-4">
              Invalid Reset Link
            </h2>
            <p className="text-gray-600 font-sans mb-6">
              This password reset link is invalid or has expired. Please request
              a new one.
            </p>
            <button
              onClick={() => (window.location.href = "/login")}
              className="w-full py-2 px-4 bg-green-600 text-white rounded font-medium font-sans hover:bg-green-800 transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#efeee8] px-2">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <AuthForm
          type="reset-password"
          title={isWelcome ? "Welcome! Set Your Password" : "Set New Password"}
          subtitle={
            isWelcome
              ? "Please set your password to activate your account and get started."
              : "Please enter your new password below."
          }
          buttonText="Set Password"
          loadingText="Setting Password..."
        />
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => (window.location.href = "/login")}
            className="text-sm text-cyan-600 hover:text-cyan-800 transition font-sans"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
