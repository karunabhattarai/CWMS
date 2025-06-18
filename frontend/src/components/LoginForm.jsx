import { useState } from "react";
import axios from "axios";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Optionally, add a success state or redirect logic

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/user/login", {
        email,
        password,
      });
      // Save token/user info to localStorage or context
      localStorage.setItem("token", res.data.token);
      // Optionally redirect or reload
      window.location.href = "/dashboard";
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
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
        Login to your Account
      </h2>
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
      {error && <div className="text-rose-700 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded mt-2 bg-orange-800 text-white font-medium font-sans hover:bg-green-600 transition"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
