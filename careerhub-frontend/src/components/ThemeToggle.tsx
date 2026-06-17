"use client";

// "use client" is required — this component uses useState, useEffect, and
// document, all of which are browser-only APIs. Without it, Next.js would
// attempt to render this on the server where none of these exist.
import { useEffect, useState } from "react";

export function ThemeToggle() {
  // isDark drives the button label and aria-label only.
  // It is NOT the source of truth for dark mode — the .dark class on
  // <html> is. CSS responds directly to that class via the
  // @custom-variant dark directive in globals.css. React has nothing to
  // do with the actual colour switching.
  const [isDark, setIsDark] = useState(false);

  // On mount: read the stored preference and fall back to the OS preference.
  // Empty dependency array — runs once after the first render.
  // Re-syncs isDark from the DOM class so that if ThemeToggle were ever
  // unmounted and remounted, the label would still match the actual mode
  // (the <html> class persists on the DOM even when the component unmounts,
  // so without this re-sync isDark would reset to false while dark mode
  // stayed on — causing a label mismatch).
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    // Fallback order:
    // 1. Stored user preference ("dark" or "light")
    // 2. OS preference if nothing is stored
    const shouldBeDark = stored === "dark" || (!stored && prefersDark);

    setIsDark(shouldBeDark);
    // The second argument forces the class on/off rather than toggling based
    // on current presence — safer than .toggle("dark") alone because it
    // avoids sync issues between React state and the DOM.
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);

    // Update the real source of truth — the DOM class.
    document.documentElement.classList.toggle("dark", next);

    // localStorage (not sessionStorage) — a colour scheme preference is a
    // personal setting that should persist indefinitely across sessions.
    // sessionStorage clears when the tab closes, which is wrong for this use case.
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      // aria-label describes the ACTION the button will perform (what will
      // happen when clicked), not the current state — follows WCAG guidance.
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm
                 text-[var(--muted-text)] transition-colors
                 hover:border-[var(--teal)] hover:text-[var(--ink)]
                 dark:border-[var(--line)] dark:hover:border-[var(--canvas-dim)]
                 dark:hover:text-[var(--ink)]"
    >
      {/* Label reflects the current mode, not the action —
          shows what mode you ARE IN so the button feels like a status indicator.
          The aria-label above separately communicates what clicking will DO. */}
      {isDark ? "Light mode" : "Dark mode"}
    </button>
  );
}