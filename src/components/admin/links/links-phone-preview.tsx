"use client";

import Image from "next/image";

import type { Link, Profile, Theme } from "@/types";

interface LinksPhonePreviewProps {
  links: Link[];
  profile?: Profile;
  theme?: Theme;
}

function getButtonRadius(roundness: string | undefined) {
  switch (roundness) {
    case "none": return "0px";
    case "sm": return "6px";
    case "md": return "10px";
    case "lg": return "16px";
    case "full": return "9999px";
    default: return "12px";
  }
}

export function LinksPhonePreview({ links, profile, theme }: LinksPhonePreviewProps) {
  const enabledLinks = links.filter((l) => l.is_enabled && l.type !== "divider");
  const buttonBg = theme?.button_color ?? "#1a1a1a";
  const buttonText = theme?.button_text_color ?? "#ffffff";
  const buttonRadius = getButtonRadius(theme?.button_roundness);
  const pageBg = theme?.background_color ?? "#f9f9f9";

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-6">
      {/* URL bar */}
      <div className="mb-3 flex w-full max-w-[300px] items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5">
        <div className="h-2 w-2 rounded-full bg-green-400" />
        <span className="truncate text-[10px] text-gray-500">
          {profile ? `biohub.app/${profile.name?.toLowerCase().replace(/\s+/g, "-")}` : "sua-pagina"}
        </span>
      </div>

      {/* Phone frame */}
      <div
        className="relative w-full max-w-[300px] overflow-hidden rounded-[32px] border-[6px] border-gray-800 shadow-2xl"
        style={{ height: "560px" }}
      >
        {/* Phone content */}
        <div
          className="absolute inset-0 overflow-y-auto"
          style={{ backgroundColor: pageBg }}
        >
          {/* Profile section */}
          <div className="flex flex-col items-center px-4 pb-3 pt-6 text-center">
            {/* Avatar */}
            <div className="mb-2.5 h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow-md">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-200 text-lg font-bold text-gray-500">
                  {profile?.name?.[0] ?? "?"}
                </div>
              )}
            </div>

            {/* Name */}
            <p className="text-[13px] font-bold leading-tight text-gray-900">
              {profile?.name ?? "Seu Nome"}
            </p>

            {/* Title */}
            {profile?.professional_title && (
              <p className="mt-0.5 text-[10px] text-gray-500">
                {profile.professional_title}
              </p>
            )}
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2 px-3 pb-4">
            {enabledLinks.length === 0 ? (
              <p className="py-4 text-center text-[11px] text-gray-400">
                Nenhum link ativo
              </p>
            ) : (
              enabledLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center gap-2.5 px-3 py-2.5"
                  style={{
                    backgroundColor: link.custom_bg_color || buttonBg,
                    color: link.custom_text_color || buttonText,
                    borderRadius: buttonRadius,
                  }}
                >
                  {link.thumbnail_url && (
                    <div className="h-7 w-7 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={link.thumbnail_url}
                        alt=""
                        width={28}
                        height={28}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 text-center">
                    <p className="text-[11px] font-semibold leading-tight tracking-wide">
                      {link.label}
                    </p>
                    {link.sublabel && (
                      <p className="text-[9px] opacity-75 mt-0.5">{link.sublabel}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notch */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-4 w-20 -translate-x-1/2 rounded-b-2xl bg-gray-800" />
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">Preview ao vivo</p>
    </div>
  );
}
