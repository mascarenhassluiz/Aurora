
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    // Timeout de segurança: se nada acontecer em 10s, destrava o botão
    const timeoutId = setTimeout(() => {
        setLoading((currentLoading) => {
            if (currentLoading) {
                setError('O servidor demorou para responder. Verifique sua conexão e tente novamente.');
                return false;
            }
            return false;
        });
    }, 10000);

    try {
      if (isLogin) {
        // --- LOGIN ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        if (data.user) {
          // Tenta buscar o perfil
          let profile = null;
          
          try {
             const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();
             profile = profileData;
          } catch (profileErr) {
             console.warn("Erro ao buscar perfil, usando fallback:", profileErr);
          }

          // Se não achou perfil, tenta criar (resiliência)
          if (!profile) {
             try {
                 await supabase.from('profiles').insert([
                   { 
                     id: data.user.id, 
                     email: data.user.email,
                     name: data.user.user_metadata?.name || 'Usuário',
                     subscription: 'free'
                   }
                 ]);
                 // Tenta buscar de novo
                 const { data: newProfile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
                 profile = newProfile;
             } catch (insertErr) {
                 console.warn("Falha ao criar perfil automático:", insertErr);
             }
          }

          // FALLBACK FINAL: Se tem User do Auth, LOGA DE QUALQUER JEITO
          // Isso impede o loop infinito se o banco de dados (tabela profiles) estiver com erro de RLS
          const userToLog: User = {
             id: data.user.id,
             name: profile?.name || data.user.user_metadata?.name || 'Usuário',
             email: profile?.email || data.user.email || '',
             createdAt: profile?.created_at || new Date().toISOString(),
             subscription: (profile?.subscription as 'free' | 'pro') || 'free'
          };
          
          clearTimeout(timeoutId);
          onLogin(userToLog);
        }

      } else {
        // --- CADASTRO ---
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name // Salva nome nos metadados como backup
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          // Se houver sessão (Auto Confirm ON), cria o perfil agora
          if (data.session) {
             const { error: insertError } = await supabase
              .from('profiles')
              .insert([
                { 
                  id: data.user.id, 
                  name: formData.name,
                  email: formData.email,
                  subscription: 'free'
                }
              ]);
             
             if (insertError) {
               console.warn("Perfil não criado imediatamente (provável RLS), será criado no login.");
             }

             // Auto login
             const newUser: User = {
                id: data.user.id,
                name: formData.name,
                email: formData.email,
                createdAt: new Date().toISOString(),
                subscription: 'free'
             };
             clearTimeout(timeoutId);
             onLogin(newUser);
          } else {
            // Se não houver sessão (Confirmação de Email necessária)
            setSuccessMsg('Cadastro realizado! Verifique seu e-mail para confirmar antes de entrar.');
            setIsLogin(true); // Manda de volta pra tela de login
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.message.includes('security policy')) {
         setError('Erro de permissão no banco de dados. Execute o script SQL de configuração no Supabase.');
      } else if (err.message.includes('Invalid login')) {
         setError('E-mail ou senha incorretos.');
      } else {
         setError(err.message || 'Ocorreu um erro. Verifique seus dados.');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-800 p-10 rounded-[3rem] shadow-2xl animate-fade-in relative z-10">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="mb-6 bg-gradient-to-tr from-indigo-100 to-pink-100 dark:from-indigo-900/40 dark:to-pink-900/40 p-5 rounded-[2rem] shadow-inner">
            <Logo className="w-14 h-14" />
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent uppercase tracking-tighter">
            {isLogin ? 'Bem-vindo de Volta' : 'Criar sua Jornada'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
            {isLogin ? 'Continue sua evolução com Aurora' : 'Comece hoje a organizar sua vida holística'}
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

        <div className="mt-8 flex flex-col items-center gap-6">
          <div className="flex items-center gap-4 w-full">
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ou</span>
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
          </div>

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
