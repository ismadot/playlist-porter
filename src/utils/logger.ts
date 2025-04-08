import chalk from 'chalk';

export const log = {
  info: (msg: string) => console.log(chalk.blue('ℹ️  ' + msg)),
  success: (msg: string) => console.log(chalk.green('✅ ' + msg)),
  warn: (msg: string) => console.warn(chalk.yellow('⚠️  ' + msg)),
  error: (msg: string) => console.error(chalk.red('❌ ' + msg)),
  step: (msg: string) => console.log(chalk.cyan('🔹 ' + msg)),
  match: (msg: string) => console.log(chalk.magenta('🎵 ' + msg)),
};
