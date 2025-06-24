/**
 * AI Provider Section
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import gradient from 'gradient-string';
import ora from 'ora';
import { getOnboardingState, updateSectionAnswers } from '../state/onboardingState.js';
import { createBox, createSeparator } from '../utils/index.js';

// Import the existing interactive models setup function to keep it DRY
import { runInteractiveSetup } from '../../commands.js';
import { findProjectRoot } from '../../utils.js';

const AI_PROVIDERS = [
    { name: '🤖 Anthropic (Claude)', value: 'anthropic' },
    { name: '🧠 OpenAI (GPT-4)', value: 'openai' },
    { name: '🔍 Perplexity', value: 'perplexity' },
    { name: '🎯 Google (Gemini)', value: 'google' },
    { name: '🚀 Mistral', value: 'mistral' },
    { name: '☁️ Azure OpenAI', value: 'azure' },
    { name: '🌐 OpenRouter', value: 'openrouter' },
    { name: '🔧 Ollama (Local)', value: 'ollama' }
];

const MODELS_BY_PROVIDER = {
    anthropic: [
        { name: 'Claude 3 Opus', value: 'claude-3-opus-20240229' },
        { name: 'Claude 3 Sonnet', value: 'claude-3-sonnet-20240229' },
        { name: 'Claude 3 Haiku', value: 'claude-3-haiku-20240307' }
    ],
    openai: [
        { name: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
        { name: 'GPT-4', value: 'gpt-4' },
        { name: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' }
    ],
    perplexity: [
        { name: 'Sonar Pro', value: 'sonar-pro' },
        { name: 'Sonar', value: 'sonar' }
    ],
    google: [
        { name: 'Gemini Pro', value: 'gemini-pro' },
        { name: 'Gemini Pro Vision', value: 'gemini-pro-vision' }
    ],
    mistral: [
        { name: 'Mistral Large', value: 'mistral-large-latest' },
        { name: 'Mistral Medium', value: 'mistral-medium-latest' }
    ],
    azure: [
        { name: 'Custom Deployment', value: 'custom' }
    ],
    openrouter: [
        { name: 'Auto (Best Available)', value: 'auto' },
        { name: 'Custom Model', value: 'custom' }
    ],
    ollama: [
        { name: 'Llama 3', value: 'llama3' },
        { name: 'Mistral', value: 'mistral' },
        { name: 'Custom Model', value: 'custom' }
    ]
};

export async function runAIProviderSection() {
    console.clear();
    
    // Display section header
    console.log(gradient.pastel.multiline(`
╔═══════════════════════════════════════╗
║        AI PROVIDER SETUP              ║
╚═══════════════════════════════════════╝
    `));
    
    console.log(chalk.gray('\nConfigure AI models for different roles in Task Master.\n'));
    console.log(chalk.yellow('Press Esc at any time to return to the main menu.\n'));
    console.log(createSeparator('─', 50, 'cristal'));
    
    const state = getOnboardingState();
    const currentAnswers = state.answers?.aiProvider || {};
    
    try {
        // Show introduction
        console.log(createBox(
            chalk.white.bold('AI Model Configuration') + '\n\n' +
            chalk.gray('Task Master uses AI models for different purposes:') + '\n' +
            chalk.cyan('• Main Model: ') + chalk.white('Primary task operations') + '\n' +
            chalk.cyan('• Research Model: ') + chalk.white('Enhanced research capabilities') + '\n' +
            chalk.cyan('• Fallback Model: ') + chalk.white('Backup when primary fails') + '\n\n' +
            chalk.yellow('We\'ll now run the interactive model setup...'),
            'single',
            'blue'
        ));
        
        const continueAnswer = await inquirer.prompt([{
            type: 'input',
            name: 'continue',
            message: 'Press Enter to start the interactive model configuration (or Esc to cancel)...'
        }], {
            onCancel: () => {
                console.log(chalk.yellow('\n⚠️  AI provider setup cancelled. Returning to main menu...'));
                return false;
            }
        });
        
        // Check if user cancelled
        if (!continueAnswer) {
            return false;
        }
        
        // Show loading animation
        const spinner = ora({
            text: gradient.rainbow('Starting interactive model setup...'),
            spinner: 'dots'
        }).start();
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        spinner.stop();
        
        // Find project root and run the existing interactive setup
        const projectRoot = findProjectRoot();
        
        console.log(chalk.blue('\n🚀 Running interactive model configuration...\n'));
        console.log(chalk.gray('Note: You can press Ctrl+C during the setup to cancel and return to the main menu.\n'));
        
        // Run the existing interactive setup (this is DRY - reusing existing code)
        try {
            await runInteractiveSetup(projectRoot);
        } catch (error) {
            if (error.name === 'ExitPromptError' || error.isTtyError) {
                console.log(chalk.yellow('\n⚠️  Model setup was cancelled. Returning to main menu...'));
                return false;
            }
            throw error; // Re-throw other errors
        }
        
        // The interactive setup has completed, now save completion status
        console.log(chalk.green('\n✅ AI model configuration completed!'));
        
        // Save completion status (the actual model config is saved by runInteractiveSetup)
        await updateSectionAnswers('aiProvider', {
            configured: true,
            completedAt: new Date().toISOString()
        });
        
        // Show completion message
        console.log(createBox(
            chalk.green.bold('✅ AI Provider Setup Complete!') + '\n\n' +
            chalk.white('Your AI models have been configured and saved.') + '\n' +
            chalk.gray('You can modify these settings later using:') + '\n' +
            chalk.cyan('  task-master models --setup'),
            'single',
            'green'
        ));
        
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
            console.error(chalk.red('Error in AI provider section:', error.message));
        }
        
        console.log(chalk.yellow('\nThe AI provider setup encountered an issue.'));
        console.log(chalk.gray('You can configure models later using: task-master models --setup'));
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