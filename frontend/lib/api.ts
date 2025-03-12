import axios from 'axios';

// Weather data interface
export interface WeatherData {
  temperature: number;
  precipitation: number;
  weatherCode: number;
  weatherDescription: string;
}

// Battery data interface
export interface BatteryData {
  value: number;
  recorded_at: string;
}

/**
 * Fetches weather data from Open-Meteo API
 * @param latitude - Location latitude
 * @param longitude - Location longitude
 * @returns Promise with weather data
 */
export async function getWeatherData(latitude = 48.8567, longitude = 2.3508): Promise<WeatherData> {
  try {
    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,weather_code&timezone=auto`
    );
    
    // Map weather code to description
    const weatherDescription = getWeatherDescription(response.data.current.weather_code);
    
    return {
      temperature: response.data.current.temperature_2m,
      precipitation: response.data.current.precipitation,
      weatherCode: response.data.current.weather_code,
      weatherDescription
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return {
      temperature: 0,
      precipitation: 0,
      weatherCode: 0,
      weatherDescription: 'Unknown'
    };
  }
}

/**
 * Fetches battery data from backend API
 * @returns Promise with battery data
 */
export async function getBatteryData(): Promise<BatteryData | null> {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/battery`);
    const batteryData = response.data.battery;
    
    // Return the latest battery measurement if available
    if (batteryData && batteryData.length > 0) {
      return batteryData[batteryData.length - 1];
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching battery data:', error);
    return null;
  }
}

/**
 * Maps WMO weather codes to human-readable descriptions
 * @param code - WMO weather code
 * @returns Weather description
 */
function getWeatherDescription(code: number): string {
  const weatherCodes: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  
  return weatherCodes[code] || 'Unknown';
}