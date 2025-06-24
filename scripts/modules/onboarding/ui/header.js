/**
 * Header component for onboarding - DRY version using existing Task Master banner
 */

import chalk from 'chalk';
import boxen from 'boxen';
import gradient from 'gradient-string';
import figlet from 'figlet';
import { getTaskMasterVersion } from '../../../../src/utils/getVersion.js';

// Import the existing banner function from ui.js to keep it DRY
import { displayBanner } from '../../ui.js';

/**
 * Display the onboarding header using existing Task Master banner
 */
export function displayHeader() {
    // Use the existing displayBanner function
    displayBanner();
    
    // Add onboarding-specific tagline
    const onboardingTagline = gradient.rainbow('✨ Interactive Onboarding Experience ✨');
    console.log('\n' + chalk.dim('─'.repeat(60)));
    console.log(onboardingTagline);
    console.log(chalk.dim('─'.repeat(60)) + '\n');
}

/**
 * Create a header for display (returns string instead of printing)
 */
export function createHeader() {
    // Create ASCII art logo using figlet (same as existing displayBanner)
    const bannerText = figlet.textSync('Task Master', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default'
    });

    // Apply gradient (same as existing displayBanner)
    const coolGradient = gradient(['#00b4d8', '#0077b6', '#03045e']);
    const gradientLogo = coolGradient(bannerText);
    
    // Add creator credit
    const creatorCredit = chalk.dim('by ') + chalk.cyan.underline('https://x.com/eyaltoledano');
    
    // Get version
    const version = getTaskMasterVersion();
    
    // Create onboarding-specific tagline
    const tagline = gradient.rainbow('✨ Interactive Onboarding Experience ✨');
    
    // Combine all elements
    const headerContent = [
        '',
        gradientLogo,
        '',
        creatorCredit,
        '',
        tagline,
        '',
        chalk.dim(`Version: ${version}`)
    ].join('\n');

    // Create a stylish box
    return boxen(headerContent, {
        padding: { top: 1, bottom: 1, left: 2, right: 2 },
        margin: { top: 1, bottom: 1 },
        borderStyle: 'double',
        borderColor: 'cyan',
        align: 'center'
    });
} 