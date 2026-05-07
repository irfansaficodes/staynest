# StayNest - Frontend

React 18 + TypeScript + Vite frontend for the StayNest hotel booking platform.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Query** for server state management
- **React Router DOM** for routing
- **React Hook Form** for form handling
- **Razorpay** SDK for payments

## Pages

### Public
| Route | Page | Description |
|---|---|---|
| `/` | Home | Landing page with hero and search |
| `/search` | Search | Hotel search with filters |
| `/detail/:hotelId` | Detail | Hotel details and booking |
| `/register` | Register | User registration |
| `/sign-in` | Sign In | User login |

### Protected
| Route | Page | Auth |
|---|---|---|
| `/booking/:hotelId` | Booking | User |
| `/my-bookings` | My Bookings | User |
| `/my-hotels` | My Hotels | Owner |
| `/add-hotel` | Add Hotel | Owner |
| `/edit-hotel/:hotelId` | Edit Hotel | Owner |
| `/admin-dashboard` | Admin | Admin |
| `/business-insights` | Analytics | Owner/Admin |

## Getting Started

```bash
npm install
npm run dev
```

Frontend runs on http://localhost:5173

### Environment Variables

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_your-key
```

## Build

```bash
npm run build
npm run preview
```
