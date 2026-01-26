
import React, { useState, useMemo, useEffect } from 'react';
import { Biometrics, Meal } from '../types';
import { UtensilsCrossed, Plus, Trash2, Calculator, Save, Database, Zap, Search, ChevronDown, ChevronUp, Edit3, X, LayoutList, AlertCircle, Utensils, Info, Lightbulb } from 'lucide-react';

interface NutritionProps {
  storagePrefix: string;
  userName: string;
}

const FOOD_DATABASE = [
  { name: 'Frango Desfiado', kcal: 195, p: 29.5, c: 0, f: 7.7, unit: 'g' },
  { name: 'Arroz Branco', kcal: 130, p: 2.7, c: 28, f: 0.3, unit: 'g' },
  { name: 'Feijão Carioca', kcal: 76, p: 4.8, c: 13.6, f: 0.5, unit: 'g' },
  { name: 'Ovo Inteiro', kcal: 143, p: 13, c: 1.1, f: 9.5, unit: 'g' },
  { name: 'Patinho Moído', kcal: 219, p: 35.9, c: 0, f: 7.3, unit: 'g' },
  { name: 'Banana Nanica', kcal: 92, p: 1.3, c: 23.8, f: 0.3, unit: 'g' },
  { name: 'Whey Protein', kcal: 390, p: 80, c: 5, f: 6, unit: 'g' },
  { name: 'Azeite de Oliva', kcal: 884, p: 0, c: 0, f: 100, unit: 'g' },
  { name: 'Pão Integral', kcal: 250, p: 10, c: 45, f: 3, unit: 'g' }
];

const INITIAL_MEALS: Meal[] = [
  { id: '1', name: 'CAFÉ DA MANHÃ', items: [] },
  { id: '2', name: 'ALMOÇO', items: [] },
  { id: '3', name: 'CAFÉ DA TARDE', items: [] },
  { id: '4', name: 'JANTA', items: [] },
];

export const Nutrition = ({ storagePrefix, userName }: NutritionProps) => {
  const mealsKey = `${storagePrefix}meals`;
  const bioKey = `${storagePrefix}bio`;
  const resetKey = `${storagePrefix}nutrition_last_reset`;

  const [meals, setMeals] = useState<Meal[]>(() => {
    const saved = localStorage.getItem(mealsKey);
    const lastReset = localStorage.getItem(resetKey);
    const today = new Date().toDateString();
    if (saved) {
      let parsed = JSON.parse(saved);
      if (lastReset !== today) {
        parsed = parsed.map((m: Meal) => ({ ...m, items: [] }));
        localStorage.setItem(resetKey, today);
      }
      return parsed;
    }
    return INITIAL_MEALS;
  });

  const [bio, setBio] = useState<Biometrics>(() => {
    const saved = localStorage.getItem(bioKey);
    return saved ? JSON.parse(saved) : { weight: 70, height: 175, age: 25, gender: 'male', activityLevel: 'moderate', goal: 'maintain' };
  });

  const [showBio, setShowBio] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [foodAmount, setFoodAmount] = useState('100');
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualFood, setManualFood] = useState({ name: '', kcal: '', p: '', c: '', f: '' });

  // Novos estados para adicionar refeição
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [newMealName, setNewMealName] = useState('');

  useEffect(() => {
    localStorage.setItem(mealsKey, JSON.stringify(meals));
    localStorage.setItem(bioKey, JSON.stringify(bio));
  }, [meals, bio, mealsKey, bioKey]);

  // Cálculo de Metas
  const targets = useMemo(() => {
    let bmr = bio.gender === 'male' 
      ? 88.36 + (13.4 * bio.weight) + (4.8 * bio.height) - (5.7 * bio.age)
      : 447.59 + (9.2 * bio.weight) + (3.1 * bio.height) - (4.3 * bio.age);
    
    const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, extreme: 1.9 };
    let tdee = bmr * multipliers[bio.activityLevel];
    
    if (bio.goal === 'lose') tdee -= 500;
    if (bio.goal === 'gain') tdee += 500;

    return {
      kcal: Math.round(tdee),
      p: Math.round(bio.weight * 2),
      f: Math.round(bio.weight * 0.8),
      c: Math.round((tdee - (bio.weight * 2 * 4) - (bio.weight * 0.8 * 9)) / 4)
    };
  }, [bio]);

  const currentTotals = useMemo(() => {
    return meals.reduce((acc, meal) => {
      meal.items.forEach(item => {
        acc.kcal += item.calories;
        acc.p += item.protein;
        acc.c += item.carbs;
        acc.f += item.fat;
      });
      return acc;
    }, { kcal: 0, p: 0, c: 0, f: 0 });
  }, [meals]);

  const addFoodToMeal = (food: typeof FOOD_DATABASE[0]) => {
    if (!selectedMealId) return;
    const amount = parseFloat(foodAmount) || 100;
    const ratio = amount / 100;

    const newItem = {
      id: Date.now().toString(),
      name: `${food.name} (${amount}g)`,
      calories: Math.round(food.kcal * ratio),
      protein: Math.round(food.p * ratio),
      carbs: Math.round(food.c * ratio),
      fat: Math.round(food.f * ratio)
    };

    setMeals(meals.map(m => m.id === selectedMealId ? { ...m, items: [...m.items, newItem] } : m));
    setSearchTerm('');
    setSelectedMealId(null);
  };

  const addManualFood = () => {
    if (!selectedMealId || !manualFood.name || !manualFood.kcal) return;
    const newItem = {
      id: Date.now().toString(),
      name: manualFood.name,
      calories: Number(manualFood.kcal),
      protein: Number(manualFood.p) || 0,
      carbs: Number(manualFood.c) || 0,
      fat: Number(manualFood.f) || 0
    };
    setMeals(meals.map(m => m.id === selectedMealId ? { ...m, items: [...m.items, newItem] } : m));
    setManualFood({ name: '', kcal: '', p: '', c: '', f: '' });
    setSelectedMealId(null);
    setIsManualEntry(false);
  };

  const removeFood = (mealId: string, foodId: string) => {
    setMeals(meals.map(m => m.id === mealId ? { ...m, items: m.items.filter(i => i.id !== foodId) } : m));
  };

  // Funções para gerenciar refeições (categorias)
  const addMeal = () => {
      if (!newMealName.trim()) return;
      const newMeal: Meal = {
          id: Date.now().toString(),
          name: newMealName.toUpperCase(),
          items: []
      };
      setMeals([...meals, newMeal]);
      setNewMealName('');
      setIsAddingMeal(false);
  };

  const deleteMeal = (e: React.MouseEvent, mealId: string) => {
      e.stopPropagation();
      e.preventDefault();

      // Verifica se a refeição tem itens. Se estiver vazia, deleta direto para facilitar a limpeza.
      const mealToDelete = meals.find(m => m.id === mealId);
      
      if (mealToDelete && mealToDelete.items.length > 0) {
          if (window.confirm(`Excluir "${mealToDelete.name}" e todos os registros nela?`)) {
              setMeals(prevMeals => prevMeals.filter(m => m.id !== mealId));
          }
      } else {
          // Exclusão silenciosa e rápida para refeições vazias (como as padrão iniciais)
          setMeals(prevMeals => prevMeals.filter(m => m.id !== mealId));
      }
  };

  const filteredFood = FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-fade-in pb-28">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black dark:text-white uppercase tracking-tighter">Nutrição</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Plano alimentar de {userName.split(' ')[0]}</p>
        </div>
        <button onClick={() => setShowBio(!showBio)} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border dark:border-slate-700 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-indigo-500 shadow-sm transition-all hover:scale-105 active:scale-95">
          <Calculator size={16} /> Calculadora TMB {showBio ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
        </button>
      </div>

      {showBio && (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border-2 border-indigo-500/20 shadow-xl animate-scale-in">
          
          {/* Tutorial / Dica da Calculadora */}
          <div className="mb-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-start gap-4">
            <div className="bg-indigo-100 dark:bg-indigo-800 p-2 rounded-xl text-indigo-600 dark:text-indigo-300 flex-shrink-0">
               <Lightbulb size={20} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">Entenda seus Dados</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                 A <strong>Taxa Metabólica Basal (TMB)</strong> é o quanto seu corpo gasta de energia em repouso. 
                 Nós multiplicamos isso pelo seu <strong>Nível de Atividade</strong> para achar seu gasto real diário.
                 <br/><br/>
                 Ao selecionar um <strong>Objetivo</strong>, o app ajusta automaticamente as calorias (ex: -500kcal para emagrecer) e a distribuição de macros.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Peso (kg)</label>
              <input type="number" value={bio.weight} onChange={e => setBio({...bio, weight: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl p-3 font-bold dark:text-white outline-none focus:ring-2 ring-indigo-500" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Altura (cm)</label>
              <input type="number" value={bio.height} onChange={e => setBio({...bio, height: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl p-3 font-bold dark:text-white outline-none focus:ring-2 ring-indigo-500" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Idade</label>
              <input type="number" value={bio.age} onChange={e => setBio({...bio, age: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl p-3 font-bold dark:text-white outline-none focus:ring-2 ring-indigo-500" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Gênero</label>
              <select value={bio.gender} onChange={e => setBio({...bio, gender: e.target.value as any})} className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl p-3 font-bold dark:text-white outline-none focus:ring-2 ring-indigo-500">
                <option value="male">Masc</option>
                <option value="female">Fem</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Atividade</label>
              <select value={bio.activityLevel} onChange={e => setBio({...bio, activityLevel: e.target.value as any})} className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl p-3 font-bold dark:text-white outline-none focus:ring-2 ring-indigo-500">
                <option value="sedentary">Sedentário</option>
                <option value="moderate">Moderado</option>
                <option value="active">Ativo</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Objetivo</label>
              <select value={bio.goal} onChange={e => setBio({...bio, goal: e.target.value as any})} className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl p-3 font-bold dark:text-white outline-none focus:ring-2 ring-indigo-500">
                <option value="lose">Emagrecer</option>
                <option value="maintain">Manter</option>
                <option value="gain">Ganhar Massa</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Sumário de Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 dark:bg-indigo-900/40 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
          <Zap className="absolute right-[-10px] top-[-10px] w-32 h-32 text-white/5" />
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 block">Calorias</span>
          <p className="text-4xl font-black">{currentTotals.kcal} <span className="text-lg opacity-40">/ {targets.kcal}</span></p>
          <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-50 transition-all duration-700" style={{ width: `${Math.min((currentTotals.kcal / targets.kcal) * 100, 100)}%` }} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border dark:border-slate-700 shadow-sm flex flex-col justify-center">
          <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1 block">Proteínas</span>
          <p className="text-2xl font-black dark:text-white">{currentTotals.p}g <span className="text-xs opacity-40">/ {targets.p}g</span></p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border dark:border-slate-700 shadow-sm flex flex-col justify-center">
          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1 block">Carboidratos</span>
          <p className="text-2xl font-black dark:text-white">{currentTotals.c}g <span className="text-xs opacity-40">/ {targets.c}g</span></p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border dark:border-slate-700 shadow-sm flex flex-col justify-center">
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1 block">Gorduras</span>
          <p className="text-2xl font-black dark:text-white">{currentTotals.f}g <span className="text-xs opacity-40">/ {targets.f}g</span></p>
        </div>
      </div>

      {/* Busca / Adição de Alimentos (Modal-like) */}
      {selectedMealId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[3rem] p-6 md:p-8 border-2 border-indigo-500 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button onClick={() => setSelectedMealId(null)} className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-300">
                    <X size={20} />
                </button>

                <div className="mb-6">
                    <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter mb-1">Adicionar Alimento</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">O que você vai comer agora?</p>
                </div>

                <div className="flex gap-4 mb-6 border-b dark:border-slate-700 pb-2 overflow-x-auto">
                    <button onClick={() => setIsManualEntry(false)} className={`text-xs font-black uppercase tracking-widest pb-2 px-4 whitespace-nowrap transition-all ${!isManualEntry ? 'text-indigo-500 border-b-2 border-indigo-500' : 'text-slate-400'}`}>Buscar Base</button>
                    <button onClick={() => setIsManualEntry(true)} className={`text-xs font-black uppercase tracking-widest pb-2 px-4 whitespace-nowrap transition-all ${isManualEntry ? 'text-indigo-500 border-b-2 border-indigo-500' : 'text-slate-400'}`}>Cadastro Manual</button>
                </div>

                {!isManualEntry ? (
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Pesquisar (ex: Arroz)" className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl py-4 pl-12 pr-4 font-bold dark:text-white outline-none focus:ring-2 ring-indigo-500" autoFocus />
                            </div>
                            <div className="w-full md:w-32">
                                <input type="number" value={foodAmount} onChange={e => setFoodAmount(e.target.value)} placeholder="Qtd (g)" className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl py-4 px-4 font-bold dark:text-white outline-none focus:ring-2 ring-indigo-500 text-center" />
                            </div>
                        </div>
                        {searchTerm && (
                            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {filteredFood.map(food => (
                                    <button key={food.name} onClick={() => addFoodToMeal(food)} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all text-left group">
                                        <div>
                                            <p className="text-sm font-black uppercase">{food.name}</p>
                                            <p className="text-[10px] opacity-60 font-bold group-hover:text-indigo-100">{food.kcal} kcal | P:{food.p} C:{food.c} G:{food.f}</p>
                                        </div>
                                        <div className="bg-white/20 p-2 rounded-xl">
                                            <Plus size={16} />
                                        </div>
                                    </button>
                                ))}
                                {filteredFood.length === 0 && <p className="text-center text-slate-400 font-bold py-4">Nenhum alimento encontrado</p>}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <input type="text" value={manualFood.name} onChange={e => setManualFood({...manualFood, name: e.target.value})} placeholder="Nome (Ex: Bolo de Cenoura)" className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 font-bold outline-none dark:text-white focus:ring-2 ring-indigo-500" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 pl-2">Calorias</label>
                                <input type="number" value={manualFood.kcal} onChange={e => setManualFood({...manualFood, kcal: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl p-3 font-bold outline-none dark:text-white text-center focus:ring-2 ring-indigo-500" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 pl-2">Prot (g)</label>
                                <input type="number" value={manualFood.p} onChange={e => setManualFood({...manualFood, p: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl p-3 font-bold outline-none dark:text-white text-center focus:ring-2 ring-indigo-500" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 pl-2">Carb (g)</label>
                                <input type="number" value={manualFood.c} onChange={e => setManualFood({...manualFood, c: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl p-3 font-bold outline-none dark:text-white text-center focus:ring-2 ring-indigo-500" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 pl-2">Gord (g)</label>
                                <input type="number" value={manualFood.f} onChange={e => setManualFood({...manualFood, f: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl p-3 font-bold outline-none dark:text-white text-center focus:ring-2 ring-indigo-500" />
                            </div>
                        </div>
                        <button onClick={addManualFood} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg mt-4">Adicionar ao Diário</button>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Gerenciamento de Refeições (Adicionar) */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border dark:border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-sm font-black dark:text-white uppercase tracking-widest pl-2 flex items-center gap-2">
            <LayoutList size={18} className="text-indigo-500" /> Suas Refeições
            </h3>
            
            {isAddingMeal ? (
                <div className="flex flex-col w-full md:w-auto gap-3 animate-scale-in p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl md:bg-transparent md:p-0">
                    <input 
                        type="text" 
                        value={newMealName} 
                        onChange={e => setNewMealName(e.target.value)}
                        placeholder="Nome da refeição (ex: Ceia)" 
                        className="w-full md:w-64 bg-white dark:bg-slate-800 md:bg-slate-50 md:dark:bg-slate-900 rounded-xl px-4 py-3 text-sm font-bold dark:text-white outline-none focus:ring-2 ring-indigo-500 border-2 border-transparent"
                        onKeyDown={e => e.key === 'Enter' && addMeal()}
                        autoFocus
                    />
                    <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={addMeal} className="flex-1 md:flex-none bg-indigo-600 text-white py-3 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest">Salvar</button>
                        <button onClick={() => setIsAddingMeal(false)} className="flex-1 md:flex-none bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 py-3 px-4 rounded-xl"><X size={18} className="mx-auto"/></button>
                    </div>
                </div>
            ) : (
                <button onClick={() => setIsAddingMeal(true)} className="w-full md:w-auto flex justify-center items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all border border-indigo-100 dark:border-indigo-800">
                    <Plus size={14} /> Nova Refeição
                </button>
            )}
        </div>
      </div>

      {/* Lista de Refeições */}
      {meals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {meals.map(meal => (
            <div key={meal.id} className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[3rem] border dark:border-slate-700 shadow-sm flex flex-col group/card relative transition-all hover:shadow-md">
                {/* Header da Refeição - Layout Flexível */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                    <div className="flex items-center gap-3 overflow-hidden w-full sm:w-auto">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-2xl flex-shrink-0">
                            <Utensils size={20} />
                        </div>
                        <h3 className="font-black dark:text-white uppercase tracking-tight text-lg truncate">{meal.name}</h3>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button 
                            type="button"
                            onClick={(e) => deleteMeal(e, meal.id)} 
                            className="flex-1 sm:flex-none h-10 w-10 sm:w-auto sm:px-3 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all flex items-center justify-center flex-shrink-0" 
                            title="Excluir Refeição"
                        >
                            <Trash2 size={18} />
                        </button>
                        <button 
                            onClick={() => setSelectedMealId(meal.id)} 
                            className="flex-1 sm:flex-none h-10 px-4 bg-indigo-600 text-white rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-200 dark:shadow-none" 
                            title="Adicionar Alimento"
                        >
                            <Plus size={16} /> <span className="sm:hidden md:inline">Adicionar</span>
                        </button>
                    </div>
                </div>

                {/* Lista de Itens */}
                <div className="space-y-3 flex-1 min-h-[100px]">
                {meal.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl group border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all">
                        <div className="overflow-hidden mr-2">
                            <p className="text-sm font-bold dark:text-white truncate">{item.name}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{item.calories} kcal</p>
                        </div>
                        <button onClick={() => removeFood(meal.id, item.id)} className="h-8 w-8 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all flex-shrink-0">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                {meal.items.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full py-6 opacity-30 text-slate-400">
                    <UtensilsCrossed size={32} />
                    <p className="text-[10px] font-black mt-2 uppercase tracking-widest">Refeição Vazia</p>
                    </div>
                )}
                </div>

                {/* Rodapé da Refeição */}
                {meal.items.length > 0 && (
                <div className="mt-6 pt-4 border-t-2 border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Calórico</span>
                    <span className="text-base font-black dark:text-white bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg">
                        {meal.items.reduce((sum, i) => sum + i.calories, 0)} kcal
                    </span>
                </div>
                )}
            </div>
            ))}
        </div>
      ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-40 text-slate-400 bg-white dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
             <AlertCircle size={48} className="mb-4" />
             <p className="text-xs font-black uppercase tracking-[0.3em]">Nenhuma refeição criada</p>
             <button onClick={() => setIsAddingMeal(true)} className="mt-4 px-6 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-100 transition-all">Criar Primeira Refeição</button>
          </div>
      )}
    </div>
  );
};
