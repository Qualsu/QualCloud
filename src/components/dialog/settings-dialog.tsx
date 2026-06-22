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
import { LogOut, Settings, Settings2 } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useState, type ReactNode } from "react";
import { useTranslation } from "@/components/hooks/use-translation";
import { LANGUAGES, type Language } from "@/config/i18n";
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
  } = useSettings();
  const { t } = useTranslation();
  const { openUserProfile, signOut } = useClerk();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

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
