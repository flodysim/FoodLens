
import { GoogleGenAI, Type } from "@google/genai";
import { NutritionData } from "../types";



const responseSchema = {
  type: Type.OBJECT,
  properties: {
    foodName: { type: Type.STRING, description: "The name of the dish identified" },
    healthScore: { type: Type.INTEGER, description: "A score from 1-10 on how healthy this meal is" },
    totalCalories: { type: Type.INTEGER, description: "Estimated total calories" },
    totalProtein: { type: Type.STRING, description: "Total protein with units (e.g., '15g')" },
    totalProteinGrams: { type: Type.INTEGER, description: "Total protein in grams as a number" },
    totalCarbs: { type: Type.STRING, description: "Total carbohydrates with units (e.g., '30g')" },
    totalFat: { type: Type.STRING, description: "Total fat with units (e.g., '10g')" },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          amount: { type: Type.STRING, description: "Estimated portion size (e.g., '1 cup')" },
          calories: { type: Type.INTEGER },
          protein: { type: Type.STRING, description: "Protein in this ingredient (e.g., '2g')" },
          carbs: { type: Type.STRING, description: "Carbs in this ingredient (e.g., '5g')" },
          fat: { type: Type.STRING, description: "Fat in this ingredient (e.g., '0g')" },
        },
        required: ["name", "amount", "calories", "protein", "carbs", "fat"],
      }
    }
  },
  required: ["foodName", "healthScore", "totalCalories", "totalProtein", "totalProteinGrams", "totalCarbs", "totalFat", "ingredients"]
};

export const analyzeFoodImage = async (base64Image: string, providedApiKey?: string): Promise<NutritionData> => {
  try {
    const key = providedApiKey || process.env.API_KEY || '';
    const ai = new GoogleGenAI({ apiKey: key });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: "Analyze this food image. Provide detailed nutritional information. Estimate portion sizes and identify individual ingredients as accurately as possible.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    if (!response.text) {
      throw new Error("No response text from Gemini");
    }

    return JSON.parse(response.text.trim()) as NutritionData;
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};
