# BU

Bison Note Mobile App - A digital currency and event management platform.

## Features

- User wallet management
- Event creation and management
- BU (Bison Units) transfers
- Payment gateway integration (Paystack)
- Admin dashboard
- QR code scanning for transfers
- Withdrawal system

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT with httpOnly cookies
- **Payment**: Paystack
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Paystack account (for payments)

### Installation

1. Clone the repository
```bash
git clone https://github.com/CodeXPrim8/BU.git
cd BU
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
PAYSTACK_SECRET_KEY=your_paystack_secret_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Admin Dashboard

The admin dashboard runs on a separate port (3001).

```bash
cd admin-dashboard
npm install
npm run dev
```

Access at [http://localhost:3001](http://localhost:3001)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   └── components/          # React components
├── admin-dashboard/        # Admin dashboard application
├── lib/                    # Shared utilities
└── public/                 # Static assets
```

## License

Private - All rights reserved
