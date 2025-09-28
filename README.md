# Solana Dashboard

A real-time Solana blockchain statistics dashboard built with Next.js, TypeScript, and TailwindCSS.

## Features

- **Real-time Data**: Auto-refreshes every 5 seconds using React Query
- **Server-side API Routes**: All blockchain requests go through secure API routes
- **Responsive Design**: Works on both desktop and mobile devices
- **Modern UI**: Built with TailwindCSS, shadcn/ui, and Framer Motion
- **Production Ready**: Well-structured code with error handling

## Dashboard Metrics

- **Supply Information**: Total, circulating, and non-circulating SOL supply
- **Epoch Data**: Current epoch, slot progress, and time remaining
- **Transaction Count**: Total number of transactions on-chain
- **Staking Information**: Total staked SOL across validators
- **Validator Statistics**: Validator count and ping statistics (avg, min, max)

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create a `.env.local` file in the root directory:
   ```env
   RPC_ENDPOINT=https://rpc.testnet.x1.xyz/
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Open Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

All API routes are located in `/app/api/`:

- `GET /api/supply` - Fetch Solana supply information
- `GET /api/epoch` - Fetch current epoch and timing data
- `GET /api/transactions` - Fetch total transaction count
- `GET /api/staking` - Fetch staking information
- `GET /api/validators` - Fetch validator statistics

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Data Fetching**: React Query (TanStack Query)
- **Blockchain**: Solana Web3.js

## Project Structure

```
├── app/
│   ├── api/           # API routes
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Homepage
├── components/
│   ├── ui/            # shadcn/ui components
│   ├── dashboard.tsx  # Main dashboard component
│   └── providers.tsx  # React Query provider
├── lib/
│   ├── solana.ts      # Solana RPC helper
│   └── utils.ts       # Utility functions
└── ...
```

## Security Features

- Environment variables are hidden from the frontend
- All blockchain requests go through server-side API routes
- No sensitive data exposed to the client

## Performance Optimizations

- Auto-refresh every 5 seconds without page reload
- Efficient data fetching with React Query
- Optimized re-renders with proper state management
- Responsive design for all screen sizes

## Development

- **Linting**: `npm run lint`
- **Build**: `npm run build`
- **Start**: `npm start`

## Notes

- The dashboard uses the X1 testnet RPC endpoint
- Validator ping data is simulated (would need actual measurement in production)
- Staking data is simplified (would need comprehensive validator stake calculation)
- All data refreshes automatically every 5 seconds
