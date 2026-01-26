import React, { useState } from 'react';
import { Check, Star, Shield, Zap, Crown, Loader2, Infinity, Calendar, Clock, Beaker } from 'lucide-react';

interface PricingProps {
  onUpgrade: () => void;
  onCancel: () => void;
}

// ---------------------------------------------------------------------------------------
// CONFIGURAÇÃO DE PAGAMENTO - STRIPE
// ---------------------------------------------------------------------------------------
const STRIPE_LINKS = {
  monthly: "https://buy.stripe.com/4gM9AMd5nehsgaU1qd3Ru05",
  annual: "https://buy.stripe.com/aFabIU0iBehsf6Q5Gt3Ru04",
  lifetime: "https://buy.stripe.com/cNi6oA8P71uG6Akfh33Ru03"
};

export const Pricing = ({ onUpgrade, onCancel }: PricingProps) => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = (planType: 'monthly' | 'annual' | 'lifetime') => {
    setLoadingPlan(planType);
    const link = STRIPE_LINKS[planType];
    
    if (link) {
        window.location.href = link;
    } else {
        setLoadingPlan(null);
        alert("Link de pagamento não encontrado.");
    }
  };

  const simulatePaymentSuccess = () => {
    // Simula o retorno do Stripe adicionando o parâmetro na URL
    const newUrl = window.location.pathname + "?status=success";
    window.location.href = newUrl;
  };

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center min-h-[85vh] py-12 px-4">
      
      {/* Header */}
      <div className="text-center mb-12 max-w-3xl">
        <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-1.5 rounded-full mb-6 border border-indigo-100 dark:border-indigo-800">
            <Crown size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Seja Premium</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter leading-tight">
          Invista no seu <span className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">Futuro</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-xl mx-auto">
          Escolha o plano ideal para desbloquear todas as ferramentas de finanças, saúde, treino e gestão de vida.
        </p>
      </div>

      {/* Grid de Planos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl w-full items-stretch">
        
        {/* PLANO MENSAL */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col hover:border-indigo-500/30 transition-all group">
          <div className="mb-6">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-4 text-slate-600 dark:text-slate-300">
                <Clock size={24} />
            </div>
            <h3 className="text-lg font-black dark:text-white uppercase tracking-tight">Mensal</h3>
            <p className="text-slate-400 text-xs font-bold mt-1">Flexibilidade total</p>
          </div>
          
          <div className="mb-8">
            <span className="text-4xl font-black text-slate-900 dark:text-white">R$ 27</span>
            <span className="text-slate-400 font-bold">,00</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mt-2">Cobrado todo mês</span>
          </div>

          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300"><Check size={14} className="text-indigo-500" /> Acesso total ao App</li>
            <li className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300"><Check size={14} className="text-indigo-500" /> Cancele quando quiser</li>
            <li className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300"><Check size={14} className="text-indigo-500" /> Suporte básico</li>
          </ul>

          <button 
            onClick={() => handleSubscribe('monthly')}
            disabled={!!loadingPlan}
            className="w-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex justify-center"
          >
            {loadingPlan === 'monthly' ? <Loader2 className="animate-spin" size={16}/> : 'Assinar Mensal'}
          </button>
        </div>

        {/* PLANO ANUAL (DESTAQUE) */}
        <div className="bg-slate-900 dark:bg-indigo-950 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col transform md:-translate-y-4 border-2 border-indigo-500">
          <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-bl-2xl z-10">Mais Popular</div>
          <Zap className="absolute -bottom-10 -right-10 w-48 h-48 text-indigo-500/20 rotate-12 pointer-events-none" />
          
          <div className="mb-6 relative z-10">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg shadow-indigo-500/30">
                <Star size={24} fill="currentColor" />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Anual</h3>
            <p className="text-indigo-200 text-xs font-bold mt-1">Melhor custo-benefício</p>
          </div>
          
          <div className="mb-8 relative z-10 text-white">
            <span className="text-5xl font-black">R$ 37</span>
            <span className="text-indigo-300 font-bold">,00</span>
            <div className="mt-2 inline-block bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border border-emerald-500/30">
               Apenas R$ 3,08 / mês
            </div>
          </div>

          <ul className="space-y-4 mb-8 flex-1 relative z-10 text-indigo-100">
            <li className="flex items-center gap-3 text-xs font-bold"><div className="p-0.5 bg-emerald-500 rounded-full"><Check size={10} className="text-white" /></div> Economia massiva</li>
            <li className="flex items-center gap-3 text-xs font-bold"><div className="p-0.5 bg-emerald-500 rounded-full"><Check size={10} className="text-white" /></div> 12 meses de acesso</li>
            <li className="flex items-center gap-3 text-xs font-bold"><div className="p-0.5 bg-emerald-500 rounded-full"><Check size={10} className="text-white" /></div> Todas as funcionalidades</li>
          </ul>

          <button 
            onClick={() => handleSubscribe('annual')}
            disabled={!!loadingPlan}
            className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-900/50 transition-all flex justify-center relative z-10"
          >
             {loadingPlan === 'annual' ? <Loader2 className="animate-spin" size={16}/> : 'Assinar Anual'}
          </button>
        </div>

        {/* PLANO VITALÍCIO */}
        <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-8 rounded-[2.5rem] border border-amber-500/30 shadow-sm flex flex-col group relative overflow-hidden">
          <div className="absolute inset-0 bg-amber-500/5 pointer-events-none"></div>
          <div className="mb-6 relative z-10">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mb-4 text-amber-500">
                <Infinity size={24} />
            </div>
            <h3 className="text-lg font-black dark:text-white uppercase tracking-tight text-amber-600 dark:text-amber-400">Vitalício</h3>
            <p className="text-slate-400 text-xs font-bold mt-1">Pague uma única vez</p>
          </div>
          
          <div className="mb-8 relative z-10">
            <span className="text-4xl font-black text-slate-900 dark:text-white">R$ 87</span>
            <span className="text-slate-400 font-bold">,00</span>
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mt-2">Acesso para sempre</span>
          </div>

          <ul className="space-y-4 mb-8 flex-1 relative z-10">
            <li className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300"><Check size={14} className="text-amber-500" /> Sem mensalidades</li>
            <li className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300"><Check size={14} className="text-amber-500" /> Atualizações futuras</li>
            <li className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300"><Check size={14} className="text-amber-500" /> Badge de Fundador</li>
          </ul>

          <button 
            onClick={() => handleSubscribe('lifetime')}
            disabled={!!loadingPlan}
            className="w-full bg-amber-500 hover:bg-amber-400 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-amber-500/20 transition-all flex justify-center relative z-10"
          >
             {loadingPlan === 'lifetime' ? <Loader2 className="animate-spin" size={16}/> : 'Obter Vitalício'}
          </button>
        </div>

      </div>

      <div className="mt-12 flex flex-col items-center gap-4">
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[10px] font-black uppercase tracking-widest transition-colors">
            Voltar ao plano gratuito
        </button>

        {/* Botão de Teste Oculto/Discreto */}
        <button onClick={simulatePaymentSuccess} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-[9px] font-bold text-slate-400 hover:text-indigo-500 transition-colors uppercase tracking-widest border border-transparent hover:border-indigo-200 dark:hover:border-indigo-900">
            <Beaker size={12} /> Testar Aprovação de Pagamento
        </button>
      </div>
      
      <p className="flex items-center gap-2 text-[9px] text-slate-300 dark:text-slate-600 font-bold uppercase tracking-widest mt-6">
        <Shield size={12} /> Pagamento seguro via Stripe
      </p>
    </div>
  );
};