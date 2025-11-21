'use client';

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue
} from '@nextui-org/table';
import {
  DeleteIcon,
  EditIcon,
  PersonIcon,
  ResultIcon
} from '@/components/icons';
import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';
import { Card, CardBody, CardHeader } from '@nextui-org/card';
import { AdminTestResult } from '@/actions';
import React, { useState } from 'react';
import { base64url, formatId, validId } from '@/lib/helpers';
import { useRouter } from '@/navigation';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@nextui-org/modal';

interface CompareProps {
  addPersonText: string;
  comparePeopleText: string;
  paramId?: string;
  availableResults: AdminTestResult[];
}

export const ComparePeople = ({
  addPersonText,
  comparePeopleText,
  paramId,
  availableResults
}: CompareProps) => {
  const router = useRouter();
  const columns = [
    {
      key: 'name',
      label: 'NAME'
    },
    {
      key: 'id',
      label: 'ID'
    },
    {
      key: 'actions',
      label: 'ACTIONS'
    }
  ];

  type Row = {
    id: string;
    name: string;
  };
  const [rows, setRows] = useState<Row[]>([]);
  const [name, setName] = useState<string>('');
  const [id, setId] = useState(paramId ?? '');

  const [editName, setEditName] = useState<string>('');
  const [editId, setEditId] = useState<string>('');
  const [editIndex, setEditIndex] = useState<number>();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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

  const isInvalidId = React.useMemo(() => {
    if (id === '') return false;

    const newId = formatId(id);
    if (rows.some((item) => item.id === newId)) return true;

    return !validId(newId);
  }, [id, rows]);

  const isInvalidEditId = React.useMemo(() => {
    if (editId === '') return false;

    const newId = formatId(editId);
    return !validId(newId);
  }, [editId]);

  function deleteItem(id: string) {
    setRows((prev) => {
      return prev.filter((item) => item.id !== id);
    });
  }

  function addPerson() {
    const newId = formatId(id);
    if (name && id && !isInvalidId) {
      setRows((prev) => {
        return [...prev, { id: newId, name }];
      });
      setName('');
      setId('');
    }
  }

  function comparePeople() {
    const urlParam = base64url.encode(JSON.stringify(rows));
    router.push(`/compare/${urlParam}`);
  }

  function onOpenEditPerson(onOpen: () => void, item: Row) {
    setEditName(item.name);
    setEditId(item.id);
    setEditIndex(rows.findIndex(({ id }) => id === item.id));
    onOpen();
  }

  function editPerson(onClose: () => void) {
    const newId = formatId(editId);
    if (editName && editId && !isInvalidEditId && editIndex !== undefined) {
      setRows((prev) => {
        const updatedRows = [...prev];
        updatedRows[editIndex] = { id: newId, name: editName };
        return updatedRows;
      });
      setEditName('');
      setEditId('');
      setEditIndex(undefined);
      onClose();
    }
  }

  return (
    <div className='w-full flex flex-col gap-4 mt-4'>
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
                    const newId = result.id;
                    if (!rows.some((item) => item.id === newId)) {
                      setRows([...rows, { id: newId, name: `Test ${result.id.slice(-8)}` }]);
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
                    isDisabled={rows.some((item) => item.id === result.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      const newId = result.id;
                      if (!rows.some((item) => item.id === newId)) {
                        setRows([...rows, { id: newId, name: `Test ${result.id.slice(-8)}` }]);
                      }
                    }}
                  >
                    {rows.some((item) => item.id === result.id) ? '✓' : '+'}
                  </Button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
      <div className='flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4 items-start'>
        <Input
          type='text'
          label='Name'
          autoFocus
          labelPlacement='outside'
          placeholder='Arthur Dent'
          startContent={
            <PersonIcon className='text-2xl text-default-400 pointer-events-none flex-shrink-0' />
          }
          value={name}
          onValueChange={setName}
        />
        <Input
          type='text'
          label='ID'
          labelPlacement='outside'
          placeholder='58a70606a835c400c8b38e84'
          startContent={
            <ResultIcon className='text-2xl text-default-400 pointer-events-none flex-shrink-0' />
          }
          value={id}
          onValueChange={setId}
          isInvalid={isInvalidId}
          errorMessage={
            isInvalidId && 'Please enter a valid ID and not a duplicate.'
          }
        />
        <div className='flex-grow h-16 place-content-end'>
          <Button
            color='primary'
            className='flex-shrink-0'
            onClick={addPerson}
            isDisabled={!name || !id || isInvalidId}
          >
            {addPersonText}
          </Button>
        </div>
      </div>
      <div>
        <Table hideHeader aria-label='List of persons to compare' isStriped>
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>
          <TableBody items={rows} emptyContent='No rows to display.'>
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) =>
                  columnKey === 'actions' ? (
                    <TableCell className='flex justify-end'>
                      <Button
                        isIconOnly
                        variant='light'
                        aria-label='Edit'
                        onPress={() => onOpenEditPerson(onOpen, item)}
                      >
                        <EditIcon />
                      </Button>
                      <Button
                        isIconOnly
                        variant='light'
                        aria-label='Delete'
                        onClick={() => deleteItem(item.id)}
                      >
                        <DeleteIcon />
                      </Button>
                    </TableCell>
                  ) : (
                    <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                  )
                }
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Button
          color='primary'
          className='mt-4'
          isDisabled={rows.length < 2}
          onClick={comparePeople}
        >
          {comparePeopleText}
        </Button>
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement='center'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                Edit person
              </ModalHeader>
              <ModalBody>
                <Input
                  type='text'
                  autoFocus
                  label='Name'
                  labelPlacement='outside'
                  placeholder='Arthur Dent'
                  startContent={
                    <PersonIcon className='text-2xl text-default-400 pointer-events-none flex-shrink-0' />
                  }
                  value={editName}
                  onValueChange={setEditName}
                />
                <Input
                  type='text'
                  label='ID'
                  labelPlacement='outside'
                  placeholder='58a70606a835c400c8b38e84'
                  startContent={
                    <ResultIcon className='text-2xl text-default-400 pointer-events-none flex-shrink-0' />
                  }
                  value={editId}
                  onValueChange={setEditId}
                  isInvalid={isInvalidEditId}
                  errorMessage={isInvalidEditId && 'Please enter a valid ID.'}
                />
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  Close
                </Button>
                <Button color='primary' onPress={() => editPerson(onClose)}>
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
