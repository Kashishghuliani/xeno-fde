const axios = require('axios');
require('dotenv').config();

console.log("👉 SHOPIFY_STORE from env:", process.env.SHOPIFY_STORE);
console.log("👉 SHOPIFY_API_KEY length:", process.env.SHOPIFY_API_KEY?.length);

const shopify = axios.create({
  baseURL: `https://${process.env.SHOPIFY_STORE}/admin/api/2023-10`,
  headers: {
    'X-Shopify-Access-Token': process.env.SHOPIFY_API_KEY,
    'Content-Type': 'application/json'
  }
});

// Fetch customers
async function fetchCustomers() {
  const res = await shopify.get('/customers.json?limit=50');
  return res.data.customers;
}

// Fetch orders
async function fetchOrders() {
  const res = await shopify.get('/orders.json?status=any&limit=50');
  return res.data.orders;
}

// Fetch products
async function fetchProducts() {
  const res = await shopify.get('/products.json?limit=50');
  return res.data.products;
}

module.exports = { fetchCustomers, fetchOrders, fetchProducts };
