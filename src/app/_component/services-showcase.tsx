"use client";

import { HardDrive, ShieldCheck, Globe } from "lucide-react";
import { useTranslation } from "@/components/hooks/use-translation";

export function ServicesShowcase() {
  const { t } = useTranslation();

  const features = [
    {
      title: t("landing.capLotsOfSpace"),
      desc: t("landing.capLotsOfSpaceDesc"),
      icon: HardDrive,
    },
    {
      title: t("landing.capSecurity"),
      desc: t("landing.capSecurityDesc"),
      icon: ShieldCheck,
    },
    {
      title: t("landing.capAccessAnywhere"),
      desc: t("landing.capAccessAnywhereDesc"),
      icon: Globe,
    },
  ];

  return (
    <section className="section-shell py-12">
      <div className="mb-10 text-center">
        <h2 className="text-xl font-semibold text-white sm:text-2xl">
          {t("landing.capabilitiesTitle")}{" "}
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            QualCloud
          </span>
        </h2>
        <p className="mt-2 text-sm text-white/50 sm:text-base">
          {t("landing.capabilitiesSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {features.map((s) => (
          <div
            key={s.title}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-purple-500/30 hover:bg-white/[0.06] hover:shadow-[0_0_40px_rgba(139,92,246,0.1)]"
          >
            <div className="flex flex-col items-center gap-5 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 transition-all duration-500 group-hover:scale-110">
                <s.icon size={32} className="text-purple-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  {s.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
