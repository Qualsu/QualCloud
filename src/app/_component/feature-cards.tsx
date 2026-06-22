"use client";

import { Boxes, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "@/components/hooks/use-translation";
import { images } from "@/config/routing/image.route";

export function FeatureCards() {
  const { t } = useTranslation();

  const landingFeatureCards = [
    {
      title: t("landingFeatureCards.unifiedAccess"),
      description: t("landingFeatureCards.unifiedAccessDesc"),
      icon: <Boxes className="h-8 w-8 text-white" />,
    },
    {
      title: t("landingFeatureCards.kenycloudArchive"),
      description: t("landingFeatureCards.kenycloudArchiveDesc"),
      icon: (
        <Image
          src={images.ICONS.KENYCLOUD}
          width={100}
          height={100}
          alt="KenyCloud icon"
          className="h-8 w-8"
        />
      ),
    },
    {
      title: t("landingFeatureCards.security"),
      description: t("landingFeatureCards.securityDesc"),
      icon: <ShieldCheck className="h-8 w-8 text-white" />,
    },
  ];

  return (
    <section className="section-shell py-12">
      <div className="mb-10 text-center">
        <h2 className="text-xl font-semibold text-white sm:text-2xl">
          {t("landing.whyTitle")}{" "}
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            QualCloud
          </span>
          ?
        </h2>
        <p className="mt-2 text-sm text-white/50 sm:text-base">
          {t("landing.whySubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {landingFeatureCards.map((card, i) => (
          <article
            key={i}
            className="group relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-600/20 to-purple-900/20 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-purple-400/40 hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-purple-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative flex flex-col items-center gap-5 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-700/25 transition-all duration-500 group-hover:scale-110 group-hover:shadow-purple-600/40">
                {card.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold uppercase tracking-wide text-white">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {card.description}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
