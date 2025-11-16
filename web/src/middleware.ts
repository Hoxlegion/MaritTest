import createMiddleware from 'next-intl/middleware';
import { localePrefix } from './navigation';
import { locales } from './config/site';

export default createMiddleware({
  locales,
  localePrefix,
  defaultLocale: 'nl'
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    '/',
    '/(nl|en)/:path*',
    '/((?!_next|_vercel|.*\\..*).*)'  
  ]
};