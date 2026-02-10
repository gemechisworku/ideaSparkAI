
import React, { useState } from 'react';
import { ProductIdea } from '../types';
import { X, Send, Sparkles } from 'lucide-react';

interface IdeaFormProps {
  onSubmit: (idea: ProductIdea) => void;
  onCancel: () => void;
}

const IdeaForm: React.FC<IdeaFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    idea: '',
    features: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.idea.trim()) return;

    // Generate a temporary title from the first line or first 40 chars
    const firstLine = formData.idea.split('\n')[0].trim();
    const tempTitle = firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine || 'New Product Idea';

    const newIdea: ProductIdea = {
      id: Math.random().toString(36).substring(2, 9),
      rawIdea: formData.idea,
      title: tempTitle,
      problem: '', // Will be extracted by AI
      solution: '', // Will be extracted by AI
      features: formData.features.split('\n').filter(f => f.trim() !== '').map(f => f.replace(/^[-*]\s*/, '').trim()),
      createdAt: Date.now(),
      status: 'draft'
    };
    onSubmit(newIdea);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="bg-slate-900 px-8 py-8 flex justify-between items-center text-white">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="text-blue-400" size={24} />
            Capture Your Vision
          </h2>
          <p className="text-slate-400 text-sm mt-1 font-medium">Describe your product idea in detail.</p>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            The Product Idea
            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Required</span>
          </label>
          <textarea
            required
            rows={8}
            placeholder="What problem are you solving? How does your product work? Describe your unique approach..."
            className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 focus:border-blue-500 focus:bg-white bg-slate-50/50 transition-all outline-none resize-none leading-relaxed text-slate-900 font-medium placeholder:text-slate-400"
            value={formData.idea}
            onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            Desired Key Features
            <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded">Optional</span>
          </label>
          <textarea
            rows={4}
            placeholder="List specific features (one per line)&#10;- Integrated payment gateway&#10;- Real-time notifications&#10;- Advanced data visualization"
            className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 focus:border-blue-500 focus:bg-white bg-slate-50/50 transition-all outline-none font-mono text-sm text-slate-900 placeholder:text-slate-400"
            value={formData.features}
            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-4 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!formData.idea.trim()}
            className="flex-[2] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
          >
            Start Validation <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default IdeaForm;
