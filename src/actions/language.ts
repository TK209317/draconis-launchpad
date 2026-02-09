"use server";

import "server-only";

import { cookies } from "next/headers";

export type Language = "zh" | "en";

export async function setLanguageCookie(language: Language) {
  const cookieStore = await cookies();
  cookieStore.set("language", language, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
}

export async function getLanguageCookie(): Promise<Language> {
  const cookieStore = await cookies();
  const language = cookieStore.get("language");
  return (language?.value as Language) || "zh";
}
