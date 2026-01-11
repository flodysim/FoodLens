
import React from 'react';
import { Ingredient } from '../types';

interface IngredientItemProps {
  ingredient: Ingredient;
}

const IngredientItem: React.FC<IngredientItemProps> = ({ ingredient }) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 flex justify-between items-center transition-all hover:border-gray-200">
      <div className="flex flex-col">
        <h4 className="font-bold text-gray-800 text-base">{ingredient.name}</h4>
        <div className="flex gap-2 mt-1">
          <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md uppercase">{ingredient.amount}</span>
          <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md uppercase">P: {ingredient.protein}</span>
        </div>
      </div>
      <div className="text-right">
        <span className="text-lg font-extrabold text-gray-900">{ingredient.calories}</span>
        <span className="text-[10px] font-bold text-gray-400 ml-1 uppercase">cal</span>
      </div>
    </div>
  );
};

export default IngredientItem;
