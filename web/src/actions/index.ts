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
const EXCLUDED_TEST_ID = '692051c011b9eb4a2d013adf'; // Change this to the actual testId you want to exclude

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

export async function createAverageTestResult(): Promise<{ id: string }> {
  'use server';
  
  const isAuthenticated = await verifySession();
  if (!isAuthenticated) {
    throw new Error('Unauthorized');
  }
  
  try {
    const db = await connectToDatabase();
    const collection = db.collection(collectionName);
    
    // Get all results except the excluded one
    const results = await collection.find({ 
      _id: { $ne: new ObjectId(EXCLUDED_TEST_ID) } 
    }).toArray();
    
    if (results.length === 0) {
      throw new Error('No test results found to average');
    }
    
    // Use the first test as template (to preserve question order and IDs)
    const templateTest = results[0];
    const numberOfTests = results.length;
    
    // Create a map to sum up scores by answer ID
    const scoresByAnswerId = new Map<string, number>();
    
    // Sum up all scores for each answer ID
    results.forEach(result => {
      result.answers.forEach((answer: any) => {
        const currentSum = scoresByAnswerId.get(answer.id) || 0;
        scoresByAnswerId.set(answer.id, currentSum + answer.score);
      });
    });
    
    // Create averaged answers using the template structure
    const averagedAnswers: Answer[] = templateTest.answers.map((templateAnswer: any) => {
      const totalScore = scoresByAnswerId.get(templateAnswer.id) || 0;
      const averageScore = Math.round(totalScore / numberOfTests);
      
      return {
        id: templateAnswer.id,
        domain: templateAnswer.domain,
        facet: templateAnswer.facet,
        score: averageScore
      };
    });
    
    // Create the average test result
    const averageTestResult: DbResult = {
      testId: 'average-result',
      lang: templateTest.lang || 'nl',
      dateStamp: new Date().toISOString(),
      timeElapsed: -1, // Special marker for average result
      answers: averagedAnswers,
      invalid: false
    };
    
    // Check if average result already exists
    const existingAverage = await collection.findOne({ testId: 'average-result' });
    
    if (existingAverage) {
      // Update existing average
      await collection.updateOne(
        { testId: 'average-result' },
        { $set: averageTestResult }
      );
      return { id: existingAverage._id.toString() };
    } else {
      // Insert new average
      const result = await collection.insertOne(averageTestResult);
      return { id: result.insertedId.toString() };
    }
  } catch (error) {
    console.error('Error creating average test result:', error);
    throw new Error('Failed to create average test result');
  }
}
