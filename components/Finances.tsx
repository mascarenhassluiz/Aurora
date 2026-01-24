
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction } from '../types';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Briefcase, TrendingUp, Trash2, Calendar, Tag, CreditCard, PiggyBank, Search } from 'lucide-react';

interface FinancesProps {
  storagePrefix: string;
  userName: string;
}

const PREDEFINED_CATEGORIES = ['Lazer', 'Alimentação', 'Transporte', 'Saúde', 'Educação', 'Moradia', 'Investimentos', 'Salário', 'Outros'];

export const Finances = ({ storagePrefix, userName }: FinancesProps) => {
    const financesKey = `${storagePrefix}finances`;
    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        const saved = localStorage.getItem(financesKey);
        return saved ? JSON.parse(saved) : [];
    });

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<Transaction['type']>('variable_expense');
    const [category, setCategory] = useState(PREDEFINED_CATEGORIES[0]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        localStorage.setItem(financesKey, JSON.stringify(transactions));
    }, [transactions, financesKey]);

    const addTransaction = () => {
        if (!description || !amount) return;
        setTransactions([{
            id: Date.now().toString(),
            description,
            amount: parseFloat(amount),
            type,
            category: category === 'custom' ? 'Outros' : category,
            date: new Date().toISOString()
        }, ...transactions]);
        setDescription('');
        setAmount('');
        setCategory(PREDEFINED_CATEGORIES[0]);
    };

    const deleteTransaction = (id: string) => {
        setTransactions(transactions.filter(t => t.id !== id));
    };

    const stats = useMemo(() => transactions.reduce((acc, curr) => {
        if (curr.type === 'income') acc.income += curr.amount;
        else if (curr.type === 'investment') acc.investments += curr.amount;
        else acc.expenses += curr.amount;
        return acc;
    }, { income: 0, expenses: 0, investments: 0 }), [transactions]);

    const balance = stats.income - stats.expenses - stats.investments;

    const filteredTransactions = transactions.filter(t => 
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (t.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in pb-20">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Finanças</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Controle de capital de {userName.split(' ')[0]}</p>
                </div>
                <div className="relative w-full md:w-64">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input 
                    type="text" 
                    placeholder="Buscar transação..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-sm font-bold dark:text-white outline-none focus:ring-2 ring-indigo-500/20"
                   />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-emerald-500 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
                    <ArrowUpCircle className="absolute right-[-10px] top-[-10px] w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1 block">Receitas</span>
                    <p className="text-3xl font-black">R$ {stats.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-rose-500 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
                    <ArrowDownCircle className="absolute right-[-10px] top-[-10px] w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1 block">Despesas</span>
                    <p className="text-3xl font-black">R$ {stats.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
                    <PiggyBank className="absolute right-[-10px] top-[-10px] w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1 block">Investido</span>
                    <p className="text-3xl font-black">R$ {stats.investments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border dark:border-slate-700 flex flex-col justify-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Saldo Líquido</span>
                    <p className={`text-3xl font-black ${balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lado Esquerdo: Formulário */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border dark:border-slate-700 shadow-sm h-fit">
                    <h3 className="text-sm font-black dark:text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                        <DollarSign className="text-emerald-500" size={18} /> Novo Lançamento
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Descrição</label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Salário, Aluguel..." className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl px-6 py-4 dark:text-white font-bold outline-none border-2 border-transparent focus:border-indigo-500 transition-all" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Valor (R$)</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0,00" className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl px-6 py-4 dark:text-white font-bold outline-none border-2 border-transparent focus:border-indigo-500 transition-all" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Tipo</label>
                            <select value={type} onChange={(e: any) => setType(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl px-6 py-4 dark:text-white font-bold outline-none border-2 border-transparent focus:border-indigo-500 transition-all appearance-none">
                                <option value="income">Receita (Entrada)</option>
                                <option value="fixed_expense">Gasto Fixo</option>
                                <option value="variable_expense">Gasto Variável</option>
                                <option value="investment">Investimento</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Categoria</label>
                            <select 
                                value={category} 
                                onChange={e => setCategory(e.target.value)} 
                                className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl px-6 py-4 dark:text-white font-bold outline-none border-2 border-transparent focus:border-indigo-500 transition-all appearance-none"
                            >
                                {PREDEFINED_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <button onClick={addTransaction} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                            Confirmar Lançamento
                        </button>
                    </div>
                </div>

                {/* Lado Direito: Histórico */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-[3rem] border dark:border-slate-700 shadow-sm flex flex-col">
                    <h3 className="text-sm font-black dark:text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                        <Calendar className="text-indigo-500" size={18} /> Extrato Detalhado
                    </h3>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredTransactions.map(t => (
                            <div key={t.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20' : t.type === 'investment' ? 'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20' : 'bg-rose-50 text-rose-500 dark:bg-rose-900/20'}`}>
                                        {t.type === 'income' ? <ArrowUpCircle size={20}/> : t.type === 'investment' ? <PiggyBank size={20}/> : <ArrowDownCircle size={20}/>}
                                    </div>
                                    <div>
                                        <h4 className="font-bold dark:text-white text-sm">{t.description}</h4>
                                        <div className="flex gap-2 items-center">
                                            <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md text-[8px] font-black text-indigo-500 uppercase tracking-widest shadow-sm">{t.category}</span>
                                            <span className="text-[9px] font-black text-slate-300 uppercase">•</span>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(t.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className={`font-black text-sm ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-700 dark:text-white'}`}>
                                        {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                    <button onClick={() => deleteTransaction(t.id)} className="text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2">
                                        <Trash2 size={18}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filteredTransactions.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 opacity-20 text-slate-400">
                                <DollarSign size={64} />
                                <p className="text-[10px] font-black mt-4 uppercase tracking-[0.3em]">Nenhum registro encontrado</p>
                            </div>
                        )}
                    </div>
                </div>
             </div>
        </div>
    );
};
