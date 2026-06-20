"use client";

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { pages } from "@/config/routing/pages.route"
import { useConvexAuth } from "convex/react"

export function CTASection() {
    const { isAuthenticated } = useConvexAuth()

    return (
        <section className="section-shell relative overflow-hidden py-14 text-center">
            <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-purple-600/20 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-blue-600/15 blur-[80px]" />

            <div className="relative">
                <h2 className="text-xl font-semibold text-white sm:text-2xl">
                    Начните прямо сейчас
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/50 sm:text-base">
                    Бесплатное облачное хранилище — начните пользоваться прямо сейчас
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link
                        href={isAuthenticated ? pages.DASHBOARD.ROOT : pages.AUTH}
                        className="group primary-button px-8 py-3 text-lg"
                    >
                        <span>Начать</span>
                        <ArrowRight size={20} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
