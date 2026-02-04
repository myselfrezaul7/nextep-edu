import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    locales: ['en', 'bn'],
    defaultLocale: 'en'
});

export const config = {
    matcher: ['/', '/(bn|en)/:path*']
};
