/**
 * Layout da área pública.
 * Mínimo de overhead — a página pública deve ser extremamente leve.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
