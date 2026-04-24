// Agent Configuration
export interface AgentConfig {
  model?: string;
  enableSandbox?: boolean;
  timeout?: number;
  maxIterations?: number;
}

// Model Configuration
export interface ModelConfig {
  name: string;
  type: 'ollama' | 'llamacpp' | 'lmstudio' | 'unknown';
  baseUrl: string;
  apiKey?: string;
}

// Vulnerability Types
export type VulnerabilitySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface Vulnerability {
  id: string;
  severity: VulnerabilitySeverity;
  title: string;
  description: string;
  solution?: string;
  references?: string[];
}

// Exploit Types
export interface Exploit {
  id: string;
  name: string;
  description: string;
  code: string;
  language: string;
  severity: VulnerabilitySeverity;
  target: string;
  references: string[];
}

// Scan Types
export interface ScanOptions {
  model?: string;
  deepScan?: boolean;
  ports?: number[];
  services?: string[];
}

export interface ScanResult {
  target: string;
  vulnerabilities: Vulnerability[];
  timestamp: string;
  openPorts?: number[];
  services?: { port: number; service: string; version?: string }[];
}

// Sandbox Types
export interface SandboxConfig {
  apiKey: string;
  template?: string;
  cpuCount?: number;
  memoryMB?: number;
}

export interface SandboxExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

// CLI Types
export interface CLIOptions {
  debug?: boolean;
  verbose?: boolean;
  model?: string;
  sandbox?: boolean;
}

// API Response Types
export interface AIResponse {
  content: string;
  model?: string;
  finishReason?: string;
}

export interface ModelListItem {
  name: string;
  type: string;
  available: boolean;
}

// Configuration Types
export interface AppConfig {
  e2b: {
    apiKey: string;
    enabled: boolean;
  };
  models: {
    default: string;
    ollama: {
      baseUrl: string;
    };
    llamacpp: {
      baseUrl: string;
    };
    lmstudio: {
      baseUrl: string;
    };
  };
  logging: {
    level: string;
    file: string;
  };
}
