
import React, { useState } from 'react';
import { Check, Star, Shield, Zap, Crown, Loader2 } from 'lucide-react';

interface PricingProps {
  onUpgrade: () => void; // Chamado apenas quando o pagamento é confirmado
  onCancel: () => void;
}

// Em produção, substitua este link pelo seu Link de Pagamento do Stripe ou Mercado Pago
// Você cria isso no Dashboard do Stripe: Product Catalog -> Add Product -> Create Payment Link
const PAYMENT_LINK = "https://buy.stripe.com/test_..."; 

export const Pricing = ({ onUpgrade, onCancel }: PricingProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = () => {
    setIsLoading(true);
    
    // Simula um pequeno delay para UX
    setTimeout(() => {
        // Redireciona o usuário para o Checkout
        // O link de pagamento deve estar configurado para redirecionar de volta para:
        // https://seu-app.com/?status=success
        window.location.href = `${PAYMENT_LINK}?prefilled_email=user@example.com`; // Você pode passar o email do usuário na URL se o provedor aceitar
        
        // NOTA: Para fins de demonstração SEM link real, vamos comentar o redirect acima
        // e chamar o onUpgrade diretamente após 2 segundos.
        // DESCOMENTE A LINHA ABAIXO PARA USAR O MODO REAL:
        // window.location.href = "https://link-do-seu-stripe.com";
        
        // MODO DEMONSTRAÇÃO (Remova isso quando colocar o link real):
        onUpgrade(); 
    }, 1500);
  };

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center min-h-[80vh] py-10">
      <div className="text-center mb-10 max-w-2xl px-6">
        <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-1.5 rounded-full mb-6">
            <Crown size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Plano Premium</span>
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter leading-tight">
          Desbloqueie seu <span className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">Potencial Total</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
          O Aurora Pro remove todas as barreiras. Acesse ferramentas avançadas de finanças, saúde clínica e gestão de trabalho para acelerar seus resultados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6 max-w-5xl w-full">
        {/* Free Plan */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100 transition-all scale-95">
          <h3 className="text-xl font-black dark:text-white uppercase tracking-tight mb-2">Básico</h3>
          <p className="text-slate-400 text-sm font-bold mb-6">Para quem está começando</p>
          <div className="text-4xl font-black dark:text-white mb-8">Grátis</div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-300"><Check size={18} className="text-indigo-500" /> Rastreamento de Hábitos</li>
            <li className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-300"><Check size={18} className="text-indigo-500" /> Diário Nutricional Básico</li>
            <li className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-300"><Check size={18} className="text-indigo-500" /> Gestão Doméstica</li>
            <li className="flex items-center gap-3 text-sm font-bold text-slate-400 line-through"><Check size={18} className="text-slate-300" /> Controle Financeiro Avançado</li>
            <li className="flex items-center gap-3 text-sm font-bold text-slate-400 line-through"><Check size={18} className="text-slate-300" /> Análise de Exames Clínicos</li>
          </ul>
          
          <button onClick={onCancel} className="w-full py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 font-black uppercase text-[10px] tracking-widest text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
            Continuar Grátis
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 border-2 border-indigo-500">
          <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest px-6 py-2 rounded-bl-2xl">Recomendado</div>
          <Zap className="absolute -bottom-10 -right-10 w-64 h-64 text-indigo-500/10 rotate-12" />
          
          <h3 className="text-xl font-black uppercase tracking-tight mb-2 flex items-center gap-2">Aurora Pro <Star size={18} className="fill-amber-400 text-amber-400"/></h3>
          <p className="text-indigo-200 dark:text-indigo-600 text-sm font-bold mb-6">Controle total da sua vida</p>
          <div className="text-5xl font-black mb-1">R$ 29,90<span className="text-lg opacity-50 font-medium">/mês</span></div>
          <p className="text-[10px] opacity-60 mb-8 uppercase tracking-widest">Cancele quando quiser</p>
          
          <ul className="space-y-4 mb-10 relative z-10">
            <li className="flex items-center gap-3 text-sm font-bold"><div className="p-1 bg-emerald-500 rounded-full"><Check size={12} className="text-white" /></div> Acesso Ilimitado a Tudo</li>
            <li className="flex items-center gap-3 text-sm font-bold"><div className="p-1 bg-emerald-500 rounded-full"><Check size={12} className="text-white" /></div> Finanças & Investimentos</li>
            <li className="flex items-center gap-3 text-sm font-bold"><div className="p-1 bg-emerald-500 rounded-full"><Check size={12} className="text-white" /></div> Saúde & Exames Laboratoriais</li>
            <li className="flex items-center gap-3 text-sm font-bold"><div className="p-1 bg-emerald-500 rounded-full"><Check size={12} className="text-white" /></div> Gestão de Trabalho & Freelance</li>
            <li className="flex items-center gap-3 text-sm font-bold"><div className="p-1 bg-emerald-500 rounded-full"><Check size={12} className="text-white" /></div> Suporte Prioritário</li>
          </ul>
          
          <button 
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-indigo-900/50 transition-all active:scale-95 relative z-10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <>Assinar Agora <Shield size={16} /></>}
          </button>
          
          <p className="text-center text-[9px] opacity-40 mt-4 font-medium uppercase tracking-wider">Pagamento 100% Seguro via Stripe</p>
        </div>
      </div>
    </div>
  );
};
