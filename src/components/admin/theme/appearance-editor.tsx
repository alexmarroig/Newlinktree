"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  User,
  LayoutTemplate,
  Image as ImageIcon,
  Type,
  Square,
  Palette,
  PanelBottom,
  Save,
  ExternalLink,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/helpers";
import { saveTheme } from "@/server/actions/theme";
import { uploadAvatar } from "@/server/actions/avatar";
import { uploadBackgroundImage } from "@/server/actions/upload-image";
import { themeSchema, type ThemeSchema } from "@/lib/validations";
import { DEFAULT_THEME, APP_URL } from "@/lib/constants";
import type { Theme, Profile, Settings, Link } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = "header" | "theme" | "wallpaper" | "text" | "buttons" | "colors" | "footer";

interface AppearanceEditorProps {
  profileId: string;
  profile: Profile;
  theme?: Theme;
  pageSlug: string;
  settings?: Settings;
  links?: Link[];
}

// ─── Section nav config ───────────────────────────────────────────────────────

const NAV_SECTIONS: { id: Section; label: string; Icon: React.ElementType }[] = [
  { id: "header", label: "Header", Icon: User },
  { id: "theme", label: "Tema", Icon: LayoutTemplate },
  { id: "wallpaper", label: "Plano de fundo", Icon: ImageIcon },
  { id: "text", label: "Texto", Icon: Type },
  { id: "buttons", label: "Botões", Icon: Square },
  { id: "colors", label: "Cores", Icon: Palette },
  { id: "footer", label: "Rodapé", Icon: PanelBottom },
];

// ─── Preset themes ────────────────────────────────────────────────────────────

const PRESETS = [
  {
    id: "custom",
    label: "Custom",
    bg: "#F5F5F5",
    btn: "#1a1a1a",
    btnText: "#ffffff",
    primaryColor: DEFAULT_THEME.primary_color,
    backgroundColor: DEFAULT_THEME.background_color,
    textColor: DEFAULT_THEME.text_color,
  },
  {
    id: "warm",
    label: "Warm",
    bg: "#FDF6EF",
    btn: "#8B5E3C",
    btnText: "#ffffff",
    primaryColor: "25 40% 40%",
    backgroundColor: "38 60% 97%",
    textColor: "20 15% 15%",
  },
  {
    id: "air",
    label: "Air",
    bg: "#F0F4FF",
    btn: "#3B5BDB",
    btnText: "#ffffff",
    primaryColor: "228 70% 55%",
    backgroundColor: "220 60% 97%",
    textColor: "225 25% 15%",
  },
  {
    id: "dark",
    label: "Dark",
    bg: "#121212",
    btn: "#ffffff",
    btnText: "#000000",
    primaryColor: "0 0% 100%",
    backgroundColor: "0 0% 7%",
    textColor: "0 0% 95%",
  },
  {
    id: "bliss",
    label: "Bliss",
    bg: "#FFF0F6",
    btn: "#C2255C",
    btnText: "#ffffff",
    primaryColor: "340 70% 45%",
    backgroundColor: "330 100% 97%",
    textColor: "340 30% 15%",
  },
  {
    id: "mineral",
    label: "Mineral",
    bg: "#F8F9FA",
    btn: "#495057",
    btnText: "#ffffff",
    primaryColor: "210 10% 35%",
    backgroundColor: "210 17% 98%",
    textColor: "210 10% 10%",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hslToHex(hsl: string): string {
  try {
    const parts = hsl.trim().split(/\s+/);
    const h = parseFloat(parts[0]);
    const s = parseFloat(parts[1]) / 100;
    const l = parseFloat(parts[2]) / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    const rh = Math.round((r + m) * 255).toString(16).padStart(2, "0");
    const gh = Math.round((g + m) * 255).toString(16).padStart(2, "0");
    const bh = Math.round((b + m) * 255).toString(16).padStart(2, "0");
    return `#${rh}${gh}${bh}`;
  } catch { return "#000000"; }
}

function hexToHsl(hex: string): string {
  try {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  } catch { return "0 0% 0%"; }
}

// ─── ColorPickerButton ────────────────────────────────────────────────────────
// Looks like a VisualOption but opens native color picker when clicked

function ColorPickerButton({
  value,
  onChange,
  label,
  fallback = "#000000",
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  fallback?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const displayHex = value || fallback;

  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-semibold uppercase tracking-wider text-blue-500">{label}</Label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center gap-3 rounded-xl border-2 border-transparent bg-gray-100 px-3 py-2.5 text-left transition-all duration-150 hover:border-gray-300 hover:bg-white hover:shadow-sm cursor-pointer"
      >
        <div
          className="h-9 w-9 flex-shrink-0 rounded-xl border border-black/10 shadow-sm"
          style={{ backgroundColor: displayHex }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm font-medium text-gray-800">{displayHex}</p>
          <p className="text-[11px] text-gray-400">Clique para alterar</p>
        </div>
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <input
          ref={inputRef}
          type="color"
          value={displayHex}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
      </button>
    </div>
  );
}

// ─── PhonePreview ─────────────────────────────────────────────────────────────
// Live preview component — reads directly from form state, no save needed

const PREVIEW_ROUNDNESS: Record<string, string> = {
  square: "4px", round: "8px", rounder: "16px", full: "9999px",
};
const PREVIEW_SHADOW: Record<string, string> = {
  none: "none",
  soft: "0 2px 8px rgba(0,0,0,0.15)",
  strong: "0 4px 16px rgba(0,0,0,0.25)",
  hard: "4px 4px 0px rgba(0,0,0,0.85)",
};

function PhonePreview({
  values,
  avatarPreview,
  profileName,
  pageSlug,
  links,
}: {
  values: ThemeSchema;
  avatarPreview: string | null;
  profileName: string;
  pageSlug: string;
  links?: Link[];
}) {
  const btnBg = values.buttonColor || "#1a1a1a";
  const btnText = values.buttonTextColor || "#ffffff";
  const radius = PREVIEW_ROUNDNESS[values.buttonRoundness] ?? "9999px";
  const shadow = PREVIEW_SHADOW[values.buttonShadow] ?? "none";
  const bgType = values.backgroundType;

  // Compute background style based on type
  let containerStyle: React.CSSProperties = {};
  let isAurora = false;
  if (bgType === "image" && values.backgroundImageUrl) {
    containerStyle = { backgroundImage: `url(${values.backgroundImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" };
  } else if (bgType === "gradient") {
    containerStyle = {
      background: `linear-gradient(-45deg, hsl(${values.backgroundColor}), #EAF0FF, ${btnBg}22, hsl(${values.backgroundColor}))`,
      backgroundSize: "300% 300%",
      animation: "bg-grad-preview 14s ease infinite",
    };
  } else if (bgType === "aurora") {
    isAurora = true;
    containerStyle = {
      background: "radial-gradient(ellipse 110% 80% at 0% 50%, rgba(0,210,255,0.45), transparent 60%), radial-gradient(ellipse 110% 80% at 100% 50%, rgba(180,0,255,0.40), transparent 60%), radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,255,180,0.30), transparent 60%), #0e1628",
      backgroundSize: "200% 200%, 200% 200%, 200% 200%, auto",
      animation: "aurora-glow-preview 18s ease-in-out infinite",
    };
  } else if (bgType === "waves") {
    containerStyle = {
      backgroundColor: "#E8F4FD",
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 80'%3E%3Cpath fill='rgba(59%2C130%2C246%2C0.25)' d='M0,40 C100,10 300,70 500,35 C650,10 750,60 800,40 L800,80 L0,80Z'/%3E%3C/svg%3E\")",
      backgroundRepeat: "repeat-x",
      backgroundSize: "800px 100px",
      backgroundPosition: "0px 85%",
    };
  } else if (bgType === "mesh") {
    containerStyle = {
      background: "radial-gradient(ellipse at 15% 15%, rgba(255,180,180,0.65), transparent 50%), radial-gradient(ellipse at 85% 10%, rgba(180,180,255,0.65), transparent 50%), radial-gradient(ellipse at 50% 90%, rgba(180,255,200,0.55), transparent 55%), #ffffff",
    };
  } else {
    containerStyle = { backgroundColor: `hsl(${values.backgroundColor})` };
  }

  const textColor = values.pageFontColor || (isAurora ? "#ffffff" : `hsl(${values.textColor})`);
  const titleColor = values.titleFontColor || textColor;

  const initials = profileName
    .split(" ").filter(Boolean).slice(0, 2)
    .map((n) => n[0]!.toUpperCase()).join("");

  const btnStyle: React.CSSProperties = {
    backgroundColor: btnBg,
    color: btnText,
    borderRadius: radius,
    boxShadow: shadow,
  };

  const MOCK_LINKS = ["Link principal", "Segundo link", "Terceiro link"];
  const previewLinks = links && links.length > 0
    ? links.filter((l) => l.type !== "divider").slice(0, 6)
    : null;

  return (
    <div
      className="w-full h-full overflow-y-auto flex flex-col items-center pt-5 px-3 gap-2.5"
      style={{ ...containerStyle, fontFamily: values.pageFont ? `"${values.pageFont}", sans-serif` : undefined }}
    >
      {/* Inject keyframes for animated types */}
      {(bgType === "gradient" || bgType === "aurora") && (
        <style>{`
          @keyframes bg-grad-preview {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes aurora-glow-preview {
            0%, 100% { background-position: 0% 50%, 100% 50%, 50% 100%; }
            33% { background-position: 50% 0%, 50% 100%, 0% 50%; }
            66% { background-position: 100% 50%, 0% 50%, 100% 0%; }
          }
        `}</style>
      )}
      {/* Avatar */}
      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full border-2 border-white shadow-md">
        {avatarPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarPreview} alt="" className="h-full w-full object-cover object-top" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200">
            <span className="text-base font-semibold text-gray-500">{initials}</span>
          </div>
        )}
      </div>

      {/* Name */}
      <div className="text-center leading-tight">
        <p
          className={`font-bold ${values.titleSize === "large" ? "text-[13px]" : "text-[11px]"}`}
          style={{ color: titleColor }}
        >
          {profileName}
        </p>
        <p className="text-[9px] mt-0.5 opacity-60" style={{ color: textColor }}>
          Psicóloga
        </p>
      </div>

      {/* Links */}
      {previewLinks
        ? previewLinks.map((link) => (
            <div
              key={link.id}
              className="w-full flex flex-col items-center justify-center px-3 py-2 text-center"
              style={btnStyle}
            >
              <span className="text-[9px] font-semibold leading-tight truncate w-full text-center">
                {link.label}
              </span>
              {link.sublabel && (
                <span className="text-[8px] opacity-70 mt-0.5 truncate w-full text-center">{link.sublabel}</span>
              )}
            </div>
          ))
        : MOCK_LINKS.map((label, i) => (
            <div
              key={i}
              className="w-full flex items-center justify-center px-3 py-2 text-[9px] font-semibold uppercase tracking-wide"
              style={btnStyle}
            >
              {label}
            </div>
          ))}

      {/* Footer hint */}
      <a
        href={`/${pageSlug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto mb-2 text-[9px] text-gray-400 hover:text-gray-600 underline"
      >
        Ver página completa ↗
      </a>
    </div>
  );
}

// ─── VisualOptionRow ────────────────────────────────────────────────────────

function VisualOption({
  active,
  onClick,
  children,
  label,
  locked,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
  locked?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all duration-150 cursor-pointer",
        active
          ? "border-gray-900 bg-white shadow-sm"
          : "border-transparent bg-gray-100 hover:border-gray-300 hover:bg-white hover:shadow-sm hover:scale-[1.03]",
        locked && "cursor-not-allowed opacity-50 hover:scale-100 hover:border-transparent hover:bg-gray-100 hover:shadow-none",
      )}
      disabled={locked}
    >
      {children}
      <span className="text-[11px] text-gray-600">{label}</span>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AppearanceEditor({
  profileId,
  profile,
  theme,
  pageSlug,
  settings,
  links,
}: AppearanceEditorProps) {
  const [activeSection, setActiveSection] = useState<Section>("header");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url ?? null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ThemeSchema>({
    resolver: zodResolver(themeSchema),
    defaultValues: {
      primaryColor: theme?.primary_color ?? DEFAULT_THEME.primary_color,
      secondaryColor: theme?.secondary_color ?? DEFAULT_THEME.secondary_color,
      backgroundColor: theme?.background_color ?? DEFAULT_THEME.background_color,
      textColor: theme?.text_color ?? DEFAULT_THEME.text_color,
      accentColor: theme?.accent_color ?? DEFAULT_THEME.accent_color,
      fontHeading: theme?.font_heading ?? DEFAULT_THEME.font_heading,
      fontBody: theme?.font_body ?? DEFAULT_THEME.font_body,
      borderRadius: (theme?.border_radius ?? DEFAULT_THEME.border_radius) as ThemeSchema["borderRadius"],
      shadowIntensity: (theme?.shadow_intensity ?? DEFAULT_THEME.shadow_intensity) as ThemeSchema["shadowIntensity"],
      layoutWidth: (theme?.layout_width ?? DEFAULT_THEME.layout_width) as ThemeSchema["layoutWidth"],
      cardStyle: (theme?.card_style ?? DEFAULT_THEME.card_style) as ThemeSchema["cardStyle"],
      backgroundImageUrl: theme?.background_image_url ?? "",
      backgroundType: (theme?.background_type ?? "color") as ThemeSchema["backgroundType"],
      wallpaperEffect: (theme?.wallpaper_effect ?? "none") as ThemeSchema["wallpaperEffect"],
      wallpaperTint: theme?.wallpaper_tint ?? 20,
      wallpaperNoise: theme?.wallpaper_noise ?? false,
      pageFont: theme?.page_font ?? "Inter",
      pageFontColor: theme?.page_text_color ?? "",
      titleFontColor: theme?.title_font_color ?? "",
      titleSize: (theme?.title_size ?? "small") as ThemeSchema["titleSize"],
      avatarLayout: (theme?.avatar_layout ?? "classic") as ThemeSchema["avatarLayout"],
      buttonStyle: (theme?.button_style ?? "solid") as ThemeSchema["buttonStyle"],
      buttonColor: theme?.button_color ?? "",
      buttonTextColor: theme?.button_text_color ?? "",
      buttonShadow: (theme?.button_shadow ?? "soft") as ThemeSchema["buttonShadow"],
      buttonRoundness: (theme?.button_roundness ?? "full") as ThemeSchema["buttonRoundness"],
      buttonAnimation: (theme?.button_animation ?? "none") as ThemeSchema["buttonAnimation"],
      profileBadgeText: theme?.profile_badge_text ?? "",
    },
  });

  const { watch, setValue, handleSubmit, formState } = form;

  async function onSave(values: ThemeSchema) {
    const result = await saveTheme(profileId, values);
    if (!result.success) {
      toast.error(result.error ?? "Erro ao salvar");
      return;
    }
    toast.success("Aparência salva! A página pública foi atualizada.");
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadAvatar(profileId, fd);
    setUploadingAvatar(false);
    if (!result.success) {
      toast.error(result.error ?? "Erro ao enviar foto");
      setAvatarPreview(profile.avatar_url ?? null);
    } else {
      toast.success("Foto atualizada!");
    }
  }

  async function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBg(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadBackgroundImage(profileId, fd);
    setUploadingBg(false);
    if (!result.success) {
      toast.error(result.error ?? "Erro ao enviar imagem");
    } else {
      setValue("backgroundImageUrl", result.data.url);
      toast.success("Imagem enviada! Salve para aplicar.");
    }
  }

  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]!.toUpperCase())
    .join("");

  // ── Section renderers ────────────────────────────────────────────────────────

  function renderHeader() {
    return (
      <div className="space-y-7">
        {/* Profile image */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-500">
            Foto de perfil
          </p>
          <div className="flex items-center gap-4">
            <div className="h-[72px] w-[72px] overflow-hidden rounded-full ring-2 ring-border shadow">
              {avatarPreview ? (
                <Image src={avatarPreview} alt="Avatar" width={72} height={72} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-stone-200">
                  <span className="text-lg font-semibold text-stone-500">{initials}</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <Button type="button" variant="outline" size="sm" loading={uploadingAvatar} onClick={() => fileInputRef.current?.click()}>
              Editar
            </Button>
          </div>
        </div>

        {/* Avatar layout */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-500">
            Layout da foto
          </p>
          <div className="flex gap-3">
            <VisualOption active={watch("avatarLayout") === "classic"} onClick={() => setValue("avatarLayout", "classic")} label="Classic">
              <div className="flex flex-col items-center gap-1">
                <div className="h-7 w-7 rounded-full bg-gray-300" />
                <div className="h-1.5 w-12 rounded bg-gray-300" />
                <div className="h-1 w-8 rounded bg-gray-200" />
              </div>
            </VisualOption>
            <VisualOption active={watch("avatarLayout") === "hero"} onClick={() => setValue("avatarLayout", "hero")} label="Hero">
              <div className="relative flex h-10 w-16 items-end justify-center overflow-hidden rounded-lg bg-gray-200">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-300 to-gray-400" />
                <div className="relative h-8 w-8 rounded-full border-2 border-white bg-gray-300" />
              </div>
            </VisualOption>
          </div>
        </div>

        {/* Title size */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-500">
            Tamanho do título
          </p>
          <div className="flex gap-3">
            <VisualOption active={watch("titleSize") === "small"} onClick={() => setValue("titleSize", "small")} label="Small">
              <span className="text-sm font-semibold">Aa</span>
            </VisualOption>
            <VisualOption active={watch("titleSize") === "large"} onClick={() => setValue("titleSize", "large")} label="Large">
              <span className="text-lg font-bold">Aa</span>
            </VisualOption>
          </div>
        </div>

        {/* Availability badge */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-500">
            Badge de disponibilidade
          </p>
          <p className="text-[11px] text-gray-500">
            Aparece abaixo do nome na página pública. Deixe em branco para ocultar.
          </p>
          <Input
            placeholder="Ex: Disponível para novos pacientes"
            value={watch("profileBadgeText") ?? ""}
            onChange={(e) => setValue("profileBadgeText", e.target.value)}
            maxLength={60}
          />
          <div className="flex flex-wrap gap-2">
            {["Disponível para novos pacientes", "Lista de espera", "Agenda aberta", ""].map((chip) => (
              <button
                key={chip || "limpar"}
                type="button"
                onClick={() => setValue("profileBadgeText", chip)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
                  watch("profileBadgeText") === chip
                    ? "border-green-400 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
                )}
              >
                {chip || "Limpar"}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderTheme() {
    return (
      <div className="space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-500">
          Temas predefinidos
        </p>
        <div className="grid grid-cols-3 gap-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setValue("primaryColor", preset.primaryColor);
                setValue("backgroundColor", preset.backgroundColor);
                setValue("textColor", preset.textColor);
                setValue("buttonColor", preset.btn);
                setValue("buttonTextColor", preset.btnText);
              }}
              className="flex flex-col items-center gap-2 rounded-xl border-2 border-transparent p-2 hover:border-gray-300 transition-all"
            >
              {/* Theme thumbnail */}
              <div
                className="h-16 w-full rounded-lg flex flex-col items-center justify-center gap-1.5 px-2"
                style={{ backgroundColor: preset.bg }}
              >
                <div className="h-2 w-8 rounded-full" style={{ backgroundColor: preset.btn, opacity: 0.3 }} />
                <div
                  className="h-5 w-full rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: preset.btn }}
                >
                  <span className="text-[8px] font-bold" style={{ color: preset.btnText }}>Aa</span>
                </div>
                <div className="h-4 w-full rounded-lg" style={{ backgroundColor: preset.btn, opacity: 0.7 }} />
              </div>
              <span className="text-[11px] text-gray-600">{preset.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderWallpaper() {
    const bgType = watch("backgroundType");
    const effect = watch("wallpaperEffect");
    const tint = watch("wallpaperTint");
    const noise = watch("wallpaperNoise");

    return (
      <div className="space-y-7">
        {/* Type */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-500">Tipo</p>
          <div className="grid grid-cols-3 gap-2">
            <VisualOption active={bgType === "color"} onClick={() => setValue("backgroundType", "color")} label="Cor sólida">
              <div className="h-10 w-full rounded-lg bg-gradient-to-br from-gray-50 to-gray-200 border border-gray-200" />
            </VisualOption>
            <VisualOption active={bgType === "image"} onClick={() => setValue("backgroundType", "image")} label="Imagem">
              <div className="h-10 w-full rounded-lg bg-gray-200 flex items-center justify-center">
                <span className="text-base">🖼</span>
              </div>
            </VisualOption>
            <VisualOption active={bgType === "gradient"} onClick={() => setValue("backgroundType", "gradient")} label="Gradiente">
              <div className="h-10 w-full rounded-lg" style={{ background: "linear-gradient(-45deg, #E8F0FF, #EAF0FF, #DBEAFE, #F0EAFF)", backgroundSize: "200% 200%" }} />
            </VisualOption>
            <VisualOption active={bgType === "aurora"} onClick={() => setValue("backgroundType", "aurora")} label="Aurora">
              <div className="h-10 w-full rounded-lg overflow-hidden" style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(0,210,255,0.5), transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(180,0,255,0.5), transparent 60%), #0e1628" }} />
            </VisualOption>
            <VisualOption active={bgType === "waves"} onClick={() => setValue("backgroundType", "waves")} label="Ondas">
              <div className="h-10 w-full rounded-lg overflow-hidden bg-sky-100 relative">
                <div className="absolute bottom-0 left-0 right-0 h-4 rounded-b-lg bg-blue-300/50" />
                <div className="absolute bottom-1 left-0 right-0 h-3 rounded-b-lg bg-blue-400/40" />
              </div>
            </VisualOption>
            <VisualOption active={bgType === "mesh"} onClick={() => setValue("backgroundType", "mesh")} label="Mesh">
              <div className="h-10 w-full rounded-lg" style={{ background: "radial-gradient(ellipse at 20% 20%, rgba(255,180,180,0.8), transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(180,180,255,0.8), transparent 50%), radial-gradient(ellipse at 50% 85%, rgba(180,255,200,0.7), transparent 50%), #fff" }} />
            </VisualOption>
            <VisualOption active={bgType === "sunset"} onClick={() => setValue("backgroundType", "sunset")} label="Pôr do sol">
              <div className="h-10 w-full rounded-lg" style={{ background: "linear-gradient(-45deg, #ff6b6b, #feca57, #ff9ff3, #f9ca24)" }} />
            </VisualOption>
            <VisualOption active={bgType === "nebula"} onClick={() => setValue("backgroundType", "nebula")} label="Nebulosa">
              <div className="h-10 w-full rounded-lg" style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(255,0,128,0.6), transparent 55%), radial-gradient(ellipse at 80% 50%, rgba(0,128,255,0.6), transparent 55%), radial-gradient(ellipse at 50% 10%, rgba(128,0,255,0.5), transparent 55%), #0a0a1a" }} />
            </VisualOption>
            <VisualOption active={bgType === "rose"} onClick={() => setValue("backgroundType", "rose")} label="Rosa">
              <div className="h-10 w-full rounded-lg" style={{ background: "radial-gradient(ellipse at 20% 30%, rgba(255,150,200,0.8), transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(255,100,180,0.7), transparent 50%), #fff5f8" }} />
            </VisualOption>
            <VisualOption active={bgType === "neon"} onClick={() => setValue("backgroundType", "neon")} label="Neon">
              <div className="h-10 w-full rounded-lg" style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(0,255,180,0.4), transparent 55%), radial-gradient(ellipse at 80% 50%, rgba(0,150,255,0.4), transparent 55%), radial-gradient(ellipse at 50% 90%, rgba(200,0,255,0.3), transparent 55%), #060614" }} />
            </VisualOption>
          </div>
        </div>

        {/* Color fill option */}
        {bgType === "color" && (
          <ColorPickerButton
            label="Cor de fundo"
            value={hslToHex(watch("backgroundColor"))}
            onChange={(hex) => setValue("backgroundColor", hexToHsl(hex))}
          />
        )}

        {/* Image upload + preview */}
        {bgType === "image" && (
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-500">Imagem de fundo</p>

            {/* Preview */}
            {watch("backgroundImageUrl") && (
              <div className="relative h-24 w-full overflow-hidden rounded-xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={watch("backgroundImageUrl")!}
                  alt="Preview do fundo"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Upload button */}
            <input
              ref={bgFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBgUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              loading={uploadingBg}
              onClick={() => bgFileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-3.5 w-3.5" />
              {watch("backgroundImageUrl") ? "Trocar imagem" : "Fazer upload"}
            </Button>

            {/* Manual URL fallback */}
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Ou cole uma URL</Label>
              <Input
                placeholder="https://..."
                value={watch("backgroundImageUrl") ?? ""}
                onChange={(e) => setValue("backgroundImageUrl", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Info for interactive types */}
        {["gradient", "aurora", "waves", "mesh", "sunset", "nebula", "rose", "neon"].includes(bgType) && (
          <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
            <p className="text-[11px] text-blue-700 font-medium">
              {bgType === "gradient" && "Gradiente animado que se move suavemente usando suas cores do tema."}
              {bgType === "aurora" && "Efeito aurora boreal com luzes animadas em fundo escuro."}
              {bgType === "waves" && "Ondas animadas em fundo azul claro — ideal para perfis de saúde e bem-estar."}
              {bgType === "mesh" && "Gradiente mesh colorido animado com tons pastéis suaves."}
              {bgType === "sunset" && "Pôr do sol quente com rosa, laranja e dourado em movimento suave."}
              {bgType === "nebula" && "Nebulosa espacial com luzes coloridas animadas em fundo escuro."}
              {bgType === "rose" && "Fundo rosé suave e feminino com movimento de luz animada."}
              {bgType === "neon" && "Efeito neon futurista com brilho em fundo escuro."}
            </p>
            <p className="text-[10px] text-blue-500 mt-1">Salve para ver na página pública.</p>
          </div>
        )}

        {/* Extra effects only for image bg */}
        {bgType === "image" && (
          <>
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-500">Efeito</p>
              <div className="flex gap-2">
                {(["none", "mono", "blur"] as const).map((ef) => (
                  <VisualOption key={ef} active={effect === ef} onClick={() => setValue("wallpaperEffect", ef)} label={ef === "none" ? "Nenhum" : ef === "mono" ? "Mono" : "Blur"}>
                    <div className="h-8 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                      <span className="text-[9px] text-gray-500">{ef === "none" ? "∅" : ef === "mono" ? "M" : "B"}</span>
                    </div>
                  </VisualOption>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Noise</p>
                <p className="text-xs text-muted-foreground">Textura granulada sutil</p>
              </div>
              <Switch checked={noise} onCheckedChange={(v) => setValue("wallpaperNoise", v)} />
            </div>
          </>
        )}
      </div>
    );
  }

  function renderText() {
    const pageFontColor = watch("pageFontColor") ?? "";
    const titleFontColor = watch("titleFontColor") ?? "";
    const titleSize = watch("titleSize");

    return (
      <div className="space-y-7">
        {/* Page font */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-500">Fonte da página</p>
          <Select value={watch("pageFont")} onValueChange={(v) => setValue("pageFont", v)}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inter">Inter</SelectItem>
              <SelectItem value="Playfair Display">Playfair Display</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="system-ui">System UI</SelectItem>
              <SelectItem value="Lora">Lora</SelectItem>
              <SelectItem value="Montserrat">Montserrat</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Page text color */}
        <ColorPickerButton
          label="Cor do texto da página"
          value={pageFontColor || hslToHex(watch("textColor"))}
          onChange={(hex) => {
            setValue("pageFontColor", hex);
            setValue("textColor", hexToHsl(hex));
          }}
        />

        {/* Title color */}
        <ColorPickerButton
          label="Cor do título"
          value={titleFontColor || hslToHex(watch("textColor"))}
          onChange={(hex) => setValue("titleFontColor", hex)}
        />

        {/* Title size */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-500">Tamanho do título</p>
          <div className="flex gap-3">
            <VisualOption active={titleSize === "small"} onClick={() => setValue("titleSize", "small")} label="Small">
              <span className="text-sm font-semibold">Aa</span>
            </VisualOption>
            <VisualOption active={titleSize === "large"} onClick={() => setValue("titleSize", "large")} label="Large">
              <span className="text-lg font-bold">Aa</span>
            </VisualOption>
          </div>
        </div>
      </div>
    );
  }

  function renderButtons() {
    const btnStyle = watch("buttonStyle");
    const btnRound = watch("buttonRoundness");
    const btnShadow = watch("buttonShadow");
    const btnColor = watch("buttonColor") ?? "";
    const btnTextColor = watch("buttonTextColor") ?? "";

    return (
      <div className="space-y-7">
        {/* Style */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-500">Estilo</p>
          <div className="flex gap-3">
            {(["solid", "glass", "outline"] as const).map((s) => (
              <VisualOption key={s} active={btnStyle === s} onClick={() => setValue("buttonStyle", s)} label={s === "solid" ? "Sólido" : s === "glass" ? "Glass" : "Contorno"}>
                <div
                  className={cn("h-7 w-16 rounded-lg border-2", {
                    "bg-gray-800 border-gray-800": s === "solid",
                    "bg-white/50 border-gray-300 backdrop-blur": s === "glass",
                    "bg-transparent border-gray-700": s === "outline",
                  })}
                />
              </VisualOption>
            ))}
          </div>
        </div>

        {/* Roundness */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-500">Arredondamento</p>
          <div className="flex gap-2">
            {([
              { id: "square", label: "Quadrado", r: "rounded" },
              { id: "round", label: "Round", r: "rounded-lg" },
              { id: "rounder", label: "Rounder", r: "rounded-2xl" },
              { id: "full", label: "Full", r: "rounded-full" },
            ] as const).map((opt) => (
              <VisualOption key={opt.id} active={btnRound === opt.id} onClick={() => setValue("buttonRoundness", opt.id)} label={opt.label}>
                <div className={cn("h-7 w-12 bg-gray-700", opt.r)} />
              </VisualOption>
            ))}
          </div>
        </div>

        {/* Shadow */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-500">Sombra</p>
          <div className="flex gap-2">
            {([
              { id: "none", label: "Nenhum" },
              { id: "soft", label: "Suave" },
              { id: "strong", label: "Forte" },
              { id: "hard", label: "Hard" },
            ] as const).map((opt) => (
              <VisualOption key={opt.id} active={btnShadow === opt.id} onClick={() => setValue("buttonShadow", opt.id)} label={opt.label}>
                <div
                  className={cn("h-7 w-12 rounded-lg bg-gray-300", {
                    "shadow-none": opt.id === "none",
                    "shadow-md": opt.id === "soft",
                    "shadow-lg": opt.id === "strong",
                    "shadow-[4px_4px_0px_rgba(0,0,0,0.8)]": opt.id === "hard",
                  })}
                />
              </VisualOption>
            ))}
          </div>
        </div>

        {/* Button color */}
        <ColorPickerButton
          label="Cor do botão"
          value={btnColor || hslToHex(watch("primaryColor"))}
          onChange={(hex) => {
            setValue("buttonColor", hex);
            setValue("primaryColor", hexToHsl(hex));
          }}
        />

        {/* Button text color */}
        <ColorPickerButton
          label="Cor do texto do botão"
          value={btnTextColor}
          fallback="#ffffff"
          onChange={(hex) => setValue("buttonTextColor", hex)}
        />
      </div>
    );
  }

  function renderColors() {
    return (
      <div className="space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-500">Paleta</p>
        <ColorPickerButton
          label="Cor primária (botões)"
          value={watch("buttonColor") || hslToHex(watch("primaryColor"))}
          onChange={(hex) => {
            setValue("buttonColor", hex);
            setValue("primaryColor", hexToHsl(hex));
          }}
        />
        <ColorPickerButton
          label="Texto dos botões"
          value={watch("buttonTextColor")}
          fallback="#ffffff"
          onChange={(hex) => setValue("buttonTextColor", hex)}
        />
        <ColorPickerButton
          label="Fundo da página"
          value={hslToHex(watch("backgroundColor"))}
          onChange={(hex) => setValue("backgroundColor", hexToHsl(hex))}
        />
        <ColorPickerButton
          label="Texto da página"
          value={watch("pageFontColor") || hslToHex(watch("textColor"))}
          onChange={(hex) => {
            setValue("pageFontColor", hex);
            setValue("textColor", hexToHsl(hex));
          }}
        />
        <ColorPickerButton
          label="Cor do título"
          value={watch("titleFontColor") || hslToHex(watch("textColor"))}
          onChange={(hex) => setValue("titleFontColor", hex)}
        />
      </div>
    );
  }

  function renderFooter() {
    return (
      <div className="space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-500">Ícones sociais</p>
        <p className="text-sm text-muted-foreground">
          Os ícones aparecem automaticamente quando as URLs estão configuradas. Gerencie-as em{" "}
          <a href="/admin/settings" className="text-blue-500 underline">
            Configurações
          </a>.
        </p>
        <div className="rounded-xl bg-muted/50 p-4 space-y-2">
          {[
            { label: "Instagram", value: profile.instagram_url },
            { label: "WhatsApp", value: profile.whatsapp_number ? `+${profile.whatsapp_number}` : null },
            { label: "LinkedIn", value: profile.linkedin_url },
            { label: "E-mail", value: settings?.contact_email },
            { label: "YouTube", value: profile.youtube_url },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className={cn("text-xs", item.value ? "text-green-600" : "text-gray-400")}>
                {item.value ? "✓ Configurado" : "— Não configurado"}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderSection() {
    switch (activeSection) {
      case "header": return renderHeader();
      case "theme": return renderTheme();
      case "wallpaper": return renderWallpaper();
      case "text": return renderText();
      case "buttons": return renderButtons();
      case "colors": return renderColors();
      case "footer": return renderFooter();
    }
  }

  const publicUrl = `${APP_URL}/${pageSlug}`;

  return (
    <form onSubmit={handleSubmit(onSave)} className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b bg-white px-5">
        <h1 className="text-sm font-semibold text-gray-900">Aparência</h1>
        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" loading={formState.isSubmitting}>
            <Save className="h-4 w-4" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left sidebar ── */}
        <nav className="flex w-[168px] shrink-0 flex-col gap-0.5 border-r bg-white p-3 overflow-y-auto">
          {NAV_SECTIONS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors text-left",
                activeSection === id
                  ? "bg-gray-100 font-semibold text-gray-900"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* ── Center content ── */}
        <div className="flex-1 overflow-y-auto bg-white p-6">
          {renderSection()}
        </div>

        {/* ── Right preview ── */}
        <div className="hidden w-[380px] shrink-0 flex-col items-center gap-4 border-l bg-gray-100 p-5 lg:flex overflow-y-auto">
          <div className="flex w-full items-center justify-between">
            <span className="truncate text-[11px] text-muted-foreground">
              {APP_URL}/{pageSlug}
            </span>
            <a
              href={`/${pageSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 shrink-0 text-gray-400 hover:text-gray-700"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          {/* Phone frame — live preview (updates instantly) */}
          <div className="relative w-full rounded-[36px] border-[6px] border-gray-800 bg-gray-800 shadow-2xl overflow-hidden">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 z-10 h-5 w-20 -translate-x-1/2 rounded-b-2xl bg-gray-800" />
            <div className="min-h-[520px] overflow-hidden rounded-[30px] bg-white">
              <PhonePreview
                values={watch()}
                avatarPreview={avatarPreview}
                profileName={profile.name}
                pageSlug={pageSlug}
                links={links}
              />
            </div>
          </div>
          <p className="text-center text-[11px] text-muted-foreground">
            Preview ao vivo — salve para publicar
          </p>
        </div>
      </div>
    </form>
  );
}
