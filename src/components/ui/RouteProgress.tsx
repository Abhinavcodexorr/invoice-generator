"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function RouteProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timers = useRef<number[]>([]);
  const key = `${pathname}?${searchParams.toString()}`;
  const prevKey = useRef(key);
  const first = useRef(true);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const finish = () => {
    clearTimers();
    setWidth(100);
    timers.current.push(
      window.setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 280),
    );
  };

  const start = () => {
    clearTimers();
    setVisible(true);
    setWidth(18);
    timers.current.push(window.setTimeout(() => setWidth(42), 80));
    timers.current.push(window.setTimeout(() => setWidth(68), 220));
    timers.current.push(window.setTimeout(() => setWidth(82), 520));
  };

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        ) {
          return;
        }
      } catch {
        return;
      }

      start();
    };

    document.addEventListener("click", onPointerDown, true);
    return () => document.removeEventListener("click", onPointerDown, true);
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      prevKey.current = key;
      return;
    }
    if (prevKey.current === key) return;
    prevKey.current = key;
    finish();
  }, [key]);

  useEffect(() => () => clearTimers(), []);

  return (
    <div
      className={`route-progress ${visible ? "is-active" : ""}`}
      style={{ width: `${width}%` }}
      aria-hidden
    />
  );
}

export function RouteProgress() {
  return (
    <Suspense fallback={null}>
      <RouteProgressInner />
    </Suspense>
  );
}
