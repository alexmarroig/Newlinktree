"use client";

import Image from "next/image";
import {
  ClipboardList,
  Download,
  FileText,
  Globe,
  Instagram,
  MessageCircle,
} from "lucide-react";

import { buildWhatsAppUrl } from "@/lib/helpers";
import {
  trackExternalLink,
  trackFileDownload,
  trackFormOpen,
  trackInstagramClick,
  trackWhatsAppClick,
} from "@/lib/analytics/events";
import type { Link } from "@/types/database";

import { useFormModal } from "../hooks/use-form-modal";

interface LinktreeLinkCardProps {
  link: Link;
  whatsappNumber: string;
  defaultWhatsappMessage: string;
  avatarUrl: string | null;
}

const ICON_CONFIG: Record<
  string,
  { Icon: React.ElementType; bg: string; color: string }
> = {
  whatsapp: { Icon: MessageCircle, bg: "bg-green-100", color: "text-green-600" },
  form: { Icon: ClipboardList, bg: "bg-violet-100", color: "text-violet-600" },
  url: { Icon: Globe, bg: "bg-sky-100", color: "text-sky-600" },
  instagram: { Icon: Instagram, bg: "bg-pink-100", color: "text-pink-600" },
  download: { Icon: FileText, bg: "bg-amber-100", color: "text-amber-600" },
  default: { Icon: Download, bg: "bg-stone-100", color: "text-stone-600" },
};

type CardStyles = {
  card: string;
  text: string;
  subtext: string;
  iconBg: string;
  iconColor: string;
};

function getCardStyles(
  variant: string,
  isWhatsApp: boolean,
  iconConfig: { bg: string; color: string },
): CardStyles {
  if (isWhatsApp) {
    return {
      card: "bg-[#25D366] shadow-sm",
      text: "text-white",
      subtext: "text-white/70",
      iconBg: "bg-white/20",
      iconColor: "text-white",
    };
  }
  switch (variant) {
    case "primary":
      return {
        card: "bg-stone-800 shadow-md",
        text: "text-white",
        subtext: "text-white/70",
        iconBg: "bg-white/20",
        iconColor: "text-white",
      };
    case "soft":
      return {
        card: "bg-stone-50 shadow-sm border border-stone-200",
        text: "text-gray-800",
        subtext: "text-gray-500",
        iconBg: iconConfig.bg,
        iconColor: iconConfig.color,
      };
    case "ghost":
      return {
        card: "bg-transparent border border-stone-200",
        text: "text-gray-800",
        subtext: "text-gray-500",
        iconBg: iconConfig.bg,
        iconColor: iconConfig.color,
      };
    case "outline":
      return {
        card: "bg-white border-2 border-stone-800",
        text: "text-gray-900",
        subtext: "text-gray-600",
        iconBg: iconConfig.bg,
        iconColor: iconConfig.color,
      };
    default: // "secondary" and any unknown future values
      return {
        card: "bg-white shadow-sm",
        text: "text-gray-900",
        subtext: "text-gray-500",
        iconBg: iconConfig.bg,
        iconColor: iconConfig.color,
      };
  }
}

export function LinktreeLinkCard({
  link,
  whatsappNumber,
  defaultWhatsappMessage,
  avatarUrl,
}: LinktreeLinkCardProps) {
  const { openModal } = useFormModal();

  // ── Divider / section label ─────────────────────────────────────────────────
  if (link.type === "divider") {
    return (
      <div className="flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-black/10" />
        {link.label && (
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            {link.label}
          </span>
        )}
        <div className="h-px flex-1 bg-black/10" />
      </div>
    );
  }

  const isWhatsApp = link.type === "whatsapp";
  const iconConfig = ICON_CONFIG[link.type] ?? ICON_CONFIG.default;
  const styles = getCardStyles(link.variant, isWhatsApp, iconConfig);

  function buildHref(): string {
    if (link.type === "whatsapp") {
      return buildWhatsAppUrl(
        whatsappNumber,
        link.whatsapp_message ?? defaultWhatsappMessage,
      );
    }
    return link.url ?? "#";
  }

  function track() {
    switch (link.type) {
      case "whatsapp":
        trackWhatsAppClick({
          linkId: link.id,
          messagePreview: link.whatsapp_message ?? undefined,
        });
        break;
      case "form":
        trackFormOpen("linktree_card");
        break;
      case "instagram":
        trackInstagramClick(link.id);
        break;
      case "download":
        trackFileDownload({ assetId: link.id, fileName: link.label, fileType: "pdf" });
        break;
      case "url":
        trackExternalLink({
          linkId: link.id,
          urlDomain: link.url
            ? (() => { try { return new URL(link.url).hostname; } catch { return "unknown"; } })()
            : "unknown",
        });
        break;
    }
  }

  // ── Left thumbnail ──────────────────────────────────────────────────────────
  const LeftThumb = () => {
    // Per-link custom thumbnail takes priority
    if (link.thumbnail_url) {
      return (
        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl">
          <Image
            src={link.thumbnail_url}
            alt=""
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
        </div>
      );
    }
    if (isWhatsApp && avatarUrl) {
      return (
        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl">
          <Image
            src={avatarUrl}
            alt=""
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
        </div>
      );
    }
    const { Icon } = iconConfig;
    // When using inline colors, show a semi-transparent white icon bg
    if (useInlineColor) {
      return (
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20">
          <Icon className="h-5 w-5" style={{ color: "inherit" }} />
        </div>
      );
    }
    return (
      <div
        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${styles.iconBg}`}
      >
        <Icon className={`h-5 w-5 ${styles.iconColor}`} />
      </div>
    );
  };

  // ── Per-link attention animation ─────────────────────────────────────────────
  const animClass =
    link.link_animation && link.link_animation !== "none"
      ? `link-anim-${link.link_animation}`
      : "";

  // ── Custom per-link colors override everything ───────────────────────────────
  const hasCustomColors = !isWhatsApp && (link.custom_bg_color || link.custom_text_color);

  // Use CSS variables for theming when variant is "secondary" (default white card)
  const useCssVars = !isWhatsApp && !hasCustomColors && link.variant === "secondary";

  const cardStyle: React.CSSProperties | undefined = hasCustomColors
    ? {
        backgroundColor: link.custom_bg_color ?? undefined,
        color: link.custom_text_color ?? undefined,
        borderRadius: "var(--btn-radius, 9999px)",
        boxShadow: "var(--btn-shadow, none)",
      }
    : useCssVars
      ? {
          backgroundColor: "var(--btn-bg, #1a1a1a)",
          color: "var(--btn-text, #ffffff)",
          borderRadius: "var(--btn-radius, 9999px)",
          boxShadow: "var(--btn-shadow, none)",
        }
      : undefined;

  // When inline style sets color, Tailwind text-* classes would override it — skip them
  const useInlineColor = hasCustomColors || useCssVars;

  const cardClass = [
    "link-card flex items-center min-h-[68px] py-3 w-full px-4",
    "transition-all duration-100",
    "active:scale-[0.97] active:shadow-none",
    useInlineColor ? "" : "rounded-2xl",
    useInlineColor ? "" : styles.card,
    !useInlineColor ? styles.card : "",
    animClass,
  ].join(" ").replace(/\s+/g, " ").trim();

  const label = (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <span
        className={`text-[13px] font-semibold uppercase tracking-wide ${useInlineColor ? "" : styles.text}`}
      >
        {link.label}
      </span>
      {link.sublabel && (
        <span
          className={`mt-0.5 text-[11px] font-normal ${useInlineColor ? "opacity-75" : styles.subtext}`}
        >
          {link.sublabel}
        </span>
      )}
    </div>
  );

  // Right spacer matches left thumb width so label stays centered
  const rightSpacer = <div className="h-12 w-12 flex-shrink-0" />;

  // ── Form type — button (no href) ────────────────────────────────────────────
  if (link.type === "form") {
    return (
      <button
        onClick={() => {
          track();
          openModal();
        }}
        className={cardClass}
        style={cardStyle}
      >
        <LeftThumb />
        {label}
        {rightSpacer}
      </button>
    );
  }

  // ── All other types — anchor ────────────────────────────────────────────────
  return (
    <a
      href={buildHref()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={track}
      className={cardClass}
      style={cardStyle}
    >
      <LeftThumb />
      {label}
      {rightSpacer}
    </a>
  );
}
