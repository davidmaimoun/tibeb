"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

/** Returns "error" on bad credentials; redirects on success. */
export async function loginAction(
  locale: string,
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: `/${locale}/admin`,
    });
    return null;
  } catch (error) {
    // signIn throws a redirect on success — that must propagate.
    if (error instanceof AuthError) return "error";
    throw error;
  }
}
