# Database Migration Guide

This guide covers the migration from S3 storage to Neon serverless Postgres with Drizzle ORM and Web3 authentication.

## Overview

The application now uses:
- **Neon serverless Postgres** for contract storage
- **Drizzle ORM** for type-safe database operations
- **SIWE (Sign-In with Ethereum)** for Web3 authentication
- **JWT tokens** stored in HTTP-only cookies for session management

## Setup Steps

### 1. Create a Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string (it looks like: `postgresql://user:password@endpoint.neon.tech/database`)

### 2. Configure Environment Variables

Update your `.env` file:

```bash
# Replace with your actual Neon database URL
DATABASE_URL=postgresql://user:password@endpoint.neon.tech/database

# Generate a strong secret for JWT (use a random string generator)
JWT_SECRET=your_very_secret_random_string_here
```

### 3. Generate and Run Database Migrations

```bash
# Generate migration files from schema
bun run db:generate

# Push schema directly to database (for development)
bun run db:push

# Or run migrations (for production)
bun run db:migrate
```

### 4. Verify Database Schema

You can use Drizzle Studio to inspect your database:

```bash
bun run db:studio
```

This will open a web interface at `https://local.drizzle.studio`

## Database Schema

### Users Table
- `id` - UUID primary key
- `walletAddress` - Unique wallet address (lowercase)
- `nonce` - Random nonce for signature verification
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Contracts Table
- `id` - UUID primary key
- `address` - Unique contract address (lowercase)
- `transactionHash` - Deployment transaction hash
- `contractName` - Contract name
- `type` - Contract type (DRC20, DRC721, DRC1155, RWA, etc.)
- `chainId` - Network chain ID
- `networkName` - Network name
- `createdAt` - Timestamp
- `ownerAddress` - Foreign key to users.walletAddress

## Authentication Flow

1. **Wallet Connection**: User connects wallet via Reown AppKit
2. **Nonce Generation**: Server generates a random nonce for the user
3. **Message Signing**: User signs a SIWE message with their wallet
4. **Signature Verification**: Server verifies the signature using SIWE
5. **Session Creation**: Server creates a JWT token and stores it in an HTTP-only cookie
6. **Authenticated Requests**: All contract operations require a valid session

## Key Changes

### What Was Removed
- `src/services/storage/S3Service.ts` - S3 contract storage (NFT metadata still uses S3)
- `src/services/contractCache.ts` - localStorage cache (replaced by database)
- `src/services/contractManager.ts` - Contract manager (replaced by server actions)

### What Was Added
- `src/db/schema.ts` - Database schema definition
- `src/db/index.ts` - Database client initialization
- `src/actions/auth.ts` - Authentication server actions
- `src/actions/contracts.ts` - Contract CRUD server actions
- `src/hooks/useAuth.ts` - Client-side authentication hook
- `src/components/AuthProvider.tsx` - Authentication provider
- `src/components/MyContractsClient.tsx` - Client component wrapper
- `drizzle.config.ts` - Drizzle configuration

### What Was Modified
- `src/page/MyContractsPage.tsx` - Now a server component
- `src/components/TokenCreator.tsx` - Uses server actions instead of ContractManager

## Server Actions

### Authentication (`src/actions/auth.ts`)
- `generateNonce()` - Generate random nonce
- `verifySignature(message, signature)` - Verify SIWE signature
- `createSession(address)` - Create JWT session
- `getSession()` - Get current session
- `logout()` - Clear session

### Contracts (`src/actions/contracts.ts`)
- `saveContract(input)` - Save contract (requires auth)
- `getUserContracts(address)` - Get user's contracts
- `getMyContracts()` - Get authenticated user's contracts
- `deleteContract(address)` - Delete contract (requires auth + ownership)
- `getContract(address)` - Get specific contract

## Development Commands

```bash
# Start development server
bun dev

# Generate migrations
bun run db:generate

# Push schema to database
bun run db:push

# Run migrations
bun run db:migrate

# Open Drizzle Studio
bun run db:studio
```

## Security Notes

1. **JWT Secret**: Use a strong, random secret in production
2. **Database URL**: Keep your DATABASE_URL secret and never commit it
3. **HTTPS**: In production, ensure HTTPS is enabled for secure cookies
4. **Session Expiry**: JWT tokens expire after 7 days
5. **HTTP-Only Cookies**: Session cookies are HTTP-only to prevent XSS attacks

## Troubleshooting

### Database Connection Error
- Verify your DATABASE_URL is correct
- Check if Neon database is accessible
- Ensure IP is whitelisted in Neon (if applicable)

### Authentication Issues
- Clear browser cookies and try again
- Check browser console for errors
- Verify JWT_SECRET is set in .env

### Migration Errors
- Ensure DATABASE_URL is set before running migrations
- Check if database user has proper permissions
- Try `bun run db:push` for development instead of migrations

## Next Steps

1. Set up your Neon database
2. Update `.env` with your credentials
3. Run `bun run db:push` to create tables
4. Test the authentication flow
5. Deploy and test contract creation

## Migration from Old Data

If you have existing contracts in S3 or localStorage, they will not be automatically migrated. Users will need to redeploy their contracts or you'll need to write a custom migration script to import old data into the new database.
