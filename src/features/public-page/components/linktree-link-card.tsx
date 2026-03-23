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

export function LinktreeLinkCard({
  link,
  whatsappNumber,
  defaultWhatsappMessage,
  avatarUrl,
}: LinktreeLinkCardProps) {
  const { openModal } = useFormModal();
  const isWhatsApp = link.type === "whatsapp";
  const iconConfig = ICON_CONFIG[link.type] ?? ICON_CONFIG.default;

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
    const { Icon, bg, color } = iconConfig;
    return (
      <div
        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
          isWhatsApp ? "bg-white/20" : bg
        }`}
      >
        <Icon className={`h-5 w-5 ${isWhatsApp ? "text-white" : color}`} />
      </div>
    );
  };

  // ── Shared card classes ─────────────────────────────────────────────────────
  const cardClass = [
    "flex items-center h-[68px] w-full rounded-2xl px-4",
    "shadow-sm transition-all duration-100",
    "active:scale-[0.97] active:shadow-none",
    isWhatsApp ? "bg-[#25D366]" : "bg-white",
  ].join(" ");

  const label = (
    <span
      className={`flex-1 text-center text-[13px] font-semibold uppercase tracking-wide ${
        isWhatsApp ? "text-white" : "text-gray-900"
      }`}
    >
      {link.label}
    </span>
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
    >
      <LeftThumb />
      {label}
      {rightSpacer}
    </a>
  );
}
