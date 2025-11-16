import { title } from '@/components/primitives';
import { checkAdminAuth } from '@/actions';
import { getTranslations } from 'next-intl/server';
import { GetResultPage } from './get-result';
import { unstable_setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

interface Props {
  params: { locale: string };
}

export default async function ResultPage({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);
  
  // Check admin authentication
  const isAuthenticated = await checkAdminAuth();
  if (!isAuthenticated) {
    redirect('/admin');
  }
  
  const t = await getTranslations('getResult');

  return (
    <div className='h-[calc(60vh)]'>
      <h1 className={title()}>{t('result')}</h1>
      <div className='mt-10'>{t('explanation')}</div>
      <GetResultPage
        viewPreviousText={t('viewPrevious')}
        getResultsText={t('getResult')}
      />
    </div>
  );
}
