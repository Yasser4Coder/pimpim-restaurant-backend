# PimPim Restaurant Backend

This is the backend API for the PimPim Restaurant web application. It is built with Node.js, Express, MongoDB, and supports real-time updates with Socket.IO. The backend provides RESTful APIs for menu management, orders, users (admin and delivery), gallery, and settings.

---

## Features

- **User Authentication** (JWT, httpOnly cookies, refresh tokens)
- **Role-based Access** (Admin, Delivery Guy)
- **Order Management** (create, update, assign delivery, track status)
- **Menu & Category Management**
- **Gallery Management** (Cloudinary image uploads)
- **Settings Management** (restaurant info, hours, etc.)
- **Real-time Order Updates** (Socket.IO)
- **Secure Password Hashing** (bcrypt)
- **CORS & Environment Configurable**

---

## Getting Started

### 1. Clone the repository

```bash
# Only the backend folder is needed for the API
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the backend root with the following variables:

```
MONGO_URI=your_mongodb_connection_string
PORT=5000
CLIENT_URL=http://localhost:3000 # or your frontend URL
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
JWT_SECRET=your_super_secret_jwt_key
```

**Never commit your .env file or secrets to version control!**

---

## Scripts

- `npm start` — Start the server (production)
- `npm run dev` — Start the server with nodemon (development)

---

## API Endpoints (Summary)

- `/api/auth/login` — Login (sets httpOnly cookies)
- `/api/auth/refresh` — Refresh access token
- `/api/auth/logout` — Logout (clears cookies)
- `/api/users` — User management (admin only)
- `/api/orders` — Order management
- `/api/menu` — Menu management
- `/api/gallery` — Gallery management
- `/api/settings` — Restaurant settings

---

## Deployment Notes

- Use a Node.js host (Render, Railway, Fly.io, etc.) for backend.
- Set all environment variables in your host's dashboard.
- Make sure CORS allows your frontend domain and `credentials: true`.
- Use HTTPS in production.

---

## License

This project is licensed under the ISC License.
