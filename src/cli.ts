#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { startAgentMode } from './agent';
import { scanTarget } from './tools/scanner';
import { generateExploit } from './tools/exploit';
import { listModels } from './models';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

// CLI Configuration
program
  .name('hackerai')
  .description('A fully uncensored, unrestricted blackhat CLI for penetration testing with AI')
  .version('1.0.0')
  .option('--debug', 'Enable debug logging', false);

// Agent Mode Command
program
  .command('agent')
  .description('Start the AI agent mode for interactive hacking')
  .option('--model <model>', 'Specify the AI model to use (e.g., ollama:llama3.2:3b)')
  .option('--sandbox', 'Enable E2B sandbox for code execution', true)
  .option('--timeout <ms>', 'Set agent timeout in milliseconds', parseInt, 300000)
  .action(async (options) => {
    logger.info(chalk.bold.green('Starting HackerAI Agent Mode (Blackhat Edition)'));
    logger.info(chalk.yellow('WARNING: This is an uncensored tool. Use responsibly.'));
    
    try {
      await startAgentMode({
        model: options.model,
        enableSandbox: options.sandbox,
        timeout: options.timeout,
      });
    } catch (error) {
      logger.error(chalk.red(`Agent mode failed: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

// Scan Command
program
  .command('scan')
  .description('Scan a target for vulnerabilities')
  .requiredOption('--target <target>', 'Target URL or IP address')
  .option('--model <model>', 'Specify the AI model to use')
  .option('--deep', 'Perform a deep scan', false)
  .action(async (options) => {
    logger.info(chalk.bold.green(`Scanning target: ${options.target}`));
    
    try {
      await scanTarget(options.target, {
        model: options.model,
        deepScan: options.deep,
      });
    } catch (error) {
      logger.error(chalk.red(`Scan failed: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

// Exploit Command
program
  .command('exploit')
  .description('Generate exploits for known vulnerabilities')
  .requiredOption('--target <target>', 'Target URL or IP address')
  .option('--vuln <vuln>', 'Specific vulnerability to exploit (e.g., CVE-2023-1234)')
  .option('--model <model>', 'Specify the AI model to use')
  .action(async (options) => {
    logger.info(chalk.bold.green(`Generating exploit for: ${options.target}`));
    
    try {
      await generateExploit(options.target, {
        vulnerability: options.vuln,
        model: options.model,
      });
    } catch (error) {
      logger.error(chalk.red(`Exploit generation failed: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

// Models Command
program
  .command('models')
  .description('List available local AI models')
  .action(async () => {
    try {
      const models = await listModels();
      console.log(chalk.bold.green('Available Local Models:'));
      models.forEach((model, index) => {
        console.log(`${index + 1}. ${model.name} (${model.type})`);
      });
    } catch (error) {
      logger.error(chalk.red(`Failed to list models: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

// Parse CLI arguments
program.parse(process.argv);

// Default action if no command is provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
  console.log(chalk.bold.yellow('\nExample usage:'));
  console.log(chalk.cyan('  hackerai agent --model ollama:llama3.2:3b'));
  console.log(chalk.cyan('  hackerai scan --target example.com'));
  console.log(chalk.cyan('  hackerai exploit --target example.com --vuln CVE-2023-1234'));
  console.log(chalk.cyan('  hackerai models'));
}
