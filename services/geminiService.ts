import type { AppData } from '../types';

// This service has been refactored to handle data updates locally.
// It mimics the interface previously used with Gemini but parses the prompts deterministically.

export const geminiService = {
  getInitialData: async (): Promise<AppData> => {
    // Return empty structure. The App.tsx handles loading from LocalStorage,
    // which will overwrite this if data exists.
    return Promise.resolve({
        settings: [],
        categories: [],
        teams: [],
        races: [],
        results: []
    });
  },

  updateData: async (prompt: string, currentData: AppData): Promise<AppData> => {
    // Create a deep copy of the current data to avoid mutation issues
    const newData: AppData = JSON.parse(JSON.stringify(currentData));

    try {
        console.log("Processing Local Update Command:", prompt);

        // 1. Handle ADD operations
        if (prompt.includes("Add the following new item")) {
            const jsonStart = prompt.indexOf('{');
            const jsonEnd = prompt.lastIndexOf('}');
            
            if (jsonStart > -1 && jsonEnd > -1) {
                const jsonStr = prompt.substring(jsonStart, jsonEnd + 1);
                const item = JSON.parse(jsonStr);
                
                if (item.type === 'settings') newData.settings.push(item);
                else if (item.type === 'category') newData.categories.push(item);
                else if (item.type === 'team') newData.teams.push(item);
                else if (item.type === 'race') newData.races.push(item);
                else if (item.type === 'result') newData.results.push(item);
            }
        }
        // 2. Handle UPDATE operations
        else if (prompt.includes("Update the following item")) {
            const jsonStart = prompt.indexOf('{');
            const jsonEnd = prompt.lastIndexOf('}');
            
            if (jsonStart > -1 && jsonEnd > -1) {
                const jsonStr = prompt.substring(jsonStart, jsonEnd + 1);
                const item = JSON.parse(jsonStr);

                const updateList = (list: any[]) => {
                    const index = list.findIndex(i => i.id === item.id);
                    if (index !== -1) list[index] = item;
                };

                if (item.type === 'settings') updateList(newData.settings);
                else if (item.type === 'category') updateList(newData.categories);
                else if (item.type === 'team') updateList(newData.teams);
                else if (item.type === 'race') updateList(newData.races);
                else if (item.type === 'result') updateList(newData.results);
            }
        }
        // 3. Handle DELETE operations
        else if (prompt.includes("Delete the item")) {
            // Expected format: "Delete the item with type 'TYPE' and id 'ID' from the data."
            const typeMatch = prompt.match(/type '([^']+)'/);
            const idMatch = prompt.match(/id '([^']+)'/);

            if (typeMatch && idMatch) {
                const type = typeMatch[1];
                const id = idMatch[1];

                if (type === 'settings') newData.settings = newData.settings.filter(i => i.id !== id);
                else if (type === 'category') newData.categories = newData.categories.filter(i => i.id !== id);
                else if (type === 'team') newData.teams = newData.teams.filter(i => i.id !== id);
                else if (type === 'race') newData.races = newData.races.filter(i => i.id !== id);
                else if (type === 'result') newData.results = newData.results.filter(i => i.id !== id);
            }
        }
    } catch (error) {
        console.error("Error processing local update:", error);
        // In case of error, return the original data to prevent corruption
        return currentData;
    }

    return Promise.resolve(newData);
  }
};