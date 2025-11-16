E-commerce App (FastAPI + React)

How to Run
- Use the Run button to install dependencies and start both servers.
- After servers start, open the preview URL to access the app.

Environment Examples
Backend .env.example
DATABASE_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net
DATABASE_NAME=ecommerce
JWT_SECRET=change_this_in_production
STRIPE_SECRET_KEY=sk_test_xxx
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>

Frontend .env.example
VITE_BACKEND_URL=http://localhost:8000

Seed Endpoint
- Call GET /seed/init on backend once to create:
  - Admin user: admin@example.com / Admin@123
  - 3 categories + 5 sample products

API Docs
- Swagger at /docs
