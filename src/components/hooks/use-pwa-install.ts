"use client";

import { useCallback, useEffect, useState } from "react";

import { toast } from "@/lib/toast";
import { useTranslation } from "@/components/hooks/use-translation";

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
    prompt(): Promise<void>;
}

let serviceWorkerRegistration: Promise<ServiceWorkerRegistration | undefined> | null = null;

async function registerServiceWorker() {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
        return undefined;
    }

    if (!serviceWorkerRegistration) {
        serviceWorkerRegistration = navigator.serviceWorker
            .register("/sw.js")
            .catch(() => undefined);
    }

    return serviceWorkerRegistration;
}

export function usePwaInstall() {
    const { t } = useTranslation();
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        registerServiceWorker();

        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            setDeferredPrompt(event as BeforeInstallPromptEvent);
        };

        const handleAppInstalled = () => {
            setDeferredPrompt(null);
            setIsInstalled(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);

        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsInstalled(true);
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    const install = useCallback(async () => {
        if (isInstalled || !deferredPrompt) {
            return;
        }

        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            toast.success(t("landing.featureCards.pwaInstallStarted"));
        }

        setDeferredPrompt(null);
    }, [deferredPrompt, isInstalled, t]);

    return { install, isAvailable: !!deferredPrompt, isInstalled };
}
