
import React, { useState, useEffect } from 'react';
import { ProductIdea, AppView } from './types';
import Dashboard from './components/Dashboard';
import IdeaForm from './components/IdeaForm';
import IdeaDetail from './components/IdeaDetail';
import LandingPage from './components/LandingPage';
import { Lightbulb, Database, Plus, Home } from 'lucide-react';

const App: React.FC = () => {
  const [ideas, setIdeas] = useState<ProductIdea[]>([]);
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ideaspark_projects');
    if (saved) {
      const parsed = JSON.parse(saved);
      setIdeas(parsed);
      // If there are ideas, go to dashboard, otherwise landing
      if (parsed.length > 0) {
        setCurrentView(AppView.DASHBOARD);
      }
    }
  }, []);

  const saveIdeas = (updated: ProductIdea[]) => {
    setIdeas(updated);
    localStorage.setItem('ideaspark_projects', JSON.stringify(updated));
  };

  const handleAddIdea = (newIdea: ProductIdea) => {
    const updated = [newIdea, ...ideas];
    saveIdeas(updated);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleUpdateIdea = (updatedIdea: ProductIdea) => {
    saveIdeas(ideas.map(i => i.id === updatedIdea.id ? updatedIdea : i));
  };

  const handleDeleteIdea = (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      saveIdeas(ideas.filter(i => i.id !== id));
    }
  };

  const openIdea = (id: string) => {
    setSelectedIdeaId(id);
    setCurrentView(AppView.VIEW_IDEA);
  };

  const selectedIdea = ideas.find(i => i.id === selectedIdeaId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Sidebar / Nav */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setCurrentView(ideas.length > 0 ? AppView.DASHBOARD : AppView.LANDING)}
        >
          <div className="bg-blue-600 p-2 rounded-lg text-white group-hover:bg-blue-700 transition-colors">
            <Lightbulb size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">IdeaSpark AI</h1>
            <p className="text-xs text-slate-500 font-medium">Innovation Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCurrentView(AppView.LANDING)}
            className={`p-2 rounded-lg transition-colors ${currentView === AppView.LANDING ? 'bg-slate-100 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
            title="Landing Page"
          >
            <Home size={20} />
          </button>
          
          {ideas.length > 0 && (
            <button 
              onClick={() => setCurrentView(AppView.CREATE)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-sm active:scale-95 text-sm"
            >
              <Plus size={18} />
              New Project
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {currentView === AppView.LANDING && (
          <LandingPage onStart={() => setCurrentView(ideas.length > 0 ? AppView.DASHBOARD : AppView.CREATE)} />
        )}

        {currentView === AppView.DASHBOARD && (
          <Dashboard 
            ideas={ideas} 
            onOpen={openIdea} 
            onDelete={handleDeleteIdea} 
            onCreate={() => setCurrentView(AppView.CREATE)}
          />
        )}

        {currentView === AppView.CREATE && (
          <div className="max-w-2xl mx-auto">
            <IdeaForm onSubmit={handleAddIdea} onCancel={() => setCurrentView(ideas.length > 0 ? AppView.DASHBOARD : AppView.LANDING)} />
          </div>
        )}

        {currentView === AppView.VIEW_IDEA && selectedIdea && (
          <IdeaDetail 
            idea={selectedIdea} 
            onUpdate={handleUpdateIdea} 
            onBack={() => setCurrentView(AppView.DASHBOARD)} 
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© 2026 IdeaSpark AI. Build the future with intelligence.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
