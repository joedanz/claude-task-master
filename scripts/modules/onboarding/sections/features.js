/**
 * Features Section
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { updateSectionAnswers, completeSection, SECTIONS } from '../state/onboardingState.js';
import { displayHeader } from '../ui/header.js';

export const title = 'Feature Selection';

// Feature definitions
const FEATURES = [
    {
        value: 'dependencies',
        name: 'Task Dependencies',
        description: 'Track and enforce task dependencies',
        checked: true
    },
    {
        value: 'reporting',
        name: 'Progress Reporting',
        description: 'Generate progress reports and analytics',
        checked: true
    },
    {
        value: 'aiSuggestions',
        name: 'AI-Powered Suggestions',
        description: 'Get AI suggestions for task breakdown and optimization',
        checked: false
    },
    {
        value: 'collaboration',
        name: 'Team Collaboration',
        description: 'Enable multi-user features and task assignment',
        checked: false
    }
];

/**
 * Run the features section
 */
export async function runFeaturesSection() {
    console.clear();
    displayHeader(state);
    
    console.log(chalk.bold.cyan('\n🚀 Feature Selection\n'));
    console.log(chalk.gray('Choose which Task Master features to enable.\n'));
    
    // Get current answers
    const currentAnswers = state.answers.features || {};
    
    try {
        // Update feature defaults based on saved state
        FEATURES.forEach(feature => {
            if (feature.value in currentAnswers) {
                feature.checked = currentAnswers[feature.value];
            }
        });
        
        const { features } = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'features',
                message: 'Select features to enable:',
                choices: FEATURES.map(f => ({
                    name: `${f.name} - ${chalk.gray(f.description)}`,
                    value: f.value,
                    checked: f.checked
                })),
                pageSize: 10
            }
        ]);
        
        // Convert array to object
        const featureFlags = {};
        FEATURES.forEach(f => {
            featureFlags[f.value] = features.includes(f.value);
        });
        
        // Save answers
        await updateSectionAnswers(SECTIONS.FEATURES, featureFlags);
        await completeSection(SECTIONS.FEATURES);
        
        console.log(chalk.green('\n✅ Feature selection saved!\n'));
        
        // Show summary
        console.log(chalk.gray('Enabled features:'));
        Object.entries(featureFlags).forEach(([key, enabled]) => {
            if (enabled) {
                const feature = FEATURES.find(f => f.value === key);
                console.log(chalk.gray(`  • ${feature.name}`));
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return true;
    } catch (error) {
        if (error.isTtyError) {
            console.error(chalk.red('Error: This environment doesn\'t support interactive prompts.'));
        } else {
            // User cancelled
            return false;
        }
    }
} 