import React, { useState } from 'react';
import { Notebook } from '../types';
import { generateAudioOverview, generateMindMap } from '../services/ai';

interface Props {
  notebook: Notebook;
  onUpdate: (nb: Notebook) => void;
}

/**
 * StudioTab aggregates tools for creating higher‑level artifacts from a
 * notebook.  Users can generate an Audio Overview in one of several
 * formats and request a Mind Map summarizing their sources.  Generated
 * outputs are displayed inline.  In a full implementation these artifacts
 * would be persisted to the notebook and shared across sessions.
 */
const StudioTab: React.FC<Props> = ({ notebook }) => {
  const [audio, setAudio] = useState<{ title: string; url: string } | null>(null);
  const [audioFormat, setAudioFormat] = useState<'deepDive' | 'brief' | 'critique' | 'debate'>('deepDive');
  const [audioLength, setAudioLength] = useState<'short' | 'default' | 'long'>('default');
  const [audioLang, setAudioLang] = useState('en');
  const [audioLoading, setAudioLoading] = useState(false);
  const [mindMap, setMindMap] = useState<any>(null);
  const [mindLoading, setMindLoading] = useState(false);

  const handleGenerateAudio = async () => {
    if (notebook.sources.length === 0) {
      alert('Add some sources first to generate audio.');
      return;
    }
    setAudioLoading(true);
    try {
      const result = await generateAudioOverview(notebook.id, audioFormat, audioLength, audioLang);
      setAudio({ title: result.title, url: result.audioUrl });
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to generate audio overview');
    } finally {
      setAudioLoading(false);
    }
  };

  const handleGenerateMindMap = async () => {
    if (notebook.sources.length === 0) {
      alert('Add some sources first to generate a mind map.');
      return;
    }
    setMindLoading(true);
    try {
      const map = await generateMindMap(notebook.id);
      setMindMap(map);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to generate mind map');
    } finally {
      setMindLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-xl font-bold">Audio Overview</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm text-gray-300">Format</label>
            <select
              value={audioFormat}
              onChange={(e) => setAudioFormat(e.target.value as any)}
              className="bg-gray-900 border border-gray-700 rounded px-2 py-1"
            >
              <option value="deepDive">Deep Dive</option>
              <option value="brief">Brief</option>
              <option value="critique">Critique</option>
              <option value="debate">Debate</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300">Length</label>
            <select
              value={audioLength}
              onChange={(e) => setAudioLength(e.target.value as any)}
              className="bg-gray-900 border border-gray-700 rounded px-2 py-1"
            >
              <option value="short">Short</option>
              <option value="default">Default</option>
              <option value="long">Long</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300">Language</label>
            <input
              type="text"
              value={audioLang}
              onChange={(e) => setAudioLang(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded px-2 py-1"
              placeholder="e.g. en"
            />
          </div>
          <button
            onClick={handleGenerateAudio}
            disabled={audioLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {audioLoading ? 'Generating…' : audio ? 'Regenerate' : 'Generate'}
          </button>
        </div>
        {audio && (
          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-semibold">{audio.title}</h3>
            <audio controls src={audio.url} className="w-full" />
          </div>
        )}
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-bold">Mind Map</h2>
        <button
          onClick={handleGenerateMindMap}
          disabled={mindLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {mindLoading ? 'Generating…' : mindMap ? 'Regenerate' : 'Generate'}
        </button>
        {mindMap && (
          <pre className="bg-gray-900 border border-gray-700 rounded p-4 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(mindMap, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
};

export default StudioTab;