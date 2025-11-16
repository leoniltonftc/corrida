import { GoogleGenAI, Type } from "@google/genai";
import type { AppData } from '../types';

// This is a placeholder; in a real environment, the API key would be securely managed.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using a mock service.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        settings: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    championshipTitle: { type: Type.STRING },
                    location: { type: Type.STRING },
                    dates: { type: Type.STRING, nullable: true },
                    organizer: { type: Type.STRING, nullable: true },
                    description: { type: Type.STRING, nullable: true },
                    timestamp: { type: Type.STRING },
                },
                required: ['id', 'type', 'championshipTitle', 'location', 'timestamp']
            }
        },
        categories: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    name: { type: Type.STRING },
                    description: { type: Type.STRING, nullable: true },
                },
                required: ['id', 'type', 'name']
            }
        },
        teams: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    name: { type: Type.STRING },
                    cidade: { type: Type.STRING, nullable: true },
                    categoryId: { type: Type.STRING },
                    skipper: { type: Type.STRING },
                    crew: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                funcao: { type: Type.STRING },
                            },
                            required: ['name', 'funcao']
                        }
                    },
                },
                required: ['id', 'type', 'name', 'categoryId', 'skipper', 'crew']
            }
        },
        races: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    name: { type: Type.STRING },
                    categoryId: { type: Type.STRING },
                    date: { type: Type.STRING },
                    status: { type: Type.STRING },
                    startTime: { type: Type.STRING, nullable: true },
                    windSpeed: { type: Type.NUMBER, nullable: true },
                    windDirection: { type: Type.STRING, nullable: true },
                    temperature: { type: Type.NUMBER, nullable: true },
                    rain: { type: Type.NUMBER, nullable: true },
                    humidity: { type: Type.NUMBER, nullable: true },
                    obsVisible: { type: Type.BOOLEAN },
                    timestamp: { type: Type.STRING },
                },
                required: ['id', 'type', 'name', 'categoryId', 'date', 'status', 'obsVisible', 'timestamp']
            }
        },
        results: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    raceId: { type: Type.STRING },
                    teamId: { type: Type.STRING },
                    position: { type: Type.INTEGER },
                    finishTime: { type: Type.STRING, nullable: true },
                    elapsedTimeMs: { type: Type.NUMBER, nullable: true },
                    notes: { type: Type.STRING, nullable: true },
                    timestamp: { type: Type.STRING },
                },
                required: ['id', 'type', 'raceId', 'teamId', 'position', 'timestamp']
            }
        }
    },
    required: ['settings', 'categories', 'teams', 'races', 'results']
};


const mockInitialData: AppData = {
  settings: [],
  categories: [],
  teams: [],
  races: [],
  results: [],
};

let mockDataStore: AppData = JSON.parse(JSON.stringify(mockInitialData));

const mockGeminiService = {
  getInitialData: async (): Promise<AppData> => {
    console.log("MOCK: Getting initial data");
    return Promise.resolve(JSON.parse(JSON.stringify(mockDataStore)));
  },
  updateData: async (prompt: string, data: AppData): Promise<AppData> => {
    console.log("MOCK: Updating data with prompt:", prompt);
    // Basic mock logic
    if (prompt.includes("Add the following new item")) {
        const itemStr = prompt.substring(prompt.indexOf('{'), prompt.lastIndexOf('}') + 1);
        const item = JSON.parse(itemStr);
        if (item.type === 'category') mockDataStore.categories.push(item);
        else if (item.type === 'team') mockDataStore.teams.push(item);
        else if (item.type === 'race') mockDataStore.races.push(item);
        else if (item.type === 'result') mockDataStore.results.push(item);
        else if (item.type === 'settings') mockDataStore.settings.push(item);

    } else if (prompt.includes("Update the following item")) {
      const itemStr = prompt.substring(prompt.indexOf('{'), prompt.lastIndexOf('}') + 1);
      const item = JSON.parse(itemStr);
      let store;
      if (item.type === 'category') store = mockDataStore.categories;
      else if (item.type === 'team') store = mockDataStore.teams;
      else if (item.type === 'race') store = mockDataStore.races;
      else if (item.type === 'result') store = mockDataStore.results;
      else if (item.type === 'settings') store = mockDataStore.settings;
      if (store) {
        const index = store.findIndex((i: any) => i.id === item.id);
        if (index > -1) store[index] = item;
      }
    } else if (prompt.includes("Delete the item with id")) {
      const parts = prompt.split("'");
      const itemType = parts[1];
      const itemId = parts[3];
      let store;
      if (itemType === 'category') store = mockDataStore.categories;
      else if (itemType === 'team') store = mockDataStore.teams;
      else if (itemType === 'race') store = mockDataStore.races;
      else if (itemType === 'result') store = mockDataStore.results;
      else if (itemType === 'settings') store = mockDataStore.settings;

      if (store) {
         mockDataStore[itemType as keyof AppData] = store.filter((i: any) => i.id !== itemId) as any;
      }
    }
    return Promise.resolve(JSON.parse(JSON.stringify(mockDataStore)));
  }
}


async function callGemini(prompt: string): Promise<AppData> {
  if (!ai) {
    throw new Error("Gemini API key not configured.");
  }
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as AppData;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to communicate with the Gemini API.");
  }
}

function buildPrompt(instruction: string, currentData: AppData): string {
    return `
You are a data management API for a sailing regatta application.
Your task is to process the user's request and return the entire, updated application state as a single, valid JSON object that conforms to the provided schema. Do not add any commentary or explanation.

Current application state:
${JSON.stringify(currentData, null, 2)}

User's instruction:
${instruction}

Return only the complete, updated JSON object.
`;
}


export const geminiService = {
  getInitialData: async (): Promise<AppData> => {
     if (!ai) return mockGeminiService.getInitialData();
     const prompt = "Return the initial empty state for the regatta application as a JSON object.";
     const initialState: AppData = { settings: [], categories: [], teams: [], races: [], results: [] };
     return callGemini(buildPrompt(prompt, initialState));
  },

  updateData: async (prompt: string, currentData: AppData): Promise<AppData> => {
    if (!ai) return mockGeminiService.updateData(prompt, currentData);
    return callGemini(buildPrompt(prompt, currentData));
  },
};