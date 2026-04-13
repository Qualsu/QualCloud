"use client"

import { useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

import { pages } from '@/config/routing/pages.route';
import { Header } from '../_component/header';
import { SideNav } from "./_components/side-nav"
import { MobileNavProvider } from '@/components/mobile-nav-context';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const { isSignedIn } = useUser()
  const [showPage, setShowPage] = useState(false)

  useEffect(() => {
    if (process.env.SERVER_STATE === "True" || !isSignedIn) {
      const timer = setTimeout(() => {
        setShowPage(true)
      }, 1000)

      return () => clearTimeout(timer)
    }

    setShowPage(false)
  }, [isSignedIn])

  return (
      <>
        {showPage ? (
          redirect(pages.AUTH)
        ) : (
          <MobileNavProvider>
            <div className="relative isolate min-h-screen text-white">
              <Header showMobileMenuButton />
              <div className="h-20 md:h-24" />
              <main className="mx-4 sm:mx-6 md:mx-8 lg:mx-10 py-6">
                <div className="mx-auto flex max-w-[1400px] gap-6 md:gap-8">
                  <SideNav />
                  <div className="min-w-0 flex-1">
                    {children}
                  </div>
                </div>
              </main>
            </div>
          </MobileNavProvider>
        )}
      </>
  );
}