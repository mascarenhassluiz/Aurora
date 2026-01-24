
import React, { useState, useEffect, useMemo } from 'react';
import { Reminder, User, Habit, Transaction, Meal } from '../types';
import { Plus, Trash2, CheckCircle, Activity, TrendingUp, Wallet, BookOpen, Bell, Clock, Calendar, Sparkles } from 'lucide-react';

interface DashboardProps {
  user: User;
}

export const Dashboard = ({ user }: DashboardProps) => {
  const prefix = `aurora_${user.email}_`;
  const remindersKey = `${prefix}reminders`;
  
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem(remindersKey);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [newReminder, setNewReminder] = useState('');

  // Estados de "Read-Only" para o resumo
  const habitsProgress = useMemo(() => {
    const saved = localStorage.getItem(`${prefix}habits`);
    if (!saved) return 0;
    const habits: Habit[] = JSON.parse(saved);
    if (habits.length === 0) return 0;
    const completed = habits.filter(h => h.completedToday).length;
    return Math.round((completed / habits.length) * 100);
  }, [prefix]);

  const financialBalance = useMemo(() => {
    const saved = localStorage.getItem(`${prefix}finances`);
    if (!saved) return 0;
    const transactions: Transaction[] = JSON.parse(saved);
    return transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
  }, [prefix]);

  const caloriesTotal = useMemo(() => {
    const saved = localStorage.getItem(`${prefix}meals`);
    if (!saved) return 0;
    const meals: Meal[] = JSON.parse(saved);
    return meals.reduce((acc, m) => acc + m.items.reduce((a, b) => a + b.calories, 0), 0);
  }, [prefix]);

  useEffect(() => {
    localStorage.setItem(remindersKey, JSON.stringify(reminders));
  }, [reminders, remindersKey]);

  const addReminder = () => {
    if (!newReminder.trim()) return;
    setReminders([{ id: Date.now().toString(), text: newReminder, completed: false }, ...reminders]);
    setNewReminder('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
          Olá, <span className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">{user.name.split(' ')[0]}</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Sua evolução real baseada nos seus registros.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border dark:border-slate-700 shadow-sm">
            <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600"><Activity size={20} /></div>
                <h3 className="text-[10px] font-black dark:text-white uppercase tracking-widest">Calorias</h3>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{caloriesTotal} <span className="text-xs font-normal opacity-40 uppercase">kcal</span></p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border dark:border-slate-700 shadow-sm">
            <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600"><Wallet size={20} /></div>
                <h3 className="text-[10px] font-black dark:text-white uppercase tracking-widest">Financeiro</h3>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">R$ {financialBalance.toLocaleString('pt-BR')}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border dark:border-slate-700 shadow-sm">
            <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600"><TrendingUp size={20} /></div>
                <h3 className="text-[10px] font-black dark:text-white uppercase tracking-widest">Hábitos</h3>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{habitsProgress}%</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border dark:border-slate-700 shadow-sm">
            <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600"><Bell size={20} /></div>
                <h3 className="text-[10px] font-black dark:text-white uppercase tracking-widest">Pendências</h3>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{reminders.filter(r => !r.completed).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[3rem] p-8 border dark:border-slate-700">
            <h2 className="text-xl font-black dark:text-white uppercase tracking-tight mb-8">Lembretes</h2>
            <div className="flex gap-2 mb-8">
                <input 
                    type="text" 
                    value={newReminder}
                    onChange={(e) => setNewReminder(e.target.value)}
                    placeholder="Algo importante?"
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-6 py-4 text-sm font-bold dark:text-white outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && addReminder()}
                />
                <button onClick={addReminder} className="bg-indigo-600 text-white px-8 rounded-2xl font-black uppercase tracking-widest text-[10px]">Add</button>
            </div>
            <div className="space-y-2">
                {reminders.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl">
                        <span className={`text-sm font-bold ${r.completed ? 'line-through opacity-30' : 'dark:text-white'}`}>{r.text}</span>
                        <button onClick={() => setReminders(reminders.filter(rem => rem.id !== r.id))} className="text-slate-300 hover:text-rose-500"><Trash2 size={18}/></button>
                    </div>
                ))}
            </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-600 to-pink-600 rounded-[3rem] p-10 text-white flex flex-col justify-center">
            <Sparkles size={32} className="mb-4 opacity-50" />
            <p className="font-medium italic leading-relaxed">"Sua jornada é única. O Aurora ajuda você a enxergar os padrões que levam ao sucesso."</p>
        </div>
      </div>
    </div>
  );
};
