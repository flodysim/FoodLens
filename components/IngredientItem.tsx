
import React from 'react';
import { Ingredient } from '../types';

interface IngredientItemProps {
  ingredient: Ingredient;
}

const IngredientItem: React.FC<IngredientItemProps> = ({ ingredient }) => {
  return (
    <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-50 flex flex-col gap-4 transition-all hover:border-blue-100">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <h4 className="font-black text-[#1C1C1E] text-lg leading-tight">{ingredient.name}</h4>
          <span className="text-xs font-bold text-gray-400 mt-1">{ingredient.amount}</span>
        </div>
        <div className="text-right">
          <span className="text-xl font-black text-[#1C1C1E]">{ingredient.calories}</span>
          <span className="text-[10px] font-bold text-gray-400 ml-1 uppercase">cal</span>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="bg-[#FFF2F2] px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" />
          <span className="text-[10px] font-black text-[#FF3B30] uppercase leading-none">{ingredient.protein}</span>
        </div>
        <div className="bg-[#F2FFF5] px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
          <span className="text-[10px] font-black text-[#34C759] uppercase leading-none">{ingredient.carbs}</span>
        </div>
        <div className="bg-[#FFFBF2] px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF9500]" />
          <span className="text-[10px] font-black text-[#FF9500] uppercase leading-none">{ingredient.fat}</span>
        </div>
      </div>
    </div>
  );
};

export default IngredientItem;
