"use client"

import { useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation';

import { pages } from '@/config/routing/pages.route';
import { Header } from '../_component/header';
import { SideNav } from "./_components/side-nav"
import { MobileNavProvider } from '@/components/mobile-nav-context';
import { SearchSuggestionsProvider } from '@/components/search-suggestions-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const { isLoaded, isSignedIn } = useUser()

  if (!isLoaded) {
    return <Loader2 className='m-auto h-screen animate-spin text/white/50'/>
  }

  if (!isSignedIn) {
    redirect(pages.AUTH)
  }

  return (
    <MobileNavProvider>
      <SearchSuggestionsProvider>
        <div className="relative isolate min-h-screen text-white">
          <Header showMobileMenuButton showSearch />
          <div className="h-20 md:h-24" />
          <main className="mx-4 sm:mx-6 md:mx-8 lg:mx-10 py-6">
            <div className="flex w-full gap-6 md:gap-8">
              <SideNav />
              <div className="min-w-0 flex-1">
                {children}
              </div>
            </div>
          </main>
        </div>
      </SearchSuggestionsProvider>
    </MobileNavProvider>
  );
}