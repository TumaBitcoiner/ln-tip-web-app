// @ts-ignore
import { parse } from 'ini';

interface AppConfig {
  name: string;
  profileImage: string;
  lightningAddress: string;
}

let config: AppConfig | null = null;

async function loadConfig(): Promise<AppConfig> {
  const response = await fetch('/config.ini');
  const text = await response.text();
  const parsed = parse(text) as any;
  config = parsed.Profile;
  return config!;
}

export { loadConfig };
export const getConfig = (): AppConfig => {
  if (!config) {
    throw new Error('Config not loaded. Call loadConfig() first.');
  }
  return config;
};
