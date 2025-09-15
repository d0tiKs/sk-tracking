function isIOS() {
  return (
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream
  );
}

/**
 * Global haptics toggle.
 * Set to false to completely disable vibration in the app (for PWA/iOS issues).
 */
const ENABLE_HAPTICS = false;

export function useHaptics() {
  const supported =
    ENABLE_HAPTICS &&
    typeof navigator !== "undefined" &&
    typeof (navigator as any).vibrate === "function" &&
    !isIOS();

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const isVisible = () =>
    typeof document === "undefined" || document.visibilityState === "visible";

  const vibrate = (pattern: number | number[]) => {
    if (!supported || reduced || !isVisible()) return false;
    // @ts-ignore
    return navigator.vibrate(pattern);
  };

  return {
    supported,
    tick: () => false,
    strong: () => false,
  };
}