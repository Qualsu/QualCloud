"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { dark } from "@clerk/themes";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#a431ff",
          colorBackground: "#1e1126",
          colorInputBackground: "rgba(255,255,255,0.06)",
          colorInputText: "#ffffff",
          colorText: "#ffffff",
          colorTextSecondary: "rgba(255,255,255,0.6)",
          borderRadius: "0.75rem",
        },
        elements: {
          card: "shadow-[0_32px_80px_rgba(0,0,0,0.45)] border border-white/10",
          formButtonPrimary: "bg-purple-600/75 hover:bg-purple-600 border border-purple-500/50",
          footerActionLink: "text-purple-400 hover:text-purple-300",
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}