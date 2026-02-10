import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected =
    pathname.startsWith('/patient') ||
    pathname.startsWith('/doctor') ||
    pathname.startsWith('/secretary') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/data-entry');

  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get('token')?.value;
  const role = req.cookies.get('role')?.value as
    | 'patient'
    | 'doctor'
    | 'secretary'
    | 'admin'
    | 'data-entry'
    | undefined;

  if (!token || !role) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  const roleRoot = `/${role}`;
  if (!pathname.startsWith(roleRoot)) {
    const url = req.nextUrl.clone();
    url.pathname = roleRoot;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/patient/:path*',
    '/doctor/:path*',
    '/secretary/:path*',
    '/admin/:path*',
    '/data-entry/:path*',
  ],
};
