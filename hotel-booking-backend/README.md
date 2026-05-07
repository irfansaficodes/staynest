# StayNest - Backend API

Express.js + TypeScript + MongoDB backend for the StayNest hotel booking platform.

## Tech Stack

- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **Nodemailer** + **Brevo SMTP** for emails
- **Cloudinary** for image storage
- **Razorpay** for payment processing

## Project Structure

```
hotel-booking-backend/
├── src/
│   ├── index.ts              # Server entry point
│   ├── routes/
│   │   ├── auth.ts           # Authentication
│   │   ├── users.ts          # User management
│   │   ├── hotels.ts         # Public hotel listing
│   │   ├── my-hotels.ts      # Owner hotel management
│   │   ├── bookings.ts       # Booking management
│   │   ├── my-bookings.ts    # User bookings
│   │   ├── payments.ts       # Razorpay integration
│   │   ├── payment-webhook.ts # Payment webhook
│   │   ├── email-verification.ts # OTP verification
│   │   ├── booking-cancellation.ts # Cancellation & refunds
│   │   ├── availability.ts   # Calendar management
│   │   ├── admin-dashboard.ts # Admin operations
│   │   ├── business-insights.ts # Analytics
│   │   └── health.ts         # Health check
│   ├── models/
│   │   ├── user.ts
│   │   ├── hotel.ts
│   │   ├── booking.ts
│   │   ├── bookingCalendar.ts
│   │   └── otp.ts
│   ├── middleware/
│   │   └── auth.ts           # JWT middleware
│   ├── services/
│   │   ├── email.ts          # Nodemailer + Brevo
│   │   ├── recommendations.ts
│   │   └── budgetPlanner.ts
│   └── shared/
│       └── types.ts
├── package.json
└── tsconfig.json
```

## API Routes

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register user |
| POST | `/login` | Login |
| GET | `/validate-token` | Validate JWT |
| POST | `/logout` | Logout |

### Email Verification (`/api/email-verification`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/send-code` | Send OTP email |
| POST | `/verify-code` | Verify OTP code |

### Hotels (`/api/hotels`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List approved hotels |
| GET | `/search` | Search with filters |
| GET | `/:id` | Get hotel details |

### My Hotels (`/api/my-hotels`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List owner's hotels |
| POST | `/` | Create hotel |
| GET | `/:id` | Get hotel |
| PUT | `/:id` | Update hotel |

### Payments (`/api/payments`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/create-order` | Create Razorpay order |
| POST | `/verify` | Verify payment signature |

### Admin (`/api/admin`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/hotels/pending` | List pending verifications |
| POST | `/hotels/:id/verify` | Approve/reject hotel |

### Business Insights (`/api/business-insights`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Analytics dashboard data |

## Getting Started

```bash
npm install
npm run dev
```

Server runs on http://localhost:5000

### Seed Data

```bash
npm run seed-hotels
```

Creates admin + owner accounts and 20 sample hotels.

## Build for Production

```bash
npm run build
npm start
```
