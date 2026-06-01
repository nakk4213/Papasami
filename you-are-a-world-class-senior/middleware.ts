import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const user = req.auth?.user;
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/dashboard/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", "/admin");
      return NextResponse.redirect(loginUrl);
    }

    if (user.role === "ADMIN") {
      const adminUrl = new URL(pathname.replace("/dashboard/admin", "/admin"), req.url);
      return NextResponse.redirect(adminUrl);
    }

    return NextResponse.redirect(new URL("/dashboard/client", req.url));
  }

  if (pathname.startsWith("/dashboard/client")) {
    if (!user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (user.role !== "CLIENT") {
      return NextResponse.redirect(new URL(user.role === "ADMIN" ? "/admin" : "/dashboard/designer", req.url));
    }
  }

  if (pathname.startsWith("/dashboard/designer")) {
    if (!user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (user.role !== "DESIGNER") {
      return NextResponse.redirect(new URL(user.role === "ADMIN" ? "/admin" : "/dashboard/client", req.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/client", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"]
};
