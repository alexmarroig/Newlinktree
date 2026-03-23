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

  // Button animation
  const btnAnimation = theme.button_animation ?? "none";
  const animationCss =
    btnAnimation === "none"
      ? ""
      : btnAnimation === "shake"
        ? `
    @keyframes btn-shake {
      0%, 100% { transform: translateX(0); }
      15% { transform: translateX(-4px) rotate(-1deg); }
      30% { transform: translateX(4px) rotate(1deg); }
      45% { transform: translateX(-3px); }
      60% { transform: translateX(3px); }
      75% { transform: translateX(-2px); }
    }
    .link-card { animation: btn-shake 2.8s ease-in-out infinite; }
    `
        : btnAnimation === "pulse"
          ? `
    @keyframes btn-pulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0,0,0,0.15); }
      50% { transform: scale(1.025); box-shadow: 0 0 0 6px rgba(0,0,0,0); }
    }
    .link-card { animation: btn-pulse 2s ease-in-out infinite; }
    `
          : btnAnimation === "bounce"
            ? `
    @keyframes btn-bounce {
      0%, 100% { transform: translateY(0); animation-timing-function: cubic-bezier(0.8,0,1,1); }
      50% { transform: translateY(-5px); animation-timing-function: cubic-bezier(0,0,0.2,1); }
    }
    .link-card { animation: btn-bounce 1.6s infinite; }
    `
            : "";

  // Wallpaper effect (mono, blur)
  let pageFilter = "none";
  if (theme.wallpaper_effect === "blur") pageFilter = "blur(8px)";
  else if (theme.wallpaper_effect === "mono") pageFilter = "grayscale(100%)";

  // Page font
  const pageFont = theme.page_font ?? theme.font_body ?? "Inter";

  const css = `
    :root {
      --primary: ${theme.primary_color};
      --primary-foreground: ${theme.background_color};
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

    /* Wallpaper background image with effect */
    ${
      theme.background_type === "image" && theme.background_image_url
        ? `.public-bg-img { background-image: url('${theme.background_image_url}'); background-size: cover; background-position: center; background-attachment: fixed; }`
        : ""
    }
    ${
      theme.wallpaper_effect && theme.wallpaper_effect !== "none"
        ? `.public-bg-img::before { content: ''; position: absolute; inset: 0; backdrop-filter: ${pageFilter}; pointer-events: none; }`
        : ""
    }
    ${
      theme.wallpaper_noise
        ? `.public-bg-img { background-image: url('${theme.background_image_url ?? ""}'), url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E"); }`
        : ""
    }

    ${animationCss}
  `;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
