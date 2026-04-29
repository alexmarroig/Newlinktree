import { AlertTriangle, ArrowUpRight } from "lucide-react";

import { ETHOS_UPGRADE_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface AccessBlockedBannerProps {
  reasonCode?: string | null;
  status?: string | null;
}

const EXPLANATION_BY_REASON: Record<string, string> = {
  trial_expired:
    "Seu período de teste expirou. Para voltar a editar, ative um plano no ETHOS.",
  no_subscription:
    "Não identificamos uma assinatura ativa para esta conta.",
  blocked:
    "Sua conta está temporariamente bloqueada para edição.",
  temporarily_unavailable:
    "O editor está temporariamente indisponível. Tente novamente em instantes.",
};

const EXPLANATION_BY_STATUS: Record<string, string> = {
  trial_expired: EXPLANATION_BY_REASON.trial_expired ?? "",
  no_subscription: EXPLANATION_BY_REASON.no_subscription ?? "",
  blocked: EXPLANATION_BY_REASON.blocked ?? "",
  temporarily_unavailable: EXPLANATION_BY_REASON.temporarily_unavailable ?? "",
};

function normalizeKey(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function getExplanation(reasonCode?: string | null, status?: string | null) {
  const reasonKey = normalizeKey(reasonCode);
  const statusKey = normalizeKey(status);

  return (
    EXPLANATION_BY_REASON[reasonKey] ??
    EXPLANATION_BY_STATUS[statusKey] ??
    EXPLANATION_BY_STATUS.temporarily_unavailable
  );
}

export function AccessBlockedBanner({
  reasonCode,
  status,
}: AccessBlockedBannerProps) {
  const explanation = getExplanation(reasonCode, status);

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold">
              Seu acesso de edição está indisponível no momento.
            </p>
            <p className="text-sm">{explanation}</p>
          </div>

          <Button asChild size="sm" className="gap-1.5">
            <a href={ETHOS_UPGRADE_URL} target="_blank" rel="noreferrer">
              Fazer upgrade no ETHOS
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
