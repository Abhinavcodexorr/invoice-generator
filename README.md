# Invoice Generator

Live invoice editor with PDF download, MongoDB storage, sign-in, history, and Save & Send.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- **MongoDB** (Mongoose) for users + invoices
- NextAuth (credentials) for Sign In / Sign Up
- `@react-pdf/renderer` for PDFs
- Resend for email (optional)

## Quick start

1. Install and run **MongoDB** locally (or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) URI).

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Env

```env
MONGODB_URI=mongodb://127.0.0.1:27017/invoice-generator
AUTH_SECRET=any-long-random-string
NEXTAUTH_URL=http://localhost:3000
```

Guest mode still works without MongoDB for edit + PDF + browser history. Sign-in / cloud save needs MongoDB running.

## Features

| Feature | Guest | Signed in |
|---|---|---|
| Live invoice editor | Yes | Yes |
| PDF download | Yes | Yes |
| History | Local browser | MongoDB |
| Save & Send email | Prompts sign-in | Yes (Resend) |

## Scripts

- `npm run dev` — development
- `npm run build` — production build
- `npm run start` — production server
