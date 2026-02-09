"use client";

import "@reown/appkit-wallet-button/react";
import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import {
  config,
  metadata,
  networks,
  projectId,
  wagmiAdapter,
} from "@/src/config";
import { LanguageProvider, useLanguage } from "@/src/contexts/LanguageContext";
import { useAppKitTheme } from "@reown/appkit/react";
import { useEffect } from "react";
import { Header } from "@/src/components/Header";
import { BackgroundDecorator } from "@/src/components/BackgroundDecorator";
import type { Language } from "@/src/actions/language";

// Wallet conflict detection and handling
if (typeof window !== "undefined") {
  const detectWalletExtensions = () => {
    const wallets: string[] = [];
    if (window.ethereum) {
      const ethereum = window.ethereum as any;
      if (ethereum.isMetaMask) wallets.push("MetaMask");
      if (ethereum.isTokenPocket) wallets.push("TokenPocket");
      if (ethereum.isOkxWallet) wallets.push("OKX Wallet");
      if (ethereum.isTrustWallet) wallets.push("Trust Wallet");
      if (ethereum.isCoinbaseWallet) wallets.push("Coinbase Wallet");
    }

    if (wallets.length > 1) {
      console.warn(`检测到多个钱包扩展: ${wallets.join(", ")}，可能会发生冲突`);
    }

    return wallets;
  };

  setTimeout(() => {
    detectWalletExtensions();
  }, 1000);
}

// Global error handling for wallet extension conflicts
if (typeof window !== "undefined") {
  const originalDefineProperty = Object.defineProperty;

  Object.defineProperty = function (
    obj: any,
    prop: string,
    descriptor: PropertyDescriptor
  ) {
    if (obj === window && prop === "ethereum") {
      if (window.hasOwnProperty("ethereum")) {
        console.warn("检测到钱包扩展冲突，跳过重复定义 ethereum 属性");
        return obj;
      }
    }
    return originalDefineProperty.call(this, obj, prop, descriptor);
  };

  window.addEventListener("error", (event) => {
    if (
      event.error &&
      event.error.message &&
      (event.error.message.includes("Cannot redefine property: ethereum") ||
        event.error.message.includes("evmAsk") ||
        event.error.message.includes("Cannot redefine property") ||
        (event.filename &&
          (event.filename.includes("evmAsk") ||
            event.filename.includes("extension"))))
    ) {
      console.warn("检测到钱包扩展冲突，已自动处理:", event.error.message);
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    if (
      event.reason &&
      event.reason.message &&
      (event.reason.message.includes("Cannot redefine property: ethereum") ||
        event.reason.message.includes("evmAsk") ||
        event.reason.message.includes("Cannot redefine property"))
    ) {
      console.warn(
        "检测到钱包扩展Promise冲突，已自动处理:",
        event.reason.message
      );
      event.preventDefault();
    }
  });

  const originalConsoleError = console.error;
  console.error = function (...args: any[]) {
    const message = args.join(" ");
    if (
      message.includes("Cannot redefine property: ethereum") ||
      message.includes("evmAsk")
    ) {
      console.warn("钱包扩展冲突错误已被拦截:", message);
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

const queryClient = new QueryClient();

const getCurrentTheme = (): "dark" => {
  return "dark";
};

const getThemeVariables = () => {
  return {
    "--w3m-font-family":
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    "--w3m-border-radius-master": "12px",
    "--w3m-z-index": 1000,
    "--w3m-accent": "#000000",
  };
};

const generalConfig = {
  projectId,
  networks,
  metadata,
  themeMode: "dark" as const,
  themeVariables: getThemeVariables(),
  debug: process.env.NODE_ENV === "development",
  enableWallets: true,
  enableWalletConnect: true,
  allowUnsupportedChain: true, // Allow connection to unsupported chains without showing error dialog
};

try {
  createAppKit({
    adapters: [wagmiAdapter],
    ...generalConfig,
    defaultAccountTypes: {
      eip155: "eoa",
    },
    features: {
      analytics: true,
    },
  });
} catch (error) {
  console.error("AppKit初始化失败:", error);
}

function AppContent({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const { setThemeMode } = useAppKitTheme();

  useEffect(() => {
    const handleThemeChange = (event?: CustomEvent) => {
      const currentTheme = event?.detail?.theme || getCurrentTheme();
      setThemeMode(currentTheme);

      const newThemeVariables = getThemeVariables();
      Object.entries(newThemeVariables).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, String(value));
      });
    };

    window.addEventListener("themeChanged", handleThemeChange as EventListener);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", () => handleThemeChange());

    handleThemeChange();

    return () => {
      window.removeEventListener(
        "themeChanged",
        handleThemeChange as EventListener
      );
      mediaQuery.removeEventListener("change", () => handleThemeChange());
    };
  }, [setThemeMode]);

  return (
    <>
      <Header />
      <BackgroundDecorator />
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
      <footer className="app-footer">
        <p>{t("app.footer")}</p>
      </footer>
    </>
  );
}

export function Providers({
  children,
  initialLanguage,
}: {
  children: React.ReactNode;
  initialLanguage: Language;
}) {
  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <AppContent>{children}</AppContent>
    </LanguageProvider>
  );
}
