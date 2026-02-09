import "./globals.css";
import { Providers } from "./providers";
import { getLanguageCookie } from "@/src/actions/language";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialLanguage = await getLanguageCookie();

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Draconis Launchpad</title>
      </head>
      <body className={roboto.className}>
        <div className="relative">
          <Providers initialLanguage={initialLanguage}>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
