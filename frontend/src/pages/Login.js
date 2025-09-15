import React, { useState } from "react";
import API from "../api/apiClient";

export default function Login({ onLogin, goToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/auth/login", { email, password });
      const { token, tenantId } = res.data;
      onLogin(token, tenantId);
    } catch (err) {
      console.error("Login error:", err.response || err);
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row w-full max-w-5xl shadow-xl rounded-2xl overflow-hidden bg-white">
        
        {/* Left side (Sign In form) */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 md:p-14 flex flex-col justify-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed">
            Log in to access your{" "}
            <span className="font-semibold text-blue-600">
              Shopify Data Dashboard
            </span>{" "}
            and manage your customers, orders, and products with ease.
          </p>

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-medium text-sm sm:text-base md:text-lg py-2.5 sm:py-3 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 transition"
            >
              Sign In
            </button>
          </form>

          {error && (
            <p className="mt-4 sm:mt-6 text-red-600 text-sm sm:text-base text-center">{error}</p>
          )}

          {/* Link to Register */}
          <p className="mt-3 sm:mt-4 text-center text-gray-600 text-sm sm:text-base">
            Don't have an account?{" "}
            <button
              onClick={goToRegister}
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>

        {/* Right side (Sign Up panel) */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-700 to-blue-500 text-white flex flex-col justify-center items-center p-6 sm:p-10 md:p-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 tracking-tight text-center sm:text-left">
            Xeno Insights
          </h2>
          <p className="text-center sm:text-left text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-sm leading-relaxed text-blue-50">
            Create your account and start analyzing{" "}
            <span className="font-semibold">customers, orders, and revenue</span>{" "}
            across your Shopify store in one unified dashboard.
          </p>
          <button
            onClick={goToRegister}
            className="px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base md:text-lg border border-white text-white font-medium rounded-lg hover:bg-white hover:text-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 transition"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
