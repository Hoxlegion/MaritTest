import { title } from '@/components/primitives';
import { getTranslations } from 'next-intl/server';
import { ComparePeople } from './compare-people';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { checkAdminAuth } from '@/actions';
import { redirect } from 'next/navigation';

interface Props {
  params: { locale: string };
  searchParams: { id: string };
}

export default async function ComparePage({
  params: { locale },
  searchParams: { id }
}: Props) {
  unstable_setRequestLocale(locale);
  
  // Check admin authentication
  const isAuthenticated = await checkAdminAuth();
  if (!isAuthenticated) {
    redirect('/admin');
  }

  const t = await getTranslations('getCompare');
  return (
    <div className='h-[calc(60vh)]'>
      <h1 className={title()}>{t('title')}</h1>
      <br />
      <br />
      <span className='mt-2'>{t('description1')}</span>
      <Suspense fallback='loading...'>
        <ComparePeople
          addPersonText={t('addPerson')}
          comparePeopleText={t('comparePeople')}
          paramId={id}
        />
      </Suspense>
    </div>
  );
}
