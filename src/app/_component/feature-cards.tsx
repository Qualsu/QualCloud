"use client";

import Image from "next/image";

import { images } from "@/config/routing/image.route";
import { useTranslation } from "@/components/hooks/use-translation";

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

            <div className="section-shell relative !mx-0 flex flex-col items-center gap-8 overflow-hidden py-10 text-center transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] sm:flex-row sm:justify-between sm:gap-10 sm:px-12 sm:py-12 sm:text-left">
                <div className="flex max-w-xl flex-col gap-4">
                    <h3 className="text-2xl font-medium text-white/90 sm:text-5xl">
                        {t("landing.featureCards.archive")}
                    </h3>
                    <p className="text-xl text-white/60 sm:text-xl">
                        {t("landing.featureCards.archiveDesc")}
                    </p>
                </div>
                <div className="relative h-52 w-52 shrink-0 sm:h-64 sm:w-64">
                    <Image
                        src={images.IMAGE.ARCHIVE}
                        alt={t("landing.featureCards.archive")}
                        fill
                        className="object-contain drop-shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
                    />
                </div>
            </div>
        </section>
    );
}
