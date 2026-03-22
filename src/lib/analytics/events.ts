"use client";

import posthog from "posthog-js";

import { ANALYTICS_EVENTS } from "@/lib/constants";

/**
 * Captura um evento no PostHog com propriedades padronizadas.
 */
export function trackEvent(
  event: string,
  properties?: Record<string, string | number | boolean | null | undefined>,
) {
  if (typeof window === "undefined") return;

  posthog.capture(event, {
    ...properties,
    $current_url: window.location.href,
  });
}

// ---- Eventos específicos com tipos seguros ----

export function trackPageView(slug: string) {
  trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, {
    page_slug: slug,
    referrer: document.referrer || null,
    ...getUTMsFromURL(),
  });
}

export function trackCTAClick(params: {
  linkId: string;
  label: string;
  type: string;
  position?: number;
  blockId?: string;
}) {
  trackEvent(ANALYTICS_EVENTS.CTA_CLICK, {
    link_id: params.linkId,
    label: params.label,
    link_type: params.type,
    position: params.position ?? null,
    block_id: params.blockId ?? null,
  });
}

export function trackWhatsAppClick(params: {
  linkId: string;
  messagePreview?: string;
}) {
  trackEvent(ANALYTICS_EVENTS.WHATSAPP_CLICK, {
    link_id: params.linkId,
    message_preview: params.messagePreview?.slice(0, 50) ?? null,
  });
}

export function trackInstagramClick(linkId: string) {
  trackEvent(ANALYTICS_EVENTS.INSTAGRAM_CLICK, { link_id: linkId });
}

export function trackExternalLink(params: { linkId: string; urlDomain: string }) {
  trackEvent(ANALYTICS_EVENTS.EXTERNAL_LINK_CLICK, {
    link_id: params.linkId,
    url_domain: params.urlDomain,
  });
}

export function trackFormOpen(triggerSource?: string) {
  trackEvent(ANALYTICS_EVENTS.FORM_OPEN, {
    trigger_source: triggerSource ?? "unknown",
  });
}

export function trackFormStart() {
  trackEvent(ANALYTICS_EVENTS.FORM_START);
}

export function trackFormSubmit(params: {
  hasEmail: boolean;
  modality: string;
  contactPref: string;
}) {
  trackEvent(ANALYTICS_EVENTS.FORM_SUBMIT, {
    has_email: params.hasEmail,
    modality: params.modality,
    contact_pref: params.contactPref,
  });
}

export function trackFileDownload(params: {
  assetId: string;
  fileName: string;
  fileType: string;
}) {
  trackEvent(ANALYTICS_EVENTS.FILE_DOWNLOAD, {
    asset_id: params.assetId,
    file_name: params.fileName,
    file_type: params.fileType,
  });
}

export function trackFAQExpand(params: {
  faqId: string;
  questionPreview: string;
}) {
  trackEvent(ANALYTICS_EVENTS.FAQ_EXPAND, {
    faq_id: params.faqId,
    question_preview: params.questionPreview.slice(0, 60),
  });
}

export function trackScrollDepth(depth: 25 | 50 | 75 | 100) {
  const eventMap = {
    25: ANALYTICS_EVENTS.SCROLL_DEPTH_25,
    50: ANALYTICS_EVENTS.SCROLL_DEPTH_50,
    75: ANALYTICS_EVENTS.SCROLL_DEPTH_75,
    100: ANALYTICS_EVENTS.SCROLL_DEPTH_100,
  };
  trackEvent(eventMap[depth]);
}

// ---- Helpers ----

function getUTMsFromURL(): Record<string, string | null> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_term: params.get("utm_term"),
  };
}
