import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { QuizCategory, Question, Difficulty } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuizQuestions = async (category: QuizCategory, difficulty: Difficulty, count: number = 5): Promise<Question[]> => {
  const prompt = `Generate ${count} multiple-choice questions for the US Citizenship Naturalization Test (2008 version).
  Focus on the category: ${category}.
  Difficulty Level: ${difficulty}.
  
  Difficulty Guidelines:
  - Easy: Focus on fundamental concepts (e.g., flag colors, capital city, first president). Simple, direct language.
  - Medium: Standard civic questions requiring specific recall from the official 100 questions list.
  - Hard: Complex questions involving specific dates, numbers, amendments, or broader context of the government structure.

  Provide 4 options for each question.
  Identify the correct answer text strictly matching one of the options.
  Provide a brief explanation.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              questionText: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING },
              category: { type: Type.STRING },
            },
            required: ["questionText", "options", "correctAnswer", "explanation", "category"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as Question[];
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
};

export const searchAttorneys = async (query: string): Promise<GenerateContentResponse> => {
  try {
    // Using Google Maps Grounding to find real locations
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });
    return response;
  } catch (error) {
    console.error("Error searching attorneys:", error);
    throw error;
  }
};

export const getImmigrationNews = async (): Promise<GenerateContentResponse> => {
  try {
    const prompt = `Find the latest news regarding United States immigration, USCIS policy changes, and citizenship application updates from the last 7 days.
    
    Summarize the top 5 most important stories.
    For each story, provide a Headline and a brief 2-3 sentence summary.
    
    Do not include opinions, only facts from reputable news sources or government (.gov) websites.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return response;
  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
};

export const createTutorChat = (): Chat => {
  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: "You are a helpful and knowledgeable US Civics Tutor preparing students for the US Citizenship Naturalization Test. Answer questions about US history, government, and the naturalization process clearly and concisely. If the user asks about something unrelated, politely steer them back to civics topics.",
    },
  });
};

export const getAIInstance = () => ai;