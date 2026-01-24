
import React, { useState, useEffect, useMemo } from 'react';
import { HealthExam } from '../types';
import { 
  HeartPulse, Activity, Calendar, Plus, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, TrendingUp, Search, Trash2, FileText, AlertTriangle, Bell, X
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface HealthProps {
  storagePrefix: string;
  userName: string;
}

// Configuração baseada no PDF fornecido
const HEALTH_METRICS_CONFIG = [
  // Basais
  { id: 'weight', label: 'Peso Corporal', unit: 'kg', category: 'basal', min: 0, max: 0 },
  
  // Hormonais
  { id: 'testo_total', label: 'Testosterona Total', unit: 'ng/dL', category: 'hormonal', min: 240.24, max: 870.68 },
  { id: 'testo_livre', label: 'Testosterona Livre', unit: 'ng/dL', category: 'hormonal', min: 0, max: 0 }, // Ref não clara no PDF, mantendo genérico
  { id: 'estradiol', label: 'Estradiol', unit: 'pg/mL', category: 'hormonal', min: 0, max: 0 },
  { id: 'prolactina', label: 'Prolactina', unit: 'ng/mL', category: 'hormonal', min: 0, max: 0 },
  { id: 'tsh', label: 'TSH', unit: 'µUI/mL', category: 'hormonal', min: 0.4, max: 4.5 }, // Padrão genérico, pdf sem valor claro
  { id: 't3', label: 'T3 (Triiodotironina)', unit: 'ng/dL', category: 'hormonal', min: 64.00, max: 152.00 },
  { id: 't4', label: 'T4 (Tiroxina)', unit: 'ng/dL', category: 'hormonal', min: 0.70, max: 1.48 },
  { id: 'psa_total', label: 'PSA Total', unit: 'ng/dL', category: 'hormonal', min: 0, max: 4.00 },

  // Não-Hormonais (Hemograma)
  { id: 'hemoglobina', label: 'Hemoglobina', unit: 'g/dL', category: 'blood', min: 13.00, max: 17.00 },
  { id: 'hematocritos', label: 'Hematócritos', unit: '%', category: 'blood', min: 40.00, max: 50.00 },
  { id: 'leucocitos', label: 'Leucócitos', unit: '/µL', category: 'blood', min: 4000, max: 10000 },
  { id: 'plaquetas', label: 'Plaquetas', unit: '/µL', category: 'blood', min: 150000, max: 450000 },

  // Bioquímica / Metabólico
  { id: 'glicose', label: 'Glicose', unit: 'mg/dL', category: 'metabolic', min: 70.00, max: 99.00 },
  { id: 'colesterol_total', label: 'Colesterol Total', unit: 'mg/dL', category: 'metabolic', min: 0, max: 190.00 },
  { id: 'hdl', label: 'HDL Colesterol', unit: 'mg/dL', category: 'metabolic', min: 40.00, max: 999 }, // > 40
  { id: 'ldl', label: 'LDL Colesterol', unit: 'mg/dL', category: 'metabolic', min: 0, max: 130.00 },
  { id: 'triglicerides', label: 'Triglicérides', unit: 'mg/dL', category: 'metabolic', min: 0, max: 150.00 },
  { id: 'creatinina', label: 'Creatinina', unit: 'mg/dL', category: 'metabolic', min: 0.66, max: 1.25 },
  { id: 'ureia', label: 'Uréia', unit: 'mg/dL', category: 'metabolic', min: 15.00, max: 36.00 },
  { id: 'tgo', label: 'TGO (AST)', unit: 'U/L', category: 'metabolic', min: 0, max: 40.00 },
  { id: 'tgp', label: 'TGP (ALT)', unit: 'U/L', category: 'metabolic', min: 0, max: 45.00 },
  { id: 'gama_gt', label: 'Gama GT', unit: 'U/L', category: 'metabolic', min: 3.0, max: 65.0 },
];

const CATEGORIES = {
  basal: 'Corporal Basal',
  hormonal: 'Hormonal',
  blood: 'Hemograma',
  metabolic: 'Bioquímica/Metabólico'
};

export const Health = ({ storagePrefix, userName }: HealthProps) => {
    const examsKey = `${storagePrefix}health_exams`;
    
    const [exams, setExams] = useState<HealthExam[]>(() => {
        const saved = localStorage.getItem(examsKey);
        return saved ? JSON.parse(saved) : [];
    });

    const [isAdding, setIsAdding] = useState(false);
    const [newExamDate, setNewExamDate] = useState(new Date().toISOString().split('T')[0]);
    const [newExamLocation, setNewExamLocation] = useState('');
    const [newExamMetrics, setNewExamMetrics] = useState<Record<string, string>>({});
    
    const [selectedMetricId, setSelectedMetricId] = useState('testo_total');
    const [activeCategory, setActiveCategory] = useState<string>('hormonal');

    // Estado para notificação (Toast)
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

    useEffect(() => {
        localStorage.setItem(examsKey, JSON.stringify(exams));
    }, [exams, examsKey]);

    // Timer para limpar notificação
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleMetricChange = (id: string, value: string) => {
        setNewExamMetrics(prev => ({ ...prev, [id]: value }));
    };

    const getStatusLabel = (metricId: string, value: number) => {
        const config = HEALTH_METRICS_CONFIG.find(m => m.id === metricId);
        if (!config || (config.min === 0 && config.max === 0)) return '';

        if (config.min !== undefined && value < config.min) return 'Baixo';
        if (config.max !== undefined && value > config.max) return 'Alto';
        return 'Normal';
    };

    const saveExam = () => {
        if (!newExamDate) return;
        
        // Convert strings to numbers for storage and check alerts
        const numericMetrics: Record<string, number> = {};
        let alertsCount = 0;

        Object.entries(newExamMetrics).forEach(([key, val]) => {
            if (val) {
                const numVal = parseFloat(String(val));
                numericMetrics[key] = numVal;
                
                const status = getStatusLabel(key, numVal);
                if (status === 'Alto' || status === 'Baixo') {
                    alertsCount++;
                }
            }
        });

        const newExam: HealthExam = {
            id: Date.now().toString(),
            date: new Date(newExamDate).toLocaleDateString('pt-BR'),
            location: newExamLocation || 'Não informado',
            metrics: numericMetrics
        };

        setExams([newExam, ...exams]);
        
        // Dispara notificação baseada nos alertas
        if (alertsCount > 0) {
            setNotification({
                message: `Exame registrado. Atenção: detectamos ${alertsCount} indicador(es) fora da referência.`,
                type: 'warning'
            });
        } else {
            setNotification({
                message: 'Exame registrado com sucesso! Todos os indicadores dentro da normalidade.',
                type: 'success'
            });
        }

        setIsAdding(false);
        setNewExamMetrics({});
        setNewExamLocation('');
    };

    const deleteExam = (id: string) => {
        setExams(exams.filter(e => e.id !== id));
        setNotification({ message: 'Exame removido do histórico.', type: 'success' });
    };

    const getStatusColor = (metricId: string, value: number) => {
        const config = HEALTH_METRICS_CONFIG.find(m => m.id === metricId);
        if (!config || (config.min === 0 && config.max === 0)) return 'text-slate-500'; // Sem referência

        if (config.min !== undefined && value < config.min) return 'text-amber-500'; // Baixo
        if (config.max !== undefined && value > config.max) return 'text-rose-500'; // Alto
        return 'text-emerald-500'; // Normal
    };

    const getExamIssues = (exam: HealthExam) => {
        let count = 0;
        Object.entries(exam.metrics).forEach(([key, val]) => {
             const status = getStatusLabel(key, val);
             if (status === 'Alto' || status === 'Baixo') count++;
        });
        return count;
    };

    // Prepare chart data
    const chartData = useMemo(() => {
        return exams
            .map(exam => ({
                date: exam.date.substring(0, 5), // dd/mm
                fullDate: exam.date,
                value: exam.metrics[selectedMetricId] || null
            }))
            .filter(d => d.value !== null)
            .reverse();
    }, [exams, selectedMetricId]);

    const selectedMetricConfig = HEALTH_METRICS_CONFIG.find(m => m.id === selectedMetricId);

    const latestExam = exams[0];
    const latestExamIssues = latestExam ? getExamIssues(latestExam) : 0;

    return (
        <div className="space-y-8 animate-fade-in pb-20 relative">
            {/* Sistema de Notificação (Toast) */}
            {notification && (
                <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm animate-slide-up border-2 ${
                    notification.type === 'warning' 
                        ? 'bg-amber-50 dark:bg-amber-900/90 border-amber-500 text-amber-800 dark:text-amber-100' 
                        : notification.type === 'error'
                        ? 'bg-rose-50 dark:bg-rose-900/90 border-rose-500 text-rose-800 dark:text-rose-100'
                        : 'bg-emerald-50 dark:bg-emerald-900/90 border-emerald-500 text-emerald-800 dark:text-emerald-100'
                }`}>
                    <div className={`p-2 rounded-full ${
                        notification.type === 'warning' ? 'bg-amber-200 dark:bg-amber-800' : 
                        notification.type === 'error' ? 'bg-rose-200 dark:bg-rose-800' : 'bg-emerald-200 dark:bg-emerald-800'
                    }`}>
                        {notification.type === 'warning' || notification.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
                    </div>
                    <div>
                        <h4 className="font-black uppercase text-[10px] tracking-widest mb-1">{notification.type === 'success' ? 'Sucesso' : 'Alerta de Saúde'}</h4>
                        <p className="text-xs font-bold leading-tight">{notification.message}</p>
                    </div>
                    <button onClick={() => setNotification(null)} className="ml-auto p-1 hover:bg-black/10 rounded-full transition-colors"><X size={16}/></button>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                   <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Saúde</h2>
                   <p className="text-slate-500 dark:text-slate-400 mt-1">Monitoramento clínico de {userName.split(' ')[0]}</p>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)} 
                    className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 ${isAdding ? 'bg-rose-500 text-white' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'}`}
                >
                    {isAdding ? <><Trash2 size={16}/> Cancelar</> : <><Plus size={16}/> Novo Exame</>}
                </button>
            </div>

            {isAdding && (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border-2 border-indigo-500/20 shadow-2xl animate-scale-in">
                    <h3 className="text-lg font-black dark:text-white uppercase tracking-tight mb-6">Registrar Resultados</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Data do Exame</label>
                            <input type="date" value={newExamDate} onChange={e => setNewExamDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl p-4 font-bold dark:text-white outline-none focus:ring-2 ring-indigo-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Local / Laboratório</label>
                            <input type="text" placeholder="Ex: Lab Exame..." value={newExamLocation} onChange={e => setNewExamLocation(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl p-4 font-bold dark:text-white outline-none focus:ring-2 ring-indigo-500" />
                        </div>
                    </div>

                    <div className="space-y-8">
                        {Object.entries(CATEGORIES).map(([catKey, catLabel]) => (
                            <div key={catKey} className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase text-indigo-500 tracking-widest border-b border-indigo-100 dark:border-indigo-900/30 pb-2">{catLabel}</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {HEALTH_METRICS_CONFIG.filter(m => m.category === catKey).map(metric => (
                                        <div key={metric.id} className="space-y-1">
                                            <label className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase truncate block" title={metric.label}>{metric.label}</label>
                                            <div className="relative">
                                                <input 
                                                    type="number" 
                                                    placeholder="0.00" 
                                                    value={newExamMetrics[metric.id] || ''} 
                                                    onChange={e => handleMetricChange(metric.id, e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl py-3 pl-3 pr-8 text-sm font-bold dark:text-white outline-none focus:bg-white dark:focus:bg-slate-950 border border-transparent focus:border-indigo-500 transition-all"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase">{metric.unit}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button onClick={saveExam} className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg transition-all active:scale-95">
                            Salvar Exame
                        </button>
                    </div>
                </div>
            )}

            {exams.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Coluna da Esquerda: Gráfico e Histórico */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Gráfico de Tendência */}
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border dark:border-slate-700 shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <div>
                                    <h3 className="text-xl font-black dark:text-white uppercase tracking-tight flex items-center gap-2">
                                        <TrendingUp className="text-indigo-500" size={24} /> Evolução
                                    </h3>
                                    <p className="text-slate-400 text-sm font-medium">Acompanhe seus indicadores ao longo do tempo</p>
                                </div>
                                <div className="relative">
                                    <select 
                                        value={selectedMetricId} 
                                        onChange={(e) => setSelectedMetricId(e.target.value)}
                                        className="bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-3 pl-4 pr-10 font-bold text-sm dark:text-white outline-none focus:border-indigo-500 appearance-none min-w-[200px]"
                                    >
                                        {HEALTH_METRICS_CONFIG.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                </div>
                            </div>

                            <div className="h-[300px] w-full">
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
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
                                                domain={['auto', 'auto']}
                                            />
                                            <Tooltip 
                                                contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: 'white'}}
                                                itemStyle={{color: '#818cf8', fontWeight: 'bold'}}
                                                labelStyle={{color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px'}}
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="value" 
                                                stroke="#6366f1" 
                                                strokeWidth={3}
                                                fillOpacity={1} 
                                                fill="url(#colorValue)" 
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                                        <Activity size={48} />
                                        <p className="text-[10px] font-black uppercase mt-4 tracking-widest">Sem dados suficientes</p>
                                    </div>
                                )}
                            </div>
                            {selectedMetricConfig && (
                                <div className="mt-4 flex gap-4 justify-center">
                                    <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full">
                                        Mín: {selectedMetricConfig.min || '-'} {selectedMetricConfig.unit}
                                    </span>
                                    <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full">
                                        Máx: {selectedMetricConfig.max || '-'} {selectedMetricConfig.unit}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Lista de Exames Recentes (Accordion Style) */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black dark:text-white uppercase tracking-widest pl-4">Histórico de Exames</h3>
                            {exams.map(exam => {
                                const issues = getExamIssues(exam);
                                // Destaque visual se houver problemas
                                const hasIssuesStyle = issues > 0 
                                    ? "border-l-4 border-l-rose-500 bg-rose-50/50 dark:bg-rose-900/10" 
                                    : "bg-white dark:bg-slate-800";
                                
                                return (
                                <div key={exam.id} className={`${hasIssuesStyle} p-6 rounded-[2.5rem] border dark:border-slate-700 shadow-sm group hover:border-indigo-500/30 transition-all`}>
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl ${issues > 0 ? 'bg-rose-100 text-rose-500 dark:bg-rose-900/30' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
                                                {issues > 0 ? <AlertTriangle size={20} /> : <FileText size={20} />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold dark:text-white text-sm">{exam.date}</h4>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{exam.location}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => deleteExam(exam.id)} className="text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.keys(exam.metrics).length > 0 ? (
                                            <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-lg">
                                                {Object.keys(exam.metrics).length} Indicadores
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg">Vazio</span>
                                        )}
                                        
                                        {issues > 0 && (
                                            <span className="text-[10px] font-black uppercase text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-3 py-1 rounded-lg flex items-center gap-1 animate-pulse">
                                                <AlertTriangle size={12} /> {issues} Alertas
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>

                    {/* Coluna da Direita: Detalhes do Último Exame */}
                    <div className="bg-slate-900 dark:bg-black p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden h-fit">
                        <Activity className="absolute right-[-20px] top-[-20px] w-64 h-64 text-indigo-500/10 rotate-12" />
                        
                        <div className="relative z-10">
                            <h3 className="text-xl font-black uppercase tracking-tight mb-2">Último Check-up</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">
                                {latestExam ? `${latestExam.date} • ${latestExam.location}` : 'Nenhum exame registrado'}
                            </p>

                            {latestExam && (
                                <div className="space-y-6">
                                    {latestExamIssues > 0 && (
                                        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-start gap-3 animate-fade-in">
                                            <div className="bg-rose-500 p-2 rounded-lg text-white animate-pulse">
                                                <AlertCircle size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-rose-500 font-black uppercase text-[10px] tracking-widest mb-1">Atenção Necessária</h4>
                                                <p className="text-rose-200 text-[10px] font-medium leading-relaxed">
                                                    {latestExamIssues} indicadores estão fora da faixa de referência neste exame. Verifique os itens destacados abaixo.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
                                        {Object.entries(CATEGORIES).map(([key, label]) => (
                                            <button 
                                                key={key} 
                                                onClick={() => setActiveCategory(key)}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeCategory === key ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400 hover:bg-white/20'}`}
                                            >
                                                {label.split(' ')[0]}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                        {HEALTH_METRICS_CONFIG.filter(m => m.category === activeCategory).map(metric => {
                                            const value = latestExam.metrics[metric.id];
                                            if (value === undefined) return null;

                                            const statusColor = getStatusColor(metric.id, value);
                                            const statusLabel = getStatusLabel(metric.id, value);
                                            const isAbnormal = statusLabel === 'Alto' || statusLabel === 'Baixo';

                                            return (
                                                <div key={metric.id} className={`${isAbnormal ? 'bg-rose-500/10 border-rose-500/30' : 'bg-white/5 border-white/5 hover:bg-white/10'} p-4 rounded-2xl flex justify-between items-center border transition-all`}>
                                                    <div>
                                                        <p className={`text-[9px] font-black uppercase mb-0.5 ${isAbnormal ? 'text-rose-400' : 'text-slate-400'}`}>{metric.label}</p>
                                                        <p className="text-lg font-bold">{value} <span className="text-[9px] font-normal opacity-60 ml-0.5">{metric.unit}</span></p>
                                                    </div>
                                                    <div className={`flex flex-col items-end ${statusColor}`}>
                                                        {statusLabel === 'Alto' && <AlertCircle size={18} className="animate-pulse" />}
                                                        {statusLabel === 'Baixo' && <AlertCircle size={18} className="rotate-180 animate-pulse" />}
                                                        {statusLabel === 'Normal' && <CheckCircle2 size={18} />}
                                                        <span className="text-[8px] font-black uppercase mt-1">{statusLabel}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {HEALTH_METRICS_CONFIG.filter(m => m.category === activeCategory && latestExam.metrics[m.id] !== undefined).length === 0 && (
                                            <p className="text-center text-[10px] font-black uppercase text-slate-500 py-10">Nenhum dado nesta categoria</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-30 text-slate-400 bg-white dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <HeartPulse size={64} />
                    <p className="text-xs font-black uppercase tracking-[0.3em] mt-4">Nenhum exame cadastrado</p>
                    <p className="text-[10px] font-medium mt-2">Clique em "Novo Exame" para começar</p>
                </div>
            )}
        </div>
    );
};
