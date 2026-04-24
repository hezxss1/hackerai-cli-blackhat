import { Sandbox, Template } from 'e2b';
import { logger } from '../utils/logger';
import chalk from 'chalk';
import { SandboxConfig, SandboxExecutionResult } from '../types';

// Sandbox manager class
class SandboxManager {
  private sandbox: Sandbox | null = null;
  private template: string;
  private config: SandboxConfig;

  constructor(template: string = 'hackerai-cli-blackhat', config: SandboxConfig) {
    this.template = template;
    this.config = config;
  }

  // Initialize the sandbox
  public async initialize(): Promise<Sandbox> {
    if (this.sandbox) {
      return this.sandbox;
    }

    logger.info(chalk.blue(`Initializing E2B sandbox with template: ${this.template}`));

    try {
      this.sandbox = await Sandbox.create(this.template, {
        apiKey: this.config.apiKey,
        cpuCount: this.config.cpuCount || 2,
        memoryMB: this.config.memoryMB || 1024,
      });

      logger.info(chalk.green('E2B sandbox initialized successfully'));
      return this.sandbox;
    } catch (error) {
      logger.error(chalk.red(`Failed to initialize sandbox: ${error instanceof Error ? error.message : String(error)}`));
      throw error;
    }
  }

  // Execute code in the sandbox
  public async execute(code: string, timeout?: number): Promise<SandboxExecutionResult> {
    if (!this.sandbox) {
      throw new Error('Sandbox not initialized. Call initialize() first.');
    }

    logger.info(chalk.blue('Executing code in sandbox...'));

    try {
      const result = await this.sandbox.execute(code, {
        timeout: timeout || 30000, // Default 30 seconds
      });

      return {
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        exitCode: result.exitCode || 0,
      };
    } catch (error) {
      logger.error(chalk.red(`Sandbox execution failed: ${error instanceof Error ? error.message : String(error)}`));
      return {
        stdout: '',
        stderr: error instanceof Error ? error.message : String(error),
        exitCode: 1,
      };
    }
  }

  // Execute a command in the sandbox
  public async executeCommand(command: string, args: string[] = []): Promise<SandboxExecutionResult> {
    if (!this.sandbox) {
      throw new Error('Sandbox not initialized. Call initialize() first.');
    }

    const fullCommand = [command, ...args].join(' ');
    logger.info(chalk.blue(`Executing command in sandbox: ${fullCommand}`));

    try {
      const result = await this.sandbox.runCommand(fullCommand);

      return {
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        exitCode: result.exitCode || 0,
      };
    } catch (error) {
      logger.error(chalk.red(`Command execution failed: ${error instanceof Error ? error.message : String(error)}`));
      return {
        stdout: '',
        stderr: error instanceof Error ? error.message : String(error),
        exitCode: 1,
      };
    }
  }

  // Upload a file to the sandbox
  public async uploadFile(localPath: string, sandboxPath: string): Promise<void> {
    if (!this.sandbox) {
      throw new Error('Sandbox not initialized. Call initialize() first.');
    }

    logger.info(chalk.blue(`Uploading file to sandbox: ${localPath} -> ${sandboxPath}`));

    try {
      const fs = require('fs');
      const content = fs.readFileSync(localPath, 'utf-8');
      await this.sandbox.fs.writeFile(sandboxPath, content);
      logger.info(chalk.green('File uploaded successfully'));
    } catch (error) {
      logger.error(chalk.red(`File upload failed: ${error instanceof Error ? error.message : String(error)}`));
      throw error;
    }
  }

  // Download a file from the sandbox
  public async downloadFile(sandboxPath: string, localPath: string): Promise<void> {
    if (!this.sandbox) {
      throw new Error('Sandbox not initialized. Call initialize() first.');
    }

    logger.info(chalk.blue(`Downloading file from sandbox: ${sandboxPath} -> ${localPath}`));

    try {
      const fs = require('fs');
      const content = await this.sandbox.fs.readFile(sandboxPath, 'utf-8');
      fs.writeFileSync(localPath, content);
      logger.info(chalk.green('File downloaded successfully'));
    } catch (error) {
      logger.error(chalk.red(`File download failed: ${error instanceof Error ? error.message : String(error)}`));
      throw error;
    }
  }

  // List files in the sandbox
  public async listFiles(path: string = '/'): Promise<string[]> {
    if (!this.sandbox) {
      throw new Error('Sandbox not initialized. Call initialize() first.');
    }

    try {
      const files = await this.sandbox.fs.readdir(path);
      return files;
    } catch (error) {
      logger.error(chalk.red(`Failed to list files: ${error instanceof Error ? error.message : String(error)}`));
      return [];
    }
  }

  // Check if a file exists in the sandbox
  public async fileExists(path: string): Promise<boolean> {
    if (!this.sandbox) {
      throw new Error('Sandbox not initialized. Call initialize() first.');
    }

    try {
      await this.sandbox.fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  // Close the sandbox
  public async close(): Promise<void> {
    if (this.sandbox) {
      try {
        await this.sandbox.close();
        logger.info(chalk.blue('Sandbox closed successfully'));
      } catch (error) {
        logger.error(chalk.red(`Failed to close sandbox: ${error instanceof Error ? error.message : String(error)}`));
      }
      this.sandbox = null;
    }
  }

  // Get sandbox status
  public isInitialized(): boolean {
    return this.sandbox !== null;
  }
}

// Create a sandbox manager instance
export function createSandboxManager(config: SandboxConfig, template?: string): SandboxManager {
  return new SandboxManager(template, config);
}

// Default sandbox manager (uses environment variables)
export const sandboxManager = createSandboxManager({
  apiKey: process.env.E2B_API_KEY || '',
  cpuCount: 2,
  memoryMB: 1024,
});

export default SandboxManager;
