import { getQuestionsWithCustom, getAvailableLanguages } from '@/lib/custom-questions';
import { Survey } from './survey';
import { useTranslations } from 'next-intl';
import { saveTest } from '@/actions';
import { unstable_setRequestLocale } from 'next-intl/server';
import { TestLanguageSwitch } from './test-language-switch';

const questionLanguages = getAvailableLanguages();

interface Props {
  params: { locale: string };
  searchParams: { lang?: string };
}

export default function TestPage({
  params: { locale },
  searchParams: { lang }
}: Props) {
  unstable_setRequestLocale(locale);
  
  // Use the lang parameter or default to locale if it's supported, otherwise English
  const language =
    lang || (questionLanguages.some((l) => l.id === locale) ? locale : 'en');
  
  const questions = getQuestionsWithCustom(language);
  const t = useTranslations('test');
  
  return (
    <>
      <div className='flex'>
        <TestLanguageSwitch
          availableLanguages={questionLanguages}
          language={language}
        />
      </div>
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
