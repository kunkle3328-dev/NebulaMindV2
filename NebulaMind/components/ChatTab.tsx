import React, { useState, useRef } from 'react';
import { Notebook, ChatMessage } from '../types';
import { generateAnswer } from '../services/ai';

interface Props {
  notebook: Notebook;
}

/**
 * ChatTab provides a conversational interface for asking questions about
 * notebook sources.  Users can optionally enable “Learning Guide” mode,
 * which prepends instructions to encourage the model to break down answers
 * and ask probing follow‑up questions.  Responses from the model include
 * citations when available.
 */
const ChatTab: React.FC<Props> = ({ notebook }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [learningGuide, setLearningGuide] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: prompt,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const finalPrompt = learningGuide
        ? `You are a patient learning guide. Break down your explanations into simple steps, ask clarifying questions when appropriate, and encourage active engagement. ${prompt}`
        : prompt;
      const result = await generateAnswer(notebook.id, finalPrompt);
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.text,
        citations: result.citations,
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to generate answer');
    } finally {
      setLoading(false);
      // Scroll to bottom after response
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded max-w-prose whitespace-pre-wrap ${msg.role === 'user' ? 'self-end bg-blue-800 text-white' : 'self-start bg-gray-800 text-gray-100'}`}
          >
            <p>{msg.text}</p>
            {msg.citations && msg.citations.length > 0 && (
              <div className="mt-1 text-xs text-green-400">
                Citations: {msg.citations.join(', ')}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-gray-700 pt-3 space-y-2">
        <label className="inline-flex items-center space-x-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={learningGuide}
            onChange={() => setLearningGuide((v) => !v)}
          />
          <span>Learning Guide mode</span>
        </label>
        <div className="flex items-end space-x-2">
          <textarea
            className="flex-1 bg-gray-900 border border-gray-700 rounded p-2 text-sm"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question…"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            {loading ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatTab;