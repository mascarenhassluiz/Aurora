
import React, { useState, useEffect } from 'react';
import { ShoppingItem } from '../types';
import { ShoppingCart, Trash2, Scale, Info, X } from 'lucide-react';

interface HomeManagementProps {
  storagePrefix: string;
  userName: string;
}

const CATEGORY_MAP: Record<string, string> = {
  grocery: 'Mercado',
  meat: 'Açougue',
  bakery: 'Padaria',
  frozen: 'Congelados',
  beverage: 'Bebidas',
  hygiene: 'Higiene',
  cleaning: 'Limpeza',
  other: 'Outros'
};

export const HomeManagement = ({ storagePrefix, userName }: HomeManagementProps) => {
    const listKey = `${storagePrefix}shopping_list`;
    const categories: ShoppingItem['category'][] = ['grocery', 'meat', 'bakery', 'frozen', 'beverage', 'hygiene', 'cleaning', 'other'];
    
    const [items, setItems] = useState<ShoppingItem[]>(() => {
        const saved = localStorage.getItem(listKey);
        return saved ? JSON.parse(saved) : [];
    });
    
    const [newItem, setNewItem] = useState('');
    const [newCategory, setNewCategory] = useState<ShoppingItem['category']>('grocery');
    const [prodA, setProdA] = useState({ price: '', qty: '' });
    const [prodB, setProdB] = useState({ price: '', qty: '' });

    // Estado para controlar a visibilidade da dica do comparador
    const [showComparatorInfo, setShowComparatorInfo] = useState(false);

    useEffect(() => {
        localStorage.setItem(listKey, JSON.stringify(items));
    }, [items, listKey]);

    const addItem = () => {
        if (!newItem.trim()) return;
        setItems([...items, { id: Date.now().toString(), name: newItem, category: newCategory, completed: false }]);
        setNewItem('');
    };

    const costA = Number(prodA.price) / Number(prodA.qty);
    const costB = Number(prodB.price) / Number(prodB.qty);
    const bestValue = costA > 0 && costB > 0 ? (costA < costB ? 'A' : 'B') : null;

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Gestão Doméstica</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Organização do lar para {userName.split(' ')[0]}</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-8 border dark:border-slate-700 shadow-sm">
                <h3 className="text-sm font-black dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    <ShoppingCart className="text-indigo-500" size={18} /> Lista de Compras
                </h3>
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="O que comprar?" className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-2xl px-6 py-4 font-bold dark:text-white outline-none focus:ring-2 ring-indigo-500/20" onKeyDown={e => e.key === 'Enter' && addItem()} />
                    <select value={newCategory} onChange={e => setNewCategory(e.target.value as any)} className="bg-slate-50 dark:bg-slate-900 rounded-2xl px-4 py-4 font-bold dark:text-white outline-none">
                        {categories.map(c => <option key={c} value={c}>{CATEGORY_MAP[c]}</option>)}
                    </select>
                    <button onClick={addItem} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all">Adicionar</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {categories.map(cat => {
                        const catItems = items.filter(i => i.category === cat);
                        if (catItems.length === 0) return null;
                        return (
                            <div key={cat} className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl border dark:border-slate-800 h-fit">
                                <h4 className="text-[10px] font-black uppercase text-indigo-500 mb-4 tracking-widest">{CATEGORY_MAP[cat]}</h4>
                                <div className="space-y-2">
                                    {catItems.map(item => (
                                        <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex items-center justify-between border dark:border-slate-700 group transition-all">
                                            <div className="flex items-center gap-3">
                                                <input 
                                                    type="checkbox" 
                                                    checked={item.completed} 
                                                    onChange={() => setItems(items.map(i => i.id === item.id ? {...i, completed: !i.completed} : i))} 
                                                    className="w-5 h-5 rounded-lg border-2 border-slate-200 cursor-pointer" 
                                                />
                                                <span className={`text-xs font-bold transition-all ${item.completed ? 'line-through opacity-30' : 'dark:text-white'}`}>{item.name}</span>
                                            </div>
                                            <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
                {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 opacity-20">
                      <ShoppingCart size={48} />
                      <p className="text-[10px] font-black uppercase mt-4 tracking-widest">Sua lista está vazia</p>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setShowComparatorInfo(!showComparatorInfo)}>
                      <h3 className="text-sm font-black dark:text-white uppercase tracking-widest flex items-center gap-2">
                          <Scale className="text-amber-500" size={18} /> Comparador Custo-Benefício
                      </h3>
                      <Info size={14} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                  </div>
                  {bestValue && (
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest animate-pulse">
                      Produto {bestValue} vale mais a pena!
                    </span>
                  )}
                </div>

                {showComparatorInfo && (
                    <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex gap-3 relative animate-scale-in">
                        <button onClick={() => setShowComparatorInfo(false)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-amber-500 transition-colors"><X size={14} /></button>
                        <div className="bg-amber-100 dark:bg-amber-800/50 p-2 rounded-xl text-amber-600 dark:text-amber-400 h-fit">
                            <Info size={16} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-amber-800 dark:text-amber-100 uppercase tracking-wide mb-1">Como usar?</p>
                            <p className="text-[11px] text-amber-900/70 dark:text-amber-200/70 font-medium leading-relaxed">
                                Use esta ferramenta quando estiver em dúvida entre dois produtos de tamanhos diferentes no mercado. 
                                <br/>
                                <strong>Exemplo:</strong> Uma Coca-Cola de 2L (R$ 9,00) vs 600ml (R$ 3,50). 
                                Digite o preço e a quantidade (em ml ou g) para descobrir qual sai mais barato proporcionalmente.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`space-y-4 p-6 rounded-3xl transition-all border-2 ${bestValue === 'A' ? 'border-emerald-500 bg-emerald-50/10' : 'bg-slate-50 dark:bg-slate-900/40 border-transparent'}`}>
                        <p className="text-[10px] font-black uppercase text-slate-400">Produto A</p>
                        <input type="number" placeholder="Preço (ex: 15.90)" value={prodA.price} onChange={e => setProdA({...prodA, price: e.target.value})} className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 font-bold outline-none dark:text-white" />
                        <input type="number" placeholder="Qtd (g ou ml)" value={prodA.qty} onChange={e => setProdA({...prodA, qty: e.target.value})} className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 font-bold outline-none dark:text-white" />
                    </div>
                    <div className={`space-y-4 p-6 rounded-3xl transition-all border-2 ${bestValue === 'B' ? 'border-emerald-500 bg-emerald-50/10' : 'bg-slate-50 dark:bg-slate-900/40 border-transparent'}`}>
                        <p className="text-[10px] font-black uppercase text-slate-400">Produto B</p>
                        <input type="number" placeholder="Preço (ex: 10.50)" value={prodB.price} onChange={e => setProdB({...prodB, price: e.target.value})} className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 font-bold outline-none dark:text-white" />
                        <input type="number" placeholder="Qtd (g ou ml)" value={prodB.qty} onChange={e => setProdB({...prodB, qty: e.target.value})} className="w-full bg-white dark:bg-slate-800 rounded-2xl p-4 font-bold outline-none dark:text-white" />
                    </div>
                </div>
            </div>
        </div>
    );
};
