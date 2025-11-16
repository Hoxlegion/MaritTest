import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { title } from '@/components/primitives';
import { Card, CardBody, CardHeader } from '@nextui-org/card';
import { ClockCircleLinearIcon } from '@nextui-org/shared-icons';
import Link from 'next/link';

type Props = {
  params: { locale: string };
};

export default async function ThankYouPage({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="flex flex-col items-center gap-4">
        <ClockCircleLinearIcon className="w-24 h-24 text-green-500" />
        <h1 className={title({ size: 'lg' })}>{t('thankyou.title')}</h1>
      </div>
      
      <Card className="max-w-md w-full">
        <CardHeader className="pb-0 pt-6 px-6 flex-col items-center">
          <h2 className="text-xl font-semibold text-center">
            {t('thankyou.subtitle')}
          </h2>
        </CardHeader>
        <CardBody className="px-6 py-6">
          <div className="text-center space-y-4">
            <p className="text-default-600">
              {t('thankyou.message')}
            </p>
            <p className="text-sm text-default-500">
              {t('thankyou.description')}
            </p>
          </div>
        </CardBody>
      </Card>

      <Link 
        href="/"
        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        Terug naar home
      </Link>
    </div>
  );
}