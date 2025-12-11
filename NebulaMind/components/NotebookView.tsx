import React, { useState, useEffect } from 'react';
import { Notebook, Source } from '../types';
import SourcesTab from './SourcesTab';
import ChatTab from './ChatTab';
import FlashcardsTab from './FlashcardsTab';
import QuizTab from './QuizTab';
import ReportTab from './ReportTab';
import StudioTab from './StudioTab';

/**
 * Simplified notebook view for the NebulaMind app.  This component focuses on
 * clarity and functionality over elaborate styling.  It exposes three main
 * sections (sources, chat and studio) and adds support for renaming individual
 * sources via the `onEditSource` callback passed down to the SourcesTab.
 */
interface Props {
  notebook: Notebook;
  onUpdate: (nb: Notebook) => void;
}

const NotebookView: React.FC<Props> = ({ notebook, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<
    'sources' | 'chat' | 'studio' | 'flashcards' | 'quiz' | 'reports'
  >('sources');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(notebook.title);

  useEffect(() => {
    setEditedTitle(notebook.title);
  }, [notebook.title]);

  // Persist a changed notebook title when the user finishes editing.  Titles
  // trimmed of whitespace and unchanged values will not trigger an update.
  const saveTitle = () => {
    const title = editedTitle.trim();
    if (title && title !== notebook.title) {
      onUpdate({ ...notebook, title, updatedAt: Date.now() });
    }
    setEditingTitle(false);
  };

  // Append a new source to the notebook and bump the update timestamp.
  const addSource = (source: Source) => {
    const updated = { ...notebook, sources: [...notebook.sources, source], updatedAt: Date.now() };
    onUpdate(updated);
  };

  // Remove a source from the notebook by id.
  const deleteSource = (id: string) => {
    const updated = { ...notebook, sources: notebook.sources.filter((s) => s.id !== id), updatedAt: Date.now() };
    onUpdate(updated);
  };

  // Replace an existing source with a modified version.  This is used by
  // SourcesTab when a user edits a title via the edit button.  The notebook
  // update timestamp is also refreshed.
  const editSource = (updatedSource: Source) => {
    const updated = {
      ...notebook,
      sources: notebook.sources.map((s) => (s.id === updatedSource.id ? updatedSource : s)),
      updatedAt: Date.now(),
    };
    onUpdate(updated);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 flex justify-between items-center border-b bg-gray-900 text-white">
        <div>
          {editingTitle ? (
            <input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
              autoFocus
              className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm"
            />
          ) : (
            <h1 className="text-xl font-bold" onDoubleClick={() => setEditingTitle(true)}>
              {notebook.title}
            </h1>
          )}
        </div>
        <nav className="space-x-4 text-sm">
          <button
            className={activeTab === 'sources' ? 'font-bold underline' : ''}
            onClick={() => setActiveTab('sources')}
          >
            Sources
          </button>
          <button
            className={activeTab === 'chat' ? 'font-bold underline' : ''}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </button>
          <button
            className={activeTab === 'flashcards' ? 'font-bold underline' : ''}
            onClick={() => setActiveTab('flashcards')}
          >
            Flashcards
          </button>
          <button
            className={activeTab === 'quiz' ? 'font-bold underline' : ''}
            onClick={() => setActiveTab('quiz')}
          >
            Quiz
          </button>
          <button
            className={activeTab === 'reports' ? 'font-bold underline' : ''}
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </button>
          <button
            className={activeTab === 'studio' ? 'font-bold underline' : ''}
            onClick={() => setActiveTab('studio')}
          >
            Studio
          </button>
        </nav>
      </header>
      <main className="flex-1 p-4 overflow-y-auto bg-gray-950 text-slate-200">
        {activeTab === 'sources' && (
          <SourcesTab
            sources={notebook.sources}
            onAddSource={addSource}
            onDeleteSource={deleteSource}
            onEditSource={editSource}
          />
        )}
        {activeTab === 'chat' && <ChatTab notebook={notebook} />}
        {activeTab === 'flashcards' && <FlashcardsTab notebook={notebook} />}
        {activeTab === 'quiz' && <QuizTab notebook={notebook} />}
        {activeTab === 'reports' && <ReportTab notebook={notebook} />}
        {activeTab === 'studio' && <StudioTab notebook={notebook} onUpdate={onUpdate} />}
      </main>
    </div>
  );
};

export default NotebookView;