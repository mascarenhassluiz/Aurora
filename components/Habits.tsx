
import React, { useState, useMemo, useEffect } from 'react';
import { Habit } from '../types';
import { Plus, Check, Trash2, Target, Trophy, Flame, Calendar, Sparkles, Share2, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HabitsProps {
  storagePrefix: string;
  userName: string;
}

const INITIAL_HABITS: Habit[] = [
  { id: '1', name: 'Beber 3L de Água', streak: 0, completedToday: false, history: [], icon: '💧', color: 'bg-blue-500' },
  { id: '2', name: 'Ler 10 páginas', streak: 0, completedToday: false, history: [], icon: '📚', color: 'bg-amber-500' },
  { id: '3', name: 'Meditação', streak: 0, completedToday: false, history: [], icon: '🧘', color: 'bg-purple-500' },
  { id: '4', name: 'Exercício Físico', streak: 0, completedToday: false, history: [], icon: '💪', color: 'bg-rose-500' },
];

const AVAILABLE_EMOJIS = ['✨', '💪', '🧠', '🏃', '💤', '🥗', '🎸', '💻', '☀️', '💊', '📝', '💧', '📚', '🧘', '🚶', '🍎', '🍵', '🎨', '🔇', '🤝'];

export const Habits = ({ storagePrefix, userName }: HabitsProps) => {
  const [mounted, setMounted] = useState(false);
  const habitsKey = `${storagePrefix}habits`;
  const resetKey = `${storagePrefix}habits_last_reset`;
  const goalKey = `${storagePrefix}habits_goal`;
  
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem(habitsKey);
    const lastResetStr = localStorage.getItem(resetKey);
    const todayStr = new Date().toDateString();

    if (saved) {
      let parsedHabits = JSON.parse(saved);
      if (lastResetStr && lastResetStr !== todayStr) {
        parsedHabits = parsedHabits.map((h: Habit) => ({ ...h, completedToday: false }));
        localStorage.setItem(resetKey, todayStr);
      }
      return parsedHabits;
    }
    return INITIAL_HABITS;
  });

  const [newHabitName, setNewHabitName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(AVAILABLE_EMOJIS[0]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(() => Number(localStorage.getItem(goalKey)) || 3);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    localStorage.setItem(habitsKey, JSON.stringify(habits));
    localStorage.setItem(goalKey, dailyGoal.toString());
  }, [habits, dailyGoal, habitsKey, goalKey]);

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    setHabits([...habits, { 
        id: Date.now().toString(), 
        name: newHabitName, 
        streak: 0, 
        completedToday: false, 
        history: [],
        icon: selectedEmoji,
        color: 'bg-indigo-500'
    }]);
    setNewHabitName('');
    setShowEmojiPicker(false);
  };

  const toggleHabit = (id: string) => {
    setHabits(habits.map(h => h.id === id ? { ...h, completedToday: !h.completedToday, streak: !h.completedToday ? h.streak + 1 : Math.max(0, h.streak - 1) } : h));
  };

  const deleteHabit = (id: string) => {
      setHabits(habits.filter(h => h.id !== id));
  };

  const completedCount = habits.filter(h => h.completedToday).length;
  const progressPercentage = dailyGoal > 0 ? Math.min((completedCount / dailyGoal) * 100, 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Hábitos</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Consistência diária para {userName.split(' ')[0]}</p>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                <Calendar size={18} className="text-indigo-500" />
                <span className="text-xs font-black dark:text-slate-200">{new Date().toLocaleDateString('pt-BR')}</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-xl flex flex-col justify-center relative overflow-hidden">
                <Sparkles className="absolute right-[-10px] top-[-10px] w-32 h-32 opacity-10" />
                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Progresso Diário</h3>
                <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-6xl font-black">{completedCount}</span>
                    <span className="text-2xl opacity-40">/ {dailyGoal}</span>
                </div>
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white transition-all duration-700 shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${progressPercentage}%` }} />
                </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
                <div className="bg-white dark:bg-slate-800 p-2 rounded-[2rem] flex flex-col sm:flex-row gap-2 border dark:border-slate-700 shadow-sm transition-all focus-within:ring-2 ring-indigo-500/20">
                    <div className="flex flex-1 gap-2">
                      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-2xl text-xl hover:bg-slate-100 transition-colors">
                          {selectedEmoji}
                      </button>
                      <input 
                        type="text" 
                        value={newHabitName} 
                        onChange={e => setNewHabitName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addHabit()}
                        placeholder="Novo hábito..." 
                        className="flex-1 bg-transparent px-2 outline-none dark:text-white font-bold placeholder:text-slate-400 placeholder:font-medium py-3"
                      />
                    </div>
                    <button onClick={addHabit} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 sm:py-0 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 w-full sm:w-auto">
                      Adicionar Hábito
                    </button>
                </div>

                {showEmojiPicker && (
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border dark:border-slate-700 grid grid-cols-5 sm:grid-cols-10 gap-2 animate-scale-in">
                    {AVAILABLE_EMOJIS.map(emoji => (
                      <button key={emoji} onClick={() => { setSelectedEmoji(emoji); setShowEmojiPicker(false); }} className={`w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-all ${selectedEmoji === emoji ? 'bg-indigo-50 dark:bg-indigo-900/40 ring-2 ring-indigo-500' : ''}`}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {habits.map(habit => (
                        <div key={habit.id} className="bg-white dark:bg-slate-800 p-5 rounded-[2.5rem] border dark:border-slate-700 flex items-center justify-between group hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-2xl text-2xl shadow-inner">{habit.icon}</div>
                                <div>
                                    <h4 className={`font-bold transition-all ${habit.completedToday ? 'line-through text-slate-400' : 'dark:text-white'}`}>{habit.name}</h4>
                                    <div className="flex items-center gap-1">
                                      <Flame size={12} className={habit.streak > 0 ? "text-orange-500" : "text-slate-300"} />
                                      <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{habit.streak} dias</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => toggleHabit(habit.id)}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${habit.completedToday ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-100 dark:border-slate-700 text-slate-200'}`}
                              >
                                  <Check size={24} strokeWidth={4} />
                              </button>
                              <button onClick={() => deleteHabit(habit.id)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 size={18} />
                              </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};
