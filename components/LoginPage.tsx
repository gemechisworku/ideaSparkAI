
import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { Lightbulb, Github, Mail, Chrome, Loader2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured || !supabase) return;
    setLoading(true);
    setError(null);

    try {
      const { error } = isSignUp 
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;
      if (isSignUp) {
        alert('Check your email for the confirmation link!');
        setIsSignUp(false);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'github' | 'google') => {
    if (!isSupabaseConfigured || !supabase) {
      alert("Supabase is not configured. Social login unavailable.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { 
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(`Auth error (${provider}):`, err);
      setError(err.message || `Failed to sign in with ${provider}`);
      setLoading(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-amber-200 max-w-md text-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Supabase Required</h2>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed">
            Persistence and authentication require a valid Supabase project. 
            Please configure your <strong>SUPABASE_URL</strong> and <strong>SUPABASE_ANON_KEY</strong>.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl text-xs font-mono text-slate-600 text-left mb-4">
             # Add to your .env<br/>
             SUPABASE_URL=...<br/>
             SUPABASE_ANON_KEY=...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl shadow-blue-100 border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-slate-900 p-10 text-center text-white relative">
          <div className="absolute top-4 right-4 text-blue-500/30">
            <ShieldCheck size={40} />
          </div>
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20 relative z-10">
            <Lightbulb size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight relative z-10">Secure Gateway</h1>
          <p className="text-slate-400 mt-2 font-medium relative z-10">IdeaSpark AI Innovation Lab</p>
        </div>

        <div className="p-10">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 text-xs font-bold animate-in shake-in duration-300">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
              onClick={() => handleSocialLogin('github')}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 border-2 border-slate-100 rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-all font-bold text-slate-700 text-sm disabled:opacity-50"
            >
              <Github size={18} /> GitHub
            </button>
            <button 
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 border-2 border-slate-100 rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-all font-bold text-slate-700 text-sm disabled:opacity-50"
            >
              <Chrome size={18} /> Google
            </button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or login with email</span></div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Terminal</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-50 focus:border-blue-500 focus:bg-white bg-slate-50 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Access Key</label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-50 focus:border-blue-500 focus:bg-white bg-slate-50 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (isSignUp ? 'Initialize Account' : 'Authenticate')}
              {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            {isSignUp ? 'Return to authentication?' : "Need a workspace?"}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-2 text-blue-600 font-bold hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Create Free Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
