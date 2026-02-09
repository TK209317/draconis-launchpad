"use client";

import { useAppKitAccount } from "@reown/appkit/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { getSession, logout } from "../actions/auth";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../hooks/useAuth";
import { LanguageSwitcher } from "./LanguageSwitcher";
import dynamic from "next/dynamic";

const WalletSignIn = dynamic(
  () => import("./WalletSignIn").then((mod) => mod.WalletSignIn),
  { ssr: false }
);

export function Header() {
  const { t } = useLanguage();
  const { isConnected, status } = useAppKitAccount();
  const { isAuthenticating, authError, authenticateUser } = useAuth();
  const isSigningIn = useRef(false);

  // Check if user has a session and handle disconnection
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      if (isConnected) {
        const session = await getSession();
        console.log("Session:", session);

        // Automatically authenticate if connected but not signed in
        if (!session && isMounted && !isSigningIn.current) {
          console.log("Authenticating user");
          isSigningIn.current = true;
          await authenticateUser();
          isSigningIn.current = false;
        }
      } else {
        if (status === "disconnected") {
          const session = await getSession();
          if (session) {
            // // Wallet disconnected - clear session
            console.log("Logging out user");
            await logout();
          }
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [isConnected, authenticateUser, status]);

  return (
    <header className="flex flex-row justify-between items-center px-2 py-2 md:px-4 md:py-4 z-50 bg-draconis-dark relative">
      {isAuthenticating && (
        <div className="absolute top-full left-0 right-0 bg-yellow-500 text-black text-center py-1 text-sm z-50">
          Signing message...
        </div>
      )}
      {authError && (
        <div className="absolute top-full left-0 right-0 bg-red-500 text-white text-center py-1 text-sm z-50">
          {authError}
        </div>
      )}
      <Link
        href="/"
        className="flex flex-row items-center gap-1 md:gap-4 cursor-pointer shrink min-w-0"
      >
        <Image
          src="/logo.png"
          alt="logo"
          width={72}
          height={72}
          className="w-10 h-10 md:w-18 md:h-18 shrink-0"
        />
        <h1 className="text-white text-sm md:text-2xl font-normal leading-normal truncate">
          {t("app.title")}
        </h1>
      </Link>
      <div className="header-actions justify-end flex-row flex gap-1 md:gap-4 items-center shrink-0">
        <div className="hidden md:block">
          <LanguageSwitcher />
        </div>
        <Link href="/#help" className="text-white! hidden md:inline">
          {t("common.help")}
        </Link>
        <WalletSignIn />
      </div>
    </header>
  );
}
