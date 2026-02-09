"use server";

import "server-only";

import { cookies } from "next/headers";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { ethers } from "ethers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const JWT_EXPIRY = "7d"; // 7 days

export interface SessionData {
  address: string;
  iat: number;
  exp: number;
}

/**
 * Generate a random nonce for wallet signature
 */
export async function generateNonce(): Promise<string> {
  return crypto.randomUUID();
}

/**
 * Verify wallet signature
 * @param message - The message that was signed
 * @param signature - The signature from the wallet
 * @returns The verified wallet address or null if verification fails
 */
export async function verifySignature(
  message: string,
  signature: string
): Promise<{ success: boolean; address?: string; error?: string }> {
  try {
    // Recover the address from the signature
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);

    if (!recoveredAddress) {
      return { success: false, error: "Invalid signature" };
    }

    const address = recoveredAddress;

    // Ensure user exists in database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.walletAddress, address.toLowerCase()))
      .limit(1);

    if (existingUser.length === 0) {
      // Create new user
      await db.insert(users).values({
        walletAddress: address.toLowerCase(),
        nonce: await generateNonce(),
      });
    } else {
      // Update nonce for existing user
      await db
        .update(users)
        .set({
          nonce: await generateNonce(),
          updatedAt: new Date(),
        })
        .where(eq(users.walletAddress, address.toLowerCase()));
    }

    return { success: true, address: address.toLowerCase() };
  } catch (error) {
    console.error("Signature verification error:", error);
    return { success: false, error: "Signature verification failed" };
  }
}

/**
 * Create a session by setting a JWT token in an HTTP-only cookie
 * @param address - The wallet address to create a session for
 */
export async function createSession(address: string): Promise<void> {
  const token = jwt.sign({ address: address.toLowerCase() }, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

/**
 * Get the current session from the cookie
 * @returns The session data or null if no valid session exists
 */
export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie?.value) {
      return null;
    }

    const decoded = jwt.verify(sessionCookie.value, JWT_SECRET) as SessionData;
    return decoded;
  } catch (error) {
    console.error("Session verification error:", error);
    return null;
  }
}

/**
 * Verify that a session exists and belongs to the specified address
 * @param expectedAddress - The address to verify against the session
 * @returns true if session is valid and matches the address
 */
export async function verifySession(
  expectedAddress?: string
): Promise<boolean> {
  const session = await getSession();

  if (!session) {
    return false;
  }

  if (
    expectedAddress &&
    session.address.toLowerCase() !== expectedAddress.toLowerCase()
  ) {
    return false;
  }

  return true;
}

/**
 * Logout by clearing the session cookie
 */
export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

/**
 * Get user nonce for signing
 * @param address - The wallet address
 * @returns The nonce or null if user doesn't exist
 */
export async function getUserNonce(address: string): Promise<string | null> {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.walletAddress, address.toLowerCase()))
      .limit(1);

    if (user.length === 0) {
      // Create new user with nonce
      const nonce = await generateNonce();
      await db.insert(users).values({
        walletAddress: address.toLowerCase(),
        nonce,
      });
      return nonce;
    }

    return user[0].nonce || (await generateNonce());
  } catch (error) {
    console.error("Error getting user nonce:", error);
    return null;
  }
}
