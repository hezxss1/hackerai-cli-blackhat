import { Sandbox } from 'e2b';
import chalk from 'chalk';
import { logger } from '../utils/logger';
import { callLocalModel } from '../models';
import { AgentConfig } from '../types';

// Global sandbox instance
let sandbox: Sandbox | null = null;

export async function initializeSandbox(): Promise<Sandbox> {
  if (sandbox) {
    return sandbox;
  }

  if (!process.env.E2B_API_KEY) {
    throw new Error('E2B_API_KEY is not configured. Please add it to your .env file.');
  }

  logger.info(chalk.blue('Initializing E2B sandbox...'));
  sandbox = await Sandbox.create('hackerai-cli-blackhat', {
    apiKey: process.env.E2B_API_KEY,
  });
  
  logger.info(chalk.green('E2B sandbox initialized successfully'));
  return sandbox;
}

export async function cleanupSandbox(): Promise<void> {
  if (sandbox) {
    try {
      await sandbox.close();
      logger.info(chalk.blue('E2B sandbox closed'));
    } catch (error) {
      logger.error(chalk.red(`Failed to close sandbox: ${error instanceof Error ? error.message : String(error)}`));
    }
    sandbox = null;
  }
}

export async function startAgentMode(config: AgentConfig): Promise<void> {
  const { model, enableSandbox = true, timeout = 300000 } = config;

  // Initialize sandbox if enabled
  if (enableSandbox) {
    await initializeSandbox();
  }

  logger.info(chalk.bold.green('\nHackerAI Agent Mode (Blackhat Edition)'));
  logger.info(chalk.yellow('Type "exit" to quit, "help" for commands\n'));

  // Set up readline interface for interactive input
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.cyan('hackerai> '),
  });

  rl.prompt();

  rl.on('line', async (line: string) => {
    const input = line.trim();

    if (input.toLowerCase() === 'exit') {
      rl.close();
      await cleanupSandbox();
      process.exit(0);
    }

    if (input.toLowerCase() === 'help') {
      console.log(chalk.bold.white('\nAvailable Commands:'));
      console.log(chalk.cyan('  scan <target>       - Scan a target for vulnerabilities'));
      console.log(chalk.cyan('  exploit <target>    - Generate exploits for a target'));
      console.log(chalk.cyan('  exec <code>        - Execute code in sandbox (if enabled)'));
      console.log(chalk.cyan('  models             - List available local models'));
      console.log(chalk.cyan('  model <name>       - Switch AI model'));
      console.log(chalk.cyan('  help               - Show this help message'));
      console.log(chalk.cyan('  exit               - Exit the agent mode\n'));
      rl.prompt();
      return;
    }

    // Process command
    try {
      if (input.startsWith('scan ')) {
        const target = input.substring(5).trim();
        if (!target) {
          console.log(chalk.red('Please provide a target'));
        } else {
          // Import scan function dynamically to avoid circular dependency
          const { scanTarget } = require('../tools/scanner');
          await scanTarget(target, { model, deepScan: false });
        }
      } else if (input.startsWith('exploit ')) {
        const target = input.substring(8).trim();
        if (!target) {
          console.log(chalk.red('Please provide a target'));
        } else {
          // Import exploit function dynamically
          const { generateExploit } = require('../tools/exploit');
          await generateExploit(target, { model });
        }
      } else if (input.startsWith('exec ')) {
        if (!enableSandbox || !sandbox) {
          console.log(chalk.red('Sandbox is not enabled. Start with --sandbox flag.'));
        } else {
          const code = input.substring(5).trim();
          if (!code) {
            console.log(chalk.red('Please provide code to execute'));
          } else {
            logger.info(chalk.blue('Executing code in sandbox...'));
            try {
              const result = await sandbox.execute(code);
              console.log(chalk.green('Execution result:'));
              console.log(result.stdout || '(no output)');
              if (result.stderr) {
                console.log(chalk.red('Errors:'));
                console.log(result.stderr);
              }
            } catch (error) {
              logger.error(chalk.red(`Code execution failed: ${error instanceof Error ? error.message : String(error)}`));
            }
          }
        }
      } else if (input.startsWith('model ')) {
        const newModel = input.substring(6).trim();
        if (!newModel) {
          console.log(chalk.red('Please provide a model name'));
        } else {
          console.log(chalk.green(`Switched to model: ${newModel}`));
          // Update the current model
          config.model = newModel;
        }
      } else if (input.toLowerCase() === 'models') {
        const { listModels } = require('../models');
        const models = await listModels();
        console.log(chalk.bold.green('Available Models:'));
        models.forEach((m: any, i: number) => {
          console.log(`${i + 1}. ${m.name} (${m.type})`);
        });
      } else {
        // Treat as a prompt for the AI model
        if (!model) {
          console.log(chalk.red('No model specified. Use --model flag or "model <name>" command.'));
        } else {
          logger.info(chalk.blue('Sending prompt to AI model...'));
          try {
            const response = await callLocalModel(model, input);
            console.log(chalk.green('AI Response:'));
            console.log(response);
          } catch (error) {
            logger.error(chalk.red(`AI model error: ${error instanceof Error ? error.message : String(error)}`));
          }
        }
      }
    } catch (error) {
      logger.error(chalk.red(`Command failed: ${error instanceof Error ? error.message : String(error)}`));
    }

    rl.prompt();
  });

  rl.on('close', async () => {
    logger.info(chalk.blue('\nAgent mode terminated'));
    await cleanupSandbox();
    process.exit(0);
  });

  // Set timeout
  setTimeout(async () => {
    logger.warn(chalk.yellow('\nAgent mode timeout reached'));
    rl.close();
    await cleanupSandbox();
    process.exit(0);
  }, timeout);
}
