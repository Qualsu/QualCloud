"use client"

import { useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation';

import { pages } from '@/config/routing/pages.route';
import { Header } from '../_component/header';
import { SideNav } from "./_components/side-nav"
import { FilesViewProvider } from "@/components/context/files-view-context";
import { FilesRefreshProvider } from "@/components/context/files-refresh-context";
import { MobileNavProvider } from '@/components/context/mobile-nav-context';
import { SearchSuggestionsProvider } from '@/components/context/search-suggestions-context';
import { UploadProgressProvider } from "@/components/context/upload-progress-context";
import { PageDropZone } from '@/components/drop-zone/page-drop-zone';
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
        <FilesRefreshProvider>
          <UploadProgressProvider>
          <PageDropZone>
            <div className="relative isolate min-h-screen text-white">
              <Header showMobileMenuButton showSearch />
              <div className="h-20 md:h-24" />
              <main className="mx-4 sm:mx-6 md:mx-8 lg:mx-10 py-6">
                <div className="flex w-full items-start">
                  <SideNav />
                  <div className="min-w-0 flex-1 md:pl-[17rem]">
                    <FilesViewProvider>
                      {children}
                    </FilesViewProvider>
                  </div>
                </div>
              </main>
            </div>
          </PageDropZone>
          </UploadProgressProvider>
        </FilesRefreshProvider>
      </SearchSuggestionsProvider>
    </MobileNavProvider>
  );
}