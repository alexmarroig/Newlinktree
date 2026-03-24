import type { Theme } from "@/types";

interface ThemeApplierProps {
  theme: Theme;
}

const ROUNDNESS_MAP: Record<string, string> = {
  square: "0.25rem",
  round: "0.5rem",
  rounder: "1rem",
  full: "9999px",
};

const RADIUS_MAP: Record<string, string> = {
  sm: "0.5rem",
  md: "0.625rem",
  lg: "0.75rem",
  xl: "1.25rem",
};

/**
 * Injeta CSS variables do tema personalizado no <style> inline.
 * Server Component — zero overhead cliente.
 */
export function ThemeApplier({ theme }: ThemeApplierProps) {
  const btnRadius = ROUNDNESS_MAP[theme.button_roundness ?? "full"] ?? "9999px";
  const pageRadius = RADIUS_MAP[theme.border_radius ?? "lg"] ?? "0.75rem";

  // Shadow map for buttons
  const shadowMap: Record<string, string> = {
    none: "none",
    soft: "0 2px 8px rgba(0,0,0,0.12)",
    strong: "0 4px 16px rgba(0,0,0,0.22)",
    hard: "4px 4px 0px rgba(0,0,0,0.80)",
  };
  const btnShadow = shadowMap[theme.button_shadow ?? "soft"] ?? shadowMap.soft;

  // Button background color — fallback to dark #1a1a1a, never the brownish HSL primary
  const btnBg = theme.button_color || "#1a1a1a";

  const btnText = theme.button_text_color ?? "#ffffff";

  // Button animation — removed global animationCss; per-link animations use .link-anim-* classes

  // Wallpaper effect (mono, blur)
  let pageFilter = "none";
  if (theme.wallpaper_effect === "blur") pageFilter = "blur(8px)";
  else if (theme.wallpaper_effect === "mono") pageFilter = "grayscale(100%)";

  // Page font
  const pageFont = theme.page_font ?? theme.font_body ?? "Inter";

  // ── Interactive backgrounds ────────────────────────────────────────────────
  const bgType = theme.background_type ?? "color";

  const interactiveBgCss =
    bgType === "gradient"
      ? `
        @keyframes bg-grad {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .public-bg-img {
          background: linear-gradient(-45deg, hsl(${theme.background_color}), #EAF0FF, ${btnBg}22, hsl(${theme.background_color}));
          background-size: 300% 300%;
          animation: bg-grad 14s ease infinite;
        }`
      : bgType === "aurora"
        ? `
        @keyframes aurora-glow {
          0%, 100% { background-position: 0% 50%, 100% 50%, 50% 100%; }
          33% { background-position: 50% 0%, 50% 100%, 0% 50%; }
          66% { background-position: 100% 50%, 0% 50%, 100% 0%; }
        }
        .public-bg-img {
          background:
            radial-gradient(ellipse 110% 80% at 0% 50%, rgba(0,210,255,0.45) 0%, transparent 60%),
            radial-gradient(ellipse 110% 80% at 100% 50%, rgba(180,0,255,0.40) 0%, transparent 60%),
            radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,255,180,0.30) 0%, transparent 60%),
            #0e1628;
          background-size: 200% 200%, 200% 200%, 200% 200%, auto;
          animation: aurora-glow 18s ease-in-out infinite;
          color: #fff;
        }
        .public-bg-img .public-title { color: #fff !important; }`
        : bgType === "waves"
          ? `
        @keyframes wave-shift {
          0% { background-position: center, 0px 92%, -300px 98%; }
          100% { background-position: center, 800px 92%, 500px 98%; }
        }
        .public-bg-img {
          background-color: #E8F4FD;
          background-image:
            none,
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 80'%3E%3Cpath fill='rgba(59%2C130%2C246%2C0.25)' d='M0,40 C100,10 300,70 500,35 C650,10 750,60 800,40 L800,80 L0,80Z'/%3E%3C/svg%3E"),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 80'%3E%3Cpath fill='rgba(59%2C130%2C246%2C0.15)' d='M0,50 C150,20 400,80 600,30 C720,0 780,50 800,55 L800,80 L0,80Z'/%3E%3C/svg%3E");
          background-repeat: no-repeat, repeat-x, repeat-x;
          background-size: cover, 800px 100px, 600px 80px;
          animation: wave-shift 10s linear infinite;
        }`
          : bgType === "mesh"
            ? `
        @keyframes mesh-drift {
          0%   { background-size: 140% 140%, 130% 130%, 150% 150%, 120% 120%, auto; }
          33%  { background-size: 160% 160%, 115% 115%, 135% 135%, 145% 145%, auto; }
          66%  { background-size: 125% 125%, 155% 155%, 120% 120%, 135% 135%, auto; }
          100% { background-size: 140% 140%, 130% 130%, 150% 150%, 120% 120%, auto; }
        }
        .public-bg-img {
          background:
            radial-gradient(ellipse at 15% 15%, rgba(255,180,180,0.65) 0%, transparent 50%),
            radial-gradient(ellipse at 85% 10%, rgba(180,180,255,0.65) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 90%, rgba(180,255,200,0.55) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 80%, rgba(255,200,240,0.55) 0%, transparent 50%),
            #ffffff;
          animation: mesh-drift 18s ease-in-out infinite;
        }`
            : bgType === "sunset"
              ? `
        @keyframes sunset-flow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .public-bg-img {
          background: linear-gradient(-45deg, #ff6b6b, #feca57, #ff9ff3, #ff6b9d, #f9ca24, #ff6b6b);
          background-size: 400% 400%;
          animation: sunset-flow 12s ease infinite;
        }`
              : bgType === "nebula"
                ? `
        @keyframes nebula-shift {
          0%, 100% { background-position: 0% 50%, 100% 50%, 50% 0%; }
          33% { background-position: 70% 20%, 30% 80%, 20% 70%; }
          66% { background-position: 30% 80%, 70% 20%, 80% 30%; }
        }
        .public-bg-img {
          background:
            radial-gradient(ellipse 120% 80% at 0% 50%, rgba(255,0,128,0.55) 0%, transparent 60%),
            radial-gradient(ellipse 120% 80% at 100% 50%, rgba(0,128,255,0.55) 0%, transparent 60%),
            radial-gradient(ellipse 100% 60% at 50% 0%, rgba(128,0,255,0.45) 0%, transparent 60%),
            #0a0a1a;
          background-size: 200% 200%, 200% 200%, 200% 200%, auto;
          animation: nebula-shift 16s ease-in-out infinite;
          color: #fff;
        }
        .public-bg-img .public-title { color: #fff !important; }`
                : bgType === "rose"
                  ? `
        @keyframes rose-drift {
          0%, 100% { background-position: 20% 20%, 80% 80%, 50% 50%; }
          33% { background-position: 70% 30%, 30% 70%, 80% 20%; }
          66% { background-position: 30% 70%, 70% 30%, 20% 80%; }
        }
        .public-bg-img {
          background:
            radial-gradient(ellipse 130% 90% at 20% 20%, rgba(255,150,200,0.75) 0%, transparent 55%),
            radial-gradient(ellipse 130% 90% at 80% 80%, rgba(255,100,180,0.65) 0%, transparent 55%),
            radial-gradient(ellipse 100% 70% at 50% 50%, rgba(255,200,230,0.5) 0%, transparent 60%),
            #fff0f6;
          background-size: 200% 200%, 200% 200%, 200% 200%, auto;
          animation: rose-drift 14s ease-in-out infinite;
        }`
                  : bgType === "neon"
                    ? `
        @keyframes neon-glow {
          0%, 100% { background-position: 0% 50%, 100% 50%, 50% 100%; }
          33% { background-position: 60% 20%, 40% 80%, 20% 40%; }
          66% { background-position: 40% 80%, 60% 20%, 80% 60%; }
        }
        .public-bg-img {
          background:
            radial-gradient(ellipse 120% 70% at 0% 50%, rgba(0,255,180,0.35) 0%, transparent 60%),
            radial-gradient(ellipse 120% 70% at 100% 50%, rgba(0,150,255,0.35) 0%, transparent 60%),
            radial-gradient(ellipse 90% 60% at 50% 100%, rgba(200,0,255,0.28) 0%, transparent 60%),
            #060614;
          background-size: 200% 200%, 200% 200%, 200% 200%, auto;
          animation: neon-glow 14s ease-in-out infinite;
          color: #fff;
        }
        .public-bg-img .public-title { color: #fff !important; }`
                    : bgType === "image" && theme.background_image_url
                      ? `.public-bg-img { background-image: url('${theme.background_image_url}'); background-size: cover; background-position: center; background-attachment: fixed; }`
                      : "";

  const css = `
    :root {
      --primary: ${theme.primary_color};
      --primary-foreground: ${theme.text_color};
      --secondary: ${theme.secondary_color};
      --secondary-foreground: ${theme.text_color};
      --background: ${theme.background_color};
      --foreground: ${theme.text_color};
      --accent: ${theme.accent_color};
      --accent-foreground: ${theme.text_color};
      --muted: ${theme.accent_color};
      --muted-foreground: ${theme.text_color.replace(
        /(\d+)%\s*$/,
        (_, n) => `${Math.min(100, parseInt(n) + 30)}%`,
      )};
      --radius: ${pageRadius};
      --font-heading: "${theme.font_heading}", ui-serif, serif;
      --font-body: "${pageFont}", ui-sans-serif, system-ui, sans-serif;

      /* Button tokens */
      --btn-bg: ${btnBg};
      --btn-text: ${btnText};
      --btn-radius: ${btnRadius};
      --btn-shadow: ${btnShadow};
    }

    /* Apply page font everywhere */
    body { font-family: var(--font-body); }

    /* Page text color override */
    ${theme.page_text_color ? `body { color: ${theme.page_text_color}; }` : ""}

    /* Title color override */
    ${theme.title_font_color ? `.public-title { color: ${theme.title_font_color} !important; }` : ""}

    /* Interactive / wallpaper background */
    ${interactiveBgCss}

    ${
      theme.wallpaper_effect && theme.wallpaper_effect !== "none" && bgType === "image"
        ? `.public-bg-img::before { content: ''; position: absolute; inset: 0; backdrop-filter: ${pageFilter}; pointer-events: none; }`
        : ""
    }
    ${
      theme.wallpaper_noise && bgType === "image"
        ? `.public-bg-img { background-image: url('${theme.background_image_url ?? ""}'), url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E"); }`
        : ""
    }

    /* Per-link attention animations — applied via .link-anim-* on individual cards */
    @keyframes btn-shake {
      0%, 100% { transform: translateX(0); }
      15% { transform: translateX(-4px) rotate(-1deg); }
      30% { transform: translateX(4px) rotate(1deg); }
      45% { transform: translateX(-3px); }
      60% { transform: translateX(3px); }
      75% { transform: translateX(-2px); }
    }
    @keyframes btn-pulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0,0,0,0.15); }
      50% { transform: scale(1.025); box-shadow: 0 0 0 6px rgba(0,0,0,0); }
    }
    @keyframes btn-bounce {
      0%, 100% { transform: translateY(0); animation-timing-function: cubic-bezier(0.8,0,1,1); }
      50% { transform: translateY(-5px); animation-timing-function: cubic-bezier(0,0,0.2,1); }
    }
    .link-anim-shake { animation: btn-shake 2.8s ease-in-out infinite; }
    .link-anim-pulse { animation: btn-pulse 2s ease-in-out infinite; }
    .link-anim-bounce { animation: btn-bounce 1.6s infinite; }

    /* Scroll-reveal — pure CSS staggered animation (no JS, no hydration issues) */
    @keyframes reveal {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .reveal-item { animation: reveal 0.45s ease both; }
    .reveal-item:nth-child(1) { animation-delay: 0.05s; }
    .reveal-item:nth-child(2) { animation-delay: 0.13s; }
    .reveal-item:nth-child(3) { animation-delay: 0.21s; }
    .reveal-item:nth-child(4) { animation-delay: 0.29s; }
    .reveal-item:nth-child(5) { animation-delay: 0.37s; }
    .reveal-item:nth-child(6) { animation-delay: 0.45s; }
    .reveal-item:nth-child(7) { animation-delay: 0.53s; }
    .reveal-item:nth-child(8) { animation-delay: 0.61s; }
  `;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
