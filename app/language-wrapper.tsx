import { getLanguageCookie } from "@/src/actions/language";
import { Providers } from "./providers";

export async function LanguageWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialLanguage = await getLanguageCookie();

  return <Providers initialLanguage={initialLanguage}>{children}</Providers>;
}
