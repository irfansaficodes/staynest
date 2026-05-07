# StayNest - Hotel Booking Management System

**Live**: [https://staynest-plum.vercel.app](https://staynest-plum.vercel.app)  
**Backend API**: [https://staynest-backend-nqv9.onrender.com](https://staynest-backend-nqv9.onrender.com)

A full-stack hotel booking platform built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring razorpay payment integration, email verification, and admin dashboard.

![MERN](https://img.shields.io/badge/MERN-Stack-blue?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)

## Features

### For Travelers
- Browse and search hotels with advanced filters (price, rating, facilities, type)
- Real-time availability and booking
- Secure payments via Razorpay
- Email verification and OTP-based authentication
- Booking management with cancellation and refunds

### For Hotel Owners
- Complete hotel CRUD management
- Image upload via Cloudinary
- Booking calendar and availability management
- Business insights and analytics dashboard

### For Admins
- Hotel verification and approval workflow
- User management
- API status monitoring
- Platform oversight dashboard

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Query** for server state management
- **React Router DOM** for routing
- **Razorpay** SDK for payments

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **Nodemailer** + **Brevo SMTP** for emails
- **Cloudinary** for image storage
- **Razorpay** for payment processing

## Project Structure

```
staynest/
├── hotel-booking-frontend/     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── forms/              # Form components
│   │   ├── contexts/           # React contexts
│   │   ├── hooks/              # Custom hooks
│   │   └── api-client.ts       # API client
│   └── package.json
├── hotel-booking-backend/      # Express backend
│   ├── src/
│   │   ├── routes/             # API route handlers
│   │   ├── models/             # MongoDB models
│   │   ├── middleware/         # Express middleware
│   │   ├── services/           # Business logic
│   │   └── index.ts            # Server entry point
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Brevo SMTP account
- Cloudinary account
- Razorpay account

### Installation

```bash
# Clone the repository
git clone https://github.com/irfansaficodes/staynest.git
cd staynest

# Install backend dependencies
cd hotel-booking-backend
npm install

# Install frontend dependencies
cd ../hotel-booking-frontend
npm install
```

### Environment Variables

Copy `.env.example` to `hotel-booking-backend/.env` and fill in your values:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_CONNECTION_STRING=mongodb+srv://<user>:<pass>@cluster.mongodb.net/hotelbooking

# JWT
JWT_SECRET_KEY=your-secret-key

# Brevo SMTP
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-email
SMTP_PASSWORD=your-smtp-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_your-key
RAZORPAY_SECRET=your-secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Google OAuth
GOOGLE_ID=your-google-client-id
GOOGLE_SECRET=your-google-client-secret
```

For the frontend, create `hotel-booking-frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_your-key
```

### Run the Seed Script

```bash
cd hotel-booking-backend
npm run seed-hotels
```

This creates:
- **Admin**: admin@staynest.com / Admin@123
- **Owner**: owner@staynest.com / Owner@123
- **20 hotels** with real images from Unsplash

### Start Development

```bash
# Backend (from hotel-booking-backend)
npm run dev

# Frontend (from hotel-booking-frontend)
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/validate-token` - Validate JWT
- `POST /api/auth/logout` - Logout

### Email Verification
- `POST /api/email-verification/send-code` - Send OTP
- `POST /api/email-verification/verify-code` - Verify OTP

### Hotels
- `GET /api/hotels` - List approved hotels
- `GET /api/hotels/:id` - Get hotel details
- `GET /api/hotels/search` - Search with filters

### My Hotels (Owner)
- `POST /api/my-hotels` - Create hotel
- `GET /api/my-hotels` - List my hotels
- `PUT /api/my-hotels/:id` - Update hotel
- `GET /api/my-hotels/:id` - Get hotel details

### Bookings
- `POST /api/hotels/:hotelId/bookings` - Create booking
- `GET /api/my-bookings` - Get my bookings

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment signature

### Admin
- `GET /api/admin/hotels/pending` - List pending hotels
- `POST /api/admin/hotels/:id/verify` - Approve/reject hotel

### Business Insights
- `GET /api/business-insights/dashboard` - Analytics data

## Deployment

### Backend (Render)
1. Push code to GitHub
2. Create Web Service on Render
3. Set root directory: `hotel-booking-backend`
4. Build: `npm install && npm run build`
5. Start: `npm start`
6. Add all environment variables

### Frontend (Vercel)
1. Import GitHub repo to Vercel
2. Set root directory: `hotel-booking-frontend`
3. Add env: `VITE_API_BASE_URL` = your Render URL
4. Deploy
