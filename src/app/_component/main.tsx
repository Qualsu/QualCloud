"use client";

import Image from "next/image";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { landingFeatureCards } from "@/config/const/components.const";
import { images } from "@/config/routing/image.route";
import { pages } from "@/config/routing/pages.route";
import { useConvexAuth } from "convex/react";
import { FeatureCards } from "./feature-cards";

function MainSkeleton() {
    return (
        <>
            <section className="section-shell py-16 sm:py-20 md:py-28">
                <div className="pointer-events-none absolute inset-y-10 left-1/2 hidden w-40 -translate-x-1/2 rounded-full bg-purple-600/10 blur-3xl md:block" />

                <Skeleton className="relative mx-auto h-20 w-full max-w-[600px] rounded-3xl sm:h-24 md:h-28" />

                <div className="mx-auto mt-6 flex max-w-[520px] flex-col items-center gap-3 px-2 sm:mt-8">
                    <Skeleton className="h-8 w-full max-w-[420px] rounded-xl" />
                </div>

                <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Skeleton className="h-16 w-40 rounded-xl" />
                </div>
            </section>

            <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-10">
                <hr className="rounded-2xl border-white/10" />
            </div>

            <section className="section-shell py-16">
                <div className="grid grid-cols-1 gap-8">
                    {landingFeatureCards.map((card) => (
                        <div
                            key={card.title}
                            className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-600/20 to-purple-900/20 p-8 backdrop-blur-sm"
                        >
                            <div className="flex items-start gap-6">
                                <Skeleton className="h-16 w-16 flex-shrink-0 rounded-xl" />
                                <div className="flex-1 space-y-3">
                                    <Skeleton className="h-6 w-40 rounded-lg" />
                                    <Skeleton className="h-4 w-full max-w-[360px] rounded-lg" />
                                    <Skeleton className="h-4 w-4/5 max-w-[280px] rounded-lg" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}

export default function Main() {
    const { isAuthenticated, isLoading } = useConvexAuth()

    if (isLoading) {
        return <MainSkeleton />;
    }

    return (
        <>
            <section className="section-shell py-16 sm:py-20 md:py-28">
                <div className="pointer-events-none absolute inset-y-10 left-1/2 hidden w-40 -translate-x-1/2 rounded-full bg-purple-600/10 blur-3xl md:block" />

                <Image
                    src={images.LOGO}
                    width={500}
                    height={130}
                    alt="QualCloud"
                    className="relative mx-auto w-full max-w-[600px] drop-shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
                />

                <h1 className="relative mx-auto mt-6 px-2 text-center text-2xl leading-tight text-white/80 sm:mt-8">
                    Единый доступ к файлам проектов Qualsu
                </h1>

                <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link href={isAuthenticated ? pages.DASHBOARD.ROOT : pages.AUTH} className="primary-button px-8 py-3 text-lg">
                        Перейти
                    </Link>
                </div>
            </section>

            <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-10">
                <hr className="border-white/10 rounded-2xl" />
            </div>

            <FeatureCards />
            
        </>
    );
}