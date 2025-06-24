/**
 * Footer component with keyboard hints
 */

import chalk from 'chalk';
import gradient from 'gradient-string';
import boxen from 'boxen';

/**
 * Display footer with keyboard hints
 */
export function displayFooter(inSection = false) {
    console.log('\n' + chalk.gray('─'.repeat(50)) + '\n');
    
    if (inSection) {
        console.log(chalk.gray('  Press ') + chalk.yellow('Ctrl+C') + chalk.gray(' to return to menu'));
    } else {
        const hints = [
            chalk.yellow('↑/↓') + chalk.gray(' Navigate'),
            chalk.yellow('⏎') + chalk.gray(' Select'),
            chalk.yellow('r') + chalk.gray(' Reset'),
            chalk.yellow('q') + chalk.gray(' Quit')
        ];
        
        console.log('  ' + hints.join('  |  '));
    }
    
    console.log();
}

export function createFooter(inSection = false) {
    if (inSection) {
        return boxen(
            chalk.gray('Press ') + chalk.yellow('Ctrl+C') + chalk.gray(' to return to menu'),
            {
                padding: { top: 0, bottom: 0, left: 1, right: 1 },
                margin: { top: 1, bottom: 0 },
                borderStyle: 'round',
                borderColor: 'gray',
                align: 'center'
            }
        );
    } else {
        const hints = [
            chalk.yellow('↑/↓') + chalk.gray(' Navigate'),
            chalk.yellow('Enter') + chalk.gray(' Select'),
            chalk.yellow('r') + chalk.gray(' Reset'),
            chalk.yellow('q') + chalk.gray(' Quit')
        ];
        
        const footerContent = hints.join('  |  ');
        
        return boxen(footerContent, {
            title: gradient.pastel('🎮 Controls'),
            titleAlignment: 'center',
            padding: { top: 0, bottom: 0, left: 2, right: 2 },
            margin: { top: 1, bottom: 1 },
            borderStyle: 'round',
            borderColor: 'gray',
            align: 'center',
            width: 60
        });
    }
} 