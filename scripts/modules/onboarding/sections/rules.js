/**
 * Rules Section
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import gradient from 'gradient-string';
import ora from 'ora';
import { getOnboardingState, updateOnboardingState } from '../state/onboardingState.js';
import { createBox, createSeparator } from '../utils/index.js';

// Import the existing interactive rules setup function to keep it DRY
import { runInteractiveProfilesSetup } from '../../../../src/utils/profiles.js';

export const title = 'Project Rules Setup';

// Available rule profiles
const RULE_PROFILES = [
    {
        value: 'cursor',
        name: 'Cursor',
        description: 'Rules for Cursor AI editor',
        checked: true
    },
    {
        value: 'windsurf',
        name: 'Windsurf',
        description: 'Rules for Windsurf editor',
        checked: false
    },
    {
        value: 'claude',
        name: 'Claude Code',
        description: 'Rules for Claude Code assistant',
        checked: false
    },
    {
        value: 'cline',
        name: 'Cline',
        description: 'Rules for Cline assistant',
        checked: false
    },
    {
        value: 'roo',
        name: 'Roo Code',
        description: 'Rules for Roo Code assistant',
        checked: false
    },
    {
        value: 'trae',
        name: 'Trae',
        description: 'Rules for Trae assistant',
        checked: false
    },
    {
        value: 'codex',
        name: 'Codex',
        description: 'Rules for Codex assistant',
        checked: false
    }
];

/**
 * Run the rules section
 */
export async function runRulesSection() {
    console.clear();
    
    // Display section header
    console.log(gradient.pastel.multiline(`
╔═══════════════════════════════════════╗
║      CODING ASSISTANT RULES           ║
╚═══════════════════════════════════════╝
    `));
    
    console.log(chalk.gray('\nConfigure coding assistant profiles for your project.\n'));
    console.log(createSeparator('─', 50, 'cristal'));
    
    const state = getOnboardingState();
    const currentAnswers = state.answers.rules || {};
    
    try {
        const { setupMethod } = await inquirer.prompt([
            {
                type: 'list',
                name: 'setupMethod',
                message: 'How would you like to configure project rules?',
                choices: [
                    { name: '🎯 Use interactive setup (recommended)', value: 'interactive' },
                    { name: '⏭️  Skip for now (use defaults)', value: 'skip' }
                ],
                default: currentAnswers.setupMethod || 'interactive'
            }
        ]);
        
        if (setupMethod === 'skip') {
            console.log(chalk.yellow('\n⚠️  Rules setup skipped. Default rules will be used.\n'));
            
            // Store skip decision
            updateOnboardingState({
                completed: {
                    ...state.completed,
                    'rules': true
                },
                answers: {
                    ...state.answers,
                    rules: {
                        setupMethod: 'skip',
                        skipped: true
                    }
                }
            });
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            return true;
        }
        
        if (setupMethod === 'interactive') {
            console.log(chalk.blue('\n🚀 Launching interactive rules setup...\n'));
            
            // Show loading spinner
            const spinner = ora({
                text: gradient.pastel('Preparing rules configuration...'),
                spinner: 'dots12',
                color: 'cyan'
            }).start();
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            spinner.stop();
            
            // Use the existing interactive setup function
            console.log(chalk.cyan('\n' + '='.repeat(60)));
            console.log(chalk.cyan.bold('  TASK MASTER - RULE PROFILES SETUP'));
            console.log(chalk.cyan('='.repeat(60)));
            
            try {
                const selectedProfiles = await runInteractiveProfilesSetup();
                
                if (selectedProfiles && selectedProfiles.length > 0) {
                    // Setup completed successfully
                    console.log(chalk.green(`\n✅ Selected ${selectedProfiles.length} rule profile(s)!\n`));
                    console.log(chalk.gray(`Profiles: ${selectedProfiles.join(', ')}\n`));
                    
                    // Store the selected profiles for later execution
                    updateOnboardingState({
                        completed: {
                            ...state.completed,
                            'rules': true
                        },
                        answers: {
                            ...state.answers,
                            rules: {
                                setupMethod: 'interactive',
                                profiles: selectedProfiles,
                                completed: true,
                                timestamp: new Date().toISOString()
                            }
                        },
                        executionPlan: [
                            ...state.executionPlan || [],
                            {
                                command: 'rules',
                                action: 'add',
                                profiles: selectedProfiles,
                                description: `Add rule profiles: ${selectedProfiles.join(', ')}`
                            }
                        ]
                    });
                    
                    console.log(chalk.gray('Rules will be applied when you complete onboarding.\n'));
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    return true;
                } else {
                    // Setup was cancelled or no profiles selected
                    console.log(chalk.yellow('\n⚠️  Rules setup was cancelled or no profiles selected.\n'));
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    return false;
                }
            } catch (error) {
                console.error(chalk.red('\n❌ Error during rules setup:'), error.message);
                console.log(chalk.yellow('\nYou can configure rules later using: task-master rules --setup\n'));
                await new Promise(resolve => setTimeout(resolve, 2000));
                return false;
            }
        }
        
    } catch (error) {
        if (error.isTtyError) {
            console.error(chalk.red('Error: This environment doesn\'t support interactive prompts.'));
        } else {
            // User cancelled
            return false;
        }
    }
}

/**
 * Run rules --setup in capture mode
 */
async function runRulesSetupCapture() {
    return new Promise((resolve) => {
        // Simulate the rules --setup flow
        inquirer.prompt([
            {
                type: 'checkbox',
                name: 'profiles',
                message: 'Select the AI coding assistants you use:',
                choices: RULE_PROFILES.map(p => ({
                    name: `${p.name} - ${chalk.gray(p.description)}`,
                    value: p.value,
                    checked: p.value === 'cursor' // Default to Cursor
                })),
                pageSize: 10,
                validate: (answer) => {
                    if (answer.length === 0) {
                        return 'Please select at least one profile';
                    }
                    return true;
                }
            }
        ]).then(answers => {
            resolve(answers);
        }).catch(() => {
            resolve(null);
        });
    });
}

/**
 * Manual rules selection (existing implementation)
 */
async function manualRulesSelection(state, currentAnswers) {
    // Update defaults based on saved state
    RULE_PROFILES.forEach(profile => {
        profile.checked = currentAnswers.profiles?.includes(profile.value) || false;
    });
    
    const { profiles } = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'profiles',
            message: 'Select rule profiles to include:',
            choices: RULE_PROFILES.map(p => ({
                name: `${p.name} - ${chalk.gray(p.description)}`,
                value: p.value,
                checked: p.checked
            })),
            pageSize: 10,
            validate: (answer) => {
                if (answer.length === 0) {
                    return 'Please select at least one profile';
                }
                return true;
            }
        }
    ]);
    
    // Save answers
    await updateSectionAnswers(SECTIONS.RULES, { profiles });
    await completeSection(SECTIONS.RULES);
    
    console.log(chalk.green('\n✅ Rule profiles saved!\n'));
    
    // Show summary
    console.log(chalk.gray('Selected profiles:'));
    profiles.forEach(profileId => {
        const profile = RULE_PROFILES.find(p => p.value === profileId);
        console.log(chalk.gray(`  • ${profile.name}`));
    });
    
    console.log(chalk.gray(`\nThese rules will be included when you complete onboarding.`));
    
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    return true;
} 