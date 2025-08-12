function isIOS() {
  return (
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream
  );
}

export function useHaptics() {
  const supported =
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
    tick: () => vibrate(15),
    strong: () => vibrate([20, 40, 20]),
  };
}