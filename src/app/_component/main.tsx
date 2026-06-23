"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { images } from "@/config/routing/image.route";
import { pages } from "@/config/routing/pages.route";
import { useConvexAuth } from "convex/react";
import { ArrowRight, Cloud, FileText, ShieldCheck } from "lucide-react";
import { FeatureCards } from "./feature-cards";
import { useTranslation } from "@/components/hooks/use-translation";

function ParticleField() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        let animationId: number
        const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = []

        const resize = () => {
            canvas.width = canvas.offsetWidth
            canvas.height = canvas.offsetHeight
        }
        resize()
        window.addEventListener("resize", resize)

        for (let i = 0; i < 40; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 2 + 1,
                a: Math.random() * 0.3 + 0.1,
            })
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            for (const p of particles) {
                p.x += p.vx
                p.y += p.vy
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(164, 120, 255, ${p.a})`
                ctx.fill()
            }
            animationId = requestAnimationFrame(animate)
        }
        animate()

        return () => {
            cancelAnimationFrame(animationId)
            window.removeEventListener("resize", resize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
        />
    )
}

function MainSkeleton() {
    return (
        <>
            <section className="section-shell py-16 sm:py-20 md:py-28">
                <Skeleton className="relative mx-auto h-20 w-full max-w-[600px] rounded-3xl sm:h-24 md:h-28" />

                <div className="mx-auto mt-6 flex max-w-[520px] flex-col items-center gap-3 px-2 sm:mt-8">
                    <Skeleton className="h-8 w-full max-w-[420px] rounded-xl" />
                    <Skeleton className="h-5 w-full max-w-[300px] rounded-lg" />
                </div>

                <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Skeleton className="h-14 w-40 rounded-xl" />
                </div>

                <div className="mt-12 flex justify-center gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-32 rounded-2xl" />
                    ))}
                </div>
            </section>

            <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-10">
                <hr className="rounded-2xl border-white/10" />
            </div>

            <section className="section-shell py-12">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-600/20 to-purple-900/20 p-6"
                        >
                            <div className="flex flex-col items-center gap-4 text-center">
                                <Skeleton className="h-14 w-14 rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="mx-auto h-5 w-32 rounded-lg" />
                                    <Skeleton className="mx-auto h-4 w-full max-w-[200px] rounded-lg" />
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
    const { t } = useTranslation();
    const { isAuthenticated, isLoading } = useConvexAuth()

    if (isLoading) {
        return <MainSkeleton />;
    }

    const features = [
        { name: t("landing.featureAnyFormat"), icon: FileText, desc: t("landing.featureAnyFormatDesc") },
        { name: t("landing.featureReliable"), icon: ShieldCheck, desc: t("landing.featureReliableDesc") },
        { name: t("landing.featureAlwaysAtHand"), icon: Cloud, desc: t("landing.featureAlwaysAtHandDesc") },
    ];

    return (
        <>
            <section className="section-shell relative py-16 sm:py-20 md:py-28">
                <ParticleField />

                <div className="pointer-events-none absolute -top-20 left-1/2 -z-10 h-60 w-60 -translate-x-1/2 rounded-full bg-purple-500/20 blur-[100px] animate-pulse" />

                <div className="relative">
                    <Image
                        src={images.LOGO}
                        width={500}
                        height={130}
                        alt="QualCloud"
                        className="relative mx-auto w-full max-w-[600px] drop-shadow-[0_18px_45px_rgba(0,0,0,0.35)] transition-all duration-700 hover:scale-[1.02]"
                        priority
                    />
                </div>

                <h1 className="relative mx-auto mt-6 max-w-[600px] px-2 text-center text-2xl leading-tight text-white/80 sm:mt-8 sm:text-3xl sm:leading-snug">
                    {t("landing.heroTitle")}
                    <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-300 bg-clip-text text-transparent"> QualCloud</span>
                </h1>

                <p className="relative mx-auto mt-4 max-w-[460px] px-4 text-center text-sm leading-relaxed text-white/50 sm:text-base">
                    {t("landing.heroSubtitle")}
                </p>

                <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link
                        href={isAuthenticated ? pages.DASHBOARD.ROOT : pages.AUTH}
                        className="group primary-button px-8 py-3 text-lg"
                    >
                        <span>{t("landing.heroCta")}</span>
                        <ArrowRight size={20} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                </div>

                <div className="relative mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                    {features.map((s) => (
                        <div
                            key={s.name}
                            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/30 hover:bg-white/[0.06]"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/30">
                                <s.icon size={18} className="text-purple-300" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white/80">{s.name}</p>
                                <p className="text-xs text-white/40">{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-10">
                <hr className="border-white/10 rounded-2xl" />
            </div>

            <FeatureCards />
        </>
    );
}
