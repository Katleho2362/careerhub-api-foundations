"use client";

import { useState } from "react";

export type ViewFilter = "all" | "open" | "closed";

interface SidebarProps {
  view: ViewFilter;
  onViewChange: (view: ViewFilter) => void;
  openCount: number;
  closedCount: number;
}

const navItems: { key: ViewFilter; label: string }[] = [
  { key: "all", label: "Home" },
  { key: "open", label: "Open jobs" },
  { key: "closed", label: "Closed jobs" },
];

export function Sidebar({ view, onViewChange, openCount, closedCount }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const counts: Record<ViewFilter, number | null> = {
    all: null,
    open: openCount,
    closed: closedCount,
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-30 rounded-lg bg-[var(--rail-bg)] p-2 text-[var(--canvas)] shadow-md md:hidden"
        aria-label="Open menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
      </button>

      {isOpen && (
        <div onClick={() => setIsOpen(false)} className="fixed inset-0 z-20 bg-black/40 md:hidden" />
      )}

      <aside
        className={`fixed z-20 h-full w-64 -translate-x-full bg-[var(--rail-bg)] p-6 transition-transform md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : ""
        }`}
      >
        <p className="font-display mb-10 text-xl font-bold tracking-tight text-[var(--canvas)]">
          CareerHub
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = view === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onViewChange(item.key);
                  setIsOpen(false);
                }}
                className={`relative flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-white/10 text-[var(--canvas)]"
                    : "text-[var(--canvas-dim)] hover:bg-white/5 hover:text-[var(--canvas)]"
                }`}
              >
                <span className="flex items-center gap-2">
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" />}
                  {item.label}
                </span>
                {counts[item.key] !== null && (
                  <span className="font-meta text-xs text-[var(--canvas-dim)]">{counts[item.key]}</span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}