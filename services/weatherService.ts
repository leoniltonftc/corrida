// services/weatherService.ts

interface WeatherForecast {
    windSpeed: number;
    windDirection: string;
    temperature: number;
    rain: number;
    humidity: number;
}

// Converte graus de direção do vento para ponto cardeal
function degreeToCardinal(degree: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((degree %= 360) < 0 ? degree + 360 : degree) / 45) % 8;
    return directions[index];
}

// Coordenadas e fuso horário fixos para Indiaroba, SE, Brasil para máxima confiabilidade
const INDIAROBA_LAT = -11.52;
const INDIAROBA_LON = -37.51;
const INDIAROBA_TZ = 'America/Maceio';


/**
 * Busca a previsão do tempo para Indiaroba/SE em uma data e hora específicas.
 * @param localDateTimeString - A data e hora no formato "YYYY-MM-DDTHH:mm" do input.
 * @returns Um objeto com a previsão do tempo completa, ou null em caso de falha.
 */
export const getWeatherForecast = async (localDateTimeString: string): Promise<WeatherForecast | null> => {
    // Valida o formato da string de entrada
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(localDateTimeString)) {
        console.error("Formato de data/hora local inválido:", localDateTimeString);
        return null;
    }
    
    // Extrai a data e a hora para a chamada da API
    const [dateString, timePart] = localDateTimeString.split('T');
    const hour = parseInt(timePart.substring(0, 2), 10);

    const hourlyParams = "temperature_2m,relativehumidity_2m,rain,windspeed_10m,winddirection_10m";
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${INDIAROBA_LAT}&longitude=${INDIAROBA_LON}&hourly=${hourlyParams}&start_date=${dateString}&end_date=${dateString}&timezone=${INDIAROBA_TZ}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error("Erro na resposta da API de previsão do tempo:", response.statusText);
            return null;
        }
        const data = await response.json();

        if (data.hourly && data.hourly.time && data.hourly.time.length > hour) {
            const windSpeed = data.hourly.windspeed_10m[hour];
            const windDirection = data.hourly.winddirection_10m[hour];
            const cardinalDirection = degreeToCardinal(windDirection);
            const temperature = data.hourly.temperature_2m[hour];
            const rain = data.hourly.rain[hour];
            const humidity = data.hourly.relativehumidity_2m[hour];

            return {
                windSpeed: parseFloat(windSpeed.toFixed(1)),
                windDirection: cardinalDirection,
                temperature: parseFloat(temperature.toFixed(1)),
                rain: parseFloat(rain.toFixed(1)),
                humidity: Math.round(humidity),
            };
        }
        console.warn("Dados de previsão do tempo incompletos ou ausentes para a hora selecionada.", data);
        return null;
    } catch (error) {
        console.error("Falha ao buscar previsão do tempo:", error);
        return null;
    }
};