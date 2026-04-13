'use client'

import { useMobileNav } from "@/components/mobile-nav-context"
import { X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image";
import { images } from "@/config/routing/image.route"
import { navItems } from "@/config/const/components.const"

export function SideNav() {
  const pathname = usePathname()
  const { isOpen, close } = useMobileNav()

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navItems.map(({ href, image, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            onClick={onClick}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 ${
              active
                ? "nav-link-active text-white"
                : "opacity-60 hover:bg-white/[0.06] hover:opacity-100"
            }`}
          >
            <Image src={image} alt="nav icon" width={16} height={16} className="w-5 h-5"/>
            <span>{label}</span>
          </Link>
        )
      })}
    </>
  )

  return (
    <nav>
      <aside className="hidden md:flex w-52 shrink-0 flex-col gap-1 pt-1">
        <NavLinks />
      </aside>

      <div className="md:hidden">
        <div
          className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={close}
        />

        <div
          className={`fixed left-0 top-0 bottom-0 z-50 w-64 transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="surface-panel h-full rounded-r-2xl px-3 py-5 flex flex-col">
            <div className="mb-4 flex items-center justify-between px-2">
              <div>
                <Image
                  src={images.LOGO}
                  width={140}
                  height={36}
                  alt="QualCloud Logo"
                  className="h-8 w-auto opacity-95 transition-opacity duration-200 hover:opacity-100 block md:hidden"
                />
                <span className="flex flrx-row justify-between items-center mt-3">
                  <span className="text-sm font-medium text-white/50 uppercase tracking-wider">Навигация</span>
                  <button
                    onClick={close}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <NavLinks onClick={close} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}