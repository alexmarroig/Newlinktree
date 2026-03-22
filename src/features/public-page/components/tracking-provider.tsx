"use client";

import { useEffect, useRef } from "react";

import {
  trackPageView,
  trackScrollDepth,
} from "@/lib/analytics/events";

interface TrackingProviderProps {
  slug: string;
  children: React.ReactNode;
}

/**
 * Provider de tracking para a página pública.
 * Gerencia: pageview, scroll depth.
 */
export function TrackingProvider({ slug, children }: TrackingProviderProps) {
  const trackedDepths = useRef<Set<number>>(new Set());

  // Pageview
  useEffect(() => {
    trackPageView(slug);
  }, [slug]);

  // Scroll depth
  useEffect(() => {
    const thresholds = [25, 50, 75, 100] as const;

    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      for (const threshold of thresholds) {
        if (scrollPercent >= threshold && !trackedDepths.current.has(threshold)) {
          trackedDepths.current.add(threshold);
          trackScrollDepth(threshold);
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return <>{children}</>;
}
