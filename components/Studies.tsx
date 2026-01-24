
import React, { useState, useMemo, useEffect } from 'react';
import { StudyTopic, Book } from '../types';
import { 
  BookOpen, GraduationCap, Star, Trash2, Layers, BookMarked, ArrowRight, Bookmark
} from 'lucide-react';

interface StudiesProps {
  storagePrefix: string;
  userName: string;
}

const STATUS_LABELS: Record<string, string> = {
  to_study: 'Para Estudar',
  reviewing: 'Revisando',
  done: 'Concluído'
};

export const Studies = ({ storagePrefix, userName }: StudiesProps) => {
    const topicsKey = `${storagePrefix}study_topics`;
    const booksKey = `${storagePrefix}study_books`;

    const [topics, setTopics] = useState<StudyTopic[]>(() => {
        const saved = localStorage.getItem(topicsKey);
        return saved ? JSON.parse(saved) : [];
    });
    const [books, setBooks] = useState<Book[]>(() => {
        const saved = localStorage.getItem(booksKey);
        return saved ? JSON.parse(saved) : [];
    });
    
    const [newTopic, setNewTopic] = useState({ subject: '', topic: '' });
    const [newBook, setNewBook] = useState('');
    const [activeTab, setActiveTab] = useState<'topics' | 'library'>('topics');

    useEffect(() => {
        localStorage.setItem(topicsKey, JSON.stringify(topics));
        localStorage.setItem(booksKey, JSON.stringify(books));
    }, [topics, books, topicsKey, booksKey]);

    const addTopic = () => {
        if (!newTopic.subject || !newTopic.topic) return;
        setTopics([{ id: Date.now().toString(), subject: newTopic.subject, topic: newTopic.topic, status: 'to_study' }, ...topics]);
        setNewTopic({ subject: '', topic: '' });
    };

    const updateTopicStatus = (id: string, status: StudyTopic['status']) => {
        setTopics(topics.map(t => t.id === id ? { ...t, status } : t));
    };

    const addBook = () => {
        if (!newBook.trim()) return;
        setBooks([{ id: Date.now().toString(), title: newBook, status: 'reading', rating: 0 }, ...books]);
        setNewBook('');
    };

    const updateBookRating = (id: string, rating: number) => {
      setBooks(books.map(b => b.id === id ? { ...b, rating } : b));
    };

    const toggleBookStatus = (id: string) => {
      setBooks(books.map(b => b.id === id ? { ...b, status: b.status === 'reading' ? 'finished' : 'reading' } : b));
    };

    const stats = useMemo(() => {
        const done = topics.filter(t => t.status === 'done').length;
        const total = topics.length;
        return { 
            progress: total > 0 ? Math.round((done / total) * 100) : 0,
            done, total,
            read: books.filter(b => b.status === 'finished').length
        };
    }, [topics, books]);

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Estudos</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Foco e evolução intelectual de {userName.split(' ')[0]}</p>
                    <div className="mt-8 flex gap-2">
                        <button onClick={() => setActiveTab('topics')} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'topics' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'bg-white dark:bg-slate-800 text-slate-400 border dark:border-slate-700'}`}>Tópicos de Estudo</button>
                        <button onClick={() => setActiveTab('library')} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'library' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200 dark:shadow-none' : 'bg-white dark:bg-slate-800 text-slate-400 border dark:border-slate-700'}`}>Biblioteca Virtual</button>
                    </div>
                </div>
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex-shrink-0 w-full lg:w-64 flex flex-col items-center relative overflow-hidden shadow-2xl">
                    <GraduationCap className="absolute right-[-10px] bottom-[-10px] w-24 h-24 opacity-10" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2 text-center">Tópicos Concluídos</span>
                    <span className="text-5xl font-black">{stats.progress}%</span>
                    <div className="mt-4 flex gap-4 opacity-60">
                      <div className="flex items-center gap-1 text-[8px] font-black uppercase"><Layers size={10} /> {stats.done}</div>
                      <div className="flex items-center gap-1 text-[8px] font-black uppercase"><BookMarked size={10} /> {stats.read}</div>
                    </div>
                </div>
            </div>

            {activeTab === 'topics' ? (
              <div className="space-y-8 animate-fade-in">
                <section className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-sm border dark:border-slate-700">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-6">Novo Tópico de Estudo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <input type="text" placeholder="Matéria..." value={newTopic.subject} onChange={e => setNewTopic({...newTopic, subject: e.target.value})} className="md:col-span-3 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 font-bold outline-none dark:text-white" />
                        <input type="text" placeholder="Conteúdo do tópico..." value={newTopic.topic} onChange={e => setNewTopic({...newTopic, topic: e.target.value})} className="md:col-span-7 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 font-bold outline-none dark:text-white" onKeyDown={e => e.key === 'Enter' && addTopic()} />
                        <button onClick={addTopic} className="md:col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all py-4 md:py-0">
                          Adicionar
                        </button>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['to_study', 'reviewing', 'done'].map(status => (
                        <div key={status} className="space-y-4">
                            <h4 className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${status === 'done' ? 'bg-emerald-500' : status === 'reviewing' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                              {STATUS_LABELS[status]}
                            </h4>
                            <div className="space-y-3">
                                {topics.filter(t => t.status === status).map(topic => (
                                    <div key={topic.id} className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border dark:border-slate-700 shadow-sm flex flex-col gap-2 group transition-all hover:shadow-md">
                                        <div className="flex justify-between items-start">
                                            <span className="bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-md text-[8px] font-black text-indigo-500 uppercase tracking-widest">{topic.subject}</span>
                                            <button onClick={() => setTopics(topics.filter(t => t.id !== topic.id))} className="text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-1"><Trash2 size={14}/></button>
                                        </div>
                                        <p className={`font-bold text-sm ${topic.status === 'done' ? 'line-through opacity-30' : 'dark:text-white'}`}>{topic.topic}</p>
                                        {topic.status !== 'done' && (
                                            <button onClick={() => updateTopicStatus(topic.id, topic.status === 'to_study' ? 'reviewing' : 'done')} className="text-[9px] font-black uppercase text-indigo-500 hover:text-indigo-600 flex items-center gap-1 mt-2">Avançar Etapa <ArrowRight size={10}/></button>
                                        )}
                                    </div>
                                ))}
                                {topics.filter(t => t.status === status).length === 0 && (
                                  <div className="py-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] flex items-center justify-center opacity-20">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Vazio</span>
                                  </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                <section className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-sm border dark:border-slate-700">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-6">Registrar Nova Leitura</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input type="text" placeholder="Título do livro ou artigo..." value={newBook} onChange={e => setNewBook(e.target.value)} className="flex-1 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-amber-500 rounded-2xl p-4 font-bold outline-none dark:text-white transition-all" onKeyDown={e => e.key === 'Enter' && addBook()} />
                        <button onClick={addBook} className="bg-amber-500 hover:bg-amber-600 text-white px-10 py-4 sm:py-0 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-amber-200 dark:shadow-none active:scale-95 transition-all">
                          Registrar
                        </button>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {books.map(book => (
                    <div key={book.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border dark:border-slate-700 shadow-sm group hover:border-amber-500/30 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-2xl ${book.status === 'finished' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20' : 'bg-amber-50 text-amber-500 dark:bg-amber-900/20'}`}>
                          <Bookmark size={20} fill={book.status === 'finished' ? 'currentColor' : 'none'} />
                        </div>
                        <button onClick={() => setBooks(books.filter(b => b.id !== book.id))} className="text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                      </div>
                      <h4 className="font-black text-slate-800 dark:text-white text-lg leading-tight mb-2">{book.title}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{book.status === 'finished' ? 'Concluído' : 'Em Leitura'}</p>
                      
                      <div className="flex flex-col gap-4">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onClick={() => updateBookRating(book.id, star)}>
                              <Star size={18} className={`transition-all ${star <= book.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700 hover:text-amber-300'}`} />
                            </button>
                          ))}
                        </div>
                        <button onClick={() => toggleBookStatus(book.id)} className="w-full py-2.5 rounded-xl border border-indigo-500/20 text-[9px] font-black uppercase text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 flex items-center justify-center gap-2 transition-all">
                          {book.status === 'reading' ? 'Concluir Leitura' : 'Voltar a Lendo'} <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {books.length === 0 && (
                    <div className="col-span-full py-20 bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center opacity-30">
                      <BookOpen size={48} />
                      <p className="text-xs font-black uppercase tracking-[0.3em] mt-4">Sua biblioteca está vazia</p>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
    );
};
