# Authentication Flow Guide

## How Sign-In Works

When you click the wallet connect button in the header, the following happens:

### 1. Wallet Connection
- User clicks the AppKit wallet button
- Selects and connects their wallet (MetaMask, WalletConnect, etc.)
- Wallet connection is established

### 2. Automatic Authentication (Triggered by `useAuth` hook)
Once the wallet is connected, authentication starts automatically:

1. **Nonce Generation**: Server generates a unique nonce for your wallet address
2. **SIWE Message Creation**: A Sign-In with Ethereum message is created:
   ```
   Sign in to Draconis Launchpad

   URI: https://your-domain.com
   Version: 1
   Chain ID: 1
   Nonce: [unique-nonce]
   Issued At: [timestamp]
   ```
3. **Signature Request**: Your wallet will pop up asking you to sign the message
4. **Signature Verification**: Server verifies your signature using SIWE
5. **Session Creation**: A JWT token is created and stored in an HTTP-only cookie
6. **Authentication Complete**: You're now signed in for 7 days

## Visual Indicators

- **Yellow banner**: Shows "Signing message..." while waiting for wallet signature
- **Console logs**: Check browser console for authentication status
- **Cookie**: Check browser DevTools → Application → Cookies for `session` cookie

## Testing the Flow

### Before You Start
1. Make sure you've set up the database:
   ```bash
   bun run db:push
   ```

2. Verify environment variables in `.env`:
   ```bash
   DATABASE_URL=your_neon_database_url
   JWT_SECRET=your_secret_key
   ```

3. Start the dev server:
   ```bash
   bun dev
   ```

### Test Steps

1. **Open the app** in your browser (http://localhost:3000)

2. **Open Browser DevTools**:
   - Press F12 or right-click → Inspect
   - Go to Console tab to see authentication logs

3. **Click the wallet button** in the header (top right)

4. **Connect your wallet**:
   - Select your wallet provider (MetaMask, WalletConnect, etc.)
   - Approve the connection

5. **Sign the message**:
   - Your wallet should automatically pop up with a signature request
   - The message will say "Sign in to Draconis Launchpad"
   - Click "Sign" or "Approve"

6. **Verify authentication**:
   - Check console for "Authentication successful" log
   - Check DevTools → Application → Cookies → `session` cookie should exist
   - Yellow "Signing message..." banner should disappear

7. **Test persistence**:
   - Refresh the page
   - You should still be signed in (no signature request)
   - Session lasts 7 days

8. **Test contract creation**:
   - Go to "Create" page
   - Deploy a test contract
   - Check "My Contracts" page - it should appear there
   - Refresh - contracts persist in database

## Troubleshooting

### Signature popup doesn't appear
**Possible causes:**
1. **Check console for errors** - Look for red error messages
2. **Wallet not fully connected** - Try disconnecting and reconnecting
3. **Browser blocking popup** - Check if browser blocked the wallet popup
4. **Database not configured** - Verify DATABASE_URL is set

**Solutions:**
- Check browser console for specific error messages
- Ensure wallet extension is unlocked
- Try in incognito mode to rule out extension conflicts
- Verify `.env` file has correct DATABASE_URL

### "Failed to get nonce" error
**Cause:** Database connection issue

**Solution:**
```bash
# Verify database connection
bun run db:push

# Check .env has DATABASE_URL set
cat .env | grep DATABASE_URL
```

### "Signature verification failed"
**Cause:** Mismatch between signed message and verification

**Solutions:**
- Clear browser cookies and try again
- Ensure system clock is correct (SIWE uses timestamps)
- Check if chainId in message matches your network

### Session not persisting
**Cause:** Cookie not being saved

**Solutions:**
- Check if running on `localhost` (cookies work)
- Verify `secure` flag is `false` in development
- Check browser privacy settings (cookies enabled)

### Authentication loops (keeps asking to sign)
**Cause:** Session not being created or stored properly

**Solutions:**
- Clear browser cookies
- Check server logs for JWT creation errors
- Verify JWT_SECRET is set in `.env`

## Debug Checklist

```bash
# 1. Check if database is accessible
bun run db:studio

# 2. Check environment variables
cat .env

# 3. Check if tables exist
# Open Drizzle Studio (from step 1)
# Verify 'users' and 'contracts' tables exist

# 4. Test database connection
# Try to view in Drizzle Studio
```

## Expected Console Output

When authentication works correctly, you should see:

```
Authentication successful
```

When there's an error:
```
Authentication error: [specific error message]
```

## Network Tab (DevTools)

Check the Network tab for these requests:

1. **POST to server action** (getUserNonce)
2. **POST to server action** (verifySignature)
3. **POST to server action** (createSession)

All should return status 200.

## Cookie Details

After successful authentication, check for this cookie:

- **Name**: `session`
- **Value**: JWT token (encoded string)
- **HttpOnly**: true
- **Secure**: false (dev), true (production)
- **SameSite**: Lax
- **Max-Age**: 604800 (7 days)

## Common Issues

### Issue: "Wallet not connected" error
**Fix**: Make sure wallet is fully connected before authentication runs

### Issue: TypeScript errors about ethers
**Fix**: Already fixed - using ethers v5 API

### Issue: SIWE message format error
**Fix**: Check that domain and URI match your application URL

### Issue: Database errors
**Fix**: Run `bun run db:push` to create tables

## Testing in Production

When deploying:

1. Update `.env` for production:
   ```bash
   DATABASE_URL=your_production_neon_url
   JWT_SECRET=use_a_strong_random_secret
   ```

2. Set `NODE_ENV=production` to enable secure cookies

3. Use HTTPS - required for secure cookies

4. Test the flow thoroughly before going live

## Support

If you encounter issues:

1. Check browser console for error messages
2. Check server logs for backend errors
3. Verify database tables exist in Drizzle Studio
4. Check that JWT_SECRET and DATABASE_URL are set
5. Try clearing cookies and trying again

---

**Authentication Method**: SIWE (Sign-In with Ethereum)
**Session Storage**: HTTP-only JWT cookie
**Session Duration**: 7 days
**Network**: Works on all EVM-compatible chains
