"use client";

import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ClipboardList,
  Download,
  ExternalLink,
  Globe,
  Heart,
  HelpCircle,
  Instagram,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import {
  trackCTAClick,
  trackExternalLink,
  trackFileDownload,
  trackFormOpen,
  trackInstagramClick,
  trackWhatsAppClick,
} from "@/lib/analytics/events";
import { cn } from "@/lib/helpers";
import { buildWhatsAppUrl, extractDomain } from "@/lib/helpers";

import { useFormModal } from "../hooks/use-form-modal";

const ICON_MAP: Record<string, React.ElementType> = {
  MessageCircle,
  ClipboardList,
  Globe,
  Instagram,
  Download,
  HelpCircle,
  BookOpen,
  Heart,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ArrowRight,
};

type CTAVariant = "primary" | "secondary" | "ghost" | "outline" | "soft";

interface CTAButtonProps {
  linkId?: string;
  label: string;
  sublabel?: string;
  type: string;
  variant?: CTAVariant;
  icon?: string;
  url?: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
  openInNewTab?: boolean;
  trackingEnabled?: boolean;
  trackingEvent?: string;
  animationDelay?: number;
  className?: string;
}

const VARIANT_STYLES: Record<CTAVariant, string> = {
  primary: "cta-button-primary",
  secondary: "cta-button-secondary",
  ghost: "cta-button-ghost",
  outline: "cta-button-secondary",
  soft: "cta-button-soft",
};

export function CTAButton({
  linkId,
  label,
  sublabel,
  type,
  variant = "primary",
  icon,
  url,
  whatsappNumber,
  whatsappMessage,
  openInNewTab = true,
  trackingEnabled = true,
  trackingEvent,
  animationDelay = 0,
  className,
}: CTAButtonProps) {
  const { openModal } = useFormModal();

  const Icon = icon ? (ICON_MAP[icon] ?? ArrowRight) : getDefaultIcon(type);
  const variantStyle = VARIANT_STYLES[variant] ?? VARIANT_STYLES.ghost;

  function handleClick() {
    if (!trackingEnabled || !linkId) return;

    // Track específico por tipo
    switch (type) {
      case "whatsapp":
        trackWhatsAppClick({
          linkId,
          messagePreview: whatsappMessage,
        });
        break;
      case "instagram":
        trackInstagramClick(linkId);
        break;
      case "download":
        trackFileDownload({
          assetId: linkId,
          fileName: label,
          fileType: "pdf",
        });
        break;
      case "form":
        trackFormOpen(trackingEvent ?? "cta_click");
        break;
      case "url":
        trackExternalLink({
          linkId,
          urlDomain: url ? extractDomain(url) : "unknown",
        });
        break;
      default:
        trackCTAClick({
          linkId,
          label,
          type,
        });
    }
  }

  function handleScrollToTarget() {
    if (!url) return;

    const normalizedHash = url.startsWith("#")
      ? url
      : url.includes("#")
        ? `#${url.split("#")[1]}`
        : `#${url}`;

    const hashId = normalizedHash.replace(/^#/, "");
    const target = document.getElementById(hashId);

    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    target.classList.add("scroll-target-highlight");
    window.setTimeout(() => target.classList.remove("scroll-target-highlight"), 1200);
  }

  // Form — abre modal
  if (type === "form") {
    return (
      <button
        onClick={() => {
          handleClick();
          openModal();
        }}
        className={cn(variantStyle, className)}
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-current/10">
            <Icon className="h-4 w-4" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold leading-tight">{label}</p>
            {sublabel && (
              <p className="mt-0.5 text-xs opacity-70">{sublabel}</p>
            )}
          </div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 opacity-60" />
      </button>
    );
  }

  // Scroll — smooth scroll para anchor
  if (type === "scroll") {
    return (
      <button
        onClick={() => {
          handleClick();
          handleScrollToTarget();
        }}
        className={cn(variantStyle, className)}
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-current/10">
            <Icon className="h-4 w-4" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold leading-tight">{label}</p>
            {sublabel && (
              <p className="mt-0.5 text-xs opacity-70">{sublabel}</p>
            )}
          </div>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
      </button>
    );
  }

  // WhatsApp
  if (type === "whatsapp") {
    const waUrl = buildWhatsAppUrl(
      whatsappNumber ?? "",
      whatsappMessage,
    );
    return (
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={cn(variantStyle, className)}
        style={{ animationDelay: `${animationDelay}ms` }}
        aria-label={`${label} (abre WhatsApp)`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-current/10">
            <MessageCircle className="h-4 w-4" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold leading-tight">{label}</p>
            {sublabel && (
              <p className="mt-0.5 text-xs opacity-70">{sublabel}</p>
            )}
          </div>
        </div>
        <ExternalLink className="h-4 w-4 shrink-0 opacity-60" />
      </a>
    );
  }

  // URL externa / Instagram / Download
  const href = type === "instagram" ? url : url;

  return (
    <a
      href={href}
      target={openInNewTab ? "_blank" : "_self"}
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(variantStyle, className)}
      style={{ animationDelay: `${animationDelay}ms` }}
      aria-label={label}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-current/10">
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold leading-tight">{label}</p>
          {sublabel && (
            <p className="mt-0.5 text-xs opacity-70">{sublabel}</p>
          )}
        </div>
      </div>
      {type === "download" ? (
        <Download className="h-4 w-4 shrink-0 opacity-60" />
      ) : (
        <ExternalLink className="h-4 w-4 shrink-0 opacity-60" />
      )}
    </a>
  );
}

function getDefaultIcon(type: string): React.ElementType {
  const map: Record<string, React.ElementType> = {
    whatsapp: MessageCircle,
    form: ClipboardList,
    url: Globe,
    instagram: Instagram,
    download: Download,
    scroll: ChevronDown,
  };
  return map[type] ?? ArrowRight;
}
