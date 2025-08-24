import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function AuthForm({
  type,
  onForgotPassword,
  title,
  subtitle,
  buttonText,
  loadingText,
  showForgotPassword = false,
}) {
  // Common state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    newPassword: "",
    name: "",
    company: "",
    token: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  // Get token from URL for reset password
  useEffect(() => {
    if (type === "reset-password") {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get("token");
      if (tokenFromUrl) {
        setFormData((prev) => ({ ...prev, token: tokenFromUrl }));
      }
    }
  }, [type]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
    setMessage("");
  };

  const validateForm = () => {
    const { email, password, confirmPassword, newPassword, name } = formData;

    switch (type) {
      case "login": {
        if (!email || !password) {
          setError("Email and password are required");
          return false;
        }
        break;
      }

      case "register": {
        if (!name || !email || !password || !confirmPassword) {
          setError("All fields are required");
          return false;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          return false;
        }
        break;
      }

      case "forgot-password": {
        if (!email) {
          setError("Email is required");
          return false;
        }
        break;
      }

      case "reset-password": {
        if (!newPassword || !confirmPassword) {
          setError("Both password fields are required");
          return false;
        }
        if (newPassword !== confirmPassword) {
          setError("Passwords do not match");
          return false;
        }
        if (newPassword.length < 6) {
          setError("Password must be at least 6 characters long");
          return false;
        }
        break;
      }

      default:
        return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      let response;
      const { email, password, name, token, newPassword } = formData;

      switch (type) {
        case "login": {
          response = await axios.post("http://localhost:5000/api/user/login", {
            email,
            password,
          });

          const authToken = response.data.token;
          login(authToken);

          const user = JSON.parse(atob(authToken.split(".")[1]));
          if (user.role === "superadmin" && !user.company) {
            window.location.href = "/company-registration";
          } else {
            window.location.href = "/dashboard";
          }
          break;
        }

        case "register": {
          response = await axios.post(
            "http://localhost:5000/api/user/register/superadmin",
            {
              name,
              email,
              password,
            }
          );

          setMessage(
            response.data.message ||
              "Registration successful! Please check your email for verification."
          );
          navigate("/company-registration");
          break;
        }

        case "forgot-password": {
          await axios.post(
            "http://localhost:5000/api/user/request-password-reset",
            {
              email,
            }
          );

          setMessage("Password reset email sent! Please check your inbox.");
          setFormData((prev) => ({ ...prev, email: "" }));
          break;
        }

        case "reset-password": {
          await axios.post("http://localhost:5000/api/user/reset-password", {
            token,
            newPassword,
          });

          setMessage(
            "Password reset successfully! You can now login with your new password."
          );
          setFormData((prev) => ({
            ...prev,
            newPassword: "",
            confirmPassword: "",
          }));

          setTimeout(() => {
            window.location.href = "/auth";
          }, 3000);
          break;
        }

        default:
          throw new Error("Invalid form type");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } failed. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const renderFields = () => {
    const { email, password, confirmPassword, newPassword, name } =
      formData;
    const inputClass =
      "px-4 py-2 rounded border border-cyan-200 focus:outline-none focus:ring-2 focus:ring-green-500 font-sans";

    switch (type) {
      case "login": {
        return (
          <>
            <input
              type="email"
              placeholder="Email"
              className={inputClass}
              value={email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className={inputClass}
              value={password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
            />
          </>
        );
      }

      case "register": {
        return (
          <>
            <input
              type="text"
              placeholder="Full Name"
              className={inputClass}
              value={name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className={inputClass}
              value={email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className={inputClass}
              value={password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className={inputClass}
              value={confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
              required
            />
          </>
        );
      }

      case "forgot-password": {
        return (
          <input
            type="email"
            placeholder="Enter your email"
            className={inputClass}
            value={email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
          />
        );
      }

      case "reset-password": {
        return (
          <>
            <input
              type="password"
              placeholder="New Password"
              className={inputClass}
              value={newPassword}
              onChange={(e) => handleInputChange("newPassword", e.target.value)}
              required
              minLength={6}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              className={inputClass}
              value={confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
              required
              minLength={6}
            />
          </>
        );
      }

      default:
        return null;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-sm mx-auto"
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center text-cyan-900 font-serif">
        {title}
      </h2>

      {subtitle && (
        <p className="text-sm text-gray-600 text-center mb-4 font-sans">
          {subtitle}
        </p>
      )}

      {renderFields()}

      {error && <div className="text-rose-700 text-sm">{error}</div>}
      {message && <div className="text-green-700 text-sm">{message}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded mt-2 bg-green-600 text-white font-medium font-sans hover:bg-green-800 transition disabled:opacity-50"
      >
        {loading ? loadingText : buttonText}
      </button>

      {showForgotPassword && onForgotPassword && (
        <button
          type="button"
          onClick={onForgotPassword}
          className="w-full text-sm text-cyan-600 hover:text-cyan-800 transition mt-2 font-sans"
        >
          Forgot your password?
        </button>
      )}
    </form>
  );
}
