"use client";

import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticating, authError } = useAuth();

  useEffect(() => {
    if (authError) {
      console.error("Authentication error:", authError);
      // Optionally show a toast or notification
    }
  }, [authError]);

  // Optionally show loading state while authenticating
  // For now, we'll just render children immediately
  // The authentication happens in the background

  return <>{children}</>;
}
