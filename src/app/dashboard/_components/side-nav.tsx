'use client'

import { useMobileNav } from "@/components/mobile-nav-context"
import { navItems, utilityNavItems } from "@/config/const/components.const"
import { images } from "@/config/routing/image.route"
import { X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35 first:pt-0">
      {children}
    </div>
  )
}

export function SideNav() {
  const pathname = usePathname()
  const { isOpen, close } = useMobileNav()

  const ServicesLinks = ({ onClick }: { onClick?: () => void }) => (
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
            <Image src={image} alt="nav icon" width={16} height={16} className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        )
      })}
    </>
  )

  const UtilityButtons = ({
    onClick,
    items,
  }: {
    onClick?: () => void
    items: typeof utilityNavItems
  }) => (
    <>
      {items.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          type="button"
          onClick={onClick}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-white/55 transition-all duration-200 hover:bg-white/[0.06] hover:text-white/90"
        >
          <Icon size={18} className="shrink-0" />
          <span>{label}</span>
        </button>
      ))}
    </>
  )

  const uploadItem = utilityNavItems.filter(({ id }) => id === "upload")
  const cloudItems = utilityNavItems.filter(({ id }) => id !== "upload")

  const NavContent = ({ onClick }: { onClick?: () => void }) => (
    <div className="flex flex-col gap-1">
      <UtilityButtons onClick={onClick} items={uploadItem} />
      <div className="my-3 h-px bg-white/10" />
      <SectionLabel>Облако</SectionLabel>
      <UtilityButtons onClick={onClick} items={cloudItems} />
      <div className="my-3 h-px bg-white/10" />
      <SectionLabel>Сервисы</SectionLabel>
      <ServicesLinks onClick={onClick} />
    </div>
  )

  return (
    <nav>
      <aside className="hidden w-60 shrink-0 md:flex md:flex-col md:pt-1">
        <NavContent />
      </aside>

      <div className="md:hidden">
        <div
          className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={close}
        />

        <div
          className={`fixed bottom-0 left-0 top-0 z-50 w-64 transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="surface-panel flex h-full flex-col rounded-r-2xl px-3 py-5">
            <div className="mb-4 px-2">
              <Image
                src={images.LOGO}
                width={140}
                height={36}
                alt="QualCloud Logo"
                className="block h-8 w-auto opacity-95 transition-opacity duration-200 hover:opacity-100 md:hidden"
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-medium uppercase tracking-wider text-white/50">
                  Навигация
                </span>
                <button
                  onClick={close}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <NavContent onClick={close} />
          </div>
        </div>
      </div>
    </nav>
  )
}
