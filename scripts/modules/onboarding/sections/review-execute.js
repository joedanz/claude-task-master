/**
 * Review and Execute Section
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import gradient from 'gradient-string';
import boxen from 'boxen';
import ora from 'ora';
import { getOnboardingState, updateOnboardingState } from '../state/onboardingState.js';
import { createSeparator } from '../utils/index.js';
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

export async function runReviewExecuteSection() {
    console.clear();
    
    // Display section header
    console.log(gradient.pastel.multiline(`
╔═══════════════════════════════════════╗
║        REVIEW & EXECUTE               ║
╚═══════════════════════════════════════╝
    `));
    
    console.log(chalk.gray('\nReview your settings and apply the configuration.\n'));
    console.log(createSeparator('─', 50, 'cristal'));
    
    const state = getOnboardingState();
    
    // Display all collected settings
    await displayConfigurationSummary(state);
    
    // Build execution plan for remaining items
    const executionPlan = buildExecutionPlan(state);
    
    if (executionPlan.length > 0) {
        console.log(chalk.bold.cyan('\n🚀 Remaining Configuration Steps\n'));
        displayExecutionPlan(executionPlan);
    } else {
        console.log(chalk.green.bold('\n✅ All configurations have been applied!\n'));
        console.log(chalk.gray('Your Task Master project is ready to use.\n'));
    }
    
    try {
        const choices = [];
        
        if (executionPlan.length > 0) {
            choices.push({ name: chalk.green('🚀 Apply remaining configurations'), value: 'execute' });
        }
        
        choices.push(
            { name: chalk.blue('📝 Review settings again'), value: 'review' },
            { name: chalk.yellow('❌ Exit onboarding'), value: 'exit' }
        );
        
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices
            }
        ]);
        
        if (action === 'exit') {
            // Show completion message
            const completionAnimation = gradient.rainbow('🎉 Task Master onboarding completed! 🎉');
            console.log('\n' + completionAnimation + '\n');
            
            console.log(chalk.green('Your project is now configured and ready to use!'));
            console.log(chalk.gray('\nNext steps:'));
            console.log(chalk.cyan('  • Create a PRD file and run: task-master parse-prd --input=<file>'));
            console.log(chalk.cyan('  • List your tasks: task-master list'));
            console.log(chalk.cyan('  • Find next task: task-master next'));
            console.log(chalk.cyan('  • Get help: task-master --help\n'));
            
            await new Promise(resolve => setTimeout(resolve, 3000));
            process.exit(0);
        }
        
        if (action === 'review') {
            // Re-run this section
            return await runReviewExecuteSection();
        }
        
        // Execute the remaining plan
        if (executionPlan.length > 0) {
            const success = await executeConfiguration(executionPlan);
            
            if (success) {
                console.log(chalk.green.bold('\n🎉 All configurations applied successfully!\n'));
                
                // Mark as completed
                updateOnboardingState({
                    completed: {
                        ...state.completed,
                        'review-execute': true
                    }
                });
                
                await new Promise(resolve => setTimeout(resolve, 2000));
                return true;
            } else {
                console.log(chalk.red('\n❌ Some configurations failed to apply.\n'));
                console.log(chalk.yellow('You can re-run individual sections from the menu.\n'));
                await new Promise(resolve => setTimeout(resolve, 3000));
                return false;
            }
        } else {
            // Mark as completed even if no execution was needed
            updateOnboardingState({
                completed: {
                    ...state.completed,
                    'review-execute': true
                }
            });
            return true;
        }
        
    } catch (error) {
        console.error(chalk.red('Error during execution:'), error.message);
        return false;
    }
}

/**
 * Display configuration summary
 */
async function displayConfigurationSummary(state) {
    const { answers } = state;
    
    // Project Info
    if (answers.projectInfo?.name) {
        const projectBox = boxen(
            chalk.white('Project: ') + chalk.cyan(answers.projectInfo.name) + '\n' +
            chalk.white('Version: ') + chalk.gray(answers.projectInfo.version) + '\n' +
            chalk.white('Author: ') + chalk.gray(answers.projectInfo.author || 'Not specified'),
            {
                title: '📁 Project Information',
                titleAlignment: 'left',
                padding: 1,
                borderStyle: 'round',
                borderColor: 'cyan'
            }
        );
        console.log(projectBox);
    }
    
    // AI Provider
    if (answers.aiProvider?.completed) {
        const aiBox = boxen(
            chalk.white('Status: ') + chalk.green('✅ Configured') + '\n' +
            chalk.white('Method: ') + chalk.gray(answers.aiProvider.setupMethod) + '\n' +
            chalk.white('Applied: ') + chalk.green('Immediately'),
            {
                title: '🤖 AI Configuration',
                titleAlignment: 'left',
                padding: 1,
                borderStyle: 'round',
                borderColor: 'green'
            }
        );
        console.log('\n' + aiBox);
    } else if (answers.aiProvider?.skipped) {
        const aiBox = boxen(
            chalk.white('Status: ') + chalk.yellow('⏭️  Skipped') + '\n' +
            chalk.white('Note: ') + chalk.gray('Default models will be used'),
            {
                title: '🤖 AI Configuration',
                titleAlignment: 'left',
                padding: 1,
                borderStyle: 'round',
                borderColor: 'yellow'
            }
        );
        console.log('\n' + aiBox);
    }
    
    // API Keys
    if (answers.apiKeys?.configured) {
        const keyBox = boxen(
            chalk.white('Status: ') + (answers.apiKeys.configured ? chalk.green('✅ Configured') : chalk.yellow('⏭️  Skipped')) + '\n' +
            chalk.white('Applied: ') + chalk.gray('Pending execution'),
            {
                title: '🔑 API Keys',
                titleAlignment: 'left',
                padding: 1,
                borderStyle: 'round',
                borderColor: 'yellow'
            }
        );
        console.log('\n' + keyBox);
    }
    
    // Features
    if (answers.features) {
        const enabledFeatures = Object.entries(answers.features)
            .filter(([_, enabled]) => enabled)
            .map(([feature, _]) => feature);
        
        const featuresBox = boxen(
            chalk.white('Enabled Features:\n') +
            enabledFeatures.map(f => chalk.gray(`  • ${f}`)).join('\n'),
            {
                title: '✨ Features',
                titleAlignment: 'left',
                padding: 1,
                borderStyle: 'round',
                borderColor: 'magenta'
            }
        );
        console.log('\n' + featuresBox);
    }
    
    // Rules
    if (answers.rules?.completed) {
        const rulesBox = boxen(
            chalk.white('Status: ') + chalk.green('✅ Selected') + '\n' +
            chalk.white('Profiles: ') + chalk.gray(answers.rules.profiles?.join(', ') || 'None') + '\n' +
            chalk.white('Applied: ') + chalk.yellow('Pending execution'),
            {
                title: '📐 Rules',
                titleAlignment: 'left',
                padding: 1,
                borderStyle: 'round',
                borderColor: 'blue'
            }
        );
        console.log('\n' + rulesBox);
    } else if (answers.rules?.skipped) {
        const rulesBox = boxen(
            chalk.white('Status: ') + chalk.yellow('⏭️  Skipped') + '\n' +
            chalk.white('Note: ') + chalk.gray('Default rules will be used'),
            {
                title: '📐 Rules',
                titleAlignment: 'left',
                padding: 1,
                borderStyle: 'round',
                borderColor: 'yellow'
            }
        );
        console.log('\n' + rulesBox);
    }
}

/**
 * Build execution plan for remaining items
 */
function buildExecutionPlan(state) {
    const { answers, executionPlan = [] } = state;
    const steps = [];
    
    // Step 1: Create .env file with API key (if configured)
    if (answers.apiKeys?.configured && answers.apiKeys.keyValue) {
        steps.push({
            id: 'env',
            name: 'Save API key',
            action: 'create-env',
            data: {
                provider: answers.apiKeys.provider,
                keyValue: answers.apiKeys.keyValue
            },
            description: 'Create .env file with API key'
        });
    }
    
    // Step 2: Initialize project (if configured)
    if (answers.projectInfo?.name) {
        steps.push({
            id: 'init',
            name: 'Initialize project',
            command: buildInitCommand(answers),
            description: 'Run task-master init with your settings'
        });
    }
    
    // Step 3: Add rule profiles (from execution plan)
    const rulesStep = executionPlan.find(step => step.command === 'rules');
    if (rulesStep) {
        steps.push({
            id: 'rules',
            name: 'Apply rule profiles',
            command: `task-master rules add ${rulesStep.profiles.join(',')}`,
            description: rulesStep.description
        });
    }
    
    return steps;
}

/**
 * Build init command
 */
function buildInitCommand(answers) {
    const args = ['-y']; // Non-interactive mode
    
    if (answers.projectInfo?.name) {
        args.push(`--name="${answers.projectInfo.name}"`);
    }
    if (answers.projectInfo?.description) {
        args.push(`--description="${answers.projectInfo.description}"`);
    }
    if (answers.projectInfo?.version) {
        args.push(`--version="${answers.projectInfo.version}"`);
    }
    if (answers.projectInfo?.author) {
        args.push(`--author="${answers.projectInfo.author}"`);
    }
    
    return `task-master init ${args.join(' ')}`;
}

/**
 * Display execution plan
 */
function displayExecutionPlan(steps) {
    steps.forEach((step, index) => {
        console.log(chalk.bold(`${index + 1}. ${step.name}`));
        console.log(chalk.gray(`   ${step.description}`));
        if (step.command) {
            console.log(chalk.gray(`   Command: ${step.command}`));
        }
        console.log();
    });
}

/**
 * Execute configuration
 */
async function executeConfiguration(steps) {
    let allSuccess = true;
    
    for (const step of steps) {
        const spinner = ora({
            text: `${step.name}...`,
            spinner: 'dots12',
            color: 'cyan'
        }).start();
        
        try {
            if (step.action === 'create-env') {
                // Special handling for .env file creation
                await createEnvFile(step.data);
            } else if (step.command) {
                // Execute command
                execSync(step.command, { 
                    stdio: 'pipe',
                    encoding: 'utf8'
                });
            }
            
            spinner.succeed(chalk.green(`✅ ${step.name} completed`));
        } catch (error) {
            spinner.fail(chalk.red(`❌ ${step.name} failed: ${error.message}`));
            allSuccess = false;
            
            // Continue with other steps even if one fails
        }
        
        // Small delay between steps
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return allSuccess;
}

/**
 * Create .env file with API key
 */
async function createEnvFile(data) {
    const envPath = path.join(process.cwd(), '.env');
    const keyMap = {
        openai: 'OPENAI_API_KEY',
        anthropic: 'ANTHROPIC_API_KEY',
        google: 'GOOGLE_API_KEY',
        perplexity: 'PERPLEXITY_API_KEY',
        mistral: 'MISTRAL_API_KEY',
        xai: 'XAI_API_KEY'
    };
    
    const keyName = keyMap[data.provider];
    if (!keyName || !data.keyValue) {
        throw new Error('Invalid API key configuration');
    }
    
    let envContent = '';
    
    try {
        envContent = await fs.readFile(envPath, 'utf8');
    } catch {
        // File doesn't exist, that's OK
    }
    
    // Parse existing content
    const lines = envContent.split('\n');
    const newLines = [];
    let keyFound = false;
    
    for (const line of lines) {
        if (line.startsWith(`${keyName}=`)) {
            newLines.push(`${keyName}=${data.keyValue}`);
            keyFound = true;
        } else if (line.trim()) {
            newLines.push(line);
        }
    }
    
    if (!keyFound) {
        newLines.push(`${keyName}=${data.keyValue}`);
    }
    
    await fs.writeFile(envPath, newLines.join('\n') + '\n', 'utf8');
} 