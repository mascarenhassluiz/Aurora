
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Logo } from './Logo';
import { supabase } from '../supabaseClient';
import { Mail, Lock, User as UserIcon, ArrowRight, Sparkles, Loader2, AlertCircle } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth = ({ onLogin }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Limpa erros ao trocar de modo
  useEffect(() => {
    setError('');
    setSuccessMsg('');
  }, [isLogin]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin // Redireciona de volta para a mesma página
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN COM EMAIL ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        // O onAuthStateChange no App.tsx cuidará do resto
      } else {
        // --- CADASTRO ---
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name 
            }
          }
        });

        if (error) throw error;

        if (data.user && !data.session) {
            setSuccessMsg('Cadastro realizado! Verifique seu e-mail para confirmar.');
            setIsLogin(true);
        }
        // Se houver sessão (confirmação de email desligada), o App.tsx detectará automaticamente
      }
    } catch (err: any) {
      console.error(err);
      if (err.message.includes('Invalid login')) {
         setError('E-mail ou senha incorretos.');
      } else if (err.message.includes('User already registered')) {
         setError('Este e-mail já está cadastrado.');
      } else {
         setError(err.message || 'Ocorreu um erro. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-800 p-10 rounded-[3rem] shadow-2xl animate-fade-in relative z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="mb-6 bg-gradient-to-tr from-indigo-100 to-pink-100 dark:from-indigo-900/40 dark:to-pink-900/40 p-5 rounded-[2rem] shadow-inner">
            <Logo className="w-14 h-14" />
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent uppercase tracking-tighter">
            {isLogin ? 'Bem-vindo' : 'Criar Conta'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
            Sua jornada de desenvolvimento pessoal começa aqui.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl text-xs font-black uppercase tracking-wider text-center border border-rose-100 dark:border-rose-800 animate-shake flex items-center justify-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-black uppercase tracking-wider text-center border border-emerald-100 dark:border-emerald-800 animate-fade-in">
            {successMsg}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-sm transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Entrar com Google
          </button>

          <div className="flex items-center gap-4 w-full py-2">
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ou com E-mail</span>
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  required
                  placeholder="Seu Nome"
                  className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 outline-none rounded-2xl px-12 py-4 text-sm font-bold dark:text-white transition-all"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                placeholder="E-mail"
                className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 outline-none rounded-2xl px-12 py-4 text-sm font-bold dark:text-white transition-all"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                required
                placeholder="Senha"
                className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 outline-none rounded-2xl px-12 py-4 text-sm font-bold dark:text-white transition-all"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : (
                <>
                  {isLogin ? 'Entrar Agora' : 'Finalizar Cadastro'}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }}
            className="text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest hover:underline"
          >
            {isLogin ? 'Não tem conta? Crie aqui' : 'Já possui conta? Faça login'}
          </button>
        </div>

        <div className="mt-10 flex justify-center gap-2 items-center text-slate-300 dark:text-slate-700">
           <Sparkles size={14} />
           <span className="text-[9px] font-black uppercase tracking-[0.3em]">Sistema Aurora Cloud</span>
        </div>
      </div>
    </div>
  );
};
