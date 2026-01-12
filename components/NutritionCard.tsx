
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
    if (l.includes('energy') || l.includes('cal')) return { text: 'text-[#1C1C1E]', bg: 'bg-white', iconColor: 'text-[#1C1C1E]' };
    if (l.includes('protein')) return { text: 'text-[#1C1C1E]', bg: 'bg-[#FFF2F2]', iconColor: 'text-[#FF3B30]' };
    if (l.includes('carb')) return { text: 'text-[#1C1C1E]', bg: 'bg-[#F2FFF5]', iconColor: 'text-[#34C759]' };
    if (l.includes('fat')) return { text: 'text-[#1C1C1E]', bg: 'bg-[#FFFBF2]', iconColor: 'text-[#FF9500]' };
    return { text: 'text-gray-500', bg: 'bg-gray-50', iconColor: 'text-gray-400' };
  };

  const theme = getTheme();

  return (
    <div className={`rounded-[24px] p-6 flex flex-col gap-2 transition-all shadow-sm ${theme.bg}`}>
      <div className="flex items-center gap-2">
        <div className={theme.iconColor}>
          {React.cloneElement(icon as React.ReactElement, { size: 18, className: 'fill-current' })}
        </div>
        <span className="text-[11px] font-bold text-gray-500 tracking-tight">{label}</span>
      </div>
      <div className="text-3xl font-black text-[#1C1C1E] tracking-tight">
        {value}
      </div>
    </div>
  );
};

export default NutritionCard;
