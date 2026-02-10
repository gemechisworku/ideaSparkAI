
import React, { useState, useMemo } from 'react';
import { ProductIdea, SimilarityAnalysis, ImprovementSuggestion } from '../types';
import { analyzeProductIdea, suggestImprovements, generateSRS } from '../services/geminiService';
import { 
  ArrowLeft, Search, Sparkles, FileText, Download, 
  ExternalLink, Check, RefreshCw, Star, Info, 
  CheckCircle, PlusCircle, AlertCircle, Quote
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

interface IdeaDetailProps {
  idea: ProductIdea;
  onUpdate: (idea: ProductIdea) => void;
  onBack: () => void;
}

const BAR_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f97316', // orange
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#f43f5e', // rose
  '#f59e0b'  // amber
];

const IdeaDetail: React.FC<IdeaDetailProps> = ({ idea, onUpdate, onBack }) => {
  const [loading, setLoading] = useState<'analyzing' | 'improving' | 'srs' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const competitorData = useMemo(() => {
    if (!idea.analysis?.competitors) return [];
    return idea.analysis.competitors.map((comp, idx) => ({
      ...comp,
      color: BAR_COLORS[idx % BAR_COLORS.length]
    }));
  }, [idea.analysis?.competitors]);

  const runAnalysis = async () => {
    setLoading('analyzing');
    setError(null);
    try {
      const refined = await analyzeProductIdea(idea);
      onUpdate({ 
        ...idea, 
        title: refined.title,
        problem: refined.problem,
        solution: refined.solution,
        analysis: refined.analysis, 
        status: 'analyzed' 
      });
    } catch (err) {
      setError("Failed to analyze. Please ensure your API Key is valid.");
    } finally {
      setLoading(null);
    }
  };

  const runImprovements = async () => {
    if (!idea.analysis) return;
    setLoading('improving');
    setError(null);
    try {
      const suggestions = await suggestImprovements(idea, idea.analysis);
      onUpdate({ ...idea, improvements: suggestions, status: 'improved' });
    } catch (err) {
      setError("Failed to generate improvements.");
    } finally {
      setLoading(null);
    }
  };

  const runSRSGeneration = async () => {
    setLoading('srs');
    setError(null);
    try {
      const srs = await generateSRS(idea);
      onUpdate({ ...idea, srs, status: 'srs_ready' });
    } catch (err) {
      setError("Failed to generate SRS.");
    } finally {
      setLoading(null);
    }
  };

  const toggleImprovement = (suggestion: ImprovementSuggestion) => {
    const accepted = idea.acceptedImprovements || [];
    const isAccepted = accepted.includes(suggestion.title);
    
    onUpdate({
      ...idea,
      acceptedImprovements: isAccepted 
        ? accepted.filter(t => t !== suggestion.title) 
        : [...accepted, suggestion.title]
    });
  };

  const exportSRS = (format: 'md' | 'txt') => {
    if (!idea.srs) return;
    const blob = new Blob([idea.srs], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${idea.title.replace(/\s+/g, '_')}_SRS.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium">
          <ArrowLeft size={20} />
          Dashboard
        </button>
        <div className="flex gap-2">
           {idea.status === 'srs_ready' && (
             <button 
              onClick={() => exportSRS('md')}
              className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-950 transition-colors shadow-sm"
             >
               <Download size={16} /> Export Blueprint
             </button>
           )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
             <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{idea.title}</h1>
             <p className="text-slate-400 text-sm mt-1 font-medium italic">Project ID: {idea.id}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            idea.status === 'draft' ? 'bg-slate-100 text-slate-500' :
            idea.status === 'analyzed' ? 'bg-blue-100 text-blue-600' :
            idea.status === 'improved' ? 'bg-indigo-100 text-indigo-600' :
            'bg-green-100 text-green-600'
          }`}>
            {idea.status}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-10">
          <div className="space-y-6">
            {!idea.problem && !idea.solution ? (
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Quote size={12} />
                  Original Prompt
                </h4>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
                  {idea.rawIdea}
                </p>
                <div className="mt-4 flex items-center gap-2 text-[11px] text-blue-600 font-bold bg-blue-50 w-fit px-2 py-1 rounded">
                   <Sparkles size={10} /> AI Analysis will extract core problem & solution
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Refined Problem</h4>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm font-medium">{idea.problem}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Refined Solution</h4>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm font-medium">{idea.solution}</p>
                </div>
              </>
            )}
          </div>
          
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <PlusCircle size={14} className="text-blue-400" />
              Requirements backlog
            </h4>
            <ul className="space-y-3">
              {idea.features.length === 0 && !idea.acceptedImprovements?.length && (
                <li className="text-xs text-slate-500 italic">No features added yet.</li>
              )}
              {idea.features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  {f}
                </li>
              ))}
              {(idea.acceptedImprovements || []).map((f, i) => (
                <li key={`acc-${i}`} className="flex items-start gap-3 text-sm font-bold text-blue-200 bg-blue-900/40 p-2.5 rounded-lg -mx-1 border border-blue-800/50">
                  <Sparkles size={14} className="mt-0.5 text-blue-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 animate-in slide-in-from-top-2">
          <AlertCircle size={20} />
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      {/* Steps Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Analysis */}
        <section className={`bg-white rounded-2xl p-6 border transition-all duration-300 ${idea.status === 'draft' ? 'border-blue-400 ring-4 ring-blue-50' : 'border-slate-200'}`}>
          <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-xl ${idea.analysis ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
              <Search size={24} />
            </div>
            {idea.analysis && <CheckCircle size={20} className="text-green-500" />}
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Step 1: Market Search</h3>
          <p className="text-sm text-slate-500 mb-6">AI discovers competitors and similar GitHub projects to find your unique edge.</p>
          <button 
            disabled={loading !== null}
            onClick={runAnalysis}
            className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              idea.analysis 
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'
            }`}
          >
            {loading === 'analyzing' ? <RefreshCw className="animate-spin" size={18}/> : (idea.analysis ? 'Redo Analysis' : 'Start AI Analysis')}
          </button>
        </section>

        {/* Step 2: Improvements */}
        <section className={`bg-white rounded-2xl p-6 border transition-all duration-300 ${idea.status === 'analyzed' ? 'border-indigo-400 ring-4 ring-indigo-50' : 'border-slate-200'} ${!idea.analysis && 'opacity-50 grayscale cursor-not-allowed'}`}>
          <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-xl ${idea.improvements ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600'}`}>
              <Sparkles size={24} />
            </div>
            {idea.improvements && <CheckCircle size={20} className="text-green-500" />}
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Step 2: Idea Evolution</h3>
          <p className="text-sm text-slate-500 mb-6">Get feature suggestions and strategic shifts based on competitor weaknesses.</p>
          <button 
            disabled={loading !== null || !idea.analysis}
            onClick={runImprovements}
            className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              idea.improvements 
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
            }`}
          >
            {loading === 'improving' ? <RefreshCw className="animate-spin" size={18}/> : (idea.improvements ? 'Update Ideas' : 'Get Suggestions')}
          </button>
        </section>

        {/* Step 3: SRS */}
        <section className={`bg-white rounded-2xl p-6 border transition-all duration-300 ${idea.status === 'improved' ? 'border-green-400 ring-4 ring-green-50' : 'border-slate-200'} ${!idea.improvements && 'opacity-50 grayscale cursor-not-allowed'}`}>
          <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-xl ${idea.srs ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-600'}`}>
              <FileText size={24} />
            </div>
            {idea.srs && <CheckCircle size={20} className="text-green-500" />}
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Step 3: Specification</h3>
          <p className="text-sm text-slate-500 mb-6">Transform your refined vision into a technical SRS document for engineering.</p>
          <button 
            disabled={loading !== null || !idea.improvements}
            onClick={runSRSGeneration}
            className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              idea.srs 
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
              : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-100'
            }`}
          >
            {loading === 'srs' ? <RefreshCw className="animate-spin" size={18}/> : (idea.srs ? 'Regenerate SRS' : 'Generate Full SRS')}
          </button>
        </section>
      </div>

      {/* Analysis Content */}
      {idea.analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                <Search size={22} className="text-blue-600" />
                Competitor Intelligence
              </h3>
              
              <div className="space-y-8">
                {competitorData.map((comp, i) => (
                  <div key={i} className="group border-b border-slate-100 last:border-0 pb-8 last:pb-0">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full border border-white shadow-sm shrink-0" 
                          style={{ backgroundColor: comp.color }} 
                        />
                        <h4 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">{comp.name}</h4>
                        <a href={comp.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors">
                          <ExternalLink size={16} />
                        </a>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded uppercase tracking-wider">
                        <Star size={10} fill="currentColor" /> {comp.similarityScore}/10 Similarity
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mb-4 leading-relaxed">{comp.relationToIdea}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Their Problem</span>
                        <p className="text-xs text-slate-600 leading-normal font-medium">{comp.problem}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Their Solution</span>
                        <p className="text-xs text-slate-600 leading-normal font-medium">{comp.solution}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-3xl p-8 text-white shadow-2xl shadow-blue-100">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Info size={24} className="text-blue-300" />
                Strategic Edge
              </h3>
              <p className="text-blue-50 leading-relaxed font-bold text-lg bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                {idea.analysis.differentiationFactor}
              </p>
              <div className="mt-8 pt-8 border-t border-white/10">
                <h4 className="text-xs font-bold text-blue-300 mb-3 uppercase tracking-widest">AI Market Summary</h4>
                <p className="text-sm text-blue-100 leading-relaxed opacity-90 font-medium">
                  {idea.analysis.summary}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
             <div className="bg-white rounded-2xl p-6 border border-slate-200 h-80 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider flex items-center gap-2">
                Similarity Distribution
              </h4>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={competitorData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" hide />
                  <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} 
                  />
                  <Bar dataKey="similarityScore" radius={[6, 6, 0, 0]}>
                    {competitorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-center text-slate-400 mt-2 font-bold uppercase tracking-tight">Competitor Color Legend</p>
            </div>

            {idea.improvements && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-in slide-in-from-right-4 duration-500">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                  <Sparkles size={18} className="text-indigo-600" />
                  Growth Levers
                </h3>
                <div className="space-y-4">
                  {idea.improvements.map((sug) => (
                    <div 
                      key={sug.id} 
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer group relative ${
                        (idea.acceptedImprovements || []).includes(sug.title) 
                        ? 'bg-blue-50 border-blue-400' 
                        : 'bg-slate-50 border-transparent hover:border-slate-200'
                      }`}
                      onClick={() => toggleImprovement(sug)}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-tighter ${
                          sug.type === 'feature' ? 'bg-indigo-100 text-indigo-700' : 
                          sug.type === 'strategic' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {sug.type}
                        </span>
                        {(idea.acceptedImprovements || []).includes(sug.title) && <CheckCircle size={14} className="text-blue-600" />}
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{sug.title}</h5>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">{sug.description}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-4 text-center font-bold">Tap a card to add it to your requirements</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SRS Viewer */}
      {idea.srs && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
          <div className="bg-slate-900 px-8 py-8 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg text-white">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Product Technical Blueprint</h2>
                <p className="text-slate-400 text-xs font-medium">Standard Software Requirements Specification</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => exportSRS('md')}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-xl transition-all border border-white/5"
              >
                <Download size={14} /> Download MD
              </button>
            </div>
          </div>
          <div className="p-8 bg-slate-100">
            <div className="bg-white rounded-2xl shadow-inner border border-slate-200">
              <textarea 
                className="w-full h-[600px] p-8 font-mono text-sm border-0 focus:ring-0 outline-none bg-transparent leading-relaxed text-slate-800 custom-scrollbar"
                value={idea.srs}
                onChange={(e) => onUpdate({ ...idea, srs: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeaDetail;
