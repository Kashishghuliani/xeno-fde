Overview
This project implements a multi-tenant Shopify Data Ingestion & Insights Service.It connects to Shopify APIs to fetch customers, products, and orders, stores them in a relational database, and provides a dashboard to visualize key business metrics such as top customers, revenue trends, and order analytics.

Features
Shopify store integration (customers, products, orders)
Multi-tenancy with tenant isolation
Authentication (sign up & login with email)
REST APIs for data access

Insights dashboard:
Total customers, orders, revenue
Orders over time (chart)
Customer growth over time
Top customers by spend
Top products by sales
Recent orders list
Sync Shopify button → fetches the latest data from Shopify on demand
Deployment on Vercel (frontend) + backend service

Tech Stack Section
Backend: Node.js (Express.js)
Frontend: React.js (Next.js)
Database: PostgreSQL (used for deployment on Render)
Charts: Recharts
Deployment: Vercel (frontend) + Render (backend & DB)

Setup Instructions
Prerequisites
Node.js installed
PostgreSQL running
Shopify Partner development store with API keys

Steps
Clone the repo:
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>

Install dependencies:
npm install

Configure environment variables:
Create a .env file with the following:

DATABASE_URL=your_db_connection_string
SHOPIFY_API_KEY=your_shopify_key
SHOPIFY_API_SECRET=your_shopify_secret
JWT_SECRET=your_secret


Start backend:
npm run dev


Start frontend:
npm run start


Architecture
Flow:
Shopify Store → APIs → Backend → PostgreSQL (tenant-isolated)
Backend → Frontend (Next.js Dashboard)
Sync Shopify button → pulls latest data from Shopify and refreshes dashboard

API Endpoints
Customers
GET /api/customers
Response:
[
  { "id": 1, "name": "Alice", "email": "alice@example.com" }
]

Orders
GET /api/orders
Response:
[
  { "id": 101, "customer_id": 1, "amount": 250.00, "date": "2025-09-14" }
]

Products
GET /api/products
Response:
[
  { "id": 501, "title": "T-shirt", "price": 19.99 }
]

Database Schema

Tables:
tenants (tenant_id, name, api_key, etc.)
customers (id, tenant_id, name, email, created_at)
products (id, tenant_id, title, price, created_at)
orders (id, tenant_id, customer_id, amount, date)

Assumptions & Limitations
Each tenant = one Shopify store.
Only email/password auth used (no OAuth).
Data sync is manual using Sync Shopify button; scheduled sync/webhooks can be added later.
Deployment is on free-tier hosting, so scaling is limited.

