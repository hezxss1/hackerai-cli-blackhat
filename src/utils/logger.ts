import winston from 'winston';
import chalk from 'chalk';

// Custom colors for winston
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Configure winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'hackerai-cli-blackhat' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.printf((info) => {
          const color = colors[info.level as keyof typeof colors] || 'white';
          const level = chalk.keyword(color)(`[${info.level.toUpperCase()}]`);
          const message = info.message;
          const timestamp = chalk.gray(new Date(info.timestamp).toISOString());
          
          // Handle error objects
          if (info instanceof Error) {
            return `${timestamp} ${level} ${message}\n${info.stack}`;
          }
          
          // Handle additional metadata
          const meta = info[Symbol.for('message')] || info.meta;
          if (meta && typeof meta === 'object') {
            return `${timestamp} ${level} ${message} ${JSON.stringify(meta)}`;
          }
          
          return `${timestamp} ${level} ${message}`;
        })
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ],
});

// Add stream for morgan if needed (for HTTP requests)
logger.stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Custom log methods for the CLI
export const cliLogger = {
  success: (message: string) => {
    console.log(chalk.green(`[+] ${message}`));
  },
  
  error: (message: string) => {
    console.log(chalk.red(`[-] ${message}`));
  },
  
  warning: (message: string) => {
    console.log(chalk.yellow(`[!] ${message}`));
  },
  
  info: (message: string) => {
    console.log(chalk.blue(`[*] ${message}`));
  },
  
  debug: (message: string) => {
    if (process.env.NODE_ENV === 'development' || process.argv.includes('--debug')) {
      console.log(chalk.gray(`[DEBUG] ${message}`));
    }
  },
  
  header: (message: string) => {
    console.log('\n' + chalk.bold.cyan('='.repeat(60)));
    console.log(chalk.bold.white(`  ${message}`));
    console.log(chalk.bold.cyan('='.repeat(60)) + '\n');
  },
  
  section: (title: string) => {
    console.log('\n' + chalk.bold.yellow(`--- ${title} ---`));
  },
};

export { logger };

export default logger;
