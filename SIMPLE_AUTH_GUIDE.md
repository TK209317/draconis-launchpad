# Simple Authentication Flow

## What Changed

We've simplified the authentication to use a basic message signing approach instead of the complex SIWE (Sign-In with Ethereum) standard.

## How It Works Now

### 1. User Connects Wallet
- User clicks the wallet button in header
- Connects via MetaMask, WalletConnect, etc.

### 2. Simple Message Created
When wallet connects, the app creates a simple, readable message:

```
Welcome to Draconis Launchpad!

Click "Sign" to authenticate your wallet.

This request will not trigger a blockchain transaction or cost any gas fees.

Wallet address: 0x1234...5678
Nonce: abc123-def456-...
```

### 3. User Signs Message
- Wallet popup appears with the message
- User clicks "Sign"
- No gas fees, no transaction

### 4. Server Verifies Signature
- Server uses `ethers.utils.verifyMessage()` to recover the address
- Confirms the signature was created by the wallet owner
- Creates a session if valid

### 5. Session Created
- JWT token stored in HTTP-only cookie
- Lasts 7 days
- Used for all authenticated operations

## Code Flow

### Client Side ([src/hooks/useAuth.ts](src/hooks/useAuth.ts))

```typescript
// 1. Get nonce from server
const nonce = await getUserNonce(address);

// 2. Create simple message
const message = `Welcome to Draconis Launchpad!
...
Wallet address: ${address}
Nonce: ${nonce}`;

// 3. Request signature (POPUP APPEARS HERE)
const signature = await signer.signMessage(message);

// 4. Verify on server
const result = await verifySignature(message, signature);

// 5. Create session
await createSession(address);
```

### Server Side ([src/actions/auth.ts](src/actions/auth.ts))

```typescript
// Recover address from signature
const recoveredAddress = ethers.utils.verifyMessage(message, signature);

// If address matches, authentication is successful
```

## Why This Approach?

### Advantages
1. **Simpler**: No complex SIWE message format to parse
2. **More Readable**: Users see a clear, friendly message
3. **Fewer Dependencies**: Removed `siwe` library
4. **Same Security**: Cryptographically secure signature verification
5. **Better UX**: Message is easier to understand

### Security
- ✅ Cryptographic signature proves wallet ownership
- ✅ Nonce prevents replay attacks
- ✅ Server-side verification with ethers.js
- ✅ HTTP-only cookies prevent XSS
- ✅ 7-day session expiry

## Testing

```bash
# 1. Start the app
bun dev

# 2. Connect wallet
# Click wallet button → Select wallet → Connect

# 3. Sign the message
# Popup appears → Click "Sign"

# 4. Check console
# Should see: "Authentication successful"

# 5. Verify session
# DevTools → Application → Cookies → "session" should exist
```

## What You'll See in Wallet

When the signature popup appears, you'll see:

```
Message:
Welcome to Draconis Launchpad!

Click "Sign" to authenticate your wallet.

This request will not trigger a blockchain transaction or cost any gas fees.

Wallet address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
Nonce: 550e8400-e29b-41d4-a716-446655440000
```

Clear, simple, and user-friendly!

## Removed Dependencies

- ❌ `siwe` - No longer needed
- ✅ `ethers` - Using built-in `verifyMessage()`

## Files Changed

### Updated
- [src/hooks/useAuth.ts](src/hooks/useAuth.ts) - Simple message format
- [src/actions/auth.ts](src/actions/auth.ts) - ethers.js verification
- [package.json](package.json) - Removed siwe

### Same Functionality
- Session management (JWT cookies)
- Database storage (Neon Postgres)
- 7-day expiry
- Secure authentication

---

**Authentication Method**: Simple message signing with ethers.js
**Message Format**: Plain text with nonce
**Verification**: `ethers.utils.verifyMessage()`
**Session**: HTTP-only JWT cookie
