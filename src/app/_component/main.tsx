"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Boxes } from "lucide-react";

import { images } from "@/config/routing/image.route";
import { pages } from "@/config/routing/pages.route";

export default function Main() {
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
                    <Link href={pages.DASHBOARD.NOTTER} className="primary-button px-8 py-3 text-lg">
                        Перейти
                    </Link>
                </div>
            </section>

            <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-10">
                <hr className="border-white/10 rounded-2xl" />
            </div>

            <section className="section-shell py-16">
                <div className="grid gap-8 grid-cols-1">
                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-900/20 p-8 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
                        <div className="flex items-start gap-6">
                            <div className="flex-shrink-0">
                                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700">
                                    <Boxes className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white uppercase tracking-wide">Единый доступ</h3>
                                <p className="mt-2 text-sm text-gray-300">Файлы всех приложений Qualsu в одном месте</p>
                            </div>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-900/20 p-8 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
                        <div className="flex items-start gap-6">
                            <div className="flex-shrink-0">
                                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700">
                                    <Image src={images.ICONS.KENYCLOUD} width={100} height={100} alt="KenyCloud icon" className="w-8 h-8"/>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white uppercase tracking-wide">Архив KenyCloud</h3>
                                <p className="mt-2 text-sm text-gray-300">Если вы пользовались KenyCloud, все ваши файлы сохранены и доступы в QualCloud</p>
                            </div>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-900/20 p-8 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
                        <div className="flex items-start gap-6">
                            <div className="flex-shrink-0">
                                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700">
                                    <ShieldCheck className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white uppercase tracking-wide">Безопансность</h3>
                                <p className="mt-2 text-sm text-gray-300">Файлы защищены и не передаются 3-им лицам</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
        </>
    );
}