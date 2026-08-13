import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip api routes, Next internals and files with an extension (static assets)
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
