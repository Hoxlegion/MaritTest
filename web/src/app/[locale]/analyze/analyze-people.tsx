'use client';

import { Input } from '@nextui-org/input';
import { Button } from '@nextui-org/button';
import { useState } from 'react';
import { useRouter } from '@/navigation';
import { AdminTestResult } from '@/actions';
import { Card, CardBody, CardHeader } from '@nextui-org/card';

interface Props {
  addPersonText: string;
  analyzeText: string;
  paramId?: string;
  availableResults: AdminTestResult[];
}

export function AnalyzePeople({ addPersonText, analyzeText, paramId, availableResults }: Props) {
  const router = useRouter();
  const [ids, setIds] = useState<string[]>(paramId ? paramId.split(',') : []);
  const [currentId, setCurrentId] = useState<string>('');

  const addPerson = () => {
    if (currentId && !ids.includes(currentId)) {
      setIds([...ids, currentId]);
      setCurrentId('');
    }
  };

  const removePerson = (id: string) => {
    setIds(ids.filter((i) => i !== id));
  };

  const analyze = () => {
    console.log('Analyze clicked, ids:', ids);
    console.log('IDs length:', ids.length);
    
    if (ids.length >= 2) {
      const encodedIds = encodeURIComponent(ids.join(','));
      const url = `/analyze/${encodedIds}`;
      console.log('Navigating to:', url);
      router.push(url);
    } else {
      console.log('Not enough IDs to analyze');
    }
  };

  const formatDate = (dateStamp: any) => {
    const date = new Date(dateStamp);
    return date.toLocaleDateString('nl-NL', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className='mt-8'>
      {availableResults.length > 0 && (
        <Card className='mb-6'>
          <CardHeader>
            <h3 className='text-lg font-semibold'>
              Beschikbare Test Resultaten ({availableResults.length})
            </h3>
          </CardHeader>
          <CardBody>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto'>
              {availableResults.map((result) => (
                <div
                  key={result.id}
                  className='flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
                  onClick={() => {
                    if (!ids.includes(result.id)) {
                      setIds([...ids, result.id]);
                    }
                  }}
                >
                  <div className='flex flex-col'>
                    <span className='font-mono text-xs'>{result.id.slice(-8)}</span>
                    <span className='text-xs text-gray-500'>{formatDate(result.dateStamp)}</span>
                  </div>
                  <Button
                    size='sm'
                    color='primary'
                    variant='flat'
                    isDisabled={ids.includes(result.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!ids.includes(result.id)) {
                        setIds([...ids, result.id]);
                      }
                    }}
                  >
                    {ids.includes(result.id) ? '✓' : '+'}
                  </Button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <div className='flex gap-4 mb-4'>
        <Input
          type='text'
          label='Test ID'
          value={currentId}
          onChange={(e) => setCurrentId(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addPerson()}
          className='max-w-md'
        />
        <Button color='primary' onClick={addPerson}>
          {addPersonText}
        </Button>
      </div>

      {ids.length > 0 && (
        <div className='mb-4'>
          <h3 className='text-lg font-semibold mb-2'>
            Geselecteerde profielen ({ids.length})
          </h3>
          <div className='flex flex-wrap gap-2'>
            {ids.map((id) => (
              <div
                key={id}
                className='flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg'
              >
                <span className='font-mono text-sm'>{id.slice(-8)}</span>
                <button
                  onClick={() => removePerson(id)}
                  className='text-red-500 hover:text-red-700'
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        color='success'
        onClick={analyze}
        isDisabled={ids.length < 2}
        className='mt-4'
      >
        {analyzeText}
      </Button>
    </div>
  );
}
