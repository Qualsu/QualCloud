"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/components/context/settings-context";
import { ConfirmDialog } from "@/components/dialog/confirm-dialog";
import { LogOut, Settings, Settings2, Check, ChevronDown, Search } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useState, useMemo, useEffect, useRef, type ReactNode } from "react";
import { useTranslation } from "@/components/hooks/use-translation";
import { useIsPwa } from "@/components/hooks/use-is-pwa";
import { LANGUAGES, type Language } from "@/config/i18n";
import { cn } from "@/lib/utils";
import { getTimeZones } from "@/lib/timezones";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SettingsDialogProps {
  children?: ReactNode;
}

export function SettingsDialog({ children }: SettingsDialogProps) {
  const {
    redirectHomeToDashboard,
    setRedirectHomeToDashboard,
    language,
    setLanguage,
    timezone,
    setTimezone,
    timeFormat,
    setTimeFormat,
  } = useSettings();
  const { t } = useTranslation();
  const isPwa = useIsPwa();
  const { openUserProfile, signOut } = useClerk();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const timeZones = useMemo(() => getTimeZones(), []);

  const [isTzOpen, setIsTzOpen] = useState(false);
  const [tzSearch, setTzSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTzOpen(false);
      }
    }
    if (isTzOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTzOpen]);

  const selectedTz = useMemo(() => {
    return timeZones.find((t) => t.value === timezone);
  }, [timeZones, timezone]);

  const filteredTimeZones = useMemo(() => {
    if (!tzSearch.trim()) return timeZones;
    const query = tzSearch.toLowerCase();
    return timeZones.filter(
      (tz) =>
        tz.label.toLowerCase().includes(query) ||
        tz.value.toLowerCase().includes(query) ||
        tz.offset.toLowerCase().includes(query)
    );
  }, [timeZones, tzSearch]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg gap-0 rounded-2xl border-white/10 bg-[#121212] p-0 shadow-2xl">
        <DialogHeader className="px-6 pb-4 pt-5">
          <DialogTitle className="text-left text-xl font-semibold text-white">
            {t("settings.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 px-6 pb-6">
          <div className="grid gap-2">
            <Label htmlFor="language-select" className="text-sm font-semibold text-white">
              {t("settings.language")}
            </Label>
            <Select
              value={language}
              onValueChange={(value) => setLanguage(value as Language)}
            >
              <SelectTrigger
                id="language-select"
                className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#211428] text-white">
                {Object.values(LANGUAGES).map((lang) => (
                  <SelectItem
                    key={lang.code}
                    value={lang.code}
                    className="focus:bg-white/10"
                  >
                    {lang.flag} {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2 relative" ref={dropdownRef}>
            <Label htmlFor="timezone-select" className="text-sm font-semibold text-white">
              {t("settings.timezone")}
            </Label>
            <button
              id="timezone-select"
              type="button"
              onClick={() => setIsTzOpen(!isTzOpen)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-ring text-left"
            >
              <span className="truncate">
                {selectedTz ? (
                  <>
                    {selectedTz.label} {selectedTz.offset && <span className="opacity-60 text-xs ml-1">({selectedTz.offset})</span>}
                  </>
                ) : (
                  timezone
                )}
              </span>
              <ChevronDown className="h-4 w-4 text-white/50 shrink-0" />
            </button>

            {isTzOpen && (
              <div className="absolute top-[calc(100%+4px)] left-0 z-50 w-full rounded-md border border-white/10 bg-[#211428] text-white shadow-md p-1 animate-in fade-in-0 zoom-in-95 duration-100">
                <div className="p-1 border-b border-white/10 mb-1 flex items-center gap-2">
                  <Search size={14} className="text-white/40 shrink-0 ml-1" />
                  <input
                    type="text"
                    value={tzSearch}
                    onChange={(e) => setTzSearch(e.target.value)}
                    placeholder={language === "ru" ? "Поиск часового пояса..." : "Search time zone..."}
                    className="w-full bg-transparent border-0 outline-none text-sm text-white placeholder:text-white/30 h-8"
                    autoFocus
                  />
                </div>
                <div className="max-h-[200px] overflow-y-auto pr-1">
                  {filteredTimeZones.length === 0 ? (
                    <div className="py-4 text-center text-xs text-white/40">
                      {language === "ru" ? "Ничего не найдено" : "No results found"}
                    </div>
                  ) : (
                    filteredTimeZones.map((tz) => {
                      const isSelected = tz.value === timezone;
                      return (
                        <button
                          key={tz.value}
                          type="button"
                          onClick={() => {
                            setTimezone(tz.value);
                            setIsTzOpen(false);
                            setTzSearch("");
                          }}
                          className={cn(
                            "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none text-left transition-colors hover:bg-white/10",
                            isSelected && "bg-white/10 font-medium"
                          )}
                        >
                          <span className="flex-1 truncate">
                            {tz.label} {tz.offset && <span className="opacity-60 text-xs ml-1">({tz.offset})</span>}
                          </span>
                          {isSelected && <Check className="h-4 w-4 shrink-0 text-white ml-2" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="time-format-select" className="text-sm font-semibold text-white">
              {t("settings.timeFormat")}
            </Label>
            <Select
              value={timeFormat}
              onValueChange={(value) => setTimeFormat(value as "12h" | "24h")}
            >
              <SelectTrigger
                id="time-format-select"
                className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#211428] text-white">
                <SelectItem value="12h" className="focus:bg-white/10">
                  {t("settings.timeFormat12")}
                </SelectItem>
                <SelectItem value="24h" className="focus:bg-white/10">
                  {t("settings.timeFormat24")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isPwa && (
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">{t("settings.redirect")}</h3>
                <p className="text-xs leading-relaxed text-white/50">
                  {t("settings.redirectDescription")}
                </p>
              </div>
              <Switch
                checked={redirectHomeToDashboard}
                onCheckedChange={setRedirectHomeToDashboard}
                aria-label={t("settings.redirectAria")}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-white/10 px-6 py-4">
          <button
            onClick={() => openUserProfile()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-transparent px-4 h-10 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <Settings size={16} />
            {t("settings.accountSettings")}
          </button>
          <button
            onClick={() => setIsLogoutDialogOpen(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600/90 px-4 h-10 text-sm font-medium text-white transition-colors hover:bg-red-600"
          >
            <LogOut size={16} />
            {t("settings.signOut")}
          </button>
        </div>
      </DialogContent>

      <ConfirmDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        title={t("settings.signOutConfirm")}
        description={t("settings.signOutDescription")}
        confirmLabel={t("settings.confirm")}
        cancelLabel={t("settings.cancel")}
        onConfirm={handleSignOut}
        isLoading={isSigningOut}
        destructive={false}
      />
    </Dialog>
  );
}

export function SettingsDialogTrigger({ onClick }: { onClick?: () => void }) {
  const { t } = useTranslation();

  return (
    <button
      onClick={onClick}
      className="mt-2 flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white/80 transition-all hover:bg-white/[0.08] hover:text-white"
    >
      <Settings2 size={18} className="shrink-0" />
      <span>{t("settings.title")}</span>
    </button>
  );
}
