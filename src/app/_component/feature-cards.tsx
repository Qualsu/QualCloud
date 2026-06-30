"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";

import { images } from "@/config/routing/image.route";
import { pages } from "@/config/routing/pages.route";
import { useTranslation } from "@/components/hooks/use-translation";
import { usePwaInstall } from "@/components/hooks/use-pwa-install";
import { useConvexAuth } from "convex/react";

function FeatureCard({
    title,
    icon,
    iconAlt,
    className,
}: {
    title: string;
    icon: string;
    iconAlt: string;
    className?: string;
}) {
    return (
        <div
            className={`section-shell relative !mx-0 flex flex-col items-center justify-center gap-5 py-10 sm:py-12 text-center transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] ${className ?? ""}`}
        >
            <div className="relative h-28 w-28 sm:h-36 sm:w-36">
                <Image
                    src={icon}
                    alt={iconAlt}
                    fill
                    className="object-contain drop-shadow-[0_8px_24px_rgba(139,92,246,0.25)]"
                />
            </div>
            <h3 className="text-lg font-medium text-white/90 sm:text-xl">
                {title}
            </h3>
        </div>
    );
}

export default function FeatureCards() {
    const { t } = useTranslation();

    return (
        <section className="mx-4 my-6 space-y-4 sm:mx-6 sm:my-8 sm:space-y-5 md:mx-8 md:my-10 lg:mx-10">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 md:gap-8 lg:gap-10">
                <FeatureCard
                    title={t("landing.featureCards.safe")}
                    icon={images.ICONS.SAFE}
                    iconAlt={t("landing.featureCards.safe")}
                />
                <FeatureCard
                    title={t("landing.featureCards.sync")}
                    icon={images.ICONS.SINGLE}
                    iconAlt={t("landing.featureCards.sync")}
                />
                <FeatureCard
                    title={t("landing.featureCards.team")}
                    icon={images.ICONS.TEAM}
                    iconAlt={t("landing.featureCards.team")}
                />
            </div>

            <div className="section-shell relative !mx-0 flex flex-col items-center justify-center gap-3 py-8 sm:py-10 text-center transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07]">
                <div className="flex items-center gap-3">
                    <Image
                        src={images.ICON}
                        alt="QualCloud"
                        width={48}
                        height={48}
                        className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                    />
                    <Image
                        src={images.APP.NOTTER}
                        alt="Notter"
                        width={48}
                        height={48}
                        className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                    />
                    <Image
                        src={images.APP.SHRTL}
                        alt="Shrtl"
                        width={48}
                        height={48}
                        className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                    />
                </div>
                <h3 className="text-xl font-medium text-white/90 sm:text-2xl">
                    {t("landing.featureCards.allInOne")}
                </h3>
                <p className="max-w-md text-sm text-white/60 sm:text-base">
                    {t("landing.featureCards.allInOneDesc")}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-6 md:gap-8 lg:gap-10">
                <div className="section-shell relative !mx-0 flex flex-col items-center gap-6 overflow-hidden py-10 text-center transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] sm:gap-8 sm:py-14">
                    <div className="flex max-w-xl flex-col gap-4">
                        <h3 className="text-2xl font-medium text-white/90 sm:text-4xl">
                            {t("landing.featureCards.archive")}
                        </h3>
                        <p className="text-xl text-white/60 sm:text-xl">
                            {t("landing.featureCards.archiveDesc")}
                        </p>
                    </div>
                    <div className="relative h-52 w-52 shrink-0 sm:h-80 sm:w-80">
                        <Image
                            src={images.IMAGE.ARCHIVE}
                            alt={t("landing.featureCards.archive")}
                            fill
                            className="object-contain drop-shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
                        />
                    </div>
                </div>

                <PwaCard />
            </div>
            <GoCard />
        </section>
    );
}

function PwaCard() {
    const { t } = useTranslation();
    const { install } = usePwaInstall();

    return (
        <div className="section-shell relative !mx-0 flex flex-col items-center gap-6 overflow-hidden py-10 text-center transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] sm:gap-8 sm:py-14">
            <div className="pointer-events-none absolute -bottom-20 left-1/2 -z-10 h-60 w-60 -translate-x-1/2 rounded-full bg-purple-600/20 blur-[100px]" />

            <h3 className="text-2xl font-medium text-white/90 sm:text-4xl">
                {t("landing.featureCards.pwaTitle")}
            </h3>

            <div className="relative h-72 w-40 sm:h-80 sm:w-44">
                <Image
                    src={images.IMAGE.PHONE}
                    alt={t("landing.featureCards.pwaTitle")}
                    fill
                    className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
                />
            </div>

            <button
                type="button"
                onClick={install}
                className="group inline-flex items-center justify-center gap-3 rounded-xl bg-white px-10 py-3 text-lg font-medium text-black shadow-lg shadow-white/5 transition-all duration-300 hover:bg-white/90 hover:shadow-white/10"
            >
                <Download size={20} />
                <span>{t("landing.featureCards.pwaButton")}</span>
            </button>
        </div>
    );
}

function GoCard() {
    const { t } = useTranslation();
    const { isAuthenticated, isLoading } = useConvexAuth();

    return (
        <div className="section-shell relative !mx-0 flex flex-col items-center gap-5 py-10 text-center transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] sm:gap-6 sm:py-14">
            <h3 className="max-w-2xl text-2xl font-medium text-white/90 sm:text-3xl">
                {t("landing.featureCards.goTitle")}
            </h3>

            <Link
                href={isLoading ? pages.ROOT : isAuthenticated ? pages.DASHBOARD.ROOT : pages.AUTH}
                className="group inline-flex items-center justify-center gap-3 rounded-xl bg-white px-10 py-3 text-lg font-medium text-black shadow-lg shadow-white/5 transition-all duration-300 hover:bg-white/90 hover:shadow-white/10"
            >
                <span>{t("landing.featureCards.goButton")}</span>
                <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
        </div>
    );
}
