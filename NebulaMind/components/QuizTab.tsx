import React, { useState } from 'react';
import { Notebook, QuizQuestion } from '../types';
import { generateQuiz } from '../services/ai';

interface Props {
  notebook: Notebook;
}

/**
 * QuizTab allows users to test their knowledge of the notebook's sources via
 * AI-generated questions.  Each quiz session consists of a set of questions
 * returned from the backend.  After answering all questions the user can
 * review the correct answers.
 */
const QuizTab: React.FC<Props> = ({ notebook }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const qs = await generateQuiz(notebook.id, 5);
      setQuestions(qs);
      setCurrentIndex(0);
      setAnswers({});
      setShowResults(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const recordAnswer = (questionId: string, value: number | string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // End of quiz
      setShowResults(true);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-center">No quiz generated yet.</p>
        <button
          onClick={handleGenerate}
          disabled={loading || notebook.sources.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {loading ? 'Generating…' : 'Generate Quiz'}
        </button>
        {notebook.sources.length === 0 && (
          <p className="text-sm text-red-400">Add some sources first to generate a quiz.</p>
        )}
      </div>
    );
  }

  // If results should be shown, display an overview comparing user answers and correct answers.
  if (showResults) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold">Quiz Results</h2>
        {questions.map((q) => {
          const userAns = answers[q.id];
          const correct = q.options && typeof q.correctIndex === 'number'
            ? q.options[q.correctIndex]
            : q.answer;
          const isCorrect = userAns === correct;
          return (
            <div key={q.id} className="p-4 border border-gray-700 rounded bg-gray-800">
              <p className="font-medium mb-2">{q.prompt}</p>
              <p className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                Your answer: {typeof userAns === 'number' && q.options ? q.options[userAns] : userAns || '—'}
              </p>
              <p className="text-green-300">Correct answer: {correct}</p>
            </div>
          );
        })}
        <button
          onClick={handleGenerate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Generate New Quiz
        </button>
      </div>
    );
  }

  // Otherwise display current question
  const q = questions[currentIndex];
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-400">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
        >
          {loading ? 'Regenerating…' : 'Regenerate'}
        </button>
      </div>
      <div className="border border-gray-700 rounded p-6 bg-gray-800">
        <p className="text-lg font-semibold mb-4">{q.prompt}</p>
        {q.options ? (
          <div className="space-y-2">
            {q.options.map((opt, idx) => (
              <label key={idx} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={q.id}
                  value={idx}
                  checked={answers[q.id] === idx}
                  onChange={() => recordAnswer(q.id, idx)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        ) : (
          <textarea
            className="w-full bg-gray-900 border border-gray-700 rounded p-2"
            rows={4}
            value={(answers[q.id] as string) || ''}
            onChange={(e) => recordAnswer(q.id, e.target.value)}
          />
        )}
      </div>
      <div className="flex justify-end">
        <button
          onClick={nextQuestion}
          className="bg-green-700 hover:bg-green-600 px-3 py-2 rounded"
        >
          {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default QuizTab;