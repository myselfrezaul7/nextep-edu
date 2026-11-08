"use client";

import { useSyncExternalStore } from "react";

/**
 * Single, rAF-batched scroll engine for the whole app.
 *
 * - Exactly one passive scroll listener, regardless of how many components use it.
 * - Per-frame consumers (progress bars, rings) write to the DOM directly via
 *   subscribeScrollFrame, so scrolling never triggers React renders.
 * - React consumers (useNavVisible, usePastFold) only re-render when a derived
 *   boolean actually flips, which keeps scrolling smooth on 120Hz+ displays.
 */

type ScrollState = {
    navVisible: boolean;
    pastFold: boolean;
};

type FrameSubscriber = (y: number, progress: number) => void;

let state: ScrollState = { navVisible: true, pastFold: false };
const listeners = new Set<() => void>();
const frameSubscribers = new Set<FrameSubscriber>();

let lastY = 0;
let ticking = false;
let started = false;

const TOP_THRESHOLD = 24;
const HIDE_AFTER = 80;
const DIRECTION_HYSTERESIS = 6;
const FOLD_THRESHOLD = 400;

function update() {
    ticking = false;
    const y = Math.max(0, window.scrollY);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, y / max) : 0;

    frameSubscribers.forEach((fn) => fn(y, progress));

    const delta = y - lastY;
    let navVisible = state.navVisible;
    if (y <= TOP_THRESHOLD) {
        navVisible = true;
        lastY = y;
    } else if (delta > DIRECTION_HYSTERESIS && y > HIDE_AFTER) {
        navVisible = false;
        lastY = y;
    } else if (delta < -DIRECTION_HYSTERESIS) {
        navVisible = true;
        lastY = y;
    }

    const pastFold = y > FOLD_THRESHOLD;

    if (navVisible !== state.navVisible || pastFold !== state.pastFold) {
        state = { navVisible, pastFold };
        listeners.forEach((listener) => listener());
    }
}

function onScroll() {
    if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
    }
}

function ensureStarted() {
    if (started || typeof window === "undefined") return;
    started = true;
    lastY = window.scrollY;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    requestAnimationFrame(update);
}

function subscribe(listener: () => void) {
    ensureStarted();
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/** Per-frame scroll callback for direct DOM writes (no React renders). */
export function subscribeScrollFrame(fn: FrameSubscriber) {
    ensureStarted();
    frameSubscribers.add(fn);
    if (typeof window !== "undefined") {
        requestAnimationFrame(update);
    }
    return () => {
        frameSubscribers.delete(fn);
    };
}

/** True while header / bottom nav should be shown (hidden while scrolling down). */
export function useNavVisible() {
    return useSyncExternalStore(
        subscribe,
        () => state.navVisible,
        () => true
    );
}

/** True once the user has scrolled past the first fold (~400px). */
export function usePastFold() {
    return useSyncExternalStore(
        subscribe,
        () => state.pastFold,
        () => false
    );
}
