import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { images } from "@/config/routing/image.route";
import ConvexClientProvider from "../components/convex-client-provider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QualCloud",
  description: "Единый доступ к файлам проектов Qualsu",
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
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}