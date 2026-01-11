
export interface Ingredient {
  name: string;
  amount: string;
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
}

export interface NutritionData {
  foodName: string;
  healthScore: number;
  totalCalories: number;
  totalProtein: string;
  totalProteinGrams: number; // Numeric value for tracking
  totalCarbs: string;
  totalFat: string;
  ingredients: Ingredient[];
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface UserProfile {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: number;
  targetCalories: number;
  targetProtein: number; // Added protein target
}

export interface MealEntry {
  id: string;
  timestamp: number;
  type: MealType;
  foodName: string;
  calories: number;
  protein: number; // Added protein tracking
}

export interface HistoryEntry {
  date: string;
  consumed: number;
  proteinConsumed: number;
  target: number;
  proteinTarget: number;
}

export enum AppState {
  SETUP = 'SETUP',
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR',
  MANUAL = 'MANUAL'
}
