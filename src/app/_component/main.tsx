"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

import { images } from "@/config/routing/image.route";
import { pages } from "@/config/routing/pages.route";
import { useConvexAuth } from "convex/react";
import { ArrowRight, Download } from "lucide-react";
import { useTranslation } from "@/components/hooks/use-translation";
import { usePwaInstall } from "@/components/hooks/use-pwa-install";

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

export default function Main() {
    const { t } = useTranslation();
    const { isAuthenticated } = useConvexAuth()
    const { install } = usePwaInstall();

    return (
        <section className="section-shell relative py-16 sm:py-20 md:py-24 lg:py-32">
            <ParticleField />

            <div className="pointer-events-none absolute -top-20 right-1/4 -z-10 h-60 w-60 rounded-full bg-purple-500/20 blur-[100px] animate-pulse" />

            <div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="flex flex-col items-start text-left">
                    <h1>
                        <Image
                            src={images.LOGO}
                            width={750}
                            height={195}
                            alt="QualCloud"
                            className="w-full max-w-[630px] drop-shadow-[0_18px_45px_rgba(0,0,0,0.35)] transition-all duration-700 hover:scale-[1.02]"
                            priority
                        />
                    </h1>

                    <p className="mt-7 max-w-[680px] text-2xl leading-relaxed text-white/70 sm:text-3xl">
                        {t("landing.heroSubtitle")}
                    </p>

                    <div className="mt-10 flex flex-wrap items-center gap-5">
                        <Link
                            href={isAuthenticated ? pages.DASHBOARD.ROOT : pages.AUTH}
                            className="group inline-flex items-center justify-center gap-3 rounded-xl bg-white px-10 py-3 text-lg font-medium text-black shadow-lg shadow-white/5 transition-all duration-300 hover:bg-white/90 hover:shadow-white/10"
                        >
                            <span>{t("landing.heroCta")}</span>
                            <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>

                        <button
                            type="button"
                            onClick={install}
                            className="primary-button inline-flex items-center justify-center gap-3 px-10 py-4 text-lg"
                        >
                            <Download size={20} />
                            <span>{t("landing.heroDownload")}</span>
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <Image
                        src={images.IMAGE.BANNER}
                        width={1590}
                        height={936}
                        alt="QualCloud dashboard"
                        className="relative w-full rounded-2xl"
                        priority
                    />
                </div>
            </div>
        </section>
    );
}
