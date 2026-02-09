# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
bun dev                 # Start Next.js development server (port 3000)

# Build & Production
bun run build          # Build for production
bun start              # Start production server

# Linting
bun run lint           # Run ESLint

# Database Operations (Drizzle ORM)
bun run db:generate    # Generate migration files from schema changes
bun run db:migrate     # Apply migrations to database
bun run db:push        # Push schema changes directly (dev only)
bun run db:studio      # Open Drizzle Studio (database GUI)

# Package Management
bun install            # Install dependencies
bun add <package>      # Add new package
bun remove <package>   # Remove package
```

## Architecture Overview

### Web3 Launchpad Application
This is a Next.js 16 (App Router) application for creating and deploying smart contracts on the Draconis network. It supports DRC20, DRC721, DRC1155, and RWA (Real-World Asset) token contracts.

### Server Actions Over REST APIs
**CRITICAL**: This project uses Next.js Server Actions exclusively (`"use server"`) instead of REST APIs for all CRUD operations. When implementing new features:
- Create server actions in `src/actions/` directory
- Mark files with `"use server"` and `import "server-only"` for database operations
- Call these actions directly from client components
- Return structured responses: `{ success: boolean; data?: T; error?: string }`

### Technology Stack
- **Next.js 16.0.0** with App Router (server components by default)
- **React 19.2.0**
- **TypeScript 5.5.3** (strict mode)
- **Wagmi 2.14.12** + **Viem 2.23.6** for Web3 interactions
- **ReOwn AppKit 1.7.4** for wallet connection UI
- **Drizzle ORM 0.44.7** with PostgreSQL (Neon serverless)
- **Tailwind CSS 4** for styling
- **Ethers 5.8.0** for signature verification only

### Authentication System
Web3-native authentication using wallet signatures (no passwords):
1. User connects wallet via AppKit
2. Server generates nonce (see `src/actions/auth.ts`)
3. User signs message with wallet
4. JWT token created and stored in HTTP-only cookie (7-day expiry)
5. Session verified on subsequent requests via `getSession()`

**Important**: Some operations like `saveContract()` support both authenticated and unauthenticated flows—if no session exists, accept wallet address as parameter.

### Database Schema (`src/db/schema.ts`)
Two main tables:
- **`users`**: Stores wallet addresses, nonces, timestamps
- **`contracts`**: Stores deployed contract metadata including address, type (DRC20/DRC721/DRC1155/RWA), chainId, verification status, and owner

When modifying schema:
1. Edit `src/db/schema.ts`
2. Run `bun run db:generate` to create migration
3. Run `bun run db:migrate` to apply (or `bun run db:push` for dev)

### Contract Verification Flow
Contracts can be verified on Blockscout:
1. User clicks "Verify" in UI
2. `verifyContract()` server action reads flattened source from `/src/contracts/[type]/contract-flattened.sol`
3. Submits to Blockscout API
4. Polls for verification status (10 attempts, 1s intervals)
5. Updates database with verification status and timestamp

### Key Directories
- **`app/`**: Next.js App Router pages (server components)
  - `app/create/[type]/page.tsx`: Contract creation pages
  - `app/providers.tsx`: Client-side providers (Wagmi, React Query, AppKit)
- **`src/actions/`**: Server actions for auth, contracts, storage, language
- **`src/components/`**: React components (many marked with `"use client"`)
- **`src/db/`**: Drizzle ORM schema and client
- **`src/contracts/`**: Smart contract templates (Solidity) and flattened versions
- **`src/contexts/`**: React contexts (Language, Web3)
- **`src/services/`**: Business logic (contract generation, storage abstraction)

### Web3 Configuration (`src/config/index.tsx`)
- Custom Draconis network defined via `defineChain()`
- WagmiAdapter bridges Wagmi with AppKit
- Environment variables required:
  - `NEXT_PUBLIC_PROJECT_ID` (ReOwn/WalletConnect)
  - `NEXT_PUBLIC_DRACONIS_RPC_URL`
  - `NEXT_PUBLIC_DRACONIS_EXPLORER_URL`
  - `NEXT_PUBLIC_DRACONIS_CHAIN_ID`
  - `NEXT_PUBLIC_DRACONIS_NAME`
  - `NEXT_PUBLIC_DRACONIS_NETWORK`

### Language Support
- Supports Chinese (zh) and English (en)
- Default: Chinese
- Managed via `LanguageContext` in `src/contexts/LanguageContext.tsx`
- Preference stored in cookie (1-year expiry) via `src/actions/language.ts`
- All UI text should support both languages

## Common Patterns

### Creating New Server Actions
```typescript
"use server";

import "server-only"; // For DB operations
import { getSession } from "./auth";
import { db } from "@/db";

export async function myAction(input: InputType): Promise<{
  success: boolean;
  data?: ReturnType;
  error?: string;
}> {
  try {
    // Check authentication if needed
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    // Perform operation
    const result = await db.query.myTable.findFirst({...});

    return { success: true, data: result };
  } catch (error) {
    console.error("Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
```

### Client Component Calling Server Action
```typescript
"use client";

import { myAction } from "@/actions/myActions";
import { useState } from "react";

export function MyComponent() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const result = await myAction(input);
    if (result.success) {
      // Handle success
    } else {
      // Handle error
      console.error(result.error);
    }
    setLoading(false);
  };

  return <button onClick={handleSubmit}>Submit</button>;
}
```

### Wallet Extension Conflict Handling
The app includes error handling in `providers.tsx` for multiple wallet extension conflicts (MetaMask, TokenPocket, OKX, etc.). This prevents "Cannot redefine property: ethereum" errors. Be aware when debugging wallet-related issues.

### Responsive Design
Use Tailwind's `md:` breakpoint for desktop layouts:
- Mobile: Single column, full-width
- Desktop: Sidebar + main content layout

Example: `className="flex flex-col md:flex-row"`

## Important Implementation Notes

1. **Server vs Client Boundary**: Be explicit with `"use client"` and `"use server"` directives. Database access must stay server-side.

2. **Type Safety**: Use Drizzle's inferred types for database operations. Import from schema: `import type { User, Contract } from "@/db/schema"`

3. **Contract Types**: Supported types are `"DRC20"`, `"DRC721"`, `"DRC1155"`, `"RWA"` (also ERC variants for other chains)

4. **Environment Variables**: Never commit `.env` files. All public variables must be prefixed with `NEXT_PUBLIC_` to be accessible client-side.

5. **Verification Status**: Contracts have verification status: `"false"`, `"verifying"`, `"true"`, `"failed"`. Handle all states in UI.

6. **Session-Optional Operations**: When adding new contract-related operations, consider if they should work without authentication (like initial contract creation).

7. **Error Handling**: Always wrap database operations in try-catch and return structured error responses. Log errors with `console.error()`.

8. **Network Support**: Primary network is Draconis, with Sepolia as testnet. Check `chainId` when handling network-specific logic.

## Database Access Pattern

```typescript
import { db } from "@/db";
import { contracts } from "@/db/schema";
import { eq } from "drizzle-orm";

// Query
const contract = await db.query.contracts.findFirst({
  where: eq(contracts.address, address),
});

// Insert
await db.insert(contracts).values({
  id: crypto.randomUUID(),
  address: contractAddress,
  // ... other fields
});

// Update
await db.update(contracts)
  .set({ isVerified: "true" })
  .where(eq(contracts.address, address));

// Delete
await db.delete(contracts)
  .where(eq(contracts.address, address));
```

## Path Aliases
TypeScript is configured with `@/*` mapping to project root. Use this for imports:
```typescript
import { Component } from "@/src/components/Component";
import { saveContract } from "@/src/actions/contracts";
```

## Smart Contract Templates
Each contract type has:
- Source files in `src/contracts/[type]/`
- Flattened version for verification: `contract-flattened.sol`
- TypeScript types in `src/services/contractGenerator.ts`

When adding new contract types, maintain this structure.
