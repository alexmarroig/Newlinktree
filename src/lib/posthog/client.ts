"use client";

import posthog from "posthog-js";

let isInitialized = false;

/**
 * Inicializa o PostHog no cliente.
 * Deve ser chamado uma única vez no layout raiz.
 */
export function initPostHog() {
  if (
    isInitialized ||
    typeof window === "undefined" ||
    !process.env.NEXT_PUBLIC_POSTHOG_KEY
  )
    return;

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: "/api/ingest", // proxy para evitar bloqueio por ad blockers
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    capture_pageview: false, // Controlamos manualmente
    capture_pageleave: true,
    autocapture: false, // Controlamos todos os eventos manualmente
    persistence: "localStorage+cookie",
    bootstrap: {
      distinctID: undefined, // Usuário anônimo
    },
    loaded: (ph) => {
      if (process.env.NODE_ENV === "development") {
        ph.debug();
      }
    },
  });

  isInitialized = true;
}

export { posthog };
