
import React, { useState, useEffect, useMemo } from 'react';
import { WorkoutSession, RunSession, TrainingSheet, TrainingExercise } from '../types';
import { 
  Dumbbell, Timer, Trash2, Activity, Plus, ClipboardList, X, Repeat, Coffee, ChevronRight, CheckCircle2, Trophy, Zap, Star, HelpCircle, TrendingUp, BarChart3, MapPin, Footprints, Heart, Bike, Gauge, Flame, ArrowRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface WorkoutProps {
  storagePrefix: string;
  userName: string;
}

// Extensão local para suportar novos campos no Cardio sem quebrar a tipagem global imediatamente
interface ExtendedRunSession extends RunSession {
  type?: 'run' | 'walk' | 'bike';
  intensity?: 'low' | 'moderate' | 'high';
}

export const Workout = ({ storagePrefix, userName }: WorkoutProps) => {
    const liftingKey = `${storagePrefix}workout_lifting`;
    const runsKey = `${storagePrefix}workout_runs`;
    const sheetsKey = `${storagePrefix}workout_sheets`;

    const [activeSubTab, setActiveSubTab] = useState<'lifting' | 'cardio' | 'sheets' | 'records'>('lifting');
    
    const [liftingLog, setLiftingLog] = useState<WorkoutSession[]>(() => {
        const saved = localStorage.getItem(liftingKey);
        return saved ? JSON.parse(saved) : [];
    });
    
    const [runLog, setRunLog] = useState<ExtendedRunSession[]>(() => {
        const saved = localStorage.getItem(runsKey);
        return saved ? JSON.parse(saved) : [];
    });
    
    const [sheets, setSheets] = useState<TrainingSheet[]>(() => {
        const saved = localStorage.getItem(sheetsKey);
        return saved ? JSON.parse(saved) : [];
    });

    const [liftForm, setLiftForm] = useState({ exercise: '', weight: '', sets: '', reps: '', rpe: '' });
    
    // Cardio Form State
    const [runForm, setRunForm] = useState({ dist: '', time: '' });
    const [cardioType, setCardioType] = useState<'run' | 'walk' | 'bike'>('run');
    const [cardioIntensity, setCardioIntensity] = useState<'low' | 'moderate' | 'high'>('moderate');

    const [newSheetName, setNewSheetName] = useState('');
    const [editingSheetId, setEditingSheetId] = useState<string | null>(null);
    const [newExercise, setNewExercise] = useState({ name: '', sets: '', reps: '', rest: '', load: '' });
    
    const [restTime, setRestTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [showRpeHelp, setShowRpeHelp] = useState(false);

    // Chart State
    const [selectedGraphExercise, setSelectedGraphExercise] = useState<string>('');

    useEffect(() => {
        localStorage.setItem(liftingKey, JSON.stringify(liftingLog));
        localStorage.setItem(runsKey, JSON.stringify(runLog));
        localStorage.setItem(sheetsKey, JSON.stringify(sheets));
    }, [liftingLog, runLog, sheets, liftingKey, runsKey, sheetsKey]);

    useEffect(() => {
        if (!selectedGraphExercise && liftingLog.length > 0) {
            setSelectedGraphExercise(liftingLog[0].exercise);
        }
    }, [liftingLog, selectedGraphExercise]);

    useEffect(() => {
      let interval: any;
      if (isTimerRunning && restTime > 0) {
        interval = setInterval(() => setRestTime(prev => prev - 1), 1000);
      } else if (restTime === 0) {
        setIsTimerRunning(false);
      }
      return () => clearInterval(interval);
    }, [isTimerRunning, restTime]);

    const startRestTimer = (seconds: number) => {
      setRestTime(seconds);
      setIsTimerRunning(true);
    };

    const addLift = () => {
        if (!liftForm.exercise) return;
        setLiftingLog([{
            id: Date.now().toString(),
            exercise: liftForm.exercise,
            weight: Number(liftForm.weight) || 0,
            sets: Number(liftForm.sets) || 1,
            reps: Number(liftForm.reps) || 0,
            rpe: Number(liftForm.rpe) || 0,
            date: new Date().toLocaleDateString('pt-BR')
        }, ...liftingLog]);
        setLiftForm({ exercise: '', weight: '', sets: '', reps: '', rpe: '' });
        setSelectedGraphExercise(liftForm.exercise);
    };

    const addRun = () => {
        if (!runForm.dist || !runForm.time) return;
        const newSession: ExtendedRunSession = {
            id: Date.now().toString(),
            distanceKm: Number(runForm.dist),
            timeMinutes: Number(runForm.time),
            date: new Date().toLocaleDateString('pt-BR'),
            type: cardioType,
            intensity: cardioIntensity
        };
        setRunLog([newSession, ...runLog]);
        setRunForm({ dist: '', time: '' });
    };

    const deleteRun = (id: string) => {
        setRunLog(runLog.filter(r => r.id !== id));
    };

    const createSheet = () => {
        if (!newSheetName.trim()) return;
        setSheets([{ id: Date.now().toString(), name: newSheetName, exercises: [] }, ...sheets]);
        setNewSheetName('');
    };

    const addExerciseToSheet = (sheetId: string) => {
        if (!newExercise.name.trim()) return;
        const exercise: TrainingExercise = {
            id: Date.now().toString(),
            name: newExercise.name,
            sets: newExercise.sets || '3',
            reps: newExercise.reps || '12',
            rest: newExercise.rest || '60',
            load: newExercise.load || '0'
        };
        setSheets(sheets.map(s => s.id === sheetId ? { ...s, exercises: [...s.exercises, exercise] } : s));
        setNewExercise({ name: '', sets: '', reps: '', rest: '', load: '' });
        setEditingSheetId(null);
    };

    const uniqueExercises = useMemo(() => {
        return Array.from(new Set(liftingLog.map(l => l.exercise))).sort();
    }, [liftingLog]);

    const chartData = useMemo(() => {
        if (!selectedGraphExercise) return [];
        return liftingLog
            .filter(l => l.exercise === selectedGraphExercise)
            .sort((a, b) => {
                const dateA = a.date.split('/').reverse().join('-');
                const dateB = b.date.split('/').reverse().join('-');
                return new Date(dateA).getTime() - new Date(dateB).getTime();
            })
            .map(l => ({
                date: l.date.substring(0, 5),
                fullDate: l.date,
                weight: l.weight,
                reps: l.reps,
                sets: l.sets
            }));
    }, [liftingLog, selectedGraphExercise]);

    const exerciseStats = useMemo(() => {
        if (!selectedGraphExercise || chartData.length === 0) return { pr: 0, totalVol: 0, sessions: 0 };
        const pr = Math.max(...chartData.map(d => d.weight));
        const totalVol = chartData.reduce((acc, curr) => acc + (curr.weight * curr.reps * curr.sets), 0);
        return { pr, totalVol, sessions: chartData.length };
    }, [chartData, selectedGraphExercise]);

    // Helpers for Cardio Stats
    const calculatePace = (dist: number, time: number) => {
        if (dist <= 0) return '0:00';
        const paceDec = time / dist;
        const mins = Math.floor(paceDec);
        const secs = Math.round((paceDec - mins) * 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const calculateSpeed = (dist: number, time: number) => {
        if (time <= 0) return '0.0';
        return (dist / (time / 60)).toFixed(1);
    };

    const cardioStats = useMemo(() => {
        const totalKm = runLog.reduce((acc, curr) => acc + curr.distanceKm, 0);
        const totalTime = runLog.reduce((acc, curr) => acc + curr.timeMinutes, 0);
        const avgPace = totalKm > 0 ? calculatePace(totalKm, totalTime) : '0:00';
        // Estimativa rudimentar de calorias (apenas para UX, não científico)
        // Corrida ~ 10kcal/min, Bike ~ 8kcal/min, Caminhada ~ 5kcal/min
        const totalCalories = runLog.reduce((acc, curr) => {
            const factor = curr.type === 'bike' ? 8 : curr.type === 'walk' ? 5 : 10;
            const intensityMult = curr.intensity === 'high' ? 1.2 : curr.intensity === 'low' ? 0.8 : 1;
            return acc + (curr.timeMinutes * factor * intensityMult);
        }, 0);

        return { totalKm, totalTime, avgPace, totalCalories: Math.round(totalCalories) };
    }, [runLog]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-slate-700">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{payload[0].payload.fullDate}</p>
                    <p className="text-lg font-black text-indigo-400">{payload[0].value} kg</p>
                    <p className="text-[10px] font-bold text-slate-300 mt-1">
                        {payload[0].payload.sets} séries x {payload[0].payload.reps} reps
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-10 animate-fade-in pb-20">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                 <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Treino</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Evolução física de {userName.split(' ')[0]}</p>
                 </div>
                 <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto max-w-full">
                    <button onClick={() => setActiveSubTab('lifting')} className={`px-4 md:px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 whitespace-nowrap ${activeSubTab === 'lifting' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
                        <Dumbbell size={14} /> Musculação
                    </button>
                    <button onClick={() => setActiveSubTab('cardio')} className={`px-4 md:px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 whitespace-nowrap ${activeSubTab === 'cardio' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
                        <Heart size={14} /> Cardio
                    </button>
                    <button onClick={() => setActiveSubTab('sheets')} className={`px-4 md:px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 whitespace-nowrap ${activeSubTab === 'sheets' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
                        <ClipboardList size={14} /> Fichas
                    </button>
                    <button onClick={() => setActiveSubTab('records')} className={`px-4 md:px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 whitespace-nowrap ${activeSubTab === 'records' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
                        <Trophy size={14} /> Recordes
                    </button>
                 </div>
             </div>

             {/* ABA DE MUSCULAÇÃO */}
             {activeSubTab === 'lifting' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border dark:border-slate-700 shadow-sm space-y-6">
                            <h3 className="text-sm font-black dark:text-white uppercase tracking-widest pl-2 mb-2 flex items-center gap-2">
                                <Plus className="text-indigo-500" size={18} /> Registrar Série
                            </h3>
                            <input type="text" placeholder="Nome do exercício..." value={liftForm.exercise} onChange={e => setLiftForm({...liftForm, exercise: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl px-6 py-4 text-sm font-bold dark:text-white outline-none focus:ring-2 ring-indigo-500" />
                            <div className="grid grid-cols-4 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-slate-400 uppercase text-center block">KG</label>
                                    <input type="number" value={liftForm.weight} onChange={e => setLiftForm({...liftForm, weight: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl py-3 text-center font-black dark:text-white outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-slate-400 uppercase text-center block">Séries</label>
                                    <input type="number" value={liftForm.sets} onChange={e => setLiftForm({...liftForm, sets: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl py-3 text-center font-black dark:text-white outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-slate-400 uppercase text-center block">Reps</label>
                                    <input type="number" value={liftForm.reps} onChange={e => setLiftForm({...liftForm, reps: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl py-3 text-center font-black dark:text-white outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-center gap-1 cursor-pointer group" onClick={() => setShowRpeHelp(!showRpeHelp)}>
                                        <label className="text-[8px] font-black text-slate-400 uppercase text-center block group-hover:text-indigo-500 transition-colors">RPE</label>
                                        <HelpCircle size={10} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                    <input type="number" value={liftForm.rpe} onChange={e => setLiftForm({...liftForm, rpe: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl py-3 text-center font-black dark:text-white outline-none" />
                                </div>
                            </div>
                            {showRpeHelp && (
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-500/30 animate-fade-in relative">
                                    <button onClick={() => setShowRpeHelp(false)} className="absolute top-3 right-3 text-indigo-300 hover:text-indigo-500"><X size={12}/></button>
                                    <h5 className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1"><Activity size={10}/> O que é RPE?</h5>
                                    <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                        <strong>Rate of Perceived Exertion (1-10):</strong> Escala de intensidade baseada em "repetições na reserva" (RIR).
                                    </p>
                                    <ul className="mt-2 space-y-1 text-[9px] font-bold text-slate-500 dark:text-slate-400">
                                        <li className="flex items-center gap-2"><span className="text-rose-500">10</span> Falha Total (0 reps sobrando)</li>
                                        <li className="flex items-center gap-2"><span className="text-orange-500">9</span> Pesado (1 rep sobrando)</li>
                                        <li className="flex items-center gap-2"><span className="text-amber-500">8</span> Moderado-Alto (2 reps sobrando)</li>
                                        <li className="flex items-center gap-2"><span className="text-emerald-500">7</span> Moderado (3 reps sobrando)</li>
                                    </ul>
                                </div>
                            )}
                            <button onClick={addLift} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all">Registrar Série</button>
                            {liftingLog.length > 0 && (
                              <div className="space-y-2 pt-4 border-t dark:border-slate-700">
                                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Histórico Recente</h4>
                                  {liftingLog.slice(0, 5).map(l => (
                                      <div key={l.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl group transition-all">
                                          <div>
                                            <span className="text-xs font-black dark:text-white uppercase">{l.exercise}</span>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">{l.date}</p>
                                          </div>
                                          <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-bold text-indigo-500 uppercase">{l.weight}kg | {l.sets}x{l.reps} | RPE {l.rpe}</span>
                                            <button onClick={() => setLiftingLog(liftingLog.filter(item => item.id !== l.id))} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><X size={14} /></button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col items-center shadow-xl border border-white/5 h-fit sticky top-8">
                            <div className="flex items-center gap-2 mb-4 text-indigo-400">
                                <Timer size={18} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Descanso</span>
                            </div>
                            <div className="text-6xl font-black font-mono mb-6 flex items-center gap-1">
                                <span>{Math.floor(restTime / 60)}</span>
                                <span className="animate-pulse">:</span>
                                <span>{String(restTime % 60).padStart(2, '0')}</span>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2">
                                <button onClick={() => startRestTimer(45)} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[10px] font-bold">45s</button>
                                <button onClick={() => startRestTimer(60)} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[10px] font-bold">1 min</button>
                                <button onClick={() => startRestTimer(90)} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[10px] font-bold">1:30</button>
                                <button onClick={() => setIsTimerRunning(!isTimerRunning)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isTimerRunning ? 'bg-rose-500' : 'bg-emerald-500'} text-white`}>
                                {isTimerRunning ? 'Pausar' : 'Iniciar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
             )}

             {/* ABA DE CARDIO */}
             {activeSubTab === 'cardio' && (
                <div className="space-y-8 animate-fade-in">
                    {/* Cardio Stats Dashboard */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                            <Footprints className="absolute right-[-10px] top-[-10px] w-24 h-24 opacity-20" />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2 block">Distância Total</span>
                            <p className="text-4xl font-black">{cardioStats.totalKm.toFixed(1)} <span className="text-lg opacity-50">km</span></p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border dark:border-slate-700 shadow-sm flex flex-col justify-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Gauge size={14}/> Pace Médio</span>
                            <p className="text-3xl font-black dark:text-white">{cardioStats.avgPace} <span className="text-sm text-slate-400 font-bold">min/km</span></p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border dark:border-slate-700 shadow-sm flex flex-col justify-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Flame size={14}/> Gasto Estimado</span>
                            <p className="text-3xl font-black dark:text-white">{cardioStats.totalCalories} <span className="text-sm text-slate-400 font-bold">kcal</span></p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Formulário de Cardio */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-[3rem] border dark:border-slate-700 shadow-sm h-fit">
                             <h3 className="text-sm font-black dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Plus className="text-amber-500" size={18} /> Novo Registro
                            </h3>
                            
                            <div className="space-y-6">
                                {/* Seletor de Tipo */}
                                <div className="grid grid-cols-3 gap-2">
                                    <button 
                                        onClick={() => setCardioType('run')}
                                        className={`flex flex-col items-center justify-center py-4 rounded-2xl transition-all border-2 ${cardioType === 'run' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-slate-50 dark:bg-slate-900 border-transparent dark:text-slate-400 hover:bg-slate-100'}`}
                                    >
                                        <Footprints size={20} className="mb-1" />
                                        <span className="text-[9px] font-black uppercase">Corrida</span>
                                    </button>
                                    <button 
                                        onClick={() => setCardioType('walk')}
                                        className={`flex flex-col items-center justify-center py-4 rounded-2xl transition-all border-2 ${cardioType === 'walk' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-50 dark:bg-slate-900 border-transparent dark:text-slate-400 hover:bg-slate-100'}`}
                                    >
                                        <ArrowRight size={20} className="mb-1" />
                                        <span className="text-[9px] font-black uppercase">Caminhada</span>
                                    </button>
                                    <button 
                                        onClick={() => setCardioType('bike')}
                                        className={`flex flex-col items-center justify-center py-4 rounded-2xl transition-all border-2 ${cardioType === 'bike' ? 'bg-cyan-500 border-cyan-500 text-white' : 'bg-slate-50 dark:bg-slate-900 border-transparent dark:text-slate-400 hover:bg-slate-100'}`}
                                    >
                                        <Bike size={20} className="mb-1" />
                                        <span className="text-[9px] font-black uppercase">Bike</span>
                                    </button>
                                </div>

                                {/* Inputs Principais */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Distância (km)</label>
                                        <input type="number" placeholder="0.0" value={runForm.dist} onChange={e => setRunForm({...runForm, dist: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl py-4 px-6 font-black dark:text-white outline-none focus:ring-2 ring-indigo-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Tempo (min)</label>
                                        <input type="number" placeholder="0" value={runForm.time} onChange={e => setRunForm({...runForm, time: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl py-4 px-6 font-black dark:text-white outline-none focus:ring-2 ring-indigo-500" />
                                    </div>
                                </div>

                                {/* Intensidade */}
                                <div>
                                    <label className="text-[8px] font-black text-slate-400 uppercase ml-1 block mb-2">Percepção de Esforço</label>
                                    <div className="flex bg-slate-50 dark:bg-slate-900 p-1.5 rounded-2xl">
                                        {['low', 'moderate', 'high'].map((level) => (
                                            <button
                                                key={level}
                                                onClick={() => setCardioIntensity(level as any)}
                                                className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${
                                                    cardioIntensity === level 
                                                    ? level === 'high' ? 'bg-rose-500 text-white shadow-lg' : level === 'moderate' ? 'bg-amber-500 text-white shadow-lg' : 'bg-emerald-500 text-white shadow-lg'
                                                    : 'text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                {level === 'low' ? 'Leve' : level === 'moderate' ? 'Moderado' : 'Intenso'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button onClick={addRun} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">
                                    Registrar Atividade
                                </button>
                            </div>
                        </div>

                        {/* Lista de Histórico */}
                        <div className="lg:col-span-3 space-y-4">
                             <div className="flex justify-between items-center px-2">
                                <h3 className="text-sm font-black dark:text-white uppercase tracking-widest">Histórico de Atividades</h3>
                                <span className="text-[10px] font-bold text-slate-400">{runLog.length} sessões</span>
                             </div>
                             
                             <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {runLog.map((run) => {
                                    const type = run.type || 'run'; // Fallback
                                    const intensity = run.intensity || 'moderate'; // Fallback
                                    const Icon = type === 'bike' ? Bike : type === 'walk' ? ArrowRight : Footprints;
                                    const colorClass = type === 'bike' ? 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' : type === 'walk' ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';

                                    return (
                                        <div key={run.id} className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 group transition-all hover:border-indigo-500/30">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${colorClass}`}>
                                                    <Icon size={20} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-black text-sm dark:text-white uppercase">
                                                            {type === 'run' ? 'Corrida' : type === 'bike' ? 'Ciclismo' : 'Caminhada'}
                                                        </h4>
                                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                                                            intensity === 'high' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                                                            intensity === 'moderate' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                                                            'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        }`}>
                                                            {intensity === 'low' ? 'Leve' : intensity === 'moderate' ? 'Mod.' : 'Intenso'}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-2">
                                                        <span className="flex items-center gap-1"><MapPin size={10}/> {run.date}</span>
                                                        <span>•</span>
                                                        <span>{run.timeMinutes} min</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 sm:gap-8 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl justify-between sm:justify-start">
                                                <div className="text-center">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase block">Distância</span>
                                                    <span className="text-sm font-black dark:text-white">{run.distanceKm}km</span>
                                                </div>
                                                <div className="text-center">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase block">Pace</span>
                                                    <span className="text-sm font-black dark:text-white">{calculatePace(run.distanceKm, run.timeMinutes)}</span>
                                                </div>
                                                <div className="text-center hidden sm:block">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase block">Velocidade</span>
                                                    <span className="text-sm font-black dark:text-white">{calculateSpeed(run.distanceKm, run.timeMinutes)} km/h</span>
                                                </div>
                                            </div>
                                            
                                            <button onClick={() => deleteRun(run.id)} className="absolute top-4 right-4 sm:static text-slate-200 hover:text-rose-500 sm:opacity-0 group-hover:opacity-100 transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    );
                                })}
                             </div>
                        </div>
                    </div>
                </div>
             )}

             {activeSubTab === 'sheets' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-8 md:p-12 rounded-[3.5rem] text-white flex flex-col md:flex-row gap-8 items-center shadow-2xl border border-white/5 overflow-hidden relative">
                        <Zap className="absolute right-[-40px] top-[-20px] w-64 h-64 text-indigo-500/10 rotate-12" />
                        <div className="flex-1 space-y-3 relative z-10 text-center md:text-left">
                          <h3 className="text-2xl font-black uppercase tracking-tight">Suas Fichas de Treino</h3>
                          <p className="text-sm text-indigo-300 font-medium max-w-md">Organize suas divisões musculares e tenha foco total no dia de hoje.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 relative z-10">
                          <input type="text" value={newSheetName} onChange={(e) => setNewSheetName(e.target.value)} placeholder="Ex: Treino A - Peito" className="flex-1 sm:w-64 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 text-white font-bold outline-none border border-white/10 focus:border-indigo-400 transition-all" />
                          <button onClick={createSheet} className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl active:scale-95 transition-all flex-shrink-0">Criar Ficha</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {sheets.map(sheet => (
                            <div key={sheet.id} className="bg-white dark:bg-slate-800 rounded-[3.5rem] border dark:border-slate-700 overflow-hidden shadow-sm group hover:shadow-2xl hover:scale-[1.01] transition-all">
                                <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-700 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 dark:shadow-none"><ClipboardList size={24}/></div>
                                      <h4 className="font-black dark:text-white uppercase tracking-tighter text-xl">{sheet.name}</h4>
                                    </div>
                                    <button onClick={() => setSheets(sheets.filter(s => s.id !== sheet.id))} className="text-slate-300 hover:text-rose-500 transition-all p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700"><Trash2 size={20} /></button>
                                </div>
                                <div className="p-8 space-y-4">
                                    {sheet.exercises.map(ex => (
                                        <div key={ex.id} className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-[2.2rem] flex justify-between items-center border border-transparent hover:border-indigo-500/20 transition-all group/item">
                                            <div className="flex items-center gap-4">
                                              <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center text-indigo-500 shadow-sm">
                                                <CheckCircle2 size={20} />
                                              </div>
                                              <div>
                                                  <p className="font-black text-sm uppercase dark:text-white tracking-tight">{ex.name}</p>
                                                  <div className="flex gap-4 mt-1">
                                                    <span className="text-[10px] text-indigo-500 font-black uppercase tracking-widest flex items-center gap-1.5"><Repeat size={12}/> {ex.sets} x {ex.reps}</span>
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1.5"><Coffee size={12}/> {ex.rest}s</span>
                                                    {ex.load && <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1.5"><Dumbbell size={12}/> {ex.load}kg</span>}
                                                  </div>
                                              </div>
                                            </div>
                                            <button onClick={() => setSheets(sheets.map(s => s.id === sheet.id ? {...s, exercises: s.exercises.filter(e => e.id !== ex.id)} : s))} className="text-slate-200 hover:text-rose-500 transition-all p-2"><X size={18}/></button>
                                        </div>
                                    ))}
                                    
                                    {editingSheetId === sheet.id ? (
                                        <div className="mt-6 p-8 bg-slate-50 dark:bg-slate-900 rounded-[2.8rem] space-y-5 border-2 border-indigo-500/30 animate-scale-in">
                                            <input type="text" placeholder="Nome do Exercício..." value={newExercise.name} onChange={e => setNewExercise({...newExercise, name: e.target.value})} className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 font-bold outline-none border dark:border-slate-700 focus:ring-2 ring-indigo-500/20" />
                                            <div className="grid grid-cols-4 gap-2">
                                                <div className="space-y-1">
                                                  <label className="text-[9px] font-black uppercase text-slate-400 block text-center">Séries</label>
                                                  <input type="text" value={newExercise.sets} onChange={e => setNewExercise({...newExercise, sets: e.target.value})} className="w-full bg-white dark:bg-slate-800 rounded-2xl p-3 text-center text-xs font-bold border dark:border-slate-700" />
                                                </div>
                                                <div className="space-y-1">
                                                  <label className="text-[9px] font-black uppercase text-slate-400 block text-center">Reps</label>
                                                  <input type="text" value={newExercise.reps} onChange={e => setNewExercise({...newExercise, reps: e.target.value})} className="w-full bg-white dark:bg-slate-800 rounded-2xl p-3 text-center text-xs font-bold border dark:border-slate-700" />
                                                </div>
                                                <div className="space-y-1">
                                                  <label className="text-[9px] font-black uppercase text-slate-400 block text-center">Carga (kg)</label>
                                                  <input type="text" value={newExercise.load} onChange={e => setNewExercise({...newExercise, load: e.target.value})} className="w-full bg-white dark:bg-slate-800 rounded-2xl p-3 text-center text-xs font-bold border dark:border-slate-700" />
                                                </div>
                                                <div className="space-y-1">
                                                  <label className="text-[9px] font-black uppercase text-slate-400 block text-center">Descanso(s)</label>
                                                  <input type="text" value={newExercise.rest} onChange={e => setNewExercise({...newExercise, rest: e.target.value})} className="w-full bg-white dark:bg-slate-800 rounded-2xl p-3 text-center text-xs font-bold border dark:border-slate-700" />
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                              <button onClick={() => addExerciseToSheet(sheet.id)} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg">Confirmar</button>
                                              <button onClick={() => setEditingSheetId(null)} className="px-6 bg-slate-200 dark:bg-slate-700 rounded-2xl text-[10px] font-black uppercase text-slate-500 dark:text-slate-300">X</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button onClick={() => setEditingSheetId(sheet.id)} className="w-full py-5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50/10 transition-all flex items-center justify-center gap-3 mt-6">
                                            <Plus size={18} /> Adicionar Exercício
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             )}

             {activeSubTab === 'records' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                     <div>
                        <h3 className="text-xl font-black dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <TrendingUp className="text-indigo-500" size={24} /> Evolução de Carga
                        </h3>
                        <p className="text-slate-400 text-sm font-medium">Selecione um exercício para ver o progresso</p>
                     </div>
                     <div className="relative">
                        <select 
                            value={selectedGraphExercise} 
                            onChange={(e) => setSelectedGraphExercise(e.target.value)}
                            className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-3 pl-4 pr-10 font-bold text-sm dark:text-white outline-none focus:border-indigo-500 appearance-none min-w-[200px]"
                        >
                            {uniqueExercises.length === 0 && <option value="">Nenhum registro</option>}
                            {uniqueExercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                        </select>
                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={16} />
                     </div>
                  </div>

                  {/* Stats Cards for Selected Exercise */}
                  {selectedGraphExercise && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
                            <Trophy size={64} className="absolute right-[-10px] bottom-[-10px] opacity-20" />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Recorde Pessoal (PR)</span>
                            <p className="text-4xl font-black mt-2">{exerciseStats.pr} kg</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border dark:border-slate-700 shadow-sm flex flex-col justify-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume Total Levantado</span>
                            <p className="text-3xl font-black dark:text-white mt-2">{exerciseStats.totalVol.toLocaleString()} kg</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border dark:border-slate-700 shadow-sm flex flex-col justify-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sessões Realizadas</span>
                            <p className="text-3xl font-black dark:text-white mt-2">{exerciseStats.sessions}</p>
                        </div>
                      </div>
                  )}

                  {/* Chart Area */}
                  <div className="bg-white dark:bg-slate-800 rounded-[3.5rem] p-6 md:p-10 border dark:border-slate-700 shadow-sm h-[400px]">
                     {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#94a3b8" 
                                    tick={{fontSize: 10, fontWeight: 'bold'}} 
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis 
                                    stroke="#94a3b8" 
                                    tick={{fontSize: 10, fontWeight: 'bold'}} 
                                    tickLine={false}
                                    axisLine={false}
                                    domain={['dataMin - 5', 'dataMax + 5']}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 2 }} />
                                <Area 
                                    type="monotone" 
                                    dataKey="weight" 
                                    stroke="#6366f1" 
                                    strokeWidth={4}
                                    fillOpacity={1} 
                                    fill="url(#colorWeight)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                     ) : (
                         <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                             <BarChart3 size={64} className="mb-4 text-slate-400" />
                             <p className="font-black uppercase tracking-widest text-xs">Sem dados suficientes para gráfico</p>
                         </div>
                     )}
                  </div>
               </div>
             )}
        </div>
    );
};
