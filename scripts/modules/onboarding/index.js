/**
 * @file Main entry point for the Onboarding module.
 * This file exports all the necessary components, state management,
 * and utilities for the enhanced onboarding flow.
 */
 
// Export non-JSX modules that work with regular Node.js
// export * from './components/index.js'; // Commented out - JSX components need tsx
export * from './state/index.js';
export * from './utils/index.js'; 

import inquirer from 'inquirer';
import chalk from 'chalk';
import { createSpinner } from 'nanospinner';
import { execSync } from 'child_process';
import { initializeOnboarding, isOnboardingComplete, resetState } from './state/onboardingState.js';
import { showDashboard } from './dashboard.js';

// Import all sections
import * as projectInfoSection from './sections/project-info.js';
import * as aiProviderSection from './sections/ai-provider.js';
import * as apiKeysSection from './sections/api-keys.js';
import * as featuresSection from './sections/features.js';
import * as rulesSection from './sections/rules.js';
import * as reviewExecuteSection from './sections/review-execute.js';

// Section map
const SECTIONS = {
    projectInfo: projectInfoSection,
    aiProvider: aiProviderSection,
    apiKeys: apiKeysSection,
    features: featuresSection,
    rules: rulesSection,
    review: reviewExecuteSection
};

/**
 * Task Master Interactive Onboarding System
 */

/**
 * Main onboarding entry point
 */
export async function startOnboarding(options = {}) {
    try {
        // Handle reset flag
        if (options.reset) {
            await resetState();
            console.log(chalk.green('✅ Onboarding state has been reset.\n'));
        }
        
        // Initialize state
        const state = await initializeOnboarding();
        
        // Check if already complete
        if (isOnboardingComplete() && !options.reset) {
            console.clear();
            console.log(chalk.green.bold('\n🎉 Onboarding is already complete!\n'));
            console.log(chalk.gray('Run with --reset flag to start over.\n'));
            console.log(chalk.cyan('Next steps:'));
            console.log(chalk.yellow('  1. Run "task-master init" to initialize your project'));
            console.log(chalk.yellow('  2. Create a PRD with "task-master parse-prd <file>"'));
            console.log(chalk.yellow('  3. Start working with "task-master next"\n'));
            return;
        }
        
        // Show the interactive dashboard
        await showDashboard();
        
        // Check if all sections are complete
        if (isOnboardingComplete()) {
            await showCompletionScreen();
        }
        
    } catch (error) {
        console.error(chalk.red('\n❌ Onboarding error:'), error.message);
        if (error.stack && process.env.DEBUG) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

/**
 * Show completion screen
 */
async function showCompletionScreen() {
    console.clear();
    console.log(chalk.green.bold(`
╔══════════════════════════════════════════╗
║                                          ║
║     🎉 Onboarding Complete! 🎉           ║
║                                          ║
╚══════════════════════════════════════════╝
`));
    
    console.log(chalk.white('Your Task Master configuration has been saved.\n'));
    
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.yellow('  1. Run "task-master init" to initialize your project'));
    console.log(chalk.yellow('  2. Create a PRD (Product Requirements Document)'));
    console.log(chalk.yellow('  3. Run "task-master parse-prd <prd-file>" to generate tasks'));
    console.log(chalk.yellow('  4. Start working with "task-master next"\n'));
    
    console.log(chalk.gray('For more help, run "task-master --help"\n'));
}

/**
 * Check if dependencies are available (legacy compatibility)
 */
export function checkDependencies() {
    // All dependencies are now installed
    return true;
}

/**
 * Get system information (legacy compatibility)
 */
export function getSystemInfo() {
    return {
        platform: process.platform,
        nodeVersion: process.version,
        cwd: process.cwd(),
        timestamp: new Date().toISOString()
    };
}

// Export state functions for external use
export * from './state/onboardingState.js'; 