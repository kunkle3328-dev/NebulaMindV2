/*
 * AI service layer for NebulaMind.
 *
 * This module provides functions that interface with the backend API to
 * perform AI-related operations, such as answering questions, generating
 * flashcards, quizzes, reports and other artifacts.  These helpers wrap
 * HTTP requests and hide the details of the API from the rest of the
 * application.
 *
 * NOTE: The actual endpoints used here are placeholders.  In a real
 * deployment these would correspond to API routes on your server that
 * proxy requests to a generative model (e.g. Google Gemini, OpenAI GPT).
 */

import { Flashcard, QuizQuestion } from '../types';

// Generic helper for making POST requests to the AI backend.  Throws if
// the request fails or the response contains an error.
async function postJson<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with status ${res.status}`);
  }
  const data = await res.json();
  if ('error' in data) {
    throw new Error(data.error);
  }
  return data as T;
}

/**
 * Generate an answer to a user question using the notebook's sources.  This
 * function sends the prompt to the backend and returns the model's full
 * response text.  The backend is expected to ground the answer in the
 * notebook's context and return citations in the result.
 */
export async function generateAnswer(notebookId: string, prompt: string): Promise<{ text: string; citations?: string[] }> {
  return postJson<{ text: string; citations?: string[] }>(
    '/api/ai/answer',
    { notebookId, prompt }
  );
}

/**
 * Request a set of flashcards derived from the notebook's sources.  The
 * backend should return an array of flashcard objects with unique ids,
 * questions and answers.  These flashcards can then be studied by the
 * user in the FlashcardsTab.
 */
export async function generateFlashcards(notebookId: string, count = 10): Promise<Flashcard[]> {
  const result = await postJson<{ flashcards: Flashcard[] }>('/api/ai/flashcards', {
    notebookId,
    count,
  });
  return result.flashcards;
}

/**
 * Request a quiz based on the notebook's sources.  The backend returns a set
 * of quiz questions.  Each question may include multiple choice options or
 * be free-form.  The client can present the quiz to the user and later
 * display the correct answers.
 */
export async function generateQuiz(notebookId: string, count = 5): Promise<QuizQuestion[]> {
  const result = await postJson<{ questions: QuizQuestion[] }>('/api/ai/quiz', {
    notebookId,
    count,
  });
  return result.questions;
}

/**
 * Generate a report from the notebook's sources.  Reports can be of various
 * styles (e.g. "briefing", "blog", "studyGuide").  The backend returns
 * markdown or plain text content which can be rendered in the UI.  The
 * returned object includes a title and body.
 */
export async function generateReport(
  notebookId: string,
  style: 'briefing' | 'blog' | 'studyGuide' | 'timeline' = 'briefing'
): Promise<{ title: string; body: string }> {
  return postJson<{ title: string; body: string }>('/api/ai/report', {
    notebookId,
    style,
  });
}

/**
 * Generate an audio overview for the notebook.  The format can be one of
 * several conversation types inspired by NotebookLM (e.g. deep dive,
 * brief, critique, debate).  The backend should return the URL of the
 * generated audio file and any metadata needed for playback.
 */
export async function generateAudioOverview(
  notebookId: string,
  format: 'deepDive' | 'brief' | 'critique' | 'debate' = 'deepDive',
  length: 'short' | 'default' | 'long' = 'default',
  language: string = 'en'
): Promise<{ audioUrl: string; title: string }> {
  return postJson<{ audioUrl: string; title: string }>('/api/ai/audioOverview', {
    notebookId,
    format,
    length,
    language,
  });
}

/**
 * Generate a simple mind map of the notebook's sources.  The backend
 * returns a nested structure representing the main topics and their
 * relationships.  Clients can render this as a tree or graph.  The
 * returned nodes each have a title and an array of children.
 */
export async function generateMindMap(notebookId: string): Promise<any> {
  return postJson<any>('/api/ai/mindMap', { notebookId });
}

/**
 * Gather all selected notes into a single unified note.  If no note IDs
 * are provided, the backend should merge all existing notes in the
 * notebook.  Returns the content of the new note.
 */
export async function unifyNotes(notebookId: string, noteIds?: string[]): Promise<{ content: string }> {
  return postJson<{ content: string }>('/api/ai/unifyNotes', { notebookId, noteIds });
}

/**
 * Ask the AI for constructive feedback on a piece of prose or argument.
 * The backend returns a critique that can help improve the user's writing.
 */
export async function critiqueText(notebookId: string, text: string): Promise<{ critique: string }> {
  return postJson<{ critique: string }>('/api/ai/critique', { notebookId, text });
}

/**
 * Fetch the textual content of a web page.  In production this function
 * should call a server‑side scraper that handles CORS and extraction.
 * During development we fall back to a simple fetch of the page and
 * return its plain text content.  If extraction fails we return an
 * explanatory message.
 */
export async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    const text = await res.text();
    // Remove HTML tags to produce plain text; this is a naive implementation.
    const plain = text.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ');
    return plain.trim() || `Retrieved content from ${url}`;
  } catch (err) {
    console.warn('Failed to fetch website content', err);
    return `Could not fetch content from ${url}.`;
  }
}

/**
 * Process an uploaded file using a generative model to extract text.  In
 * a real deployment this would forward the file to a backend that calls
 * a multimodal model (e.g. Gemini) to transcribe audio or extract text
 * from images and PDFs.  Here we simply read the file as text when
 * possible or return a placeholder.  Supported MIME types include
 * text/plain and application/pdf.  For unsupported types the file name is
 * returned.
 */
export async function processFileWithGemini(file: File, mimeType: string): Promise<string> {
  try {
    if (mimeType.startsWith('text/')) {
      const text = await file.text();
      return text;
    }
    // For binary files we cannot extract text client‑side; return a stub.
    return `Uploaded file ${file.name} of type ${mimeType} has been received. Text extraction requires server‑side processing.`;
  } catch (err) {
    console.error('Failed to process file', err);
    return `Could not process file ${file.name}.`;
  }
}