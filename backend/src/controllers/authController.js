import React, { useState } from "react";
import API from "../api/apiClient";

export default function Signup({ onSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await API.post("/auth/register", { email, password, tenantName });
      const { token, tenantId } = res.data;

      setSuccess("Account created successfully!");
      // Optionally log in immediately
      if (onSignup) onSignup(token, tenantId);
    } catch (err) {
      console.error("Signup error:", err.response || err);
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="flex flex-col md:flex-row w-full max-w-5xl shadow-xl rounded-2xl overflow-hidden bg-white">

        {/* Left side (Sign Up form) */}
        <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-700 mb-3 tracking-tight">
            Create Account
          </h2>
          <p className="text-gray-600 text-base md:text-lg mb-8 leading-relaxed">
            Sign up to create your <span className="font-semibold text-blue-600">Shopify Data Dashboard</span> and manage your customers, orders, and products.
          </p>

          <form onSubmit={handleSignup} className="space-y-5">
            <input
              type="text"
              placeholder="Tenant / Company Name"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              required
              className="w-full px-4 py-3 text-sm md:text-base border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 text-sm md:text-base border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 text-sm md:text-base border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 text-white font-medium text-base md:text-lg py-3 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Registering..." : "Sign Up"}
            </button>
          </form>

          {error && <p className="mt-6 text-red-600 text-sm text-center">{error}</p>}
          {success && <p className="mt-6 text-green-600 text-sm text-center">{success}</p>}
        </div>

        {/* Right side (Info Panel) */}
        <div className="w-full md:w-1/2 bg-blue-700 text-white flex flex-col justify-center items-center p-10 md:p-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
            Xeno Insights
          </h2>
          <p className="text-center text-base md:text-lg mb-8 max-w-sm leading-relaxed text-blue-50">
            Analyze <span className="font-semibold">customers, orders, and revenue</span> across your Shopify store in one unified dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
