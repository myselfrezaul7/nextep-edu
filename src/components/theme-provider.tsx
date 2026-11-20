"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

function ThemeColorMetaSync() {
    const { resolvedTheme } = useTheme();

    React.useEffect(() => {
        if (!resolvedTheme) return;
        const color = resolvedTheme === "dark" ? "#0B1120" : "#F8F9FA";
        // Update all existing theme-color meta tags (including Next.js media-scoped tags)
        // because browsers honor the first matching meta[name="theme-color"] in document order.
        const existingMetas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
        if (existingMetas.length > 0) {
            existingMetas.forEach((meta) => {
                meta.content = color;
            });
            return;
        }
        const meta = document.createElement("meta");
        meta.name = "theme-color";
        meta.content = color;
        document.head.appendChild(meta);
    }, [resolvedTheme]);

    return null;
}

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return (
        <NextThemesProvider {...props}>
            <ThemeColorMetaSync />
            {children}
        </NextThemesProvider>
    );
}
