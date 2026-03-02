"use server";

import "server-only";
import { cookies } from "next/headers";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { ethers } from "ethers";
import crypto from 'crypto'; // 用來產生 nonce

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


export async function getUserNonce(address: string): Promise<string> {
  const lowerAddress = address.toLowerCase();
  console.log("[SERVER ACTION - getUserNonce] 開始執行，address:", lowerAddress);

  // 確認環境變數（這部分你已經加了）
  console.log("[SERVER ACTION] DATABASE_URL 是否存在:", !!process.env.DATABASE_URL);
  console.log("[SERVER ACTION] DATABASE_URL 值長度:", process.env.DATABASE_URL?.length || 0);
  console.log("[SERVER ACTION] DATABASE_URL 開頭:", process.env.DATABASE_URL?.substring(0, 30) || "無");

  try {
    console.log("[getUserNonce] 嘗試查詢用戶");
    const user = await db
      .select()
      .from(users)
      .where(eq(users.walletAddress, lowerAddress))
      .limit(1);

    console.log("[getUserNonce] 查詢結果:", user);

    if (user.length > 0 && user[0].nonce) {
      console.log("[getUserNonce] 找到用戶，返回現有 nonce:", user[0].nonce);
      return user[0].nonce;
    }

    // 產生新 nonce（用 crypto 確保安全）
    const nonce = crypto.randomUUID();
    console.log("[getUserNonce] 產生新 nonce:", nonce);

    console.log("[getUserNonce] 插入新用戶");
    await db.insert(users).values({
      walletAddress: lowerAddress,
      nonce,
      // 如果 schema 有其他必填欄位，如 createdAt，加這裡
      // createdAt: new Date(),
    });

    console.log("[getUserNonce] 插入成功，返回新 nonce");
    return nonce;
  } catch (error) {
    console.error("[getUserNonce] 完整錯誤:", error);
    // 不要返回 null，而是拋錯，讓外層知道失敗原因
    throw new Error(`無法取得或產生 nonce: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}
