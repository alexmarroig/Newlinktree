import { redirect } from "next/navigation";

import { DEFAULT_SLUG } from "@/lib/constants";

/**
 * Rota raiz — redireciona para o slug padrão da terapeuta.
 */
export default function RootPage() {
  redirect(`/${DEFAULT_SLUG}`);
}
