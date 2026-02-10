
import React from 'react';
import { Sparkles, Target, Zap, FileCode, CheckCircle2, Search, ArrowRight, ShieldCheck } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="animate-in fade-in duration-700">
      {/* Hero Section */}
      <div className="text-center py-16 px-4">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full text-blue-600 text-sm font-bold mb-6">
          <Sparkles size={16} />
          <span>The Future of Product Validation is Here</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
          From Raw Thought to <br />
          <span className="text-blue-600">Product Blueprint</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          IdeaSpark AI uses advanced reasoning to validate your product ideas, find competitors, and generate professional technical specifications in seconds.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={onStart}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2 group"
          >
            Start Your Project <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Why Section */}
      <div className="py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm px-8 md:px-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Why use IdeaSpark AI?</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="flex gap-4">
              <div className="shrink-0 w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Target size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Eliminate Blind Spots</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Don't build something that already exists. Our AI searches the global web and GitHub to find competitors you didn't know about.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="shrink-0 w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Accelerate Development</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Turn a rough idea into a comprehensive 20-page SRS document instantly. Skip weeks of manual drafting.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="shrink-0 w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Unbiased Validation</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Our AI provides objective similarity scores and identifies market gaps based on real-world data, not gut feeling.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="shrink-0 w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                <FileCode size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Tech-Ready Specs</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Hand off professional markdown requirements to developers that cover interfaces, functional, and non-functional requirements.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-24 max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-16 text-center">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: "01", icon: Sparkles, title: "Spark", desc: "Input your raw product idea and any core features you've envisioned." },
            { step: "02", icon: Search, title: "Analyze", desc: "AI searches the web and GitHub for similar projects and identifies market gaps." },
            { step: "03", icon: CheckCircle2, title: "Evolve", desc: "Review AI-suggested improvements and accept features to refine your vision." },
            { step: "04", icon: FileCode, title: "Blueprint", desc: "Generate a complete, editable SRS document ready for development." }
          ].map((item, i) => (
            <div key={i} className="relative bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-xs">
                {item.step}
              </div>
              <div className="mb-6 text-blue-600">
                <item.icon size={32} />
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-3">{item.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
           <button 
            onClick={onStart}
            className="text-blue-600 font-bold hover:text-blue-800 flex items-center gap-2 mx-auto"
          >
            Ready to validate your idea? <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
