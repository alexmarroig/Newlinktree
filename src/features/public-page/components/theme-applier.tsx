import type { Theme } from "@/types";

interface ThemeApplierProps {
  theme: Theme;
}

/**
 * Injeta CSS variables do tema personalizado no <style> inline.
 * Server Component — zero overhead cliente.
 */
export function ThemeApplier({ theme }: ThemeApplierProps) {
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
      --radius: ${
        theme.border_radius === "sm"
          ? "0.5rem"
          : theme.border_radius === "md"
            ? "0.625rem"
            : theme.border_radius === "xl"
              ? "1.25rem"
              : "0.75rem"
      };
      --font-heading: "${theme.font_heading}", ui-serif, serif;
      --font-body: "${theme.font_body}", ui-sans-serif, system-ui, sans-serif;
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
