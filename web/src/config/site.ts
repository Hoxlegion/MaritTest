import { getTranslations } from 'next-intl/server';

export type SiteConfig = typeof siteConfig;

export const basePath = 'https://maritperceptietest.up.railway.app';
export const supportEmail = 'hoxlegion@gmail.com';

export type Language = {
  code: string;
  name: string;
  countryCode?: string;
  map?: string[];
};

export const languages: Language[] = [
  { code: 'nl', name: 'Nederlands', countryCode: 'nl', map: ['nl-NL'] },
  { code: 'en', name: 'English', countryCode: 'us', map: ['en-GB'] }
];

export const locales = languages.map((lang) => lang.code) as string[];

export const siteConfig = {
  name: 'Hoe zie jij Marit Test',
  creator: '@Timo',
  description:
    'Learn to know yourself better with a free, open-source personality test.',
  navItems: [
    {
      label: 'home',
      href: '/'
    },
    {
      label: 'start_test',
      href: '/test'
    },
  ],
  navMenuItems: [
    {
      label: 'home',
      href: '/'
    },
    {
      label: 'start_test',
      href: '/test'
    },
  ],
  footerLinks: [
    {
      label: 'home',
      href: '/'
    },
  ],
};

export const getNavItems = async ({
  locale,
  linkType
}: {
  locale: string;
  linkType: 'navItems' | 'navMenuItems' | 'footerLinks';
}) => {
  const t = await getTranslations({ locale, namespace: 'toolbar' });
  return siteConfig[linkType].map((link) => ({
    label: t(`${link.label}`),
    href: link.href
  }));
};
