import React, { useState } from 'react';
import { Notebook, Flashcard } from '../types';
import { generateFlashcards } from '../services/ai';

interface Props {
  notebook: Notebook;
}

/**
 * FlashcardsTab displays a deck of flashcards generated from the notebook's
 * sources.  Users can cycle through the cards, flip them to reveal the
 * answer, and regenerate a new set at any time.  The generation is
 * asynchronous and uses the AI backend via the `generateFlashcards` helper.
 */
const FlashcardsTab: React.FC<Props> = ({ notebook }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [current, setCurrent] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const cards = await generateFlashcards(notebook.id, 10);
      setFlashcards(cards);
      setCurrent(0);
      setShowAnswer(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to generate flashcards');
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    if (flashcards.length > 0) {
      setCurrent((current + 1) % flashcards.length);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (flashcards.length > 0) {
      setCurrent((current - 1 + flashcards.length) % flashcards.length);
      setShowAnswer(false);
    }
  };

  // Render a button to generate cards if none exist yet.
  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-center">No flashcards generated yet.</p>
        <button
          onClick={handleGenerate}
          disabled={loading || notebook.sources.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {loading ? 'Generating…' : 'Generate Flashcards'}
        </button>
        {notebook.sources.length === 0 && (
          <p className="text-sm text-red-400">Add some sources first to generate flashcards.</p>
        )}
      </div>
    );
  }

  const card = flashcards[current];
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-400">
          Card {current + 1} of {flashcards.length}
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
        <p className="text-lg font-semibold mb-4">{card.question}</p>
        {showAnswer && (
          <p className="mt-2 text-green-400 whitespace-pre-wrap">{card.answer}</p>
        )}
      </div>
      <div className="flex justify-between">
          <button
            onClick={prevCard}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded"
          >
            Prev
          </button>
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="bg-green-700 hover:bg-green-600 px-3 py-2 rounded"
          >
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </button>
          <button
            onClick={nextCard}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded"
          >
            Next
          </button>
      </div>
    </div>
  );
};

export default FlashcardsTab;