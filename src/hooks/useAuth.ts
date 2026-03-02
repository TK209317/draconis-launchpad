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
  const authTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 斷開連線時重置狀態
    if (!isConnected) {
      hasAttemptedAuth.current = false;
      setIsAuthenticated(false);
      setAuthError(null);
      setIsAuthenticating(false); // 強制關閉 loading
    }

    return () => {
      // 清理 timeout
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
      }
    };
  }, [isConnected]);

  const authenticateUser = async () => {
    if (!address || !walletProvider) {
      setAuthError("錢包未連接");
      return;
    }

    // 如果已經在認證中，就不要重複執行
    if (isAuthenticating) {
      console.log("已在認證中，跳過重複呼叫");
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);
    setIsAuthenticated(false);
    hasAttemptedAuth.current = true;

    // 設定 30 秒強制關閉 timeout（防卡死）
    authTimeoutRef.current = setTimeout(() => {
      console.warn("認證超時，強制關閉 loading");
      setIsAuthenticating(false);
      setAuthError("認證超時，請重新嘗試");
    }, 30000);

    try {
      console.log("[Auth] 步驟1: 取得 nonce");
      const nonce = await getUserNonce(address);
      if (!nonce) {
        throw new Error("無法取得 nonce");
      }
      console.log("[Auth] nonce:", nonce);

      const message = `Welcome to Draconis Launchpad!

Click "Sign" to authenticate your wallet.

This request will not trigger a blockchain transaction or cost any gas fees.

Wallet address: ${address}
Nonce: ${nonce}`;

      console.log("[Auth] 步驟2: 請求錢包簽名");
      const provider = new ethers.providers.Web3Provider(walletProvider);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(message);
      console.log("[Auth] 簽名成功:", signature);

      console.log("[Auth] 步驟3: 驗證簽名");
      const verifyResult = await verifySignature(message, signature);
      if (!verifyResult.success) {
        throw new Error(verifyResult.error || "簽名驗證失敗");
      }
      console.log("[Auth] 簽名驗證成功");

      console.log("[Auth] 步驟4: 建立 session");
      await createSession(address);
      console.log("[Auth] session 建立成功");

      setIsAuthenticated(true);
      console.log("[Auth] 認證完成");
    } catch (error) {
      console.error("[Auth] 認證失敗:", error);
      setAuthError(
        error instanceof Error ? error.message : "認證失敗，請檢查網路或錢包"
      );
      setIsAuthenticated(false);
    } finally {
      console.log("[Auth] 流程結束，關閉 loading");
      setIsAuthenticating(false);
      
      // 清理 timeout
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
        authTimeoutRef.current = null;
      }
    }
  };

  return {
    isAuthenticated,
    isAuthenticating,
    authError,
    authenticateUser,
  };
}