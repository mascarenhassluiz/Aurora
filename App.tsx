
import React, { useState, useEffect } from 'react';
import { NavigationTab, User } from './types';
import { Dashboard } from './components/Dashboard';
import { Habits } from './components/Habits';
import { Finances } from './components/Finances';
import { Work } from './components/Work';
import { HomeManagement } from './components/HomeManagement';
import { Nutrition } from './components/Nutrition';
import { Workout } from './components/Workout';
import { Studies } from './components/Studies';
import { Health } from './components/Health';
import { Pricing } from './components/Pricing';
import { Logo } from './components/Logo';
import { Auth } from './components/Auth';
import { supabase } from './supabaseClient'; // Import Supabase
import { 
  LayoutDashboard, 
  Activity, 
  DollarSign, 
  Briefcase, 
  Home, 
  Utensils, 
  Dumbbell, 
  BookOpen, 
  Sun, 
  Moon,
  Menu,
  X,
  LogOut,
  HeartPulse,
  Lock
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);

  // Initialize Session from Supabase
  useEffect(() => {
    let mounted = true;

    // 1. Verificar sessão atual
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
           console.warn("Erro ao conectar com Supabase (verifique suas chaves):", error.message);
        }

        if (data?.session?.user && mounted) {
          // Buscar dados do perfil
          const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.session.user.id)
              .single();
              
          if (profile && !profileError) {
              setCurrentUser({
                  id: profile.id,
                  name: profile.name,
                  email: profile.email,
                  createdAt: profile.created_at,
                  subscription: profile.subscription
              });
          }
        }
      } catch (err) {
        console.error("Erro crítico na inicialização do Supabase:", err);
      } finally {
        if (mounted) setLoadingSession(false);
      }
    };

    getSession();

    // 2. Ouvir mudanças na autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && mounted) {
         try {
           const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
           
           if (profile) {
              setCurrentUser({
                  id: profile.id,
                  name: profile.name,
                  email: profile.email,
                  createdAt: profile.created_at,
                  subscription: profile.subscription
              });
           }
         } catch (e) {
           console.error("Erro ao buscar perfil:", e);
         }
      } else if (mounted) {
        setCurrentUser(null);
      }
    });
    
    // Tema
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Check for Payment Success in URL
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('status') === 'success' && currentUser) {
      setTimeout(async () => {
         // Atualiza o banco de dados (Isso idealmente seria via Webhook, mas aqui fazemos front-side para o MVP)
         if (currentUser.subscription !== 'pro') {
             try {
                const { error } = await supabase
                    .from('profiles')
                    .update({ subscription: 'pro' })
                    .eq('id', currentUser.id);

                if (!error) {
                    setCurrentUser({ ...currentUser, subscription: 'pro' });
                    alert('Pagamento confirmado! Bem-vindo ao Aurora Pro.');
                }
             } catch (e) {
                console.error("Erro ao atualizar assinatura:", e);
             }
         }
         window.history.replaceState({}, document.title, window.location.pathname);
      }, 500);
    }
  }, [currentUser]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setShowPricing(false);
      setActiveTab('dashboard');
    } catch (e) {
      console.error("Erro ao sair:", e);
    }
  };

  const handleUpgrade = async () => {
    if (!currentUser) return;
    
    // Simulação manual (remover em produção com Stripe real)
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ subscription: 'pro' })
            .eq('id', currentUser.id);

        if (!error) {
            setCurrentUser({ ...currentUser, subscription: 'pro' });
            setShowPricing(false);
        }
    } catch (e) {
        console.error("Erro upgrade manual:", e);
    }
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; isPro?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'habits', label: 'Hábitos', icon: <Activity size={20} /> },
    { id: 'nutrition', label: 'Nutrição', icon: <Utensils size={20} /> },
    { id: 'workout', label: 'Treino', icon: <Dumbbell size={20} /> },
    { id: 'home', label: 'Casa', icon: <Home size={20} /> },
    { id: 'studies', label: 'Estudos', icon: <BookOpen size={20} /> },
    { id: 'finances', label: 'Finanças', icon: <DollarSign size={20} />, isPro: true },
    { id: 'work', label: 'Trabalho', icon: <Briefcase size={20} />, isPro: true },
    { id: 'health', label: 'Saúde', icon: <HeartPulse size={20} />, isPro: true }, 
  ];

  if (loadingSession) {
      return (
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center gap-4">
                  <Logo className="w-12 h-12" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Carregando Aurora...</p>
              </div>
          </div>
      );
  }

  if (!currentUser) {
    return <Auth onLogin={(user) => setCurrentUser(user)} />;
  }

  const renderContent = () => {
    if (showPricing) {
      return <Pricing onUpgrade={handleUpgrade} onCancel={() => setShowPricing(false)} />;
    }

    const storagePrefix = `aurora_${currentUser.email}_`;
    const userName = currentUser.name;
    
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={currentUser} />;
      case 'habits': return <Habits storagePrefix={storagePrefix} userName={userName} />;
      case 'finances': return <Finances storagePrefix={storagePrefix} userName={userName} />;
      case 'work': return <Work storagePrefix={storagePrefix} userName={userName} />;
      case 'home': return <HomeManagement storagePrefix={storagePrefix} userName={userName} />;
      case 'nutrition': return <Nutrition storagePrefix={storagePrefix} userName={userName} />;
      case 'workout': return <Workout storagePrefix={storagePrefix} userName={userName} />;
      case 'studies': return <Studies storagePrefix={storagePrefix} userName={userName} />;
      case 'health': return <Health storagePrefix={storagePrefix} userName={userName} />;
      default: return <Dashboard user={currentUser} />;
    }
  };

  const handleTabChange = (tab: NavigationTab) => {
    const targetTab = navItems.find(t => t.id === tab);
    
    if (targetTab?.isPro && currentUser.subscription !== 'pro') {
        setShowPricing(true);
        setIsMobileMenuOpen(false);
        return;
    }

    setShowPricing(false);
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] lg:hidden backdrop-blur-sm transition-opacity duration-300" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-3 p-6 border-b border-slate-100 dark:border-slate-800">
            <Logo className="w-10 h-10" />
            <div>
              <span className="block text-xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent uppercase tracking-tight">Aurora</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold truncate max-w-[120px]">{currentUser.name}</span>
                  {currentUser.subscription === 'pro' && (
                      <span className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest">Pro</span>
                  )}
                  {currentUser.subscription === 'free' && (
                      <span className="bg-slate-200 dark:bg-slate-700 text-slate-500 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest">Free</span>
                  )}
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            {navItems.map((item) => {
              const isLocked = item.isPro && currentUser.subscription !== 'pro';
              return (
                <button 
                    key={item.id} 
                    onClick={() => handleTabChange(item.id)} 
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 group ${activeTab === item.id && !showPricing ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon} {item.label}
                  </div>
                  {isLocked && <Lock size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
             {currentUser.subscription === 'free' && (
                 <button onClick={() => setShowPricing(true)} className="w-full mb-4 bg-gradient-to-r from-indigo-600 to-pink-600 text-white p-4 rounded-2xl shadow-lg transform hover:scale-[1.02] active:scale-95 transition-all text-center">
                     <p className="text-xs font-black uppercase tracking-widest mb-1">Faça Upgrade</p>
                     <p className="text-[10px] opacity-90">Desbloqueie todo o poder</p>
                 </button>
             )}
             
             <button onClick={toggleTheme} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300">
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                <span className="text-sm font-medium">{darkMode ? 'Claro' : 'Escuro'}</span>
             </button>
             <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/10 text-rose-600 font-black uppercase text-[9px]">
                <LogOut size={14} /> Sair
             </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b sticky top-0 z-40">
           <Logo className="w-8 h-8" />
           <button onClick={() => setIsMobileMenuOpen(true)} className="p-2"><Menu size={24} /></button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth pb-32 lg:pb-8">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
        </div>
      </main>
    </div>
  );
}
