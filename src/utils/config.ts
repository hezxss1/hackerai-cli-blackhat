import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { AppConfig } from '../types';

// Load environment variables
dotenv.config();

// Default configuration
const DEFAULT_CONFIG: AppConfig = {
  e2b: {
    apiKey: process.env.E2B_API_KEY || '',
    enabled: true,
  },
  models: {
    default: process.env.DEFAULT_MODEL || 'ollama:llama3.2:3b',
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    },
    llamacpp: {
      baseUrl: process.env.LLAMACPP_BASE_URL || 'http://localhost:8080',
    },
    lmstudio: {
      baseUrl: process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234',
    },
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: 'logs/app.log',
  },
};

// Configuration class
class Config {
  private config: AppConfig;
  private configPath: string;

  constructor() {
    this.config = DEFAULT_CONFIG;
    this.configPath = path.join(process.cwd(), 'config.json');
    this.loadConfig();
  }

  // Load configuration from file
  private loadConfig(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        const fileConfig = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
        this.config = this.mergeConfig(DEFAULT_CONFIG, fileConfig);
      }
    } catch (error) {
      console.warn('Failed to load config file, using defaults');
    }
  }

  // Merge configurations
  private mergeConfig(defaultConfig: AppConfig, fileConfig: Partial<AppConfig>): AppConfig {
    return {
      ...defaultConfig,
      ...fileConfig,
      e2b: {
        ...defaultConfig.e2b,
        ...fileConfig.e2b,
      },
      models: {
        ...defaultConfig.models,
        ...fileConfig.models,
      },
      logging: {
        ...defaultConfig.logging,
        ...fileConfig.logging,
      },
    };
  }

  // Get configuration
  public get(): AppConfig {
    return this.config;
  }

  // Get specific configuration value
  public getValue<T>(key: string): T | undefined {
    // Flatten the config for easier access
    const flatConfig = {
      ...this.config.e2b,
      ...this.config.models,
      ...this.config.logging,
    };
    return flatConfig[key as keyof typeof flatConfig] as T | undefined;
  }

  // Set configuration value
  public setValue(key: string, value: any): void {
    // This is a simplified version - in a real implementation,
    // you'd want to properly handle nested keys
    const keys = key.split('.');
    let current = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (current[keys[i] as keyof AppConfig]) {
        current = current[keys[i] as keyof AppConfig] as any;
      } else {
        current[keys[i] as keyof AppConfig] = {} as any;
        current = current[keys[i] as keyof AppConfig] as any;
      }
    }
    
    current[keys[keys.length - 1] as keyof typeof current] = value;
  }

  // Save configuration to file
  public save(): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Failed to save config file');
    }
  }

  // Validate configuration
  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check E2B configuration
    if (this.config.e2b.enabled && !this.config.e2b.apiKey) {
      errors.push('E2B is enabled but no API key is configured');
    }

    // Check model configuration
    if (!this.config.models.default) {
      errors.push('No default model is configured');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Singleton instance
export const config = new Config();

export default config;
