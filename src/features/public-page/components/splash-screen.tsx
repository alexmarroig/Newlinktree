"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SplashScreenProps {
  avatarUrl?: string | null;
  name: string;
  title?: string | null;
  /** Override da frase. Se omitido, seleciona automaticamente pelo horário. */
  phrase?: string;
  /** Intervalo em dias entre exibições. Default: 7. */
  intervalDays?: number;
}

// ─── Frases por horário ───────────────────────────────────────────────────────

const PHRASES: { start: number; end: number; text: string }[] = [
  { start: 5,  end: 12, text: "Você acordou. Isso já é um começo." },
  { start: 12, end: 17, text: "Nem tudo que te cansa é visível." },
  { start: 17, end: 21, text: "Você aprendeu a dar conta… mas não a sentir." },
  { start: 21, end: 24, text: "Tem coisas que só aparecem quando você desacelera." },
  { start: 0,  end: 5,  text: "Você não precisa estar em crise para se cuidar." },
];

function getAutoPhrase(): string {
  const h = new Date().getHours();
  return PHRASES.find((p) => h >= p.start && h < p.end)?.text ?? PHRASES[1]!.text;
}

// ─── localStorage ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "biohub_splash_ts";

function shouldShow(intervalDays: number): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    return Date.now() - Number(raw) > intervalDays * 86_400_000;
  } catch {
    return false;
  }
}

function markShown(): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch { /* noop */ }
}

// ─── Stage machine ────────────────────────────────────────────────────────────
// null  → SSR / não determinado ainda
// 0     → apenas fundo + respiração (0–1.5s)
// 1     → frase entra (1.5–3s)
// 2     → identidade entra: avatar + nome (3–4s)
// 3     → fade-out (4–4.8s)
// "out" → desmontado

type Stage = null | 0 | 1 | 2 | 3 | "out";

// ─── Componente ───────────────────────────────────────────────────────────────

export function SplashScreen({
  avatarUrl,
  name,
  title,
  phrase,
  intervalDays = 7,
}: SplashScreenProps) {
  const [stage, setStage] = useState<Stage>(null);
  const [resolvedPhrase, setResolvedPhrase] = useState("");

  useEffect(() => {
    if (!shouldShow(intervalDays)) {
      setStage("out");
      return;
    }

    markShown();
    setResolvedPhrase(phrase ?? getAutoPhrase());
    setStage(0);

    const t1 = setTimeout(() => setStage(1), 1500);
    const t2 = setTimeout(() => setStage(2), 3000);
    const t3 = setTimeout(() => setStage(3), 4200);
    const t4 = setTimeout(() => setStage("out"), 5000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [intervalDays, phrase]);

  // SSR → null (sem hydration mismatch). Visita repetida → null.
  if (stage === null || stage === "out") return null;

  const showPhrase   = stage >= 1;
  const showIdentity = stage >= 2;
  const isExiting    = stage === 3;

  return (
    <div
      className={`splash-overlay${isExiting ? " splash-exit" : ""}`}
      aria-hidden="true"
      role="presentation"
    >
      {/* Orbs animados */}
      <div className="splash-orb splash-orb-1" />
      <div className="splash-orb splash-orb-2" />
      <div className="splash-orb splash-orb-3" />

      {/* Anéis de respiração */}
      <div className="splash-breathe-ring" />
      <div className="splash-breathe-ring-outer" />

      {/* Conteúdo central */}
      <div className="splash-content">
        {showPhrase && (
          <p className="splash-phrase">{resolvedPhrase}</p>
        )}

        {showIdentity && (
          <div className="splash-identity">
            {avatarUrl && (
              <div className="splash-avatar">
                <Image
                  src={avatarUrl}
                  alt={name}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover object-top"
                  priority
                />
              </div>
            )}

            <div className="splash-divider" />

            <div className="splash-name-block">
              <span className="splash-name">{name}</span>
              {title && <span className="splash-title">{title}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
