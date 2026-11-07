"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { destinations } from "@/data/destinations";

export interface BookingModalPrefill {
    destination?: string;
    topic?: string;
    educationLevel?: string;
}

interface BookingModalContextValue {
    isOpen: boolean;
    prefill: BookingModalPrefill | null;
    openModal: (prefillOrEvent?: BookingModalPrefill | unknown) => void;
    closeModal: () => void;
}

const KNOWN_DESTINATIONS = Object.values(destinations);

export function resolveDestinationName(input?: string): string | undefined {
    if (!input || typeof input !== "string") return undefined;
    const trimmed = input.trim();
    if (!trimmed) return undefined;

    const lower = trimmed.toLowerCase();
    const matched = KNOWN_DESTINATIONS.find(
        (d) => d.slug.toLowerCase() === lower || d.name.toLowerCase() === lower
    );
    return matched ? matched.name : trimmed.slice(0, 80);
}

export function inferDestinationFromText(text?: string): string | undefined {
    if (!text || typeof text !== "string") return undefined;
    const normalized = text.replace(/_/g, " ").toLowerCase();
    for (const dest of KNOWN_DESTINATIONS) {
        if (
            normalized.includes(dest.name.toLowerCase()) ||
            (dest.slug === "uk" && /\buk\b/.test(normalized)) ||
            (dest.slug === "usa" && /\busa\b/.test(normalized))
        ) {
            return dest.name;
        }
    }
    return undefined;
}

export function sanitizeBookingPrefill(input?: unknown): BookingModalPrefill | null {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        return null;
    }

    // Guard against DOM Event or React SyntheticEvent when passed directly as onClick={openModal}
    if (
        "nativeEvent" in input ||
        "preventDefault" in input ||
        "stopPropagation" in input ||
        ("target" in input && "currentTarget" in input) ||
        (typeof Event !== "undefined" && input instanceof Event)
    ) {
        return null;
    }

    const candidate = input as Record<string, unknown>;
    const rawDestination =
        typeof candidate.destination === "string" && candidate.destination.trim()
            ? resolveDestinationName(candidate.destination)
            : undefined;
    const topic =
        typeof candidate.topic === "string" && candidate.topic.trim()
            ? candidate.topic.trim().slice(0, 120)
            : undefined;
    const educationLevel =
        typeof candidate.educationLevel === "string" && candidate.educationLevel.trim()
            ? candidate.educationLevel.trim().slice(0, 60)
            : undefined;

    const destination = rawDestination || inferDestinationFromText(topic);

    if (!destination && !topic && !educationLevel) {
        return null;
    }

    return {
        ...(destination ? { destination } : {}),
        ...(topic ? { topic } : {}),
        ...(educationLevel ? { educationLevel } : {}),
    };
}

export function openBookingModal(prefill?: BookingModalPrefill | unknown) {
    if (typeof window === "undefined") return;
    const sanitized = sanitizeBookingPrefill(prefill);
    window.dispatchEvent(
        new CustomEvent("open-booking-modal", {
            detail: sanitized,
        })
    );
}

const fallbackContextValue: BookingModalContextValue = {
    isOpen: false,
    prefill: null,
    openModal: (prefillOrEvent?: BookingModalPrefill | unknown) => {
        openBookingModal(prefillOrEvent);
    },
    closeModal: () => {
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("close-booking-modal"));
        }
    },
};

const BookingModalContext = createContext<BookingModalContextValue>(fallbackContextValue);

export function BookingModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [prefill, setPrefill] = useState<BookingModalPrefill | null>(null);
    const pathname = usePathname();

    const getRouteDestination = useCallback((): string | undefined => {
        if (!pathname) return undefined;
        const match = pathname.match(/^\/destinations\/([^/?#]+)/);
        if (!match?.[1]) return undefined;
        const slug = decodeURIComponent(match[1]).toLowerCase();
        return destinations[slug]?.name;
    }, [pathname]);

    const openModal = useCallback(
        (prefillOrEvent?: BookingModalPrefill | unknown) => {
            const explicitPrefill = sanitizeBookingPrefill(prefillOrEvent);
            const routeDestination = getRouteDestination();

            const mergedPrefill: BookingModalPrefill | null =
                explicitPrefill || routeDestination
                    ? {
                          ...(routeDestination ? { destination: routeDestination } : {}),
                          ...(explicitPrefill || {}),
                      }
                    : null;

            setPrefill(mergedPrefill);
            setIsOpen(true);
        },
        [getRouteDestination]
    );

    const closeModal = useCallback(() => {
        setIsOpen(false);
    }, []);

    useEffect(() => {
        const handleOpenEvent = (event: Event) => {
            const customEvent = event as CustomEvent<unknown>;
            openModal(customEvent.detail);
        };
        const handleCloseEvent = () => {
            closeModal();
        };

        window.addEventListener("open-booking-modal", handleOpenEvent);
        window.addEventListener("close-booking-modal", handleCloseEvent);
        window.__openBookingModal = openModal;

        return () => {
            window.removeEventListener("open-booking-modal", handleOpenEvent);
            window.removeEventListener("close-booking-modal", handleCloseEvent);
            delete window.__openBookingModal;
        };
    }, [openModal, closeModal]);

    return (
        <BookingModalContext.Provider value={{ isOpen, prefill, openModal, closeModal }}>
            {children}
        </BookingModalContext.Provider>
    );
}

export function useBookingModal() {
    return useContext(BookingModalContext);
}

declare global {
    interface Window {
        __openBookingModal?: (prefill?: BookingModalPrefill | unknown) => void;
    }
}
