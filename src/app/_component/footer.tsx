import Image from "next/image";
import Link from "next/link";

import { images } from "@/config/routing/image.route";
import { links } from "@/config/routing/links.route";
import { pages } from "@/config/routing/pages.route";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="section-shell mt-8 rounded-[1.75rem] py-6 sm:py-8">
            <div className="mx-auto w-full max-w-7xl">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <Link href={pages.ROOT} className="flex items-center">
                        <Image src={images.LOGO} width={160} height={40} alt="QualCloud Logo" className="w-36 sm:w-44" />
                    </Link>
                    <ul className="flex flex-wrap items-center gap-y-3 text-sm font-medium text-white/60">
                        <li>
                            <Link href={links.FEEDBACK} target="_blank" className="me-4 transition-colors hover:text-white md:me-6">Feedback</Link>
                        </li>
                        <li>
                            <Link href={links.QUAL_ID} target="_blank" className="me-4 transition-colors hover:text-white md:me-6">Qual ID</Link>
                        </li>
                        <li>
                            <Link href={links.TELEGRAM} target="_blank" className="me-4 transition-colors hover:text-white md:me-6">Telegram</Link>
                        </li>
                    </ul>
                </div>
                <hr className="my-6 border-white/30 lg:my-8" />
                <span className="block text-sm text-white/50 sm:text-center">
                    © 2021–{currentYear}{" "}
                    <Link href={links.QUALSU} className="transition-colors hover:text-white">Qualsu</Link>
                </span>
            </div>
        </footer>
    );
}