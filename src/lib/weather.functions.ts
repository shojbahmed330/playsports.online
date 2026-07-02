// Free open-meteo weather lookup — no API key required.
import { createServerFn } from "@tanstack/react-start";

export type WeatherSnapshot = {
  temperatureC: number | null;
  windKph: number | null;
  code: number | null;
  description: string;
} | null;

const codeMap: Record<number, string> = {
  0: "Clear sky", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Rime fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow",
  80: "Rain showers", 81: "Rain showers", 82: "Violent showers",
  95: "Thunderstorm", 96: "Thunderstorm w/ hail", 99: "Thunderstorm w/ hail",
};

// tiny in-memory cache
const cache = new Map<string, { at: number; data: WeatherSnapshot }>();
const TTL = 30 * 60 * 1000;

export const getMatchWeather = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => {
    const o = (d ?? {}) as { city?: string };
    return { city: typeof o.city === "string" ? o.city.trim() : "" };
  })
  .handler(async ({ data }): Promise<WeatherSnapshot> => {
    if (!data.city) return null;
    const key = data.city.toLowerCase();
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < TTL) return hit.data;
    try {
      const geo = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(data.city)}&count=1&language=en&format=json`,
      ).then((r) => (r.ok ? r.json() : null));
      const first = geo?.results?.[0];
      if (!first) { cache.set(key, { at: Date.now(), data: null }); return null; }
      const wx = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${first.latitude}&longitude=${first.longitude}&current=temperature_2m,wind_speed_10m,weather_code`,
      ).then((r) => (r.ok ? r.json() : null));
      const c = wx?.current;
      if (!c) { cache.set(key, { at: Date.now(), data: null }); return null; }
      const snap: WeatherSnapshot = {
        temperatureC: typeof c.temperature_2m === "number" ? c.temperature_2m : null,
        windKph: typeof c.wind_speed_10m === "number" ? Math.round(c.wind_speed_10m * 3.6) : null,
        code: typeof c.weather_code === "number" ? c.weather_code : null,
        description: codeMap[c.weather_code] ?? "—",
      };
      cache.set(key, { at: Date.now(), data: snap });
      return snap;
    } catch {
      return null;
    }
  });
