
import React from 'react';
import { ProductIdea } from '../types';
import { Clock, ChevronRight, Trash2, Box, Search, CheckCircle2, FileText } from 'lucide-react';

interface DashboardProps {
  ideas: ProductIdea[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ ideas, onOpen, onDelete, onCreate }) => {
  const getStatusBadge = (status: ProductIdea['status']) => {
    switch (status) {
      case 'draft': return <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold">DRAFT</span>;
      case 'analyzed': return <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-semibold">ANALYZED</span>;
      case 'improved': return <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded text-xs font-semibold">IMPROVED</span>;
      case 'srs_ready': return <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-semibold uppercase">SRS COMPLETED</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Your Innovation Lab</h2>
          <p className="text-slate-500 mt-1">Manage and refine your product vision with AI-powered insights.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          <div className="px-4 py-2 text-center border-r border-slate-100">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Ideas</p>
            <p className="text-xl font-bold text-slate-800">{ideas.length}</p>
          </div>
          <div className="px-4 py-2 text-center">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">SRS Ready</p>
            <p className="text-xl font-bold text-slate-800">{ideas.filter(i => i.status === 'srs_ready').length}</p>
          </div>
        </div>
      </div>

      {ideas.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-16 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Box size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No projects yet</h3>
          <p className="text-slate-500 mt-2 max-w-md">Your future product starts here. Click the button below to capture your first idea and begin the validation process.</p>
          <button 
            onClick={onCreate}
            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all hover:-translate-y-1"
          >
            Create My First Idea
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea) => (
            <div 
              key={idea.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all group flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  {getStatusBadge(idea.status)}
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(idea.id); }}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {idea.title}
                </h3>
                
                <p className="text-slate-500 text-sm mt-3 line-clamp-3">
                  {idea.problem}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Clock size={12} />
                    {new Date(idea.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div className="flex gap-3">
                  {idea.status !== 'draft' && <Search size={14} className="text-blue-500" />}
                  {idea.status === 'srs_ready' && <FileText size={14} className="text-green-500" />}
                  {idea.status === 'improved' && <CheckCircle2 size={14} className="text-indigo-500" />}
                </div>
                <button 
                  onClick={() => onOpen(idea.id)}
                  className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Manage Project
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
