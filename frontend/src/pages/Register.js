import React, { useState } from "react";
import API from "../api/apiClient";

export default function Register({ goToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await API.post("/auth/register", { email, password, tenantName });
      setSuccess("Account created successfully! Please log in.");
      setEmail("");
      setPassword("");
      setTenantName("");
    } catch (err) {
      console.error("Registration error:", err.response || err);
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row w-full max-w-5xl shadow-xl rounded-2xl overflow-hidden bg-white">
        
        {/* Left side (Register Form) */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 md:p-14 flex flex-col justify-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Create Account
          </h2>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed">
            Sign up to access your{" "}
            <span className="font-semibold text-blue-600">Shopify Data Dashboard</span>{" "}
            and manage your customers, orders, and products.
          </p>

          <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
            <input
              type="text"
              placeholder="Tenant Name"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              required
              className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />

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
              Sign Up
            </button>
          </form>

          {/* Success and Error Messages */}
          {error && <p className="mt-4 sm:mt-6 text-red-600 text-sm sm:text-base text-center">{error}</p>}
          {success && <p className="mt-4 sm:mt-6 text-green-600 text-sm sm:text-base text-center">{success}</p>}

          {/* Link to Login */}
          <p className="mt-3 sm:mt-4 text-center text-gray-600 text-sm sm:text-base">
            Already have an account?{" "}
            <button
              onClick={goToLogin}
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>

        {/* Right side panel */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-700 to-blue-500 text-white flex flex-col justify-center items-center p-6 sm:p-10 md:p-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 tracking-tight text-center sm:text-left">
            Xeno Insights
          </h2>
          <p className="text-center sm:text-left text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-sm leading-relaxed text-blue-50">
            Analyze customers, orders, and revenue across your Shopify store in one unified dashboard.
          </p>
          <button
            onClick={goToLogin}
            className="px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base md:text-lg border border-white text-white font-medium rounded-lg hover:bg-white hover:text-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 transition"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
