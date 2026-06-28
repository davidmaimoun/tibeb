"use server";

import { signOut } from "@/lib/auth";

export async function logoutAction(locale: string) {
  await signOut({ redirectTo: `/${locale}/admin/login` });
}
