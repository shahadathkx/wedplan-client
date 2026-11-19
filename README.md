# WedPlan Client

## Description

WedPlan is a responsive role-based wedding services platform built for couples,
vendors, and administrators. Customers discover wedding professionals and
request bookings; vendors manage listings, availability, booking requests,
profiles, and subscriptions; administrators moderate users and services and
review transactions.

## Features

- Better Auth email/password and Google sign-in with MongoDB and JWT support
- Protected customer, vendor, and admin dashboards
- Customer booking overview, booking history, details, cancellation, and profile
  settings
- Vendor statistics, service management, image uploads, booking responses,
  subscription comparison, and Stripe Checkout
- Admin user moderation, service approval/rejection, status management, deletion,
  and read-only transactions
- Server-verified payment success polling and payment cancellation
- Responsive navigation, service discovery, filters, loading, empty, and error
  states
- Motion animations, Sonner notifications, and a custom 404 page

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Better Auth, MongoDB, and JWT/JWKS
- ShadCN-compatible Radix UI components
- Motion and Lucide icons
- Sonner toast notifications
- ImgBB image hosting
- Stripe Checkout

## Repositories

- **Client:** https://github.com/shahadathkx/wedplan-client.git
- **Server:** https://github.com/shahadathkx/wedplan-server.git

## Live Link

Add the deployed WedPlan client URL here after deployment.

The local client runs at `http://localhost:3000`.

## Prerequisites

- Node.js 20.9 or later
- npm
- MongoDB
- A Google OAuth application
- An ImgBB API key
- A running WedPlan Express API
- Stripe credentials and webhook configuration on the server

## Install

```bash
npm install
```

Copy the environment template:

```bash
cp .env.example .env.local
```

On Windows PowerShell, you can instead copy it with:

```powershell
Copy-Item .env.example .env.local
```

## Run Locally

Start the Express API on its configured origin, then start the client:

```bash
npm run dev
```

Open `http://localhost:3000`.

Use these scripts for validation and production builds:

```bash
npx tsc --noEmit
npm run lint
npm run build
npm start
```

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `BETTER_AUTH_SECRET` | Yes | Secret used to sign Better Auth sessions and operations. |
| `BETTER_AUTH_URL` | Yes | Public origin of the Next.js application. |
| `MONGODB_URI` | Yes | MongoDB connection URI used by Better Auth. |
| `MONGODB_DB` | Optional | MongoDB database name. |
| `GOOGLE_CLIENT_ID` | For Google sign-in | Google OAuth client identifier. |
| `GOOGLE_CLIENT_SECRET` | For Google sign-in | Google OAuth client secret. |
| `IMGBB_API_KEY` | For image uploads | Server-only ImgBB API key. |
| `NEXT_PUBLIC_API_URL` | Yes | Public origin of the WedPlan Express API. |

Values are documented only in `.env.example`. Never commit `.env`, `.env.local`,
or production secrets.

## Required URLs

### Local development

- Better Auth callback:
  `http://localhost:3000/api/auth/callback/google`
- Better Auth base URL:
  `http://localhost:3000`
- Express API:
  `http://localhost:5000`
- Payment success return:
  `http://localhost:3000/payment-success`
- Payment cancel return:
  `http://localhost:3000/payment-cancel`

### Production

- Set `BETTER_AUTH_URL` to the deployed client origin.
- Register `<deployed-client-origin>/api/auth/callback/google` as a Google OAuth
  authorized redirect URI.
- Configure Express CORS to allow only the deployed client origin.
- Set `NEXT_PUBLIC_API_URL` to the deployed Express API origin.
- Configure Stripe Checkout success and cancel URLs to the deployed
  `/payment-success` and `/payment-cancel` routes.
- Configure the Stripe webhook on the Express API; the webhook must verify
  payment status and update the vendor subscription plan on the server.

## Routes

- `/` - Home
- `/services` - Browse and filter services
- `/services/[id]` - Service details and booking form
- `/sign-up` - Customer/vendor registration
- `/sign-in` - Email/password and Google sign-in
- `/dashboard` - Role-based dashboard redirect
- `/customer/dashboard` - Customer overview
- `/customer/dashboard/bookings` - Customer booking management
- `/customer/dashboard/profile` - Customer profile settings
- `/vendor/dashboard` - Vendor overview
- `/vendor/dashboard/services` - Vendor service management
- `/vendor/dashboard/services/new` - Add service
- `/vendor/dashboard/bookings` - Vendor booking requests
- `/vendor/dashboard/subscription` - Free/Premium plans
- `/vendor/dashboard/profile` - Vendor profile settings
- `/admin/dashboard` - Admin overview
- `/admin/dashboard/users` - User management
- `/admin/dashboard/services` - Service moderation
- `/admin/dashboard/transactions` - Read-only transactions
- `/payment-success` - Server-verified Premium activation confirmation
- `/payment-cancel` - Cancelled Checkout return
- `/api/upload` - Server-side ImgBB image upload
- `/api/auth/[...all]` - Better Auth handler

## Authentication and Payments

The signup role is restricted to `customer` or `vendor`. Subscription plan,
expiry, and blocked status are server-controlled fields and cannot be granted
from browser input.

The client retrieves a JWT for authenticated Express API requests. Express must
verify that token and enforce role and resource ownership checks.

The success page polls `/api/me` and only shows a confirmed state after the
server returns `subscriptionPlan: "premium"`. It does not write subscription
state in the browser or grant any feature entitlement client-side. Stripe
webhook verification and server-side plan updates remain authoritative.
