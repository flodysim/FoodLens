
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
  Plus
} from 'lucide-react';
import { AppState, NutritionData, UserProfile, MealEntry, MealType, HistoryEntry } from './types';
import { analyzeFoodImage } from './services/geminiService';
import NutritionCard from './components/NutritionCard';
import IngredientItem from './components/IngredientItem';

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

const App: React.FC = () => {
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

  const [state, setState] = useState<AppState>(userProfile ? AppState.IDLE : AppState.SETUP);
  const [data, setData] = useState<NutritionData | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('Breakfast');
  const [isEndDayModalOpen, setIsEndDayModalOpen] = useState(false);
  
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

  const calculateTargets = (weight: number, height: number, age: number, gender: 'male' | 'female', activity: number) => {
    const bmr = gender === 'male' 
      ? (10 * weight) + (6.25 * height) - (5 * age) + 5
      : (10 * weight) + (6.25 * height) - (5 * age) - 161;
    const targetCalories = Math.round(bmr * activity);
    const targetProtein = Math.round(weight * 1.8);
    return { targetCalories, targetProtein };
  };

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const weight = Number(formData.get('weight'));
    const height = Number(formData.get('height'));
    const age = Number(formData.get('age'));
    const gender = formData.get('gender') as 'male' | 'female';
    const activity = Number(formData.get('activity'));
    const { targetCalories, targetProtein } = calculateTargets(weight, height, age, gender, activity);
    setUserProfile({ weight, height, age, gender, activityLevel: activity, targetCalories, targetProtein });
    setState(AppState.IDLE);
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
      const result = await analyzeFoodImage(base64);
      setData(result);
      setState(AppState.RESULTS);
    } catch (err) {
      setState(AppState.ERROR);
    }
  };

  const logMeal = () => {
    if (!data) return;
    setDailyLog(prev => [...prev, {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: selectedMealType,
      foodName: data.foodName,
      calories: data.totalCalories,
      protein: data.totalProteinGrams
    }]);
    resetToDashboard();
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
      protein: Number(formData.get('protein') || 0)
    }]);
    resetToDashboard();
  };

  const resetToDashboard = () => {
    setState(AppState.IDLE);
    setData(null);
    setImagePreview(null);
  };

  const confirmEndDay = () => {
    const totalCals = dailyLog.reduce((sum, item) => sum + item.calories, 0);
    const totalProt = dailyLog.reduce((sum, item) => sum + item.protein, 0);
    setHistory(prev => [{
      date: new Date().toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      consumed: totalCals,
      proteinConsumed: totalProt,
      target: userProfile?.targetCalories || 2000,
      proteinTarget: userProfile?.targetProtein || 120
    }, ...prev].slice(0, 14));
    setDailyLog([]);
    setIsEndDayModalOpen(false);
    setState(AppState.IDLE);
  };

  const deleteMeal = (id: string) => {
    if (confirm("Delete this entry?")) setDailyLog(prev => prev.filter(i => i.id !== id));
  };

  const totalCaloriesConsumed = dailyLog.reduce((sum, item) => sum + item.calories, 0);
  const totalProteinConsumed = dailyLog.reduce((sum, item) => sum + item.protein, 0);
  const targetCals = userProfile?.targetCalories || 2000;
  const targetProt = userProfile?.targetProtein || 120;
  const calRemaining = targetCals - totalCaloriesConsumed;
  const calProgress = (totalCaloriesConsumed / targetCals) * 100;
  const protProgress = (totalProteinConsumed / targetProt) * 100;
  const isCalsOverLimit = calRemaining < 0;

  if (state === AppState.SETUP) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="card-base max-w-md w-full p-10 animate-in fade-in zoom-in-95 transition-all">
          <div className="w-20 h-20 bg-green-500 rounded-[28px] flex items-center justify-center mb-8 mx-auto shadow-xl shadow-green-200">
            <Sparkles className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-2">SIM Food</h1>
          <p className="text-gray-400 text-center text-sm font-medium mb-10">Let's set up your daily goals</p>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <select name="gender" className="bg-gray-100 border-none rounded-2xl px-5 py-4 text-gray-800 outline-none font-bold text-sm">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <input required name="age" type="number" placeholder="Age" className="bg-gray-100 border-none rounded-2xl px-5 py-4 text-gray-800 outline-none font-bold text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input required name="weight" type="number" step="0.1" placeholder="Weight (kg)" className="bg-gray-100 border-none rounded-2xl px-5 py-4 text-gray-800 outline-none font-bold text-sm" />
              <input required name="height" type="number" placeholder="Height (cm)" className="bg-gray-100 border-none rounded-2xl px-5 py-4 text-gray-800 outline-none font-bold text-sm" />
            </div>
            <div className="pt-4">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3 ml-1">Activity Level</label>
              <select name="activity" className="w-full bg-gray-100 border-none rounded-2xl px-5 py-4 text-gray-800 outline-none font-bold text-sm appearance-none">
                <option value="1.2">Sedentary</option>
                <option value="1.375">Lightly Active</option>
                <option value="1.55">Moderately Active</option>
                <option value="1.725">Very Active</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-black text-white font-bold py-5 rounded-[22px] mt-6 text-sm uppercase tracking-widest shadow-lg pressable">
              Get Started
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (state === AppState.LOADING) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="card-base p-12 flex flex-col items-center">
          <Loader2 className="w-16 h-16 text-green-500 animate-spin mb-6" />
          <h2 className="text-xl font-extrabold text-gray-800">Analyzing Food</h2>
          <p className="text-sm text-gray-400 mt-2 font-medium">Identifying nutrients using AI...</p>
        </div>
      </div>
    );
  }

  if (state === AppState.MANUAL) {
    return (
      <div className="min-h-screen flex flex-col items-center p-6">
        <div className="card-base max-w-md w-full p-8 transition-all animate-in slide-in-from-bottom-5">
          <button onClick={resetToDashboard} className="text-gray-400 mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-tight">
            <ChevronLeft size={16} /> Dashboard
          </button>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Add Food</h2>
          <form onSubmit={logManualMeal} className="space-y-4">
            <input required name="foodName" type="text" placeholder="Meal Name" className="w-full bg-gray-100 border-none rounded-2xl px-6 py-5 text-lg font-bold text-gray-800 outline-none" />
            <div className="grid grid-cols-2 gap-4">
              <input required name="calories" type="number" placeholder="Kcal" className="w-full bg-gray-100 border-none rounded-2xl px-6 py-5 text-lg font-bold text-gray-800 outline-none" />
              <input name="protein" type="number" placeholder="Protein (g)" className="w-full bg-gray-100 border-none rounded-2xl px-6 py-5 text-lg font-bold text-gray-800 outline-none" />
            </div>
            <select name="mealType" className="w-full bg-gray-100 border-none rounded-2xl px-6 py-5 text-gray-800 outline-none font-bold text-sm">
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
            </select>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-5 rounded-[22px] text-sm uppercase tracking-widest shadow-xl shadow-blue-100 pressable">
              Add to Diary
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (state === AppState.IDLE || state === AppState.ERROR) {
    const chartHistory = [...history].slice(0, 6).reverse();

    return (
      <div className="min-h-screen flex flex-col items-center p-6 pb-32 max-w-md mx-auto relative">
        <header className="w-full flex justify-between items-center mb-8 mt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-green-500 shadow-sm border border-gray-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest leading-none mb-1">Health Hub</p>
              <h1 className="text-xl font-extrabold tracking-tight text-gray-900">SIM Food</h1>
            </div>
          </div>
          <button onClick={() => setState(AppState.SETUP)} className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm border border-gray-100">
            <Settings size={20} />
          </button>
        </header>

        {/* Central Rings Card */}
        <div className="card-base w-full p-8 mb-6 flex flex-col items-center relative overflow-hidden transition-all hover:shadow-xl">
          <div className="relative mb-6">
            <ActivityRing 
              progress={calProgress} 
              color={isCalsOverLimit ? '#FF3B30' : '#FF9500'} 
              size={230} 
              strokeWidth={18}
            >
              <div className="flex flex-col items-center">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-300 mb-2">Remaining</p>
                <h2 className={`text-6xl font-black tracking-tight leading-none ${isCalsOverLimit ? 'text-red-500' : 'text-gray-900'}`}>
                  {calRemaining}
                </h2>
                <span className="text-xs font-bold text-gray-400 mt-4 uppercase tracking-tighter">kcal balance</span>
              </div>
            </ActivityRing>
            {/* Protein Ring Overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-75 opacity-20 pointer-events-none">
              <ActivityRing progress={protProgress} color="#007AFF" size={310} strokeWidth={14} />
            </div>
          </div>

          <div className="w-full grid grid-cols-3 gap-2 mt-2">
             <div className="flex flex-col items-center p-3 bg-gray-50 rounded-2xl">
                <span className="text-[8px] font-extrabold uppercase tracking-widest text-orange-500 mb-1">Burned</span>
                <span className="text-lg font-extrabold text-gray-900 leading-none">{totalCaloriesConsumed}</span>
             </div>
             <div className="flex flex-col items-center p-3 bg-blue-50 rounded-2xl">
                <span className="text-[8px] font-extrabold uppercase tracking-widest text-blue-500 mb-1">Protein</span>
                <span className="text-lg font-extrabold text-gray-900 leading-none">{totalProteinConsumed}g</span>
             </div>
             <div className="flex flex-col items-center p-3 bg-gray-50 rounded-2xl">
                <span className="text-[8px] font-extrabold uppercase tracking-widest text-gray-400 mb-1">Goal</span>
                <span className="text-lg font-extrabold text-gray-900 leading-none">{targetCals}</span>
             </div>
          </div>
        </div>

        {/* Weekly Progress Rings */}
        <div className="card-base w-full p-6 mb-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Weekly Progress</h3>
            <div className="p-1.5 bg-green-50 rounded-lg">
              <TrendingUp size={14} className="text-green-500" />
            </div>
          </div>
          <div className="flex justify-between items-center px-1">
            {chartHistory.map((day, i) => (
              <MiniTrendRing 
                key={i} 
                progress={(day.consumed / day.target) * 100} 
                label={day.date} 
                color={day.consumed > day.target ? '#FF3B30' : '#FF9500'} 
              />
            ))}
            <MiniTrendRing 
              progress={calProgress} 
              label="Today" 
              color={isCalsOverLimit ? '#FF3B30' : '#34C759'} 
            />
          </div>
        </div>

        {/* Action Grid */}
        <div className="w-full grid grid-cols-3 gap-3 mb-8">
          <button onClick={() => cameraInputRef.current?.click()} className="card-base p-5 flex flex-col items-center justify-center gap-2 hover:bg-black group transition-all pressable">
            <Camera className="w-6 h-6 text-green-500 group-hover:text-white transition-colors" />
            <span className="text-[9px] font-extrabold uppercase tracking-tight text-gray-400 group-hover:text-gray-300">Scan</span>
          </button>
          <button onClick={() => galleryInputRef.current?.click()} className="card-base p-5 flex flex-col items-center justify-center gap-2 hover:bg-black group transition-all pressable">
            <ImageIcon className="w-6 h-6 text-blue-500 group-hover:text-white transition-colors" />
            <span className="text-[9px] font-extrabold uppercase tracking-tight text-gray-400 group-hover:text-gray-300">Import</span>
          </button>
          <button onClick={() => setState(AppState.MANUAL)} className="card-base p-5 flex flex-col items-center justify-center gap-2 hover:bg-black group transition-all pressable">
            <Plus className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors" />
            <span className="text-[9px] font-extrabold uppercase tracking-tight text-gray-400 group-hover:text-gray-300">Manual</span>
          </button>
        </div>

        {/* List of Today's Meals */}
        <div className="w-full space-y-3 mb-12">
          <div className="flex justify-between items-center px-4 mb-2">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Daily Diary</h3>
            <span className="text-[10px] font-bold text-gray-300">{dailyLog.length} items</span>
          </div>
          {dailyLog.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <Utensils size={32} className="mx-auto mb-3 text-gray-200" />
              <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No meals logged yet</p>
            </div>
          ) : (
            dailyLog.map(item => (
              <div key={item.id} className="card-base p-4 flex items-center justify-between group transition-all hover:translate-x-1">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                    <Utensils size={20} />
                   </div>
                   <div>
                    <h4 className="font-bold text-gray-800 text-base">{item.foodName}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-tight text-gray-400">{item.type} • {item.protein}g Protein</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xl font-black text-gray-900">+{item.calories}</p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">kcal</p>
                  </div>
                  <button onClick={() => deleteMeal(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-xl text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Floating Add Button & Finish Day */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm glass-nav rounded-[28px] p-3 flex justify-between items-center z-50 shadow-2xl border border-white/50">
           <button onClick={() => setIsEndDayModalOpen(true)} className="px-6 py-4 text-xs font-extrabold uppercase tracking-tight text-gray-400 hover:text-red-500 transition-colors pressable">
             Finish Day
           </button>
           <button onClick={() => cameraInputRef.current?.click()} className="bg-black w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl pressable">
             <Camera size={24} />
           </button>
           <div className="w-24 opacity-0"></div>
        </div>

        <input type="file" ref={cameraInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" capture="environment" />
        <input type="file" ref={galleryInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

        {isEndDayModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
             <div className="card-base w-full max-w-sm p-10 text-center animate-in zoom-in-95">
                <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <HistoryIcon className="text-green-500 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Sync for Today?</h3>
                <p className="text-gray-400 text-sm font-medium mb-10 leading-relaxed">This will archive your data to history and clear your current diary.</p>
                <div className="flex flex-col gap-3">
                  <button onClick={confirmEndDay} className="w-full bg-black text-white font-bold py-5 rounded-2xl text-xs uppercase tracking-widest shadow-xl pressable">Sync Now</button>
                  <button onClick={() => setIsEndDayModalOpen(false)} className="w-full text-gray-400 font-bold py-4 text-xs uppercase tracking-widest hover:text-gray-600 transition-all">Cancel</button>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center pb-40">
      <div className="max-w-md w-full relative flex flex-col animate-in fade-in slide-in-from-bottom-5">
        <div className="absolute top-8 left-8 z-50">
          <button onClick={resetToDashboard} className="w-12 h-12 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center text-gray-600 shadow-xl transition-all hover:scale-105 active:scale-90">
            <ChevronLeft size={24} />
          </button>
        </div>

        <div className="w-full h-[40vh] relative overflow-hidden rounded-b-[40px] shadow-lg">
          <img src={imagePreview || ""} alt="Matter" className="w-full h-full object-cover relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-20"></div>
        </div>

        <div className="px-6 -mt-16 relative z-30">
          <div className="card-base p-8 mb-6 shadow-2xl border-white/40">
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight leading-tight">{data?.foodName}</h2>
            <div className="bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-full inline-flex items-center gap-2 shadow-sm">
               <Heart className="w-4 h-4 text-red-500 fill-red-500/20" />
               <span className="text-[11px] font-extrabold uppercase tracking-tight text-gray-600">Health Rating: <span className="text-green-600">{data?.healthScore}</span>/10</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-10">
            <NutritionCard label="Energy" value={`${data?.totalCalories} kcal`} icon={<Flame className="w-5 h-5" />} bgColor="" />
            <NutritionCard label="Protein" value={data?.totalProtein || '0g'} icon={<Zap className="w-5 h-5" />} bgColor="" />
            <NutritionCard label="Carbs" value={data?.totalCarbs || '0g'} icon={<Leaf className="w-5 h-5" />} bgColor="" />
            <NutritionCard label="Fats" value={data?.totalFat || '0g'} icon={<Droplets className="w-5 h-5" />} bgColor="" />
          </div>

          <div className="mb-8">
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 px-2">Meal Type</h3>
            <div className="grid grid-cols-2 gap-3">
              {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as MealType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedMealType(type)}
                  className={`py-4 rounded-2xl text-[11px] font-extrabold uppercase tracking-widest transition-all border ${
                    selectedMealType === type 
                    ? `bg-black border-transparent text-white shadow-lg` 
                    : 'bg-white border-gray-100 text-gray-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 px-2">Ingredients</h3>
            <div className="space-y-3">
              {data?.ingredients.map((item, idx) => (
                <IngredientItem key={idx} ingredient={item} />
              ))}
            </div>
          </div>
        </div>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[100]">
           <button 
              onClick={logMeal}
              className="w-full bg-green-500 text-white font-extrabold py-6 rounded-[28px] shadow-2xl shadow-green-200 flex items-center justify-center gap-3 transition-all pressable text-sm uppercase tracking-widest"
           >
             <Check size={20} />
             Add to Diary
           </button>
        </div>
      </div>
    </div>
  );
};

export default App;
