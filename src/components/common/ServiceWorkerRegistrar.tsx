"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistrar() {
    useEffect(() => {
        if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
            return;
        }
        if (process.env.NODE_ENV !== "production") {
            return;
        }

        const register = () => {
            navigator.serviceWorker
                .register("/sw.js", { scope: "/" })
                .catch(() => {
                    // Fail silently in private windows or restricted WebViews
                });
        };

        if (document.readyState === "complete") {
            register();
        } else {
            window.addEventListener("load", register, { once: true });
            return () => window.removeEventListener("load", register);
        }
    }, []);

    return null;
}
