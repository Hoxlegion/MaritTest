'use client';

import { useState } from 'react';
import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';
import { Card, CardBody, CardHeader } from '@nextui-org/card';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@nextui-org/table';
import { getAllTestResults, AdminTestResult, getTestResult } from '@/actions';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@nextui-org/modal';
import calculateScore from '@bigfive-org/score';
import { Chip } from '@nextui-org/react';
import { Link } from '@/navigation';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [results, setResults] = useState<AdminTestResult[]>([]);``
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedResult, setSelectedResult] = useState<AdminTestResult | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLogin = async () => {
    if (!password) {
      setError('Voer een wachtwoord in');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const testResults = await getAllTestResults(password);
      setResults(testResults);
      setIsAuthenticated(true);
    } catch (err) {
      setError('Ongeldig wachtwoord');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (result: AdminTestResult) => {
    setSelectedResult(result);
    onOpen();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('nl-NL');
  };

  const formatTimeElapsed = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getPersonalityScores = (answers: any[]) => {
    try {
      const scores = calculateScore({ answers });
      return Object.entries(scores).map(([domain, data]: [string, any]) => ({
        domain: getDomainName(domain),
        score: data.score,
        result: data.result
      }));
    } catch (error) {
      return [];
    }
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

  const getResultColor = (result: string) => {
    const colors: { [key: string]: "success" | "warning" | "danger" | "default" | "primary" | "secondary" } = {
      'high': 'success',
      'neutral': 'warning', 
      'low': 'danger'
    };
    return colors[result] || 'default';
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <Card className="max-w-md w-full">
          <CardHeader className="pb-0 pt-6 px-6">
            <h1 className="text-2xl font-bold">Admin Login</h1>
          </CardHeader>
          <CardBody className="px-6 py-6">
            <div className="space-y-4">
              <Input
                type="password"
                label="Wachtwoord"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
              <Button 
                color="primary" 
                fullWidth 
                onPress={handleLogin}
                isLoading={loading}
              >
                Inloggen
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Test Resultaten Admin</h1>
        <div className="flex gap-2">
          <Button 
            as={Link}
            href="/compare"
            color="secondary" 
            variant="flat"
          >
            Vergelijk Resultaten
          </Button>
          <Button 
            color="danger" 
            variant="flat"
            onPress={() => {
              setIsAuthenticated(false);
              setPassword('');
              setResults([]);
            }}
          >
            Uitloggen
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">
            Recente Test Resultaten ({results.length})
          </h2>
        </CardHeader>
        <CardBody>
          <Table aria-label="Test results table">
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>Datum</TableColumn>
              <TableColumn>Taal</TableColumn>
              <TableColumn>Tijd</TableColumn>
              <TableColumn>Vragen</TableColumn>
              <TableColumn>Acties</TableColumn>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-mono text-sm">
                    {result.id.slice(-8)}
                  </TableCell>
                  <TableCell>{formatDate(result.dateStamp)}</TableCell>
                  <TableCell>{result.lang.toUpperCase()}</TableCell>
                  <TableCell>{formatTimeElapsed(result.timeElapsed)}</TableCell>
                  <TableCell>{result.answers.length}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        color="primary" 
                        variant="flat"
                        onPress={() => handleViewDetails(result)}
                      >
                        Bekijk Details
                      </Button>
                      <Button 
                        as={Link}
                        href={`/result/${result.id}`}
                        size="sm" 
                        color="success" 
                        variant="flat"
                      >
                        Bekijk Resultaat
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Test Resultaat Details
          </ModalHeader>
          <ModalBody>
            {selectedResult && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold">Test ID:</p>
                    <p className="font-mono text-sm">{selectedResult.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Datum:</p>
                    <p>{formatDate(selectedResult.dateStamp)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Taal:</p>
                    <p>{selectedResult.lang.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Test Tijd:</p>
                    <p>{formatTimeElapsed(selectedResult.timeElapsed)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Persoonlijkheidsscores</h3>
                  <div className="space-y-3">
                    {getPersonalityScores(selectedResult.answers).map((score, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{score.domain}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{score.score}</span>
                          <Chip
                            color={getResultColor(score.result)}
                            size="sm"
                            variant="flat"
                          >
                            {score.result}
                          </Chip>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Antwoorden ({selectedResult.answers.length})
                  </h3>
                  <div className="max-h-64 overflow-y-auto">
                    <Table aria-label="Answers table" className="text-sm">
                      <TableHeader>
                        <TableColumn>Domein</TableColumn>
                        <TableColumn>Facet</TableColumn>
                        <TableColumn>Score</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {selectedResult.answers.map((answer, index) => (
                          <TableRow key={index}>
                            <TableCell>{answer.domain}</TableCell>
                            <TableCell>{answer.facet}</TableCell>
                            <TableCell>{answer.score}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onPress={onClose}>
              Sluit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}