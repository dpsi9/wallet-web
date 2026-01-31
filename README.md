# PocketWallet

A minimal, self-custodial Solana wallet built with Next.js and @solana/kit.

## Features
- HD wallet with BIP39 seed phrases
- Send SOL and swap tokens (Jupiter integration)
- Mainnet/Devnet switching
- Responsive UI (mobile-friendly)
- No external wallet adapters

## Getting Started

1. **Install dependencies:**
   ```sh
   pnpm install
   ```
2. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in your Solana RPC URLs and API keys.
3. **Run the app:**
   ```sh
   pnpm dev
   ```
   The app will be available at `http://localhost:3000`.

## Tech Stack
- Next.js 16
- React 19
- Tailwind CSS
- @solana/kit
- Jupiter API

## License
MIT
