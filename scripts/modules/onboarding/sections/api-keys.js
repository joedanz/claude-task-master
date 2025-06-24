/**
 * API Keys Section
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import gradient from 'gradient-string';
import ora from 'ora';
import { getOnboardingState, updateSectionAnswers } from '../state/onboardingState.js';
import { createBox, createSeparator } from '../utils/index.js';

export async function runAPIKeysSection() {
    console.clear();
    
    // Display section header
    console.log(gradient.pastel.multiline(`
╔═══════════════════════════════════════╗
║      API KEYS CONFIGURATION           ║
╚═══════════════════════════════════════╝
    `));
    
    console.log(chalk.gray('\nConfigure API keys for your selected AI providers.\n'));
    console.log(chalk.yellow('Press Esc at any time to return to the main menu.\n'));
    console.log(createSeparator('─', 50, 'cristal'));
    
    const state = getOnboardingState();
    const currentAnswers = state.answers?.apiKeys || {};
    
    try {
        // Show information about API keys
        console.log(createBox(
            chalk.white.bold('API Key Setup Information') + '\n\n' +
            chalk.gray('Task Master requires API keys for AI providers.') + '\n' +
            chalk.cyan('• Keys are stored securely in your .env file') + '\n' +
            chalk.cyan('• Different providers require different keys') + '\n' +
            chalk.cyan('• You can configure these manually or skip for now') + '\n\n' +
            chalk.yellow('Common providers:') + '\n' +
            chalk.white('  • Anthropic (Claude): ANTHROPIC_API_KEY') + '\n' +
            chalk.white('  • OpenAI (GPT): OPENAI_API_KEY') + '\n' +
            chalk.white('  • Perplexity: PERPLEXITY_API_KEY'),
            'single',
            'blue'
        ));
        
        const setupAnswer = await inquirer.prompt([{
            type: 'list',
            name: 'setupMethod',
            message: 'How would you like to configure API keys?',
            choices: [
                { name: '📝 I\'ll configure them manually later', value: 'manual' },
                { name: '⏭️  Skip for now (use environment variables)', value: 'skip' },
                { name: '📋 Show me the setup instructions', value: 'instructions' }
            ],
            default: currentAnswers.setupMethod || 'manual'
        }], {
            onCancel: () => {
                console.log(chalk.yellow('\n⚠️  API keys setup cancelled. Returning to main menu...'));
                return false;
            }
        });
        
        // Check if user cancelled
        if (!setupAnswer) {
            return false;
        }
        
        const { setupMethod } = setupAnswer;
        
        if (setupMethod === 'instructions') {
            console.log(createBox(
                chalk.white.bold('API Key Setup Instructions') + '\n\n' +
                chalk.cyan('1. Create a .env file in your project root') + '\n' +
                chalk.cyan('2. Add your API keys in this format:') + '\n\n' +
                chalk.yellow('ANTHROPIC_API_KEY=your_anthropic_key_here') + '\n' +
                chalk.yellow('OPENAI_API_KEY=your_openai_key_here') + '\n' +
                chalk.yellow('PERPLEXITY_API_KEY=your_perplexity_key_here') + '\n\n' +
                chalk.cyan('3. Restart Task Master to load the new keys') + '\n\n' +
                chalk.gray('For MCP/Cursor integration, add keys to .cursor/mcp.json'),
                'single',
                'green'
            ));
            
            const instructionsAnswer = await inquirer.prompt([{
                type: 'input',
                name: 'continue',
                message: 'Press Enter to continue (or Esc to cancel)...'
            }], {
                onCancel: () => true // Allow cancelling here too
            });
        }
        
        // Show processing animation
        const spinner = ora({
            text: gradient.rainbow('Saving API key configuration...'),
            spinner: 'dots'
        }).start();
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Save the configuration choice
        await updateSectionAnswers('apiKeys', {
            setupMethod,
            configured: true,
            completedAt: new Date().toISOString()
        });
        
        spinner.succeed(chalk.green('API key configuration saved!'));
        
        // Show completion message
        let completionMessage;
        if (setupMethod === 'manual') {
            completionMessage = chalk.green.bold('✅ API Keys Section Complete!') + '\n\n' +
                chalk.white('You\'ve chosen to configure API keys manually.') + '\n' +
                chalk.gray('Remember to add them to your .env file when ready.');
        } else if (setupMethod === 'skip') {
            completionMessage = chalk.green.bold('✅ API Keys Section Complete!') + '\n\n' +
                chalk.white('API key setup skipped.') + '\n' +
                chalk.gray('Task Master will use any existing environment variables.');
        } else {
            completionMessage = chalk.green.bold('✅ API Keys Section Complete!') + '\n\n' +
                chalk.white('Setup instructions provided.') + '\n' +
                chalk.gray('Follow the instructions to configure your API keys.');
        }
        
        console.log('\n' + createBox(completionMessage, 'single', 'green'));
        
        // Wait for user to acknowledge
        const finalAnswer = await inquirer.prompt([{
            type: 'input',
            name: 'continue',
            message: 'Press Enter to return to the main menu (or Esc to cancel)...'
        }], {
            onCancel: () => true // Allow cancelling here too
        });
        
        return true; // Indicate successful completion
        
    } catch (error) {
        if (error.isTtyError) {
            console.error(chalk.red('Error: This environment doesn\'t support interactive prompts.'));
        } else {
            console.error(chalk.red('Error in API keys section:', error.message));
        }
        
        console.log(chalk.gray('\nPress any key to return to the main menu...'));
        
        // Wait for any key press
        return new Promise((resolve) => {
            const stdin = process.stdin;
            stdin.setRawMode(true);
            stdin.resume();
            stdin.setEncoding('utf8');
            
            const onKeyPress = () => {
                stdin.setRawMode(false);
                stdin.pause();
                stdin.removeListener('data', onKeyPress);
                resolve(false);
            };
            
            stdin.once('data', onKeyPress);
        });
    }
} 