
export type NavigationTab = 'dashboard' | 'habits' | 'finances' | 'work' | 'home' | 'nutrition' | 'workout' | 'studies' | 'health';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  createdAt: string;
  subscription: 'free' | 'pro'; // Novo campo para controle de plano
}

export interface Reminder {
  id: string;
  text: string;
  completed: boolean;
  datetime?: string;
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  completedToday: boolean;
  history: { day: string; score: number }[];
  icon?: string;
  color?: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'fixed_expense' | 'variable_expense' | 'investment';
  category?: string;
  date: string;
}

export interface WorkShift {
  id: string;
  jobName: string;
  isWorking: boolean;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: 'cleaning' | 'grocery' | 'meat' | 'hygiene' | 'beverage' | 'bakery' | 'frozen' | 'other';
  completed: boolean;
}

export interface Meal {
  id: string;
  name: string;
  items: { id: string; name: string; calories: number; protein: number; carbs: number; fat: number }[];
}

export interface Biometrics {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'extreme';
  goal: 'maintain' | 'lose' | 'gain';
}

export interface WorkoutSession {
  id: string;
  exercise: string;
  weight: number;
  sets: number;
  reps: number;
  rpe: number;
  date: string;
}

export interface RunSession {
  id: string;
  distanceKm: number;
  timeMinutes: number;
  date: string;
}

export interface TrainingExercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  rest?: string;
  load?: string;
}

export interface TrainingSheet {
  id: string;
  name: string;
  exercises: TrainingExercise[];
}

export interface StudyTopic {
  id: string;
  subject: string;
  topic: string;
  status: 'to_study' | 'reviewing' | 'done';
}

export interface Book {
  id: string;
  title: string;
  status: 'reading' | 'finished';
  rating: number;
}

export interface HealthMetric {
  id: string;
  value: number;
}

export interface HealthExam {
  id: string;
  date: string;
  location: string;
  metrics: Record<string, number>; // chave é o ID da métrica (ex: 'testo_total'), valor é o resultado
}
