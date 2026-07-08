import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { ThemeProvider } from "@/components/provider/theme-provider";
import { images } from "@/config/routing/image.route";
import ConvexClientProvider from "@/components/provider/convex-client-provider";
import { ApiAuthProvider } from "@/components/provider/api-auth-provider";
import { SettingsProvider } from "@/components/context/settings-context";
import { LanguageSync } from "@/components/provider/language-provider";
import { Toaster } from "react-hot-toast";
import ruTranslations from "@/config/i18n/translations/ru.json";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "QualCloud | %s",
    default: "QualCloud",
  },
  description: ruTranslations.meta.defaultDescription,
  manifest: images.MANIFEST,
  icons: {
    icon: images.ICON,

  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            <ApiAuthProvider>
              <SettingsProvider>
                <LanguageSync />
                <Toaster
                  position="bottom-center"
                  reverseOrder={false}
                  toastOptions={{
                    style: {
                      background: 'rgba(40, 28, 40, 0.95)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(24px)',
                    },
                  }}
                />
                {children}
              </SettingsProvider>
            </ApiAuthProvider>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}