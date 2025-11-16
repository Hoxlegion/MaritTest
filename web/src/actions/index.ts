'use server';

import { connectToDatabase } from '@/db';
import { ObjectId } from 'mongodb';
import { B5Error, DbResult, Feedback, Answer } from '@/types';
import calculateScore from '@bigfive-org/score';
import generateResult, {
  getInfo,
  Language,
  Domain
} from '@bigfive-org/results';
import { createSession, verifySession, clearSession } from '@/lib/auth';

const collectionName = process.env.DB_COLLECTION || 'results';
const resultLanguages = getInfo().languages;

export type Report = {
  id: string;
  timestamp: number;
  availableLanguages: Language[];
  language: string;
  results: Domain[];
};

export async function getTestResult(
  id: string,
  language?: string
): Promise<Report | undefined> {
  'use server';
  try {
    const query = { _id: new ObjectId(id) };
    const db = await connectToDatabase();
    const collection = db.collection(collectionName);
    const report = await collection.findOne(query);
    if (!report) {
      console.error(`The test results with id ${id} are not found!`);
      throw new B5Error({
        name: 'NotFoundError',
        message: `The test results with id ${id} is not found in the database!`
      });
    }
    const selectedLanguage =
      language ||
      (!!resultLanguages.find((l) => l.id == report.lang) ? report.lang : 'en');
    const scores = calculateScore({ answers: report.answers });
    const results = generateResult({ lang: selectedLanguage, scores });
    return {
      id: report._id.toString(),
      timestamp: report.dateStamp,
      availableLanguages: resultLanguages,
      language: selectedLanguage,
      results
    };
  } catch (error) {
    if (error instanceof B5Error) {
      throw error;
    }
    throw new Error('Something wrong happend. Failed to get test result!');
  }
}

export async function saveTest(testResult: DbResult) {
  'use server';
  try {
    const db = await connectToDatabase();
    const collection = db.collection(collectionName);
    const result = await collection.insertOne(testResult);
    return { id: result.insertedId.toString() };
  } catch (error) {
    console.error(error);
    throw new B5Error({
      name: 'SavingError',
      message: 'Failed to save test result!'
    });
  }
}

export type FeebackState = {
  message: string;
  type: 'error' | 'success';
};

export async function saveFeedback(
  prevState: FeebackState,
  formData: FormData
): Promise<FeebackState> {
  'use server';
  const feedback: Feedback = {
    name: String(formData.get('name')),
    email: String(formData.get('email')),
    message: String(formData.get('message'))
  };
  try {
    const db = await connectToDatabase();
    const collection = db.collection('feedback');
    await collection.insertOne({ feedback });
    return {
      message: 'Sent successfully!',
      type: 'success'
    };
  } catch (error) {
    return {
      message: 'Error sending feedback!',
      type: 'error'
    };
  }
}

export type AdminTestResult = {
  id: string;
  testId: string;
  lang: string;
  dateStamp: Date;
  timeElapsed: number;
  answers: Answer[];
  invalid: boolean;
};

export async function getAllTestResults(password: string): Promise<AdminTestResult[]> {
  'use server';
  
  // Simple password check - in production, use proper authentication
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  if (password !== adminPassword) {
    console.log(adminPassword, password);
    throw new Error('Unauthorized');
  }

  try {
    const db = await connectToDatabase();
    const collection = db.collection(collectionName);
    const results = await collection
      .find({})
      .sort({ dateStamp: -1 })
      .limit(100)
      .toArray();

    return results.map(result => ({
      id: result._id.toString(),
      testId: result.testId,
      lang: result.lang,
      dateStamp: result.dateStamp,
      timeElapsed: result.timeElapsed,
      answers: result.answers,
      invalid: result.invalid
    }));
  } catch (error) {
    console.error('Error fetching test results:', error);
    throw new Error('Failed to fetch test results');
  }
}

// Authentication actions
export async function loginAdmin(password: string): Promise<{ success: boolean; error?: string }> {
  'use server';
  
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (password !== adminPassword) {
    return { success: false, error: 'Invalid password' };
  }
  
  await createSession();
  return { success: true };
}

export async function logoutAdmin() {
  'use server';
  await clearSession();
}

export async function checkAdminAuth(): Promise<boolean> {
  'use server';
  return await verifySession();
}

export async function getAllTestResultsProtected(): Promise<AdminTestResult[]> {
  'use server';
  
  const isAuthenticated = await verifySession();
  if (!isAuthenticated) {
    throw new Error('Unauthorized');
  }
  
  try {
    const db = await connectToDatabase();
    const results = await db.collection(collectionName).find({}).toArray();
    
    return results.map(result => ({
      id: result._id.toString(),
      scores: calculateScore({ answers: result.answers }),
      testId: result.testId,
      lang: result.lang,
      dateStamp: result.dateStamp,
      timeElapsed: result.timeElapsed,
      answers: result.answers,
      invalid: result.invalid
    }));
  } catch (error) {
    console.error('Error fetching test results:', error);
    throw new Error('Failed to fetch test results');
  }
}
