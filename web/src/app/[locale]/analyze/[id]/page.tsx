import { getTestResult, checkAdminAuth } from '@/actions';
import { redirect } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { AnalyzeView } from './analyze-view';

interface Props {
  params: { id: string; locale: string };
}

export default async function AnalyzeResultsPage({
  params: { id, locale }
}: Props) {
  unstable_setRequestLocale(locale);

  // Check admin authentication
  const isAuthenticated = await checkAdminAuth();
  if (!isAuthenticated) {
    redirect('/admin');
  }

  // Decode the URL-encoded IDs
  const decodedId = decodeURIComponent(id);
  const ids = decodedId.split(',');

  if (ids.length < 2) {
    redirect('/analyze');
  }

  try {
    const results = await Promise.all(
      ids.map(async (testId) => {
        const result = await getTestResult(testId, locale);
        return result;
      })
    );

    // Filter out any undefined results
    const validResults = results.filter((r) => r !== undefined);

    if (validResults.length < 2) {
      redirect('/analyze');
    }

    return <AnalyzeView results={validResults} />;
  } catch (error) {
    console.error('Error fetching test results:', error);
    redirect('/analyze');
  }
}
