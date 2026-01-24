
import React, { useState, useEffect } from 'react';
import { WorkShift, Reminder } from '../types';
import { Briefcase, CheckSquare, Trash, Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Share2, Info } from 'lucide-react';

interface WorkProps {
  storagePrefix: string;
  userName: string;
}

export const Work = ({ storagePrefix, userName }: WorkProps) => {
    const shiftsKey = `${storagePrefix}work_shifts`;
    const tasksKey = `${storagePrefix}work_tasks`;
    const scheduleKey = `${storagePrefix}work_schedule`;

    const [shifts, setShifts] = useState<WorkShift[]>(() => {
        const saved = localStorage.getItem(shiftsKey);
        return saved ? JSON.parse(saved) : [];
    });
    const [tasks, setTasks] = useState<Reminder[]>(() => {
        const saved = localStorage.getItem(tasksKey);
        return saved ? JSON.parse(saved) : [];
    });
    const [schedule, setSchedule] = useState<Record<string, string[]>>(() => {
        const saved = localStorage.getItem(scheduleKey);
        return saved ? JSON.parse(saved) : {};
    });

    const [newJobName, setNewJobName] = useState('');
    const [newTask, setNewTask] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem(shiftsKey, JSON.stringify(shifts));
        localStorage.setItem(tasksKey, JSON.stringify(tasks));
        localStorage.setItem(scheduleKey, JSON.stringify(schedule));
    }, [shifts, tasks, schedule, shiftsKey, tasksKey, scheduleKey]);

    const today = new Date();
    const isToday = (day: number) => {
        return today.getDate() === day && 
               today.getMonth() === currentDate.getMonth() && 
               today.getFullYear() === currentDate.getFullYear();
    };

    const jobColors = ['bg-indigo-500', 'bg-pink-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-sky-500'];
    const getJobColor = (index: number) => jobColors[index % jobColors.length];
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const addJob = () => {
        if (!newJobName.trim()) return;
        const newJob = { id: Date.now().toString(), jobName: newJobName, isWorking: false };
        setShifts([...shifts, newJob]);
        setNewJobName('');
        if (!selectedJobId) setSelectedJobId(newJob.id);
    };

    const deleteJob = (id: string) => {
        setShifts(shifts.filter(s => s.id !== id));
        if (selectedJobId === id) setSelectedJobId(null);
    };

    const addTask = () => {
        if (!newTask.trim()) return;
        setTasks([...tasks, { id: Date.now().toString(), text: newTask, completed: false }]);
        setNewTask('');
    };

    const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const toggleDaySchedule = (day: number) => {
        if (!selectedJobId) return;
        const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const currentJobsOnDay = schedule[dateKey] || [];
        const newJobsOnDay = currentJobsOnDay.includes(selectedJobId) 
            ? currentJobsOnDay.filter(id => id !== selectedJobId) 
            : [...currentJobsOnDay, selectedJobId];
        setSchedule({ ...schedule, [dateKey]: newJobsOnDay });
    };

    return (
        <div className="space-y-8 animate-fade-in pb-16 px-1 sm:px-0">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Trabalho</h2>
                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-2xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                    <Briefcase size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Contas de {userName.split(' ')[0]}</span>
                </div>
             </div>
             
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <section className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Meus Contratos / Projetos</h3>
                        <div className="flex gap-2 mb-6">
                            <input type="text" value={newJobName} onChange={(e) => setNewJobName(e.target.value)} placeholder="Nome do local ou job..." className="flex-1 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm focus:border-indigo-500 outline-none dark:text-white font-bold" onKeyDown={(e) => e.key === 'Enter' && addJob()} />
                            <button onClick={addJob} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-5 py-3 shadow-lg active:scale-95 transition-all"><Plus size={20} /></button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {shifts.map((shift, idx) => (
                                <div key={shift.id} className="p-4 rounded-3xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900/50 flex justify-between items-center group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${getJobColor(idx)}`} />
                                        <span className="font-bold text-slate-800 dark:text-white text-sm">{shift.jobName}</span>
                                    </div>
                                    <button onClick={() => deleteJob(shift.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash size={14}/></button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="text-lg font-black dark:text-white mb-6 uppercase tracking-tight">Checklist de Trabalho</h3>
                        <div className="flex gap-2 mb-6">
                            <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="O que fazer hoje?" className="flex-1 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm dark:text-white font-bold outline-none focus:border-indigo-500" onKeyDown={(e) => e.key === 'Enter' && addTask()} />
                            <button onClick={addTask} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl px-5 py-3 transition-all active:scale-95"><Plus size={20} /></button>
                        </div>
                        <div className="space-y-2">
                            {tasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all">
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" checked={task.completed} onChange={() => setTasks(tasks.map(t => t.id === task.id ? {...t, completed: !t.completed} : t))} className="w-5 h-5 rounded-lg border-2 border-slate-200 text-indigo-600" />
                                        <span className={`text-sm font-bold ${task.completed ? 'line-through text-slate-400' : 'dark:text-white'}`}>{task.text}</span>
                                    </div>
                                    <button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} className="text-slate-300 hover:text-red-500"><Trash size={14}/></button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700 p-8 h-fit">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <CalendarIcon className="text-indigo-500" size={24} />
                            <h3 className="text-xl font-black dark:text-white uppercase tracking-tight">Escala Mensal</h3>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
                            <button onClick={() => changeMonth(-1)} className="p-2 text-slate-600 dark:text-slate-300"><ChevronLeft size={18} /></button>
                            <span className="px-2 font-black text-xs uppercase dark:text-white">{monthNames[currentDate.getMonth()]}</span>
                            <button onClick={() => changeMonth(1)} className="p-2 text-slate-600 dark:text-slate-300"><ChevronRight size={18} /></button>
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Agendar para:</label>
                        <div className="flex flex-wrap gap-2">
                            {shifts.map((shift, idx) => (
                                <button key={shift.id} onClick={() => setSelectedJobId(shift.id)} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border-2 ${selectedJobId === shift.id ? 'border-indigo-500 bg-indigo-500 text-white shadow-md shadow-indigo-200 dark:shadow-none' : 'border-slate-100 dark:border-slate-700 text-slate-400 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100'}`}>
                                    {shift.jobName}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => <div key={d} className="text-center text-[10px] font-black text-slate-300">{d}</div>)}
                        {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, i) => <div key={i} />)}
                        {Array.from({ length: getDaysInMonth(currentDate) }).map((_, i) => {
                            const day = i + 1;
                            const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const jobsOnDay = schedule[dateKey] || [];
                            return (
                                <div key={day} onClick={() => toggleDaySchedule(day)} className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all hover:scale-105 active:scale-90 ${isToday(day) ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 dark:border-slate-800'}`}>
                                    <span className="text-[10px] font-black dark:text-white">{day}</span>
                                    <div className="flex gap-0.5">
                                        {jobsOnDay.map(jId => {
                                            const idx = shifts.findIndex(s => s.id === jId);
                                            return <div key={jId} className={`w-1 h-1 rounded-full ${getJobColor(idx)}`} />
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
             </div>
        </div>
    );
};
