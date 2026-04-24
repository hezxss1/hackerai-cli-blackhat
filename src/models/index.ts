import axios from 'axios';
import { logger } from '../utils/logger';

interface ModelInfo {
  name: string;
  type: 'ollama' | 'llamacpp' | 'lmstudio' | 'unknown';
  baseUrl: string;
}

// Default model configurations
const DEFAULT_MODELS: ModelInfo[] = [
  {
    name: 'ollama:llama3.2:3b',
    type: 'ollama',
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  },
  {
    name: 'llamacpp:default',
    type: 'llamacpp',
    baseUrl: process.env.LLAMACPP_BASE_URL || 'http://localhost:8080',
  },
  {
    name: 'lmstudio:default',
    type: 'lmstudio',
    baseUrl: process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234',
  },
];

// Parse model string to get type and name
function parseModel(modelStr: string): { type: string; name: string } {
  if (modelStr.includes(':')) {
    const [type, name] = modelStr.split(':');
    return { type, name };
  }
  // Default to ollama if no type specified
  return { type: 'ollama', name: modelStr };
}

// Get model configuration
function getModelConfig(modelStr: string): ModelInfo {
  const { type, name } = parseModel(modelStr);
  
  // Check if we have a predefined configuration
  const existing = DEFAULT_MODELS.find(m => m.name === modelStr);
  if (existing) {
    return existing;
  }

  // Create a new configuration based on type
  let baseUrl = '';
  switch (type) {
    case 'ollama':
      baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      break;
    case 'llamacpp':
      baseUrl = process.env.LLAMACPP_BASE_URL || 'http://localhost:8080';
      break;
    case 'lmstudio':
      baseUrl = process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234';
      break;
    default:
      baseUrl = 'http://localhost:11434'; // Default to Ollama
  }

  return {
    name: modelStr,
    type: type as 'ollama' | 'llamacpp' | 'lmstudio' | 'unknown',
    baseUrl,
  };
}

// Call Ollama API
async function callOllama(baseUrl: string, model: string, prompt: string, system?: string): Promise<string> {
  try {
    const response = await axios.post(`${baseUrl}/api/chat`, {
      model,
      messages: [
        { role: 'system', content: system || 'You are a helpful AI assistant for penetration testing.' },
        { role: 'user', content: prompt },
      ],
      stream: false,
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 120000, // 2 minutes
    });

    return response.data.message.content;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Ollama error: ${error.response?.data?.error || error.message}`);
    }
    throw error;
  }
}

// Call Llama.cpp API
async function callLlamaCpp(baseUrl: string, prompt: string, system?: string): Promise<string> {
  try {
    const response = await axios.post(`${baseUrl}/completion`, {
      prompt: `${system || 'You are a helpful AI assistant for penetration testing.'}\n\n${prompt}`,
      stream: false,
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 120000,
    });

    return response.data.content;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Llama.cpp error: ${error.response?.data?.error || error.message}`);
    }
    throw error;
  }
}

// Call LM Studio API
async function callLMStudio(baseUrl: string, model: string, prompt: string, system?: string): Promise<string> {
  try {
    const response = await axios.post(`${baseUrl}/v1/chat/completions`, {
      model,
      messages: [
        { role: 'system', content: system || 'You are a helpful AI assistant for penetration testing.' },
        { role: 'user', content: prompt },
      ],
      stream: false,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LMSTUDIO_API_KEY || 'lm-studio'}`,
      },
      timeout: 120000,
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`LM Studio error: ${error.response?.data?.error || error.message}`);
    }
    throw error;
  }
}

// Main function to call local models
export async function callLocalModel(modelStr: string, prompt: string, system?: string): Promise<string> {
  const config = getModelConfig(modelStr);
  const { type, name, baseUrl } = config;

  logger.info(`Calling ${type} model: ${name}`);

  try {
    switch (type) {
      case 'ollama':
        return await callOllama(baseUrl, name, prompt, system);
      case 'llamacpp':
        return await callLlamaCpp(baseUrl, prompt, system);
      case 'lmstudio':
        return await callLMStudio(baseUrl, name, prompt, system);
      default:
        // Try Ollama as default
        return await callOllama(baseUrl, name, prompt, system);
    }
  } catch (error) {
    logger.error(`Failed to call ${type} model: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

// List available models
export async function listModels(): Promise<ModelInfo[]> {
  // For now, return the default models
  // In a future version, we could add auto-discovery
  return DEFAULT_MODELS.map(model => ({
    ...model,
    // Update baseUrl from environment
    baseUrl: model.type === 'ollama' 
      ? process.env.OLLAMA_BASE_URL || model.baseUrl
      : model.type === 'llamacpp'
        ? process.env.LLAMACPP_BASE_URL || model.baseUrl
        : model.type === 'lmstudio'
          ? process.env.LMSTUDIO_BASE_URL || model.baseUrl
          : model.baseUrl,
  }));
}

// Health check for model endpoints
export async function checkModelHealth(modelStr: string): Promise<boolean> {
  const config = getModelConfig(modelStr);
  
  try {
    const response = await axios.get(`${config.baseUrl}/api/tags`);
    return response.status === 200;
  } catch {
    return false;
  }
}
