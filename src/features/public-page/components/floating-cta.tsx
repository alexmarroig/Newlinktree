"use client";

import { useEffect, useState } from "react";
import { MessageCircle, ArrowUp } from "lucide-react";

import { buildWhatsAppUrl } from "@/lib/helpers";
import { trackWhatsAppClick, trackFormOpen } from "@/lib/analytics/events";
import type { Link } from "@/types/database";

import { useFormModal } from "../hooks/use-form-modal";

interface FloatingCtaProps {
  primaryLink: Link | null;
  whatsappNumber: string;
  defaultMessage: string;
}

export function FloatingCta({
  primaryLink,
  whatsappNumber,
  defaultMessage,
}: FloatingCtaProps) {
  const [visible, setVisible] = useState(false);
  const { openModal } = useFormModal();

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 160);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!primaryLink && !whatsappNumber) return null;

  function handleClick() {
    if (primaryLink?.type === "form") {
      trackFormOpen("floating_cta");
      openModal();
      return;
    }
    if (primaryLink?.type === "whatsapp" || (!primaryLink && whatsappNumber)) {
      const num = primaryLink?.whatsapp_message !== undefined
        ? whatsappNumber
        : whatsappNumber;
      const msg = primaryLink?.whatsapp_message ?? defaultMessage;
      trackWhatsAppClick({ linkId: primaryLink?.id ?? "floating_cta" });
      window.open(buildWhatsAppUrl(num, msg), "_blank", "noopener,noreferrer");
      return;
    }
    if (primaryLink?.url) {
      window.open(primaryLink.url, "_blank", "noopener,noreferrer");
    }
  }

  const isWhatsApp =
    !primaryLink ||
    primaryLink.type === "whatsapp" ||
    (primaryLink.type !== "form" && !primaryLink.url);

  const label = primaryLink?.label ?? "Conversar comigo";

  return (
    <div
      className={[
        "fixed bottom-5 left-1/2 z-50 -translate-x-1/2",
        "transition-all duration-300 ease-in-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={handleClick}
        className={[
          "flex items-center gap-2 rounded-full px-5 py-3",
          "text-[13px] font-semibold text-white shadow-xl",
          "transition-transform duration-100 active:scale-95",
          isWhatsApp
            ? "bg-[#25D366] hover:bg-[#1ebe5d]"
            : "bg-[#1a1a1a] hover:bg-[#333]",
        ].join(" ")}
        style={
          primaryLink?.custom_bg_color
            ? {
                backgroundColor: primaryLink.custom_bg_color,
                color: primaryLink.custom_text_color ?? "#ffffff",
              }
            : undefined
        }
      >
        {isWhatsApp ? (
          <MessageCircle className="h-4 w-4" />
        ) : (
          <ArrowUp className="h-4 w-4" />
        )}
        {label}
      </button>
    </div>
  );
}
