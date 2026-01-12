
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

export type GoalType = 'lose' | 'maintain' | 'gain';

export interface UserProfile {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: number;
  goal: GoalType;
  targetWeight?: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

export interface MealEntry {
  id: string;
  timestamp: number;
  type: MealType;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface HistoryEntry {
  date: string;
  consumed: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
  target: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
}

export enum AppState {
  SETUP = 'SETUP',
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR',
  MANUAL = 'MANUAL',
  ANALYTICS = 'ANALYTICS',
  SETTINGS = 'SETTINGS'
}
