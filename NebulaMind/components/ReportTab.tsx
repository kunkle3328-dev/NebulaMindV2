import React, { useState } from 'react';
import { Notebook } from '../types';
import { generateReport } from '../services/ai';

interface Props {
  notebook: Notebook;
}

/**
 * ReportTab allows users to create high‑quality documents from their notebook
 * sources.  Users can choose from several styles (briefing, blog, study
 * guide, timeline) and the AI will assemble a cohesive report.  The
 * resulting report is displayed with its title and body.  Users can
 * regenerate or select a different style at any time.
 */
const ReportTab: React.FC<Props> = ({ notebook }) => {
  const [style, setStyle] = useState<'briefing' | 'blog' | 'studyGuide' | 'timeline'>('briefing');
  const [report, setReport] = useState<{ title: string; body: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateReport(notebook.id, style);
      setReport(result);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-end space-x-4">
        <div>
          <label htmlFor="style" className="block text-sm font-medium text-gray-300">
            Report style
          </label>
          <select
            id="style"
            value={style}
            onChange={(e) => setStyle(e.target.value as any)}
            className="mt-1 bg-gray-900 border border-gray-700 rounded px-3 py-2"
          >
            <option value="briefing">Briefing</option>
            <option value="blog">Blog post</option>
            <option value="studyGuide">Study guide</option>
            <option value="timeline">Timeline</option>
          </select>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || notebook.sources.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {loading ? 'Generating…' : report ? 'Regenerate' : 'Generate'}
        </button>
      </div>
      {notebook.sources.length === 0 && (
        <p className="text-sm text-red-400">Add some sources first to generate a report.</p>
      )}
      {report && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{report.title}</h2>
          <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: report.body }} />
        </div>
      )}
    </div>
  );
};

export default ReportTab;