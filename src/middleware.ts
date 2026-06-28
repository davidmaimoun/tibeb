import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// next-intl handles locale detection + redirects.
// Admin route protection is enforced in the admin layout (server-side session
// check) to keep the middleware lightweight and edge-friendly.
export default createMiddleware(routing);

export const config = {
  // Match all paths except API, Next internals, and files with an extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
