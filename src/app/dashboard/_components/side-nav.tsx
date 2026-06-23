'use client'

import { OrganizationSwitcher } from "@clerk/nextjs"
import { useMobileNav } from "@/components/context/mobile-nav-context"
import { navItems, utilityNavItems } from "@/config/const/components.const"
import { images } from "@/config/routing/image.route"
import { Upload, X } from "lucide-react"
import { UploadDialog } from "@/components/dialog/upload-dialog"
import {
  SettingsDialog,
  SettingsDialogTrigger,
} from "@/components/dialog/settings-dialog"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { useTranslation } from "@/components/hooks/use-translation"

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
  const { t } = useTranslation()

  const ServicesLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navItems.map(({ href, image, key }) => {
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
            <span>{t(key)}</span>
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
    items: (typeof utilityNavItems)[number][]
  }) => (
    <>
      {items.map(({ id, href, icon: Icon, key }) => {
        const active = Boolean(href) && pathname === href

        return (
          <Link
            key={id}
            href={href || "#"}
            onClick={onClick}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 ${
                active
                ? "nav-link-active text-white"
                : "text-white/60 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <Icon size={18} className="shrink-0" />
            <span>{t(key)}</span>
          </Link>
        )
      })}
    </>
  )

  const cloudItems = utilityNavItems.filter(({ id }) => id !== "upload")

  const UploadNavButton = ({ onClick }: { onClick?: () => void }) => (
    <UploadDialog>
      <button
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/60 transition-all duration-200 hover:bg-white/[0.06] hover:text-white"
      >
        <Upload size={18} className="shrink-0" />
        <span>{t("nav.upload")}</span>
      </button>
    </UploadDialog>
  )

  const NavContent = ({ onClick }: { onClick?: () => void }) => (
    <div className="flex flex-col gap-1">
      <UploadNavButton onClick={onClick} />
      <SectionLabel>{t("sideNav.cloud")}</SectionLabel>
      <UtilityButtons onClick={onClick} items={cloudItems} />
      <div className="my-3 h-px bg-white/10" />
      <SectionLabel>{t("sideNav.services")}</SectionLabel>
      <ServicesLinks onClick={onClick} />
    </div>
  )

  return (
    <nav>
      <aside className="hidden w-60 shrink-0 md:fixed md:top-[7.5rem] md:left-6 lg:left-8 xl:left-10 md:flex md:flex-col md:h-[calc(100vh-7.5rem)] md:pt-1">
        <NavContent />
        <div className="mt-auto border-t border-white/10 px-2 pt-3 mb-3">
          <OrganizationSwitcher
            appearance={{
              elements: {
                rootBox: "w-full",
                organizationSwitcherTrigger:
                  "w-full justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white/80 hover:bg-white/[0.08] hover:text-white",
              },
            }}
          />
          <SettingsDialog>
            <SettingsDialogTrigger />
          </SettingsDialog>
        </div>
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
                  {t("sideNav.navigation")}
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

            <div className="mt-auto mb-3 border-t border-white/10 px-2 pt-3">
              <OrganizationSwitcher
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    organizationSwitcherTrigger:
                      "w-full justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white/80 hover:bg-white/[0.08] hover:text-white",
                  },
                }}
              />
              <SettingsDialog>
                <SettingsDialogTrigger onClick={close} />
              </SettingsDialog>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
