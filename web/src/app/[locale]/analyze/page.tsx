import { title } from '@/components/primitives';
import { getTranslations } from 'next-intl/server';
import { AnalyzePeople } from './analyze-people';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { checkAdminAuth } from '@/actions';
import { redirect } from 'next/navigation';

interface Props {
  params: { locale: string };
  searchParams: { id: string };
}

export default async function AnalyzePage({
  params: { locale },
  searchParams: { id }
}: Props) {
  unstable_setRequestLocale(locale);
  
  // Check admin authentication
  const isAuthenticated = await checkAdminAuth();
  if (!isAuthenticated) {
    redirect('/admin');
  }

  const t = await getTranslations('getAnalyze');
  return (
    <div className='h-[calc(60vh)]'>
      <h1 className={title()}>Analyseer Antwoorden</h1>
      <br />
      <br />
      <span className='mt-2'>Selecteer meerdere profielen om de antwoorden per vraag naast elkaar te bekijken.</span>
      <Suspense fallback='loading...'>
        <AnalyzePeople
          addPersonText="Voeg profiel toe"
          analyzeText="Analyseer Antwoorden"
          paramId={id}
        />
      </Suspense>
    </div>
  );
}
