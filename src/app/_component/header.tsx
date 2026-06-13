"use client";

import { OrganizationSwitcher, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { Loader2, Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { pages } from "@/config/routing/pages.route";
import { images } from "@/config/routing/image.route";
import { useMobileNav } from "@/components/mobile-nav-context";
import { HeaderProps } from "@/config/types/components.types";
import { usePathname } from "next/navigation";
import { SearchBar } from "../dashboard/_components/search-bar";

export function Header({ showMobileMenuButton, showSearch }: HeaderProps) {
    const { isLoading } = useConvexAuth();
    const { toggle } = useMobileNav();
    const pathname = usePathname()
    const shouldShowSearch = showSearch ?? pathname.startsWith("/dashboard");

    return (
        <header className="fixed top-0 left-0 right-0 z-10 px-4 pt-3 sm:px-6">
            <div className="surface-panel flex w-full items-center gap-4 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
                <div className="flex min-w-0 items-center gap-3 md:justify-self-start">
                    {showMobileMenuButton && (
                        <button
                            onClick={toggle}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white md:hidden"
                            aria-label="Открыть меню"
                        >
                            <Menu size={18} />
                        </button>
                    )}
                    <Link href={pages.ROOT}>
                        <Image
                            src={images.LOGO}
                            width={140}
                            height={36}
                            alt="QualCloud Logo"
                            className={`h-8 w-auto hidden md:block`}
                        />

                        <Image
                            src={images.ICON}
                            width={40}
                            height={40}
                            alt="QualCloud Icon"
                            className={`h-8 w-auto ${pathname === "/" ? "block md:hidden" : "hidden"}`}
                        />
                    </Link>
                </div>

                {shouldShowSearch && (
                    <div className="hidden justify-center md:flex md:justify-self-center">
                        <SearchBar syncWithUrl />
                    </div>
                )}

                {isLoading ? (
                    <Loader2 className="animate-spin text-white/60" size={20} />
                ) : (
                    <div className="flex min-w-fit items-center gap-2 md:justify-self-end">
                        <OrganizationSwitcher
                            appearance={{
                                elements: {
                                    rootBox: "text-white",
                                    organizationSwitcherTrigger: `text-white/80 hover:text-white hover:bg-white/10 rounded-xl px-3 py-2 ${pathname === "/" && "hidden"}`,
                                }
                            }}
                        />
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "w-8 h-8",
                                }
                            }}
                        />
                        <SignedOut>
                            <SignInButton>
                                <Link
                                    href={pages.AUTH}
                                    className="primary-button px-4 py-2 text-sm"
                                >
                                    Войти
                                </Link>
                            </SignInButton>
                        </SignedOut>
                    </div>
                )}
            </div>
        </header>
    );
}
