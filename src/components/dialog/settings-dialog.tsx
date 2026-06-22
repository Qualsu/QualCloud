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

interface SettingsDialogProps {
  children?: ReactNode;
}

export function SettingsDialog({ children }: SettingsDialogProps) {
  const { redirectHomeToDashboard, setRedirectHomeToDashboard } = useSettings();
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
            Настройки
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">Редирект</h3>
              <p className="text-xs leading-relaxed text-white/50">
                При переходе на главную страницу &apos;/&apos; перенаправлять на дашборд
              </p>
            </div>
            <Switch
              checked={redirectHomeToDashboard}
              onCheckedChange={setRedirectHomeToDashboard}
              aria-label="Перенаправлять на дашборд с главной страницы"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-white/10 px-6 py-4">
          <button
            onClick={() => openUserProfile()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-transparent px-4 h-10 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <Settings size={16} />
            Настройки аккаунта
          </button>
          <button
            onClick={() => setIsLogoutDialogOpen(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600/90 px-4 h-10 text-sm font-medium text-white transition-colors hover:bg-red-600"
          >
            <LogOut size={16} />
            Выйти из аккаунта
          </button>
        </div>
      </DialogContent>

      <ConfirmDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        title="Выйти из аккаунта"
        description="Вы уверены, что хотите выйти из аккаунта?"
        confirmLabel="Выйти"
        cancelLabel="Отмена"
        onConfirm={handleSignOut}
        isLoading={isSigningOut}
        destructive={false}
      />
    </Dialog>
  );
}

export function SettingsDialogTrigger({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mt-2 flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white/80 transition-all hover:bg-white/[0.08] hover:text-white"
    >
      <Settings2 size={18} className="shrink-0" />
      <span>Настройки</span>
    </button>
  );
}
