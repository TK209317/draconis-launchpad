"use client";

import { useEffect, useState, useRef } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { ethers } from "ethers";
import { getUserNonce, verifySignature, createSession } from "../actions/auth";

export function useAuth() {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const hasAttemptedAuth = useRef(false);

  useEffect(() => {
    // Don't auto-authenticate - only authenticate when explicitly called
    // Reset when disconnected
    if (!isConnected) {
      hasAttemptedAuth.current = false;
      setIsAuthenticated(false);
    }
  }, [isConnected, address, walletProvider]);

  const authenticateUser = async () => {
    if (!address || !walletProvider) {
      setAuthError("Wallet not connected");
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      // Get nonce from server
      const nonce = await getUserNonce(address);
      if (!nonce) {
        throw new Error("Failed to get nonce");
      }

      // Create a simple message to sign
      const message = `Welcome to Draconis Launchpad!

Click "Sign" to authenticate your wallet.

This request will not trigger a blockchain transaction or cost any gas fees.

Wallet address: ${address}
Nonce: ${nonce}`;

      // Request signature from wallet using ethers v5
      const provider = new ethers.providers.Web3Provider(walletProvider);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(message);

      // Verify signature on server
      const verifyResult = await verifySignature(message, signature);
      if (!verifyResult.success) {
        throw new Error(verifyResult.error || "Signature verification failed");
      }

      // Create session
      await createSession(address);

      setIsAuthenticated(true);
      console.log("Authentication successful");
    } catch (error) {
      console.error("Authentication error:", error);
      setAuthError(
        error instanceof Error ? error.message : "Authentication failed"
      );
      setIsAuthenticated(false);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return {
    isAuthenticated,
    isAuthenticating,
    authError,
    authenticateUser,
  };
}
