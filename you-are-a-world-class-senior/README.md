# Papa Sami Studio

Papa Sami Studio is a production-oriented graphic design marketplace built with Next.js 15, TypeScript, Prisma, NextAuth/Auth.js, TailwindCSS, Stripe, Paystack, Cloudinary, and Resend/Nodemailer.

## Quick Start

1. Copy `.env.example` to `.env` and fill the required secrets.
2. Install dependencies with `npm install`.
3. Generate Prisma with `npm run db:generate`.
4. Push the schema with `npm run db:push`.
5. Seed sample content with `npm run db:seed`.
6. Start development with `npm run dev`.

## Production

- PostgreSQL is required.
- Stripe and Paystack webhooks must point to `/api/webhooks/stripe` and `/api/webhooks/paystack`.
- Cloudinary signed uploads use `/api/uploads/signature`.
- The app is ready for Vercel, Railway, or Render with environment variables configured.
- Set `ADMIN_NOTIFICATION_EMAIL` plus Resend or SMTP credentials so admins receive email when a new design request is submitted.
