import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";

/** Call at the top of any protected admin page. Redirects to login if needed. */
export async function requireAdmin(locale: string) {
  const session = await auth();
  if (!session?.user) {
    redirect({ href: "/admin/login", locale });
  }
  return session!;
}
