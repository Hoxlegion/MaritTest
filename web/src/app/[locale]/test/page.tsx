import { getQuestionsWithCustomDutch } from '@/lib/custom-questions';
import { Survey } from './survey';
import { useTranslations } from 'next-intl';
import { saveTest } from '@/actions';
import { unstable_setRequestLocale } from 'next-intl/server';

interface Props {
  params: { locale: string };
  searchParams: { lang?: string };
}

export default function TestPage({
  params: { locale },
  searchParams: { lang }
}: Props) {
  unstable_setRequestLocale(locale);
  // Force Dutch language for the test questions
  const language = 'nl';
  const questions = getQuestionsWithCustomDutch(language);
  const t = useTranslations('test');
  return (
    <>
      <Survey
        questions={questions}
        nextText={t('next')}
        prevText={t('back')}
        resultsText={t('seeResults')}
        saveTest={saveTest}
        language={language}
      />
    </>
  );
}
