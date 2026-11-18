# WedPlan Client

WedPlan is a responsive wedding-planning platform for customers, vendors, and
administrators. This repository contains the Next.js App Router client,
Better Auth configuration, shared UI, and client-side API integration.

## Features

- Email/password and Google sign-in using Better Auth.
- MongoDB-backed users and JWT/JWKS support for the Express API.
- Customer/vendor role selection at signup; admin is not a public signup role.
- Optional profile image upload through a server-side ImgBB integration.
- Role-aware protected dashboards, profile settings, and live navbar session
  state.
- Featured services, category discovery, responsive service search and filters,
  service detail galleries, and authenticated booking requests.
- Responsive marketing and authentication pages, ShadCN-compatible UI
  components, Motion animations, and Sonner toast notifications.

## Tech Stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS v4 and ShadCN-compatible components
- Better Auth with the MongoDB adapter and JWT plugin
- Motion, Lucide, and Sonner

## Requirements

- Node.js 20.9 or later
- npm
- MongoDB
- A Google OAuth client for Google sign-in
- An ImgBB API key for profile image uploads
- The WedPlan Express API for authenticated platform operations

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the required values.

3. Configure the Google OAuth authorized redirect URI as:

   ```text
   http://localhost:3000/api/auth/callback/google
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `BETTER_AUTH_SECRET` | Yes | Random secret used by Better Auth. Use a unique, long value. |
| `BETTER_AUTH_URL` | Yes | Public origin of this Next.js app, such as `http://localhost:3000`. |
| `MONGODB_URI` | Yes | MongoDB connection string. |
| `MONGODB_DB` | No | MongoDB database name. Defaults to `wedplan`. |
| `GOOGLE_CLIENT_ID` | For Google sign-in | Google OAuth client ID. |
| `GOOGLE_CLIENT_SECRET` | For Google sign-in | Google OAuth client secret. |
| `IMGBB_API_KEY` | For image upload | ImgBB API key. It is only read by `/api/upload` on the server. |
| `NEXT_PUBLIC_API_URL` | Yes for API features | Origin of the Express API, for example `http://localhost:5000`. |

Never commit `.env`, `.env.local`, or production secrets. The committed
`.env.example` contains placeholders only.

## Authentication and API Integration

Better Auth serves its endpoints at `/api/auth/*`. The signup role field is
validated server-side and accepts only `customer` or `vendor`; role, blocked
state, and subscription fields cannot be provided by the signup client.
Passwords must be at least six characters and contain uppercase and lowercase
letters.

The JWT plugin exposes the JWKS endpoint at
`/api/auth/jwks`. The client API helper retrieves a session JWT from
`/api/auth/token` and sends it to the Express API in an
`Authorization: Bearer <token>` header. Express must verify that JWT and load
authorization data from its user collection; it must not trust a client-supplied
role.

Profile image uploads are sent to the Next.js `/api/upload` route. The route
validates image type and size, uses `IMGBB_API_KEY` on the server, and returns
the hosted image URL. The key is never exposed to browser code.

## Routes

- `/` — WedPlan landing page
- `/sign-up` and `/sign-in` — email/password and Google authentication
- `/services` — searchable service directory with category, location, and price
  filters
- `/services/[id]` — authenticated service details and booking request form
- `/dashboard` — redirects to the current user's role dashboard
- `/customer/dashboard`, `/vendor/dashboard`, `/admin/dashboard` — role-protected
  dashboards
- `/profile-settings` — authenticated profile editor using the Express API
- `/api/auth/[...all]` — Better Auth handler
- `/api/upload` — server-side ImgBB image upload

The home page loads featured services from `GET /api/services/featured` and
links each service category to a filtered `/services` result. Booking requests
are sent to `POST /api/bookings` with the service ID, event date, event
location, and message. The API remains authoritative for service visibility,
booking ownership, duplicate requests, and role permissions.

The Next.js 16 `src/proxy.ts` protects dashboard and profile routes. The Express
API remains responsible for authorization on its own endpoints.

## Scripts

```bash
npm run dev       # Start Next.js in development
npm run lint      # Run ESLint
npx tsc --noEmit  # Check TypeScript types
npm run build     # Create a production build
npm start         # Serve the production build
```

## Production Notes

- Set all environment variables in the deployment platform; do not expose
  server-only secrets with the `NEXT_PUBLIC_` prefix.
- Set `BETTER_AUTH_URL` to the production app origin and add the matching Google
  OAuth callback URI.
- Set `NEXT_PUBLIC_API_URL` to the deployed Express API origin and configure
  Express CORS to allow only the client origin.
- Serve the app and API over HTTPS in production.
