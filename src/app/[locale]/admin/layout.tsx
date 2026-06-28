import { setRequestLocale } from "next-intl/server";

// Visual wrapper only — no auth here so the login page renders. Protected pages
// call requireAdmin() themselves.
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <div className="min-h-screen bg-cream-deep/30">{children}</div>;
}
