/**
 * Project Info Section
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import gradient from 'gradient-string';
import ora from 'ora';
import { getOnboardingState, updateOnboardingState, updateSectionAnswers } from '../state/onboardingState.js';
import { validateProjectName, validateVersion, createBox, createSeparator } from '../utils/index.js';

export const title = 'Project Configuration';

/**
 * Run the project info section
 */
export async function runProjectInfoSection() {
    console.clear();
    
    // Display section header
    console.log(gradient.pastel.multiline(`
╔═══════════════════════════════════════╗
║      PROJECT INFORMATION SETUP        ║
╚═══════════════════════════════════════╝
    `));
    
    console.log(chalk.gray('\nLet\'s start by setting up your project information.\n'));
    console.log(chalk.yellow('Press Esc at any time to return to the main menu.\n'));
    console.log(createSeparator('─', 50, 'cristal'));
    
    const state = getOnboardingState();
    const currentAnswers = state.answers?.projectInfo || {};
    
    try {
        // Collect project information with Esc handling
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'What is your project name?',
                default: currentAnswers.name || '',
                validate: validateProjectName
            },
            {
                type: 'input',
                name: 'description',
                message: 'Provide a brief description of your project:',
                default: currentAnswers.description || ''
            },
            {
                type: 'input',
                name: 'version',
                message: 'What is the initial version?',
                default: currentAnswers.version || '0.1.0',
                validate: validateVersion
            },
            {
                type: 'input',
                name: 'author',
                message: 'Who is the author/maintainer?',
                default: currentAnswers.author || ''
            }
        ], {
            // Handle Ctrl+C gracefully
            onCancel: () => {
                console.log(chalk.yellow('\n⚠️  Section cancelled. Returning to main menu...'));
                return false;
            }
        });
        
        // Check if user cancelled
        if (!answers) {
            return false;
        }
        
        // Show processing animation
        const spinner = ora({
            text: gradient.rainbow('Saving project information...'),
            spinner: 'dots'
        }).start();
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Save the answers
        await updateSectionAnswers('projectInfo', answers);
        
        spinner.succeed(chalk.green('Project information saved successfully!'));
        
        // Show summary
        console.log('\n' + createBox(
            chalk.white.bold('Project Summary:') + '\n\n' +
            chalk.cyan('Name: ') + chalk.white(answers.name) + '\n' +
            chalk.cyan('Description: ') + chalk.white(answers.description) + '\n' +
            chalk.cyan('Version: ') + chalk.white(answers.version) + '\n' +
            chalk.cyan('Author: ') + chalk.white(answers.author),
            'single',
            'green'
        ));
        
        console.log(chalk.green('\n✅ Project information section completed!'));
        
        // Wait for user to acknowledge with Esc handling
        const continueAnswer = await inquirer.prompt([{
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
            console.error(chalk.red('Error in project information section:', error.message));
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