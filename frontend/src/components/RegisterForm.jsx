import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState(""); // Add a company field if required
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name || !email || !password || !confirm) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/user/register/superadmin", {
        name,
        email,
        password,
      });

      setSuccess(
        res.data.message ||
          "Registration successful! Please check your email for verification."
      );
      navigate("/onboarding");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-sm mx-auto"
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center text-cyan-900 font-serif">
        Registration
      </h2>
      <input
        type="text"
        placeholder="Full Name"
        className="px-4 py-2 rounded border border-cyan-200 focus:outline-none focus:ring-2 focus:ring-green-500 font-sans"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Company(not required for superadmins)"
        className="px-4 py-2 rounded border border-cyan-200 focus:outline-none focus:ring-2 focus:ring-green-500 font-sans"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        className="px-4 py-2 rounded border border-cyan-200 focus:outline-none focus:ring-2 focus:ring-green-500 font-sans"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="px-4 py-2 rounded border border-cyan-200 focus:outline-none focus:ring-2 focus:ring-green-500 font-sans"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Confirm Password"
        className="px-4 py-2 rounded border border-cyan-200 focus:outline-none focus:ring-2 focus:ring-green-500 font-sans"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
      />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-800 text-sm">{success}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded mt-2 bg-green-600 text-white font-medium font-sans hover:bg-green-800 transition"
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
