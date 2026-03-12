import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// When true, unauthenticated users accessing protected pages are sent to /signup
// (showing the feature overview). Set to false to redirect to /login instead.
const REDIRECT_TO_SIGNUP = false;

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/status")) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPage =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/status") ||
    request.nextUrl.pathname.startsWith("/docs") ||
    request.nextUrl.pathname.startsWith("/pricing") ||
    request.nextUrl.pathname.startsWith("/privacy") ||
    request.nextUrl.pathname.startsWith("/terms");

  const isAuthOnlyPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup") ||
    request.nextUrl.pathname.startsWith("/auth");

  if (!user && !isPublicPage && !isAuthOnlyPage) {
    const url = request.nextUrl.clone();
    url.pathname = REDIRECT_TO_SIGNUP ? "/signup" : "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthOnlyPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|status/|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
