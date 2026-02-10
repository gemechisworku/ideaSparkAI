
import React, { useState, useEffect } from 'react';
import { ProductIdea, AppView } from './types';
import Dashboard from './components/Dashboard';
import IdeaForm from './components/IdeaForm';
import IdeaDetail from './components/IdeaDetail';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import { supabase, isSupabaseConfigured, verifySupabaseTable } from './services/supabaseClient';
import { createLogger } from './services/logger';
import { Lightbulb, Database, Plus, Home, Loader2, LogOut, User, AlertCircle } from 'lucide-react';

const log = createLogger('App');
const LOCAL_STORAGE_KEY = 'ideaspark_ideas_v1';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [ideas, setIdeas] = useState<ProductIdea[]>([]);
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbReady, setDbReady] = useState<boolean | null>(null); // null = checking, true = ok, false = fallback

  // Auth Listener + Supabase health check
  useEffect(() => {
    const init = async () => {
      if (isSupabaseConfigured && supabase) {
        log.info('Supabase is configured. Verifying table & session...');

        // 1. Verify the ideas table exists
        const tableOk = await verifySupabaseTable();
        setDbReady(tableOk);

        if (!tableOk) {
          log.warn('Table verification failed. Using LocalStorage fallback.');
          fetchIdeasFromLocalStorage();
          return;
        }

        // 2. Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        log.info('Session check complete.', { hasSession: !!session });
        setSession(session);

        if (session) {
          await fetchIdeasFromSupabase();
        } else {
          setIsLoading(false);
        }

        // 3. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          log.info('Auth state changed.', { event: _event, hasSession: !!session });
          setSession(session);
          if (session) {
            fetchIdeasFromSupabase();
            setCurrentView(prev => (prev === AppView.LOGIN || prev === AppView.LANDING) ? AppView.DASHBOARD : prev);
          } else {
            setIdeas([]);
            setIsLoading(false);
            setCurrentView(AppView.LANDING);
          }
        });

        return () => subscription.unsubscribe();
      } else {
        log.info('Supabase not configured. Using LocalStorage.');
        setDbReady(false);
        fetchIdeasFromLocalStorage();
      }
    };

    init();
  }, []);

  // ─── Data Access: Supabase ───────────────────────────────────────

  const fetchIdeasFromSupabase = async () => {
    setIsLoading(true);
    log.info('Fetching ideas from Supabase...');
    try {
      const { data, error } = await supabase!
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData: ProductIdea[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        title: item.title,
        rawIdea: item.raw_idea,
        problem: item.problem,
        solution: item.solution,
        features: item.features || [],
        status: item.status,
        analysis: item.analysis,
        improvements: item.improvements,
        acceptedImprovements: item.accepted_improvements || [],
        srs: item.srs,
        createdAt: new Date(item.created_at).getTime()
      }));

      log.info(`Fetched ${formattedData.length} ideas from Supabase.`);
      setIdeas(formattedData);
    } catch (err: any) {
      log.error('Failed to fetch ideas from Supabase.', { message: err?.message, code: err?.code, details: err?.details });
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Data Access: LocalStorage ───────────────────────────────────

  const fetchIdeasFromLocalStorage = () => {
    setIsLoading(true);
    log.info('Fetching ideas from LocalStorage...');
    try {
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
      const parsedData: ProductIdea[] = localData ? JSON.parse(localData) : [];
      log.info(`Fetched ${parsedData.length} ideas from LocalStorage.`);
      setIdeas(parsedData);
    } catch (err) {
      log.error('Failed to parse ideas from LocalStorage.', err);
      setIdeas([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Unified helpers ─────────────────────────────────────────────

  const useCloud = () => isSupabaseConfigured && supabase && session && dbReady;

  const saveToLocalStorage = (updatedIdeas: ProductIdea[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedIdeas));
  };

  // ─── CRUD ────────────────────────────────────────────────────────

  const handleAddIdea = async (newIdea: ProductIdea) => {
    log.info('Adding new idea...', { id: newIdea.id, title: newIdea.title });
    try {
      if (useCloud()) {
        const { error } = await supabase!.from('ideas').insert([{
          id: newIdea.id,
          user_id: session.user.id,
          title: newIdea.title,
          raw_idea: newIdea.rawIdea,
          problem: newIdea.problem,
          solution: newIdea.solution,
          features: newIdea.features,
          status: newIdea.status,
          created_at: new Date(newIdea.createdAt).toISOString()
        }]);
        if (error) throw error;
        log.info('Idea saved to Supabase.', { id: newIdea.id });
      } else {
        const updatedIdeas = [newIdea, ...ideas];
        saveToLocalStorage(updatedIdeas);
        log.info('Idea saved to LocalStorage.', { id: newIdea.id });
      }

      setIdeas(prev => [newIdea, ...prev]);
      setCurrentView(AppView.DASHBOARD);
    } catch (err: any) {
      log.error('Failed to save idea.', { message: err?.message, code: err?.code });
      alert('Failed to save to database. Please ensure the "ideas" table exists in Supabase (see README).');
    }
  };

  const handleUpdateIdea = async (updatedIdea: ProductIdea) => {
    log.info('Updating idea...', { id: updatedIdea.id, status: updatedIdea.status });
    try {
      if (useCloud()) {
        const { error } = await supabase!
          .from('ideas')
          .update({
            title: updatedIdea.title,
            problem: updatedIdea.problem,
            solution: updatedIdea.solution,
            features: updatedIdea.features,
            status: updatedIdea.status,
            analysis: updatedIdea.analysis,
            improvements: updatedIdea.improvements,
            accepted_improvements: updatedIdea.acceptedImprovements,
            srs: updatedIdea.srs
          })
          .eq('id', updatedIdea.id);

        if (error) throw error;
        log.info('Idea updated in Supabase.', { id: updatedIdea.id });
      } else {
        const updatedIdeas = ideas.map(i => i.id === updatedIdea.id ? updatedIdea : i);
        saveToLocalStorage(updatedIdeas);
        log.info('Idea updated in LocalStorage.', { id: updatedIdea.id });
      }

      setIdeas(prev => prev.map(i => i.id === updatedIdea.id ? updatedIdea : i));
    } catch (err: any) {
      log.error('Failed to update idea.', { message: err?.message, id: updatedIdea.id });
    }
  };

  const handleDeleteIdea = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      log.info('Deleting idea...', { id });
      try {
        if (useCloud()) {
          const { error } = await supabase!.from('ideas').delete().eq('id', id);
          if (error) throw error;
          log.info('Idea deleted from Supabase.', { id });
        } else {
          const updatedIdeas = ideas.filter(i => i.id !== id);
          saveToLocalStorage(updatedIdeas);
          log.info('Idea deleted from LocalStorage.', { id });
        }

        setIdeas(prev => prev.filter(i => i.id !== id));
      } catch (err: any) {
        log.error('Failed to delete idea.', { message: err?.message, id });
      }
    }
  };

  const handleLogout = async () => {
    log.info('User logging out...');
    if (supabase) {
      await supabase.auth.signOut();
      log.info('User signed out.');
      setCurrentView(AppView.LANDING);
    }
  };

  const openIdea = (id: string) => {
    log.debug('Opening idea detail.', { id });
    setSelectedIdeaId(id);
    setCurrentView(AppView.VIEW_IDEA);
  };

  const selectedIdea = ideas.find(i => i.id === selectedIdeaId);

  // Auth Guard for private views
  const isPrivateView = [AppView.DASHBOARD, AppView.CREATE, AppView.VIEW_IDEA].includes(currentView);
  if (isSupabaseConfigured && dbReady && !session && isPrivateView) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setCurrentView(ideas.length > 0 ? AppView.DASHBOARD : AppView.LANDING)}
        >
          <div className="bg-blue-600 p-2 rounded-lg text-white group-hover:bg-blue-700 transition-colors">
            <Lightbulb size={24} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold tracking-tight">IdeaSpark AI</h1>
            <p className="text-xs text-slate-500 font-medium">Innovation Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <button 
            onClick={() => setCurrentView(AppView.LANDING)}
            className={`p-2 rounded-lg transition-colors ${currentView === AppView.LANDING ? 'bg-slate-100 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Home size={20} />
          </button>
          
          {session ? (
            <div className="flex items-center gap-3 sm:gap-6">
               <button 
                  onClick={() => setCurrentView(AppView.CREATE)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-sm active:scale-95 text-sm"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">New Project</span>
                </button>
              <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end hidden md:flex">
                  <span className="text-xs font-bold text-slate-900 leading-none truncate max-w-[120px]">{session.user.email?.split('@')[0]}</span>
                  <span className="text-[10px] text-slate-400 font-medium leading-none mt-1">Free Tier</span>
                </div>
                <div className="relative group">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 group-hover:bg-slate-200 transition-colors cursor-pointer overflow-hidden">
                    {session.user.user_metadata?.avatar_url ? (
                      <img src={session.user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-[60]">
                    <div className="px-4 py-2 border-b border-slate-50 mb-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-xs font-bold text-slate-700 truncate">{session.user.email}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-bold"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
             <button 
              onClick={() => setCurrentView(AppView.LOGIN)}
              className="bg-slate-900 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
            >
              <User size={16} />
              Sign In
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {/* Supabase configured but table missing */}
        {isSupabaseConfigured && dbReady === false && currentView !== AppView.LANDING && (
          <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-4 text-red-800 animate-in fade-in duration-300">
            <AlertCircle className="shrink-0" size={24} />
            <div>
              <p className="font-bold text-sm">Supabase Table Missing</p>
              <p className="text-xs opacity-80">
                The <code className="bg-red-100 px-1 rounded">ideas</code> table was not found in your Supabase instance.
                Data is being saved to LocalStorage. Please run the SQL schema from the README to enable cloud persistence.
              </p>
            </div>
          </div>
        )}

        {/* Supabase not configured at all */}
        {!isSupabaseConfigured && currentView !== AppView.LANDING && (
          <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-4 text-amber-800 animate-in fade-in duration-300">
            <AlertCircle className="shrink-0" size={24} />
            <div>
              <p className="font-bold text-sm">Supabase Environment Variables Missing</p>
              <p className="text-xs opacity-80">Persistence is currently limited to LocalStorage. Check your .env file.</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-400">
            <Loader2 size={40} className="animate-spin text-blue-500" />
            <p className="font-medium animate-pulse">Establishing Secure Session...</p>
          </div>
        ) : (
          <>
            {currentView === AppView.LANDING && (
              <LandingPage onStart={() => {
                if (session) setCurrentView(ideas.length > 0 ? AppView.DASHBOARD : AppView.CREATE);
                else if (isSupabaseConfigured && dbReady) setCurrentView(AppView.LOGIN);
                else setCurrentView(ideas.length > 0 ? AppView.DASHBOARD : AppView.CREATE);
              }} />
            )}

            {currentView === AppView.LOGIN && <LoginPage />}

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
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© 2026 IdeaSpark AI. Your trusted innovation engine.</p>
          {/* <div className="flex gap-4 items-center">
            {isSupabaseConfigured && dbReady ? (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <Database size={14} /> Cloud Vault Active
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-400 font-medium">
                <Database size={14} /> Local Storage Only
              </span>
            )}
          </div> */}
        </div>
      </footer>
    </div>
  );
};

export default App;
