'use client';

import { Input } from '@nextui-org/input';
import { Button } from '@nextui-org/button';
import { useState } from 'react';
import { useRouter } from '@/navigation';

interface Props {
  addPersonText: string;
  analyzeText: string;
  paramId?: string;
}

export function AnalyzePeople({ addPersonText, analyzeText, paramId }: Props) {
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

  return (
    <div className='mt-8'>
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
