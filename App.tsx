
import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Flame,
  Zap,
  Leaf,
  Droplets,
  Heart,
  ChevronLeft,
  Loader2,
  User,
  Settings,
  Utensils,
  History as HistoryIcon,
  Trash2,
  X,
  TrendingUp,
  Image as ImageIcon,
  Keyboard,
  Sparkles,
  Check,
  Plus,
  Home,
  Pencil,
  TrendingDown,
  Target,
  Calendar,
  Scale,
  Ruler,
  ChevronRight,
  Activity
} from 'lucide-react';
import { AppState, NutritionData, UserProfile, MealEntry, MealType, HistoryEntry, GoalType } from './types';
import { analyzeFoodImage } from './services/geminiService';
import NutritionCard from './components/NutritionCard';
import IngredientItem from './components/IngredientItem';
import { translations } from './translations';

enum SetupStep {
  GENDER,
  WEIGHT,
  AGE,
  HEIGHT,
  ACTIVITY,
  GOAL
}

const HorizontalRuler: React.FC<{
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  unit: string;
}> = ({ value, min, max, onChange, unit }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemWidth = 10;

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [initialScroll, setInitialScroll] = useState(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = (value - min) * 10 * itemWidth;
    }
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isDragging) return; // Let mouse move handle it or just let it fire
    const newVal = Math.round(e.currentTarget.scrollLeft / itemWidth) / 10 + min;
    const clamped = Math.max(min, Math.min(max, newVal));
    if (Math.abs(clamped - value) > 0.05) {
      onChange(Number(clamped.toFixed(1)));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setInitialScroll(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX);
    scrollRef.current.scrollLeft = initialScroll - walk;

    // Update value during drag for immediate feedback
    const newVal = Math.round(scrollRef.current.scrollLeft / itemWidth) / 10 + min;
    const clamped = Math.max(min, Math.min(max, newVal));
    if (Math.abs(clamped - value) > 0.05) {
      onChange(Number(clamped.toFixed(1)));
    }
  };

  return (
    <div className="relative w-full py-16 flex flex-col items-center">
      <div className="text-8xl font-black mb-12 flex items-baseline gap-3 tabular-nums text-[#1C1C1E]">
        {value.toFixed(1)} <span className="text-4xl text-[#3A3A3C] font-bold">{unit}</span>
      </div>
      <div className="relative w-full h-32 flex items-center justify-center">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`w-full h-full flex items-center overflow-x-auto no-scrollbar snap-x ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
          style={{ paddingLeft: 'calc(50% - 0.5px)', paddingRight: 'calc(50% - 0.5px)' }}
        >
          {Array.from({ length: Math.round((max - min) * 10) + 1 }).map((_, i) => {
            const isMajor = i % 10 === 0;
            const isMid = i % 5 === 0;
            return (
              <div
                key={i}
                className="flex-shrink-0 flex items-center justify-center snap-center"
                style={{ width: itemWidth }}
              >
                <div className={`transition-all duration-300 ${isMajor ? 'h-24 w-[2px] bg-[#C7C7CC]' : isMid ? 'h-14 w-[1px] bg-[#D1D1D6]' : 'h-8 w-[1px] bg-[#E5E5EA]'}`} />
              </div>
            );
          })}
        </div>
        {/* Pointer */}
        <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-[2.5px] bg-[#1C1C1E] rounded-full z-10" />
      </div>
    </div>
  );
};

const VerticalRuler: React.FC<{
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  unit: string;
}> = ({ value, min, max, onChange, unit }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemHeight = 10;

  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [initialScroll, setInitialScroll] = useState(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (max - value) * 10 * itemHeight;
    }
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isDragging) return;
    const newVal = max - (Math.round(e.currentTarget.scrollTop / itemHeight) / 10);
    const clamped = Math.max(min, Math.min(max, newVal));
    if (Math.abs(clamped - value) > 0.05) {
      onChange(Number(clamped.toFixed(1)));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.pageY - (scrollRef.current?.offsetTop || 0));
    setInitialScroll(scrollRef.current?.scrollTop || 0);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const y = e.pageY - scrollRef.current.offsetTop;
    const walk = (y - startY);
    scrollRef.current.scrollTop = initialScroll - walk;

    const newVal = max - (Math.round(scrollRef.current.scrollTop / itemHeight) / 10);
    const clamped = Math.max(min, Math.min(max, newVal));
    if (Math.abs(clamped - value) > 0.05) {
      onChange(Number(clamped.toFixed(1)));
    }
  };

  return (
    <div className="relative w-full h-[500px] flex items-center">
      {/* Value Display */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-8xl font-black tabular-nums text-[#1C1C1E] leading-none mb-1">
          {Math.round(value)}
        </div>
        <div className="text-3xl font-bold text-[#3A3A3C]">{unit}</div>
      </div>

      {/* Ruler */}
      <div className="relative w-32 h-full flex items-center justify-center">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`h-full w-full overflow-y-auto no-scrollbar snap-y flex flex-col items-start ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
          style={{ paddingTop: 'calc(250px - 0.5px)', paddingBottom: 'calc(250px - 0.5px)' }}
        >
          {Array.from({ length: Math.round((max - min) * 10) + 1 }).map((_, i) => {
            const isMajor = i % 10 === 0;
            const isMid = i % 5 === 0;
            return (
              <div
                key={i}
                className="flex-shrink-0 flex items-center justify-start snap-center"
                style={{ height: itemHeight }}
              >
                <div className={`transition-all duration-300 ${isMajor ? 'w-24 h-[2px] bg-[#C7C7CC]' : isMid ? 'w-14 h-[1px] bg-[#D1D1D6]' : 'w-8 h-[1px] bg-[#E5E5EA]'}`} />
              </div>
            );
          })}
        </div>
        {/* Pointer */}
        <div className="absolute left-0 right-8 top-1/2 -translate-y-1/2 h-[2.5px] bg-[#1C1C1E] rounded-full z-10" />
      </div>
    </div>
  );
};


const ActivityRing: React.FC<{
  progress: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  children?: React.ReactNode;
}> = ({ progress, size = 220, strokeWidth = 16, color, children }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          className="activity-ring-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="activity-ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
};

const MiniTrendRing: React.FC<{ progress: number; label: string; color: string }> = ({ progress, label, color }) => {
  const size = 32;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            className="activity-ring-bg"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <circle
            className="activity-ring-progress"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
      </div>
      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{label}</span>
    </div>
  );
};

const SettingsItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: string;
  color: string;
  onClick?: () => void;
}> = ({ icon, label, value, color, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 active:bg-gray-100 transition-colors first:rounded-t-[32px] last:rounded-b-[32px] border-b border-gray-50 last:border-0"
  >
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white`}>
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { size: 20 }) : icon}
      </div>
      <div className="text-left">
        <p className="text-sm font-bold text-[#1C1C1E]">{label}</p>
        {value && <p className="text-xs font-medium text-gray-400">{value}</p>}
      </div>
    </div>
    <ChevronRight size={18} className="text-gray-300" />
  </button>
);

const App: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'zh'>('en');
  const t = translations[lang];

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('foodai_profile');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [dailyLog, setDailyLog] = useState<MealEntry[]>(() => {
    try {
      const saved = localStorage.getItem('foodai_log');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('foodai_history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('foodai_api_key') || '';
  });

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  const [state, setState] = useState<AppState>(userProfile ? AppState.IDLE : AppState.SETUP);
  const [setupStep, setSetupStep] = useState<SetupStep>(SetupStep.WEIGHT);
  const [setupData, setSetupData] = useState({
    gender: 'male' as 'male' | 'female',
    weight: 70,
    age: 25,
    height: 175,
    activity: 1.2,
    goal: 'maintain' as GoalType,
    targetWeight: 70
  });

  const [data, setData] = useState<NutritionData | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('Breakfast');
  const [isEndDayModalOpen, setIsEndDayModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [portionCount, setPortionCount] = useState(1);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userProfile) localStorage.setItem('foodai_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('foodai_log', JSON.stringify(dailyLog));
  }, [dailyLog]);

  useEffect(() => {
    localStorage.setItem('foodai_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('foodai_api_key', apiKey);
  }, [apiKey]);

  const calculateTargets = (weight: number, height: number, age: number, gender: 'male' | 'female', activity: number) => {
    const bmr = gender === 'male'
      ? (10 * weight) + (6.25 * height) - (5 * age) + 5
      : (10 * weight) + (6.25 * height) - (5 * age) - 161;
    const targetCalories = Math.round(bmr * activity);

    // Macro splits: P: 25%, F: 25%, C: 50%
    const targetProtein = Math.round((targetCalories * 0.25) / 4);
    const targetFat = Math.round((targetCalories * 0.25) / 9);
    const targetCarbs = Math.round((targetCalories * 0.50) / 4);

    return { targetCalories, targetProtein, targetCarbs, targetFat };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setImagePreview(reader.result as string);
      processImage(base64);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const processImage = async (base64: string) => {
    setState(AppState.LOADING);
    try {
      const result = await analyzeFoodImage(base64, apiKey);
      setData(result);
      setState(AppState.RESULTS);
    } catch (err) {
      setState(AppState.ERROR);
    }
  };

  const logMeal = () => {
    if (!data) return;
    const multiplier = 1 / portionCount;
    setDailyLog(prev => [...prev, {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: selectedMealType,
      foodName: data.foodName + (portionCount > 1 ? ` (1/${portionCount} portion)` : ''),
      calories: Math.round(Number(data.totalCalories) * (portionCount > 1 ? multiplier : 1)),
      protein: Number((Number(data.totalProteinGrams) * multiplier).toFixed(1)),
      carbs: Math.round((parseInt(data.totalCarbs) || 0) * multiplier),
      fat: Math.round((parseInt(data.totalFat) || 0) * multiplier)
    }]);
    resetToDashboard();
    setPortionCount(1);
  };

  const logManualMeal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setDailyLog(prev => [...prev, {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: formData.get('mealType') as MealType,
      foodName: formData.get('foodName') as string,
      calories: Number(formData.get('calories')),
      protein: Number(formData.get('protein') || 0),
      carbs: Number(formData.get('carbs') || 0),
      fat: Number(formData.get('fat') || 0)
    }]);
    resetToDashboard();
  };

  const resetToDashboard = () => {
    setState(AppState.IDLE);
    setData(null);
    setImagePreview(null);
    setPortionCount(1);
  };

  const confirmEndDay = () => {
    const totalCals = dailyLog.reduce((sum, item) => sum + item.calories, 0);
    const totalProt = dailyLog.reduce((sum, item) => sum + item.protein, 0);
    const totalCarbs = dailyLog.reduce((sum, item) => sum + item.carbs, 0);
    const totalFat = dailyLog.reduce((sum, item) => sum + item.fat, 0);

    setHistory(prev => [{
      date: new Date().toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      consumed: totalCals,
      proteinConsumed: totalProt,
      carbsConsumed: totalCarbs,
      fatConsumed: totalFat,
      target: userProfile?.targetCalories || 2000,
      proteinTarget: userProfile?.targetProtein || 120,
      carbsTarget: userProfile?.targetCarbs || 250,
      fatTarget: userProfile?.targetFat || 60
    }, ...prev].slice(0, 14));
    setDailyLog([]);
    setIsEndDayModalOpen(false);
    setState(AppState.IDLE);
  };

  const deleteMeal = (id: string) => {
    if (window.confirm(t.deleteEntry)) {
      setDailyLog(prev => prev.filter(i => i.id !== id));
    }
  };

  const totalCaloriesConsumed = dailyLog.reduce((sum, item) => sum + item.calories, 0);
  const totalProteinConsumed = dailyLog.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbsConsumed = dailyLog.reduce((sum, item) => sum + item.carbs, 0);
  const totalFatConsumed = dailyLog.reduce((sum, item) => sum + item.fat, 0);

  const targetCals = userProfile?.targetCalories || 2000;
  const targetProt = userProfile?.targetProtein || 120;
  const targetCarbs = userProfile?.targetCarbs || 250;
  const targetFat = userProfile?.targetFat || 60;

  const calRemaining = targetCals - totalCaloriesConsumed;
  const calProgress = (totalCaloriesConsumed / targetCals) * 100;
  const protProgress = (totalProteinConsumed / targetProt) * 100;
  const carbProgress = (totalCarbsConsumed / targetCarbs) * 100;
  const fatProgress = (totalFatConsumed / targetFat) * 100;

  const isCalsOverLimit = calRemaining < 0;

  if (state === AppState.SETUP) {
    const nextStep = () => {
      if (setupStep === SetupStep.GOAL || isEditingProfile) {
        finishSetup();
      } else {
        setSetupStep(prev => prev + 1);
      }
    };

    const prevStep = () => {
      if (isEditingProfile) {
        setState(AppState.SETTINGS);
        setIsEditingProfile(false);
        return;
      }
      if (setupStep !== SetupStep.GENDER) {
        setSetupStep(prev => prev - 1);
      }
    };

    const finishSetup = () => {
      const { weight, height, age, gender, activity, goal, targetWeight } = setupData;
      let { targetCalories, targetProtein, targetCarbs, targetFat } = calculateTargets(weight, height, age, gender, activity);

      // Adjust based on goal
      if (goal === 'lose') targetCalories -= 500;
      if (goal === 'gain') targetCalories += 500;

      // Recalculate macros for adjusted calories
      targetProtein = Math.round((targetCalories * 0.25) / 4);
      targetFat = Math.round((targetCalories * 0.25) / 9);
      targetCarbs = Math.round((targetCalories * 0.50) / 4);

      setUserProfile({
        weight, height, age, gender,
        activityLevel: activity,
        goal, targetWeight,
        targetCalories, targetProtein, targetCarbs, targetFat
      });
      setState(isEditingProfile ? AppState.SETTINGS : AppState.IDLE);
      setIsEditingProfile(false);
    };
    // setup functions end here

    const renderStep = () => {
      switch (setupStep) {
        case SetupStep.GENDER:
          return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-4xl font-black text-gray-900 text-center mb-12">{t.iam}</h2>
              <div className="grid grid-cols-1 gap-4">
                {(['male', 'female'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => { setSetupData(d => ({ ...d, gender: g })); nextStep(); }}
                    className={`card-base p-8 flex items-center justify-between group transition-all pressable ${setupData.gender === g ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''}`}
                  >
                    <span className="text-xl font-bold capitalize">{t[g] || g}</span>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${setupData.gender === g ? 'bg-blue-500 border-blue-500' : 'border-gray-200'}`}>
                      {setupData.gender === g && <Check size={16} className="text-white" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        case SetupStep.WEIGHT:
          return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                  <Flame size={20} />
                </div>
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t.weight}</span>
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-8">{t.weight}</h2>
              <HorizontalRuler
                value={setupData.weight}
                min={30}
                max={200}
                unit="kg"
                onChange={(v) => setSetupData(d => ({ ...d, weight: v }))}
              />
              <button onClick={nextStep} className="w-full bg-blue-600 text-white font-black py-6 rounded-3xl mt-12 text-lg shadow-xl shadow-blue-100 pressable">
                {t.save}
              </button>
            </div>
          );
        case SetupStep.AGE:
          const ageRanges = ["18-24", "25-34", "35-44", "45-54", "55+"];
          return (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-4xl font-black text-gray-900 text-center mb-12">{t.age}</h2>
              <div className="grid grid-cols-1 gap-3">
                {ageRanges.map(range => (
                  <button
                    key={range}
                    onClick={() => {
                      const ageVal = parseInt(range);
                      setSetupData(d => ({ ...d, age: ageVal }));
                      if (!isEditingProfile) nextStep();
                    }}
                    className={`card-base p-6 text-xl font-bold transition-all text-center pressable ${setupData.age === parseInt(range) ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              {isEditingProfile && (
                <button onClick={nextStep} className="w-full bg-blue-600 text-white font-black py-6 rounded-3xl mt-8 text-lg shadow-xl shadow-blue-100 pressable">
                  Save
                </button>
              )}
            </div>
          );
        case SetupStep.HEIGHT:
          return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-4xl font-black text-gray-900 mb-8">{t.height}</h2>
              <VerticalRuler
                value={setupData.height}
                min={50}
                max={250}
                unit="cm"
                onChange={(v) => setSetupData(d => ({ ...d, height: v }))}
              />
              <button onClick={nextStep} className="w-full bg-blue-600 text-white font-black py-6 rounded-3xl mt-8 text-lg shadow-xl shadow-blue-100 pressable">
                {isEditingProfile ? t.save : t.next}
              </button>
            </div>
          );
        case SetupStep.ACTIVITY:
          const activityLevels = [
            { id: 1.2, label: t.sedentary, desc: 'Mostly sitting (e.g. office work)', icon: <div className="p-3 bg-gray-100 rounded-2xl"><Settings size={22} /></div> },
            { id: 1.375, label: t.lightlyActive, desc: 'Mostly standing or walking', icon: <div className="p-3 bg-blue-50 rounded-2xl"><User size={22} className="text-blue-500" /></div> },
            { id: 1.55, label: t.moderatelyActive, desc: 'Regular physical activity', icon: <div className="p-3 bg-green-50 rounded-2xl"><TrendingUp size={22} className="text-green-500" /></div> },
            { id: 1.725, label: t.veryActive, desc: 'Constant physical activity', icon: <div className="p-3 bg-orange-50 rounded-2xl"><Zap size={22} className="text-orange-500" /></div> },
          ];
          return (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-4xl font-black text-gray-900 text-center mb-8">{t.activityLevel}</h2>
              <div className="grid grid-cols-1 gap-4">
                {activityLevels.map(level => (
                  <button
                    key={level.id}
                    onClick={() => {
                      setSetupData(d => ({ ...d, activity: level.id }));
                      if (!isEditingProfile) nextStep();
                    }}
                    className={`card-base p-6 flex items-center gap-5 transition-all pressable ${setupData.activity === level.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
                  >
                    {level.icon}
                    <div className="text-left">
                      <p className={`font-bold text-lg ${setupData.activity === level.id ? 'text-white' : 'text-gray-900'}`}>{level.label}</p>
                      <p className={`text-xs ${setupData.activity === level.id ? 'text-blue-100' : 'text-gray-400'}`}>{level.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              {isEditingProfile && (
                <button onClick={nextStep} className="w-full bg-blue-600 text-white font-black py-6 rounded-3xl mt-8 text-lg shadow-xl shadow-blue-100 pressable">
                  Save
                </button>
              )}
            </div>
          );
        case SetupStep.GOAL:
          const goals = [
            { id: 'lose', label: t.loseWeight, desc: t.reduceFat, icon: <Flame size={20} />, color: 'text-orange-500' },
            { id: 'maintain', label: t.maintainWeight, desc: t.keepShape, icon: <Heart size={20} />, color: 'text-green-500' },
            { id: 'gain', label: t.gainWeight, desc: t.buildMuscle, icon: <TrendingUp size={20} />, color: 'text-blue-500' },
          ];
          return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-1 gap-3">
                {goals.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setSetupData(d => ({ ...d, goal: g.id as GoalType }))}
                    className={`card-base p-6 flex items-center gap-4 transition-all pressable ${setupData.goal === g.id ? 'bg-blue-600 text-white ring-4 ring-blue-100' : ''}`}
                  >
                    <div className={`p-3 rounded-2xl ${setupData.goal === g.id ? 'bg-white/20 text-white' : 'bg-gray-50 ' + g.color}`}>
                      {g.icon}
                    </div>
                    <div className="text-left">
                      <p className="font-bold">{g.label}</p>
                      <p className={`text-[10px] uppercase font-bold tracking-tight ${setupData.goal === g.id ? 'text-blue-100' : 'text-gray-400'}`}>{g.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {setupData.goal !== 'maintain' && (
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-center mb-4">{t.target} {t.weight}</h3>
                  <HorizontalRuler
                    value={setupData.targetWeight}
                    min={30}
                    max={200}
                    unit="kg"
                    onChange={(v) => setSetupData(d => ({ ...d, targetWeight: v }))}
                  />
                </div>
              )}

              <button onClick={finishSetup} className="w-full bg-blue-600 text-white font-black py-6 rounded-3xl mt-4 text-lg shadow-xl shadow-blue-100 pressable">
                {isEditingProfile ? t.save : t.getStarted}
              </button>
            </div>
          );
      }
    };

    return (
      <div className="min-h-screen bg-[#FDFDFF] flex flex-col p-6 pb-12">
        <header className="flex items-center justify-between mb-8 px-2">
          <button onClick={prevStep} className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-gray-100 text-gray-900 active:scale-95 transition-all">
            <ChevronLeft size={24} />
          </button>
          {!isEditingProfile && (
            <div className="flex gap-1.5">
              {Object.keys(SetupStep).filter(k => isNaN(Number(k))).map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === setupStep ? 'w-8 bg-blue-600' : i < setupStep ? 'w-3 bg-blue-200' : 'w-2 bg-gray-100'}`} />
              ))}
            </div>
          )}
          <div className="w-12 h-12" />
        </header>

        <main className="flex-1 flex flex-col max-w-sm mx-auto w-full pt-4">
          {renderStep()}
        </main>
      </div>
    );
  }

  if (state === AppState.LOADING) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="card-base p-12 flex flex-col items-center">
          <Loader2 className="w-16 h-16 text-green-500 animate-spin mb-6" />
          <h2 className="text-xl font-extrabold text-gray-800">{t.analyzing}</h2>
          <p className="text-sm text-gray-400 mt-2 font-medium">{t.identifying}</p>
        </div>
      </div>
    );
  }

  if (state === AppState.MANUAL) {
    return (
      <div className="min-h-screen flex flex-col items-center p-6">
        <div className="card-base max-w-md w-full p-8 transition-all animate-in slide-in-from-bottom-5">
          <button onClick={resetToDashboard} className="text-gray-400 mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-tight">
            <ChevronLeft size={16} /> {t.dashboard}
          </button>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">{t.addFood}</h2>
          <form onSubmit={logManualMeal} className="space-y-4">
            <input required name="foodName" type="text" placeholder={t.mealName} className="w-full bg-gray-100 border-none rounded-2xl px-6 py-5 text-lg font-bold text-gray-800 outline-none" />
            <div className="grid grid-cols-2 gap-4">
              <input required name="calories" type="number" placeholder="Kcal" className="w-full bg-gray-100 border-none rounded-2xl px-6 py-5 text-lg font-bold text-gray-800 outline-none" />
              <input name="protein" type="number" placeholder="Protein (g)" className="w-full bg-gray-100 border-none rounded-2xl px-6 py-5 text-lg font-bold text-gray-800 outline-none" />
            </div>
            <select name="mealType" className="w-full bg-gray-100 border-none rounded-2xl px-6 py-5 text-gray-800 outline-none font-bold text-sm">
              <option value="Breakfast">{t.breakfast}</option>
              <option value="Lunch">{t.lunch}</option>
              <option value="Dinner">{t.dinner}</option>
              <option value="Snack">{t.snack}</option>
            </select>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-5 rounded-[22px] text-sm uppercase tracking-widest shadow-xl shadow-blue-100 pressable">
              {t.addToDiary}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (state === AppState.IDLE || state === AppState.ERROR) {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - today.getDay() + i);
      return {
        name: d.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'short' }),
        date: d.getDate(),
        isToday: d.toDateString() === today.toDateString()
      };
    });

    return (
      <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center pb-32 max-w-sm mx-auto font-['Plus_Jakarta_Sans']">
        {/* Top Date Selector */}
        <div className="w-full flex justify-between px-4 py-6">
          {days.map((d, i) => (
            <div key={i} className={`flex flex-col items-center p-2 rounded-xl transition-all ${d.isToday ? 'bg-black text-white' : 'bg-transparent text-gray-400'}`}>
              <span className="text-[10px] font-bold uppercase">{d.name}</span>
              <span className="text-base font-black">{d.date}</span>
            </div>
          ))}
        </div>

        {/* Calorie Card */}
        <div className={`w-[92%] rounded-[32px] p-8 mb-6 shadow-sm flex items-center justify-between transition-colors duration-500 ${isCalsOverLimit ? 'bg-[#FF3B30]/10' : 'bg-white'}`}>
          <div className="flex flex-col">
            <h2 className={`text-6xl font-black tracking-tighter leading-none mb-4 ${isCalsOverLimit ? 'text-[#FF3B30]' : 'text-[#1C1C1E]'}`}>
              {Math.abs(calRemaining)}
            </h2>
            <p className={`text-xs font-black uppercase tracking-widest opacity-60 ${isCalsOverLimit ? 'text-[#FF3B30]' : 'text-[#1C1C1E]'}`}>
              {isCalsOverLimit ? t.caloriesOver : t.caloriesLeft}
            </p>
          </div>
          <div className="relative">
            <ActivityRing
              progress={isCalsOverLimit ? 100 : calProgress}
              color={isCalsOverLimit ? '#FF3B30' : '#007AFF'}
              size={120}
              strokeWidth={14}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-colors duration-500 ${isCalsOverLimit ? 'bg-[#FF3B30] shadow-red-200' : 'bg-[#007AFF] shadow-blue-200'}`}>
                <Flame size={28} className="text-white fill-white" />
              </div>
            </ActivityRing>
          </div>
        </div>

        {/* Macro Grid */}
        <div className="w-[92%] grid grid-cols-3 gap-3 mb-8">
          {/* Protein */}
          <div className="bg-white rounded-[24px] p-5 flex flex-col items-center shadow-sm">
            <div className="flex items-center gap-1.5 self-start mb-6">
              <Zap size={14} className="text-[#FF3B30] fill-[#FF3B30]" />
              <span className="text-[10px] font-bold text-gray-500">{t.protein}</span>
            </div>
            <ActivityRing progress={protProgress} color="#FF3B30" size={80} strokeWidth={8}>
              <div className="flex flex-col items-center leading-tight">
                <span className="text-xl font-black">{Math.max(0, targetProt - totalProteinConsumed)}</span>
                <span className="text-[8px] font-bold uppercase text-gray-400">{t.left}</span>
              </div>
            </ActivityRing>
            <p className="text-[9px] font-bold text-gray-400 mt-6">{totalProteinConsumed}g / {targetProt}g</p>
          </div>

          {/* Carbs */}
          <div className="bg-white rounded-[24px] p-5 flex flex-col items-center shadow-sm">
            <div className="flex items-center gap-1.5 self-start mb-6">
              <Utensils size={14} className="text-[#34C759] fill-[#34C759]" />
              <span className="text-[10px] font-bold text-gray-500">{t.carbs}</span>
            </div>
            <ActivityRing progress={carbProgress} color="#34C759" size={80} strokeWidth={8}>
              <div className="flex flex-col items-center leading-tight">
                <span className="text-xl font-black">{Math.max(0, targetCarbs - totalCarbsConsumed)}</span>
                <span className="text-[8px] font-bold uppercase text-gray-400">{t.left}</span>
              </div>
            </ActivityRing>
            <p className="text-[9px] font-bold text-gray-400 mt-6">{totalCarbsConsumed}g / {targetCarbs}g</p>
          </div>

          {/* Fat */}
          <div className="bg-white rounded-[24px] p-5 flex flex-col items-center shadow-sm">
            <div className="flex items-center gap-1.5 self-start mb-6">
              <Droplets size={14} className="text-[#FF9500] fill-[#FF9500]" />
              <span className="text-[10px] font-bold text-gray-500">{t.fat}</span>
            </div>
            <ActivityRing progress={fatProgress} color="#FF9500" size={80} strokeWidth={8}>
              <div className="flex flex-col items-center leading-tight">
                <span className="text-xl font-black">{Math.max(0, targetFat - totalFatConsumed)}</span>
                <span className="text-[8px] font-bold uppercase text-gray-400">{t.left}</span>
              </div>
            </ActivityRing>
            <p className="text-[9px] font-bold text-gray-400 mt-6">{totalFatConsumed}g / {targetFat}g</p>
          </div>
        </div>

        {/* Recently Logged */}
        <div className="w-[92%] flex-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-black text-[#1C1C1E]">{t.recentlyLogged}</h3>
            <div className="flex gap-3">
              <button onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')} className="font-bold text-xs bg-gray-200 px-2 py-1 rounded-lg pressable">
                {lang === 'en' ? '中' : 'EN'}
              </button>
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-900 shadow-sm pressable"
              >
                <Camera size={20} />
              </button>
              <button
                onClick={() => setState(AppState.MANUAL)}
                className="w-10 h-10 bg-[#007AFF] rounded-full flex items-center justify-center text-white shadow-lg pressable"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-10 flex flex-col items-center justify-center min-h-[220px] shadow-sm">
            {dailyLog.length === 0 ? (
              <div className="flex flex-col items-center cursor-pointer" onClick={() => cameraInputRef.current?.click()}>
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Utensils size={32} className="text-gray-400" />
                </div>
                <h4 className="text-base font-bold text-[#1C1C1E] mb-1">{t.noMeals}</h4>
                <p className="text-xs font-medium text-gray-400">{t.tapToStart}</p>
              </div>
            ) : (
              <div className="w-full space-y-4">
                {[...dailyLog].reverse().map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 border-b border-gray-50 last:border-0 group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                        <Utensils size={20} className="text-gray-400 group-hover:text-blue-500" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{item.foodName}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{item.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-2">
                        <p className="font-black text-gray-900 leading-none">+{item.calories}</p>
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tight">kcal</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMeal(item.id);
                        }}
                        className="p-2 text-gray-200 hover:text-red-500 transition-all active:scale-90"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Nav Bar */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/80 backdrop-blur-2xl rounded-[40px] p-2 flex justify-between items-center shadow-2xl border border-white/50 px-6 h-20 z-[100]">
          <button
            onClick={() => setState(AppState.ANALYTICS)}
            className={`p-3 transition-colors ${state === AppState.ANALYTICS ? 'text-black' : 'text-gray-400 hover:text-black'}`}
          >
            <TrendingUp size={24} />
          </button>
          <button onClick={() => setState(AppState.IDLE)} className={`p-4 rounded-full transition-all ${state === AppState.IDLE ? 'bg-gray-100 text-black' : 'text-gray-400'}`}>
            <Home size={24} fill={state === AppState.IDLE ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => setState(AppState.SETTINGS)}
            className={`p-3 transition-colors ${state === AppState.SETTINGS ? 'text-black' : 'text-gray-400 hover:text-black'}`}
          >
            <Settings size={24} />
          </button>
        </div>

        <input type="file" ref={cameraInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
        <input type="file" ref={galleryInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
      </div>
    );
  }

  if (state === AppState.ANALYTICS) {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const target = userProfile?.targetCalories || 1604;
    const currentWeight = userProfile?.weight || 52.3;
    const targetWeight = userProfile?.targetWeight || 32.5;
    const remainingWeight = Math.abs(currentWeight - targetWeight);

    // Calculate BMI
    const heightInMeters = (userProfile?.height || 175) / 100;
    const bmi = Number((currentWeight / (heightInMeters * heightInMeters)).toFixed(1));

    return (
      <div className="min-h-screen bg-[#F8F9FD] flex flex-col items-center pb-32 max-w-sm mx-auto font-['Plus_Jakarta_Sans']">
        <header className="w-full px-6 pt-12 pb-6">
          <h1 className="text-3xl font-black text-[#1C1C1E]">{t.analytics}</h1>
        </header>

        {/* Daily Calories Card */}
        <div className="w-[92%] bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-gray-100/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#1C1C1E]">{t.dailyCalories}</h2>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-sm">7D</button>
              <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-gray-400">14D</button>
            </div>
          </div>

          <div className="flex flex-col items-center mb-8">
            <span className="text-xs font-bold text-gray-400 mb-1">{formattedDate}</span>
            <span className="text-4xl font-black text-[#1C1C1E] mb-1">{totalCaloriesConsumed}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-gray-400">kcal</span>
              <span className="text-xs font-bold text-green-500">-{target - totalCaloriesConsumed} {t.vsTarget}</span>
            </div>
          </div>

          {/* Calorie Chart Mockup */}
          <div className="relative h-48 w-full mb-8">
            <div className="absolute inset-0 flex flex-col justify-between text-[10px] font-bold text-gray-300">
              <span>{target}</span>
              <span>{Math.round(target * 0.75)}</span>
              <span>{Math.round(target * 0.5)}</span>
              <span>{Math.round(target * 0.25)}</span>
              <span>0</span>
            </div>
            <div className="absolute left-10 right-0 top-0 bottom-0">
              {/* Grid Lines */}
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="w-full border-t border-gray-50 absolute" style={{ top: `${i * 25}%` }} />
              ))}
              {/* Target Line */}
              <div className="w-full border-t-2 border-dashed border-green-400/50 absolute top-0 z-10" />

              {/* Bar Chart Mockup */}
              <div className="absolute inset-0 flex items-end justify-between px-2">
                {[6, 7, 8, 9, 10, 11, 12].map((day, i) => (
                  <div key={day} className="flex flex-col items-center gap-2 group">
                    <div
                      className={`w-1.5 rounded-full transition-all duration-500 ${i === 6 ? 'bg-blue-600 h-[10%]' : 'bg-gray-100 h-[2%]'} group-hover:bg-blue-400`}
                    />
                    <span className={`text-[10px] font-bold ${i === 6 ? 'text-gray-900' : 'text-gray-300'}`}>{day.toString().padStart(2, '0')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50/50 rounded-[20px] p-4 flex flex-col items-center">
              <span className="text-xl font-black text-[#1C1C1E]">0</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">{t.average}</span>
            </div>
            <div className="bg-green-50/50 rounded-[20px] p-4 flex flex-col items-center">
              <span className="text-xl font-black text-green-600">{target}</span>
              <span className="text-[10px] font-bold text-green-600/60 uppercase">{t.target}</span>
            </div>
            <div className="bg-gray-50/50 rounded-[20px] p-4 flex flex-col items-center">
              <span className="text-xl font-black text-[#1C1C1E]">0</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">{t.peak}</span>
            </div>
          </div>
        </div>

        {/* Weight Goal Card */}
        <div className="w-[92%] bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-gray-100/50">
          <h2 className="text-xl font-bold text-[#1C1C1E] mb-6">{t.weightGoal}</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 p-4 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t.current}</span>
              <span className="text-lg font-black text-[#1C1C1E]">{currentWeight} kg</span>
            </div>
            <div className="bg-orange-50/50 p-4 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] font-bold text-orange-400 uppercase mb-1 text-center">{t.remaining}</span>
              <span className="text-lg font-black text-orange-900">{remainingWeight.toFixed(1)} kg</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t.target}</span>
              <span className="text-lg font-black text-[#1C1C1E]">{targetWeight} kg</span>
            </div>
          </div>
        </div>

        {/* BMI Card */}
        <div className="w-[92%] bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-gray-100/50">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#1C1C1E]">{t.bmi}</span>
              <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px] text-gray-400">i</div>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="text-5xl font-black text-[#1C1C1E] mb-6">{bmi}</div>

          <div className="space-y-3">
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-blue-300" style={{ width: '18.5%' }} />
              <div className="h-full bg-green-400" style={{ width: '25%' }} />
              <div className="h-full bg-orange-300" style={{ width: '25%' }} />
              <div className="h-full bg-red-400 transition-all" style={{ width: '31.5%' }} />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-400">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-300" />
                <span>{t.underweight}</span>
              </div>
              <span>&lt; 18.5</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-400">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span>{t.healthy}</span>
              </div>
              <span>18.5 - 24.9</span>
            </div>
          </div>
        </div>

        {/* Bottom Nav Bar */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/80 backdrop-blur-2xl rounded-[40px] p-2 flex justify-between items-center shadow-2xl border border-white/50 px-6 h-20 z-[100]">
          <button
            onClick={() => setState(AppState.ANALYTICS)}
            className={`p-3 transition-colors ${state === AppState.ANALYTICS ? 'text-black' : 'text-gray-400 hover:text-black'}`}
          >
            <TrendingUp size={24} />
          </button>
          <button onClick={() => setState(AppState.IDLE)} className={`p-4 rounded-full transition-all ${state === AppState.IDLE ? 'bg-gray-100 text-black' : 'text-gray-400'}`}>
            <Home size={24} fill={state === AppState.IDLE ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => setState(AppState.SETTINGS)}
            className={`p-3 transition-colors ${state === AppState.SETTINGS ? 'text-black' : 'text-gray-400 hover:text-black'}`}
          >
            <Settings size={24} />
          </button>
        </div>
      </div>
    );
  }

  if (state === AppState.SETTINGS) {
    const getActivityLabel = (level: number) => {
      if (level <= 1.2) return t.sedentary;
      if (level <= 1.375) return t.lightlyActive;
      if (level <= 1.55) return t.moderatelyActive;
      return t.veryActive;
    };

    const handleSettingsEdit = (step: SetupStep) => {
      if (userProfile) {
        setSetupData({
          gender: userProfile.gender,
          weight: userProfile.weight,
          age: userProfile.age,
          height: userProfile.height,
          activity: userProfile.activityLevel,
          goal: userProfile.goal,
          targetWeight: userProfile.targetWeight || userProfile.weight
        });
        setSetupStep(step);
        setIsEditingProfile(true);
        setState(AppState.SETUP);
      }
    };

    return (
      <div className="min-h-screen bg-[#F8F9FD] flex flex-col items-center pb-32 max-w-sm mx-auto font-['Plus_Jakarta_Sans']">
        <header className="w-full px-6 pt-16 pb-8 flex justify-between items-center">
          <h1 className="text-4xl font-black text-[#1C1C1E]">{t.settings}</h1>
          <button
            onClick={() => setIsApiKeyModalOpen(true)}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#1C1C1E] shadow-sm border border-gray-100 hover:bg-gray-50 transition-all active:scale-95"
          >
            <Sparkles size={24} className={apiKey ? "text-blue-500 fill-blue-50" : "text-gray-300"} />
          </button>
        </header>

        <div className="w-full px-6 space-y-8">
          {/* General Section */}
          <div>
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] mb-4 px-1">{t.general}</h3>
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100/50 overflow-hidden">
              <SettingsItem
                icon={<Target />}
                label={t.yourGoal}
                value={`${userProfile?.goal === 'lose' ? t.loseWeight : userProfile?.goal === 'gain' ? t.gainWeight : t.maintainWeight} -> ${userProfile?.targetWeight || userProfile?.weight} kg`}
                color="bg-red-50 !text-red-500"
                onClick={() => handleSettingsEdit(SetupStep.GOAL)}
              />
              <SettingsItem
                icon={<Calendar />}
                label={t.age}
                value={`${userProfile?.age} ${t.years}`}
                color="bg-blue-50 !text-blue-500"
                onClick={() => handleSettingsEdit(SetupStep.AGE)}
              />
              <SettingsItem
                icon={<Scale />}
                label={t.weight}
                value={`${userProfile?.weight} kg`}
                color="bg-yellow-50 !text-yellow-600"
                onClick={() => handleSettingsEdit(SetupStep.WEIGHT)}
              />
              <SettingsItem
                icon={<Ruler />}
                label={t.height}
                value={`${userProfile?.height} cm`}
                color="bg-orange-50 !text-orange-500"
                onClick={() => handleSettingsEdit(SetupStep.HEIGHT)}
              />
              <SettingsItem
                icon={<Activity />}
                label={t.activityLevel}
                value={getActivityLabel(userProfile?.activityLevel || 1.2)}
                color="bg-green-50 !text-green-500"
                onClick={() => handleSettingsEdit(SetupStep.ACTIVITY)}
              />
            </div>
          </div>

          {/* Customization Section */}
          <div>
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] mb-4 px-1">{t.customization}</h3>
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100/50 overflow-hidden">
              <SettingsItem
                icon={<TrendingUp />}
                label={t.yourPlan}
                value={t.manageMacros}
                color="bg-indigo-50 !text-indigo-500"
                onClick={() => handleSettingsEdit(SetupStep.GOAL)}
              />
            </div>
          </div>
        </div>

        {/* Bottom Nav Bar */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/80 backdrop-blur-2xl rounded-[40px] p-2 flex justify-between items-center shadow-2xl border border-white/50 px-6 h-20 z-[100]">
          <button
            onClick={() => setState(AppState.ANALYTICS)}
            className={`p-3 transition-colors ${state === AppState.ANALYTICS ? 'text-black' : 'text-gray-400 hover:text-black'}`}
          >
            <TrendingUp size={24} />
          </button>
          <button onClick={() => setState(AppState.IDLE)} className={`p-4 rounded-full transition-all ${state === AppState.IDLE ? 'bg-gray-100 text-black' : 'text-gray-400'}`}>
            <Home size={24} fill={state === AppState.IDLE ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => setState(AppState.SETTINGS)}
            className={`p-3 transition-colors ${state === AppState.SETTINGS ? 'text-black' : 'text-gray-400 hover:text-black'}`}
          >
            <Settings size={24} />
          </button>
        </div>

        {/* API Key Modal */}
        {isApiKeyModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 text-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsApiKeyModalOpen(false)} />
            <div className="bg-white w-full max-w-sm rounded-[40px] p-8 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mx-auto mb-6">
                <Sparkles size={32} />
              </div>
              <h3 className="text-2xl font-black text-[#1C1C1E] mb-2">{t.geminiKey}</h3>
              <p className="text-sm font-medium text-gray-400 mb-8 px-4">{t.enterKey}</p>

              <div className="space-y-4 text-left">
                <div className="relative">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-1">{t.yourKey}</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={t.pasteKey}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-blue-500 focus:bg-white outline-none transition-all text-[#1C1C1E]"
                  />
                </div>

                <button
                  onClick={() => setIsApiKeyModalOpen(false)}
                  className="w-full bg-[#007AFF] text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 pressable text-sm uppercase tracking-widest"
                >
                  {t.saveKey}
                </button>
                <button
                  onClick={() => setIsApiKeyModalOpen(false)}
                  className="w-full text-gray-400 font-bold py-2 text-[10px] uppercase tracking-widest text-center"
                >
                  {t.maybeLater}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center pb-40 font-['Plus_Jakarta_Sans']">
      <div className="max-w-md w-full relative flex flex-col animate-in fade-in slide-in-from-bottom-5">
        {/* Hero Image Section */}
        <div className="w-full h-[50vh] relative overflow-hidden rounded-b-[40px] shadow-2xl">
          <img src={imagePreview || ""} alt="Food" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/10" />

          {/* Overlay Buttons */}
          <div className="absolute top-12 left-6 right-6 flex justify-between items-center z-50">
            <button onClick={resetToDashboard} className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all hover:bg-black/40 active:scale-95">
              <ChevronLeft size={24} />
            </button>
            <button className="w-10 h-10 bg-[#FF3B30] rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-95">
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 -mt-16 relative z-30">
          {/* Title & Health Card */}
          <div className="bg-white rounded-[32px] p-8 mb-6 shadow-xl relative">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-4xl font-black text-[#1C1C1E] tracking-tight leading-tight w-[80%]">
                {data?.foodName}
              </h2>
              <button className="text-gray-300 hover:text-gray-500">
                <Pencil size={20} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#FF2D55] fill-[#FF2D55]" />
              <span className="text-base font-bold text-[#FF2D55]">{t.healthScore} <span className="text-[#1C1C1E] font-black ml-1">{data?.healthScore}/10</span></span>
            </div>
          </div>

          {/* Meal Type Selector */}
          <div className="bg-white rounded-[24px] p-2 mb-4 flex justify-between shadow-sm border border-gray-100/50">
            {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedMealType(type)}
                className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedMealType === type ? 'bg-black text-white shadow-lg' : 'text-gray-400'}`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Portion Selector */}
          <div className="bg-white rounded-[24px] p-6 mb-6 shadow-sm border border-gray-100/50 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t.plateSharing}</h4>
              <p className="text-sm font-bold text-[#1C1C1E]">{t.divideNutrition} {portionCount} {portionCount === 1 ? t.person : t.people}</p>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl">
              <button
                onClick={() => setPortionCount(Math.max(1, portionCount - 1))}
                className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-900 shadow-sm border border-gray-100 active:scale-95 transition-all text-xl font-bold"
              >
                -
              </button>
              <span className="text-lg font-black w-4 text-center">{portionCount}</span>
              <button
                onClick={() => setPortionCount(Math.min(10, portionCount + 1))}
                className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-900 shadow-sm border border-gray-100 active:scale-95 transition-all text-xl font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Nutrition Grid */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-white rounded-[24px] p-6 flex flex-col gap-2 transition-all shadow-sm">
              <div className="flex items-center gap-2">
                <div className="text-[#1C1C1E]">
                  <Flame size={18} className="fill-current" />
                </div>
                <span className="text-[11px] font-bold text-gray-500 tracking-tight">Calories</span>
              </div>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  value={Math.round((data?.totalCalories || 0) / portionCount)}
                  onChange={(e) => {
                    if (data) {
                      const newTotal = Number(e.target.value) * portionCount;
                      setData({ ...data, totalCalories: newTotal });
                    }
                  }}
                  className="text-3xl font-black text-[#1C1C1E] tracking-tight w-24 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-100 rounded-lg selection:bg-blue-100"
                />
                <span className="text-sm font-bold text-gray-300 uppercase">kcal</span>
              </div>
            </div>
            <NutritionCard
              label={t.protein}
              value={portionCount > 1
                ? `${(Number(data?.totalProteinGrams || 0) / portionCount).toFixed(1)}g`
                : (data?.totalProtein || '0g')
              }
              icon={<Zap />}
              bgColor=""
            />
            <NutritionCard
              label={t.carbs}
              value={portionCount > 1
                ? `${Math.round((parseInt(data?.totalCarbs || '0g') || 0) / portionCount)}g`
                : (data?.totalCarbs || '0g')
              }
              icon={<Leaf />}
              bgColor=""
            />
            <NutritionCard
              label={t.fat}
              value={portionCount > 1
                ? `${Math.round((parseInt(data?.totalFat || '0g') || 0) / portionCount)}g`
                : (data?.totalFat || '0g')
              }
              icon={<Droplets />}
              bgColor=""
            />
          </div>

          {/* Ingredients Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-lg font-black text-[#1C1C1E]">{t.ingredients}</h3>
              <button className="w-8 h-8 bg-[#007AFF] rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Plus size={18} />
              </button>
            </div>
            <div className="space-y-4">
              {data?.ingredients.map((item, idx) => (
                <IngredientItem key={idx} ingredient={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[100]">
          <button
            onClick={logMeal}
            className="w-full bg-[#007AFF] text-white font-black py-6 rounded-[32px] shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 transition-all pressable text-lg"
          >
            {t.addToDiary}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
