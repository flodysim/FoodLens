
import React from 'react';

interface NutritionCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
}

const NutritionCard: React.FC<NutritionCardProps> = ({ label, value, icon }) => {
  const getTheme = () => {
    const l = label.toLowerCase();
    if (l.includes('energy')) return { text: 'text-orange-500', bg: 'bg-orange-50' };
    if (l.includes('synthesis') || l.includes('protein')) return { text: 'text-blue-500', bg: 'bg-blue-50' };
    if (l.includes('carbon') || l.includes('carb')) return { text: 'text-green-500', bg: 'bg-green-50' };
    if (l.includes('lipid') || l.includes('fat')) return { text: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { text: 'text-gray-500', bg: 'bg-gray-50' };
  };

  const theme = getTheme();

  return (
    <div className="card-base p-5 flex flex-col gap-3 transition-all hover:shadow-lg">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-xl ${theme.bg} ${theme.text}`}>
          {icon}
        </div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900 tracking-tight">
        {value}
      </div>
    </div>
  );
};

export default NutritionCard;
