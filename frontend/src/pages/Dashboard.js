import React, { useEffect, useState } from "react";
import API from "../api/apiClient";
import ChartOrdersByDate from "../components/ChartOrdersByDate";
import ChartCustomerGrowth from "../components/ChartCustomerGrowth";

export default function Dashboard({ tenantId, onLogout }) {
  const [metrics, setMetrics] = useState({});
  const [ordersSeries, setOrdersSeries] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [customersByDate, setCustomersByDate] = useState([]);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [syncMessage, setSyncMessage] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [m, orders, customers, products, recents, custGrowth] =
        await Promise.all([
          API.get("/dashboard/metrics", { headers }),
          API.get("/dashboard/orders-by-date", { headers }),
          API.get("/dashboard/top-customers", { headers }),
          API.get("/dashboard/top-products", { headers }),
          API.get("/dashboard/recent-orders", { headers }),
          API.get("/dashboard/customers-by-date", { headers }),
        ]);

      setMetrics({
        totalCustomers: Number(m.data.totalCustomers) || 0,
        totalOrders: Number(m.data.totalOrders) || 0,
        revenue: Number(m.data.revenue) || 0,
      });

      setOrdersSeries(
        orders.data.map((item) => ({
          date: item.date,
          orderCount: Number(item.orderCount) || 0,
          totalRevenue: Number(item.totalRevenue) || 0,
        }))
      );

      setTopCustomers(customers.data || []);
      setTopProducts(products.data || []);
      setRecentOrders(
  (recents.data || []).sort((a, b) => {
    // if backend provides created_at
    if (a.created_at && b.created_at) {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    // fallback: sort by order id (assuming higher id = newer)
    return (b.id || b.shopify_order_id) - (a.id || a.shopify_order_id);
  })
);
      setCustomersByDate(
        custGrowth.data.map((item) => ({
          date: item.date,
          newCustomers: Number(item.newCustomers) || 0,
        }))
      );
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      if (err.response && err.response.status === 401) {
        setError("Session expired. Redirecting to login...");
        setTimeout(() => onLogout(), 1500);
      } else {
        setError("Failed to load dashboard data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [onLogout]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        "/sync/shopify",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSyncMessage(res.data.message || "Sync completed successfully");
      await loadDashboard();
    } catch (err) {
      console.error("Sync failed", err);
      setSyncMessage("Sync failed. Try again.");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-10 gap-4 sm:gap-0">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-700 tracking-tight">
            Insights Dashboard
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSync}
              disabled={syncing}
              className={`px-4 sm:px-5 py-2.5 rounded-lg font-semibold shadow transition duration-200 ${
                syncing
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-300"
              }`}
            >
              {syncing ? "Syncing..." : "Sync Shopify"}
            </button>
            <button
              onClick={onLogout}
              className="px-4 sm:px-5 py-2.5 rounded-lg font-semibold shadow bg-red-600 text-white hover:bg-red-700 transition duration-200 focus:ring-2 focus:ring-red-300"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div className="bg-white rounded-xl shadow p-4 sm:p-6 border-t-4 border-blue-600">
            <h4 className="text-sm sm:text-base font-medium text-gray-500">
              Customers
            </h4>
            <p className="text-2xl sm:text-3xl font-bold text-blue-700 mt-2">
              {metrics.totalCustomers}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 sm:p-6 border-t-4 border-blue-600">
            <h4 className="text-sm sm:text-base font-medium text-gray-500">
              Orders
            </h4>
            <p className="text-2xl sm:text-3xl font-bold text-blue-700 mt-2">
              {metrics.totalOrders}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 sm:p-6 border-t-4 border-green-600">
            <h4 className="text-sm sm:text-base font-medium text-gray-500">
              Revenue
            </h4>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">
              ₹{metrics.revenue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Orders by Date */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-8 sm:mb-10">
          <h3 className="text-lg sm:text-xl font-semibold text-blue-700 mb-4">
            📊 Orders Over Time
          </h3>
          <div className="h-64 sm:h-80">
            <ChartOrdersByDate data={ordersSeries} />
          </div>
        </div>

        {/* Customer Growth */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-8 sm:mb-10">
          <h3 className="text-lg sm:text-xl font-semibold text-blue-700 mb-4">
            👥 Customer Growth
          </h3>
          <div className="h-64 sm:h-80">
            <ChartCustomerGrowth data={customersByDate} />
          </div>
        </div>

        {/* Tables */}
        {[
          {
            title: "Top Customers",
            data: topCustomers,
            empty: "No customers yet.",
            cols: ["Name", "Email", "Total Spent (₹)"],
            key: "customer",
          },
          {
            title: "Top Products",
            data: topProducts,
            empty: "No products yet.",
            cols: ["Product", "Price (₹)"],
            key: "product",
          },
          {
            title: "Recent Orders",
            data: recentOrders,
            empty: "No orders yet.",
            cols: ["Order ID", "Amount (₹)", "Customer"],
            key: "order",
          },
        ].map((section, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow p-4 sm:p-6 mb-8 sm:mb-10 overflow-x-auto"
          >
            <h3 className="text-lg sm:text-xl font-semibold text-blue-700 mb-4">
              {section.title}
            </h3>
            {section.data.length === 0 ? (
              <p className="text-gray-500">{section.empty}</p>
            ) : (
              <table className="w-full table-fixed border-collapse min-w-[400px]">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    {section.cols.map((c, i) => (
                      <th
                        key={i}
                        className={`px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-semibold text-left ${
                          i === section.cols.length - 1 ? "" : ""
                        }`}
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                  {section.data.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-gray-50">
                      {section.key === "customer" && (
                        <>
                          <td className="px-3 sm:px-4 py-2">{row.first_name} {row.last_name}</td>
                          <td className="px-3 sm:px-4 py-2">{row.email}</td>
                          <td className="px-3 sm:px-4 py-2 text-right">{Number(row.total_spent).toFixed(2)}</td>
                        </>
                      )}
                      {section.key === "product" && (
                        <>
                          <td className="px-3 sm:px-4 py-2">{row.title}</td>
                          <td className="px-3 sm:px-4 py-2 text-right">{Number(row.price).toFixed(2)}</td>
                        </>
                      )}
                      {section.key === "order" && (
                        <>
                          <td className="px-3 sm:px-4 py-2">{row.id || row.shopify_order_id}</td>
                          <td className="px-3 sm:px-4 py-2 text-right">{Number(row.total_price).toFixed(2)}</td>
                          <td className="px-3 sm:px-4 py-2">
                            {row.customer?.first_name
                              ? `${row.customer.first_name} ${row.customer.last_name || ""}`
                              : row.customer?.name || row.customer || "Unknown Customer"}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
