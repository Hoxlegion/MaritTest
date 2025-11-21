'use client';

import { Report, getTestAnswers } from '@/actions';
import { Answer } from '@/types';
import { Card, CardBody, CardHeader } from '@nextui-org/card';
import { Chip } from '@nextui-org/react';
import { getQuestionsWithCustom } from '@/lib/custom-questions';
import { useState, useEffect } from 'react';

interface Props {
  results: Report[];
}

interface QuestionAnalysis {
  questionId: string;
  questionText: string;
  domain: string;
  facet: number;
  choices: { text: string; score: number }[];
  answers: {
    profileId: string;
    score: number;
    choiceText: string;
  }[];
}

export function AnalyzeView({ results }: Props) {
  const [allAnswers, setAllAnswers] = useState<Answer[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get questions from the first result's language
  const questions = getQuestionsWithCustom(results[0].language);
  
  useEffect(() => {
    async function fetchAnswers() {
      try {
        const answersPromises = results.map(result => getTestAnswers(result.id));
        const fetchedAnswers = await Promise.all(answersPromises);
        setAllAnswers(fetchedAnswers);
      } catch (err) {
        setError('Fout bij het ophalen van antwoorden');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAnswers();
  }, [results]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody>
            <p>Laden...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody>
            <p className="text-red-500">{error}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Create a mapping of question ID to question text
  const questionMap = new Map(questions.map(q => [q.id, q]));

  // Build question analysis data
  const questionAnalysis: QuestionAnalysis[] = [];
  
  if (allAnswers.length > 0 && allAnswers[0].length > 0) {
    // Use first test as template for question order
    allAnswers[0].forEach((templateAnswer) => {
      const question = questionMap.get(templateAnswer.id);
      
      if (question) {
        questionAnalysis.push({
          questionId: templateAnswer.id,
          questionText: question.text,
          domain: templateAnswer.domain,
          facet: templateAnswer.facet,
          choices: question.choices || [],
          answers: results.map((result, index) => {
            const answer = allAnswers[index].find(a => a.id === templateAnswer.id);
            const score = answer?.score || 0;
            const choice = question.choices?.find(c => c.score === score);
            return {
              profileId: result.id,
              score: score,
              choiceText: choice?.text || `Score: ${score}`
            };
          })
        });
      }
    });
  }

  const getScoreColor = (score: number): "success" | "warning" | "danger" | "default" => {
    if (score >= 4) return 'success';
    if (score >= 3) return 'warning';
    if (score >= 2) return 'danger';
    return 'default';
  };

  const getDomainName = (domain: string) => {
    const names: { [key: string]: string } = {
      'O': 'Openheid',
      'C': 'Consciëntieusheid', 
      'E': 'Extraversie',
      'A': 'Vriendelijkheid',
      'N': 'Neuroticisme'
    };
    return names[domain] || domain;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <h2 className="text-2xl font-bold">
              Analyse van {results.length} profielen
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Vergelijk antwoorden per vraag van verschillende profielen
          </p>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Geselecteerde profielen:</h3>
            <div className="flex flex-wrap gap-2">
              {results.map((result, index) => (
                <Chip key={result.id} color="primary" variant="flat">
                  Profiel {index + 1}: {result.id.slice(-8)}
                </Chip>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-12">
                    #
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-48">
                    Domein
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vraag
                  </th>
                  {results.map((_, index) => (
                    <th key={index} className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      P{index + 1}
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Gem.
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {questionAnalysis.map((qa, qIndex) => {
                  const average = qa.answers.reduce((sum, a) => sum + a.score, 0) / qa.answers.length;
                  
                  return (
                    <tr key={qa.questionId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-mono">
                        {qIndex + 1}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{getDomainName(qa.domain)}</span>
                          <span className="text-xs text-gray-500">Facet {qa.facet}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm max-w-md">
                        {qa.questionText}
                      </td>
                      {qa.answers.map((answer, index) => (
                        <td key={index} className="px-3 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Chip
                              color={getScoreColor(answer.score)}
                              size="sm"
                              variant="flat"
                            >
                              {answer.score}
                            </Chip>
                            <span className="text-xs text-gray-600 dark:text-gray-400 max-w-[150px]">
                              {answer.choiceText}
                            </span>
                          </div>
                        </td>
                      ))}
                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        <Chip
                          color="secondary"
                          size="sm"
                          variant="flat"
                        >
                          {average.toFixed(1)}
                        </Chip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
