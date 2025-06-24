/**
 * Dashboard component - Main onboarding interface
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import gradient from 'gradient-string';
import ansiEscapes from 'ansi-escapes';
import chalkAnimation from 'chalk-animation';
import { createHeader, displayHeader } from './ui/header.js';
import { createMenu, animateMenuTransition, createCompletionSummary } from './ui/menu.js';
import { createFooter } from './ui/footer.js';
import { createProgressBar, updateProgressBar, closeProgressBar } from './ui/progressBar.js';
import { 
  getOnboardingState, 
  updateOnboardingState, 
  initializeOnboarding,
  completeSection,
  getCompletionPercentage,
  isOnboardingComplete 
} from './state/onboardingState.js';
import { runSection } from './sections/index.js';

// Define sections with hotkeys
const SECTIONS = [
  { id: 'project-info', name: '📋 Project Information', key: '1', stateKey: 'projectInfo' },
  { id: 'ai-provider', name: '🤖 AI Provider Setup', key: '2', stateKey: 'aiProvider' },
  { id: 'api-keys', name: '🔑 API Keys Configuration', key: '3', stateKey: 'apiKeys' },
  { id: 'features', name: '✨ Features Selection', key: '4', stateKey: 'features' },
  { id: 'rules', name: '📐 Coding Assistant Rules', key: '5', stateKey: 'rules' },
  { id: 'review', name: '🚀 Review & Execute', key: '6', stateKey: 'review' }
];

export async function showDashboard() {
  let currentMenuIndex = 0;
  
  // Initialize onboarding state
  await initializeOnboarding();
  let state = getOnboardingState();
  
  // Show initial loading animation with enhanced spinner
  const spinner = ora({
    text: gradient.rainbow('Loading Task Master Onboarding...'),
    spinner: 'dots12',
    color: 'cyan'
  }).start();
  
  // Simulate loading time for effect
  await new Promise(resolve => setTimeout(resolve, 1500));
  spinner.stop();
  
  // Show welcome animation
  console.clear();
  const welcomeText = chalkAnimation.rainbow('Welcome to Task Master Onboarding!');
  await new Promise(resolve => setTimeout(resolve, 2000));
  welcomeText.stop();
  
  // Main dashboard loop with keyboard navigation
  while (true) {
    console.clear();
    
    // Display header
    displayHeader();
    
    // Get current state
    state = getOnboardingState();
    
    // Check if onboarding is complete
    if (isOnboardingComplete()) {
      console.log(createCompletionSummary(state));
      
      const { action } = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'Onboarding is complete! What would you like to do?',
        choices: [
          { name: '🎉 Exit Onboarding', value: 'exit' },
          { name: '🔄 Reset and Start Over', value: 'reset' },
          { name: '📊 View Progress Summary', value: 'summary' }
        ]
      }]);
      
      if (action === 'exit') {
        console.clear();
        const exitAnimation = chalkAnimation.karaoke('Thank you for using Task Master! 🚀');
        await new Promise(resolve => setTimeout(resolve, 2000));
        exitAnimation.stop();
        break;
      } else if (action === 'reset') {
        await resetOnboarding();
        state = getOnboardingState();
        currentMenuIndex = 0;
        continue;
      } else if (action === 'summary') {
        continue; // Will show summary again
      }
    }
    
    // Display progress and menu
    console.log(createMenu(currentMenuIndex, state));
    
    // Enhanced footer with hotkeys
    console.log(createEnhancedFooter(currentMenuIndex));
    
    // Handle keyboard input with single character detection
    const action = await getKeyboardInput(currentMenuIndex, state);
    
    switch (action.type) {
      case 'navigate':
        currentMenuIndex = action.index;
        break;
        
      case 'enter':
        await handleSectionEntry(action.index, state);
        break;
        
      case 'progress':
        await showProgressSummary(state);
        break;
        
      case 'reset':
        const resetConfirmed = await confirmReset();
        if (resetConfirmed) {
          await resetOnboarding();
          state = getOnboardingState();
          currentMenuIndex = 0;
        }
        break;
        
      case 'exit':
        console.clear();
        const exitAnimation = chalkAnimation.pulse('Goodbye! 👋');
        await new Promise(resolve => setTimeout(resolve, 1500));
        exitAnimation.stop();
        return;
    }
  }
}

/**
 * Enhanced footer with hotkeys
 */
function createEnhancedFooter(selectedIndex) {
  const hotkeys = SECTIONS.map((section, index) => {
    const isSelected = index === selectedIndex;
    const keyDisplay = isSelected ? chalk.yellow.bold(section.key) : chalk.gray(section.key);
    const nameDisplay = isSelected ? chalk.white.bold(section.name) : chalk.gray(section.name);
    return `${keyDisplay} ${nameDisplay}`;
  }).join('  ');
  
  const navigationHelp = [
    chalk.yellow('↑/↓') + chalk.gray(' Navigate'),
    chalk.yellow('⏎') + chalk.gray(' Enter Section'),
    chalk.yellow('1-6') + chalk.gray(' Direct Access'),
    chalk.yellow('p') + chalk.gray(' Progress'),
    chalk.yellow('r') + chalk.gray(' Reset'),
    chalk.yellow('Esc/q') + chalk.gray(' Quit')
  ].join('  |  ');
  
  return '\n' + chalk.gray('─'.repeat(80)) + '\n' +
         hotkeys + '\n\n' +
         navigationHelp + '\n' +
         chalk.gray('─'.repeat(80));
}

/**
 * Get keyboard input with single character detection
 */
async function getKeyboardInput(currentIndex, state) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    
    const onKeyPress = (key) => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener('data', onKeyPress);
      
      // Handle different key inputs
      switch (key) {
        case '\u001b[A': // Up arrow
          const upIndex = currentIndex > 0 ? currentIndex - 1 : SECTIONS.length - 1;
          resolve({ type: 'navigate', index: upIndex });
          break;
          
        case '\u001b[B': // Down arrow
          const downIndex = currentIndex < SECTIONS.length - 1 ? currentIndex + 1 : 0;
          resolve({ type: 'navigate', index: downIndex });
          break;
          
        case '\r': // Enter
        case '\n':
          resolve({ type: 'enter', index: currentIndex });
          break;
          
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          const sectionIndex = parseInt(key, 10) - 1;
          if (sectionIndex >= 0 && sectionIndex < SECTIONS.length) {
            resolve({ type: 'enter', index: sectionIndex });
          } else {
            resolve({ type: 'navigate', index: currentIndex });
          }
          break;
          
        case 'p':
        case 'P':
          resolve({ type: 'progress' });
          break;
          
        case 'r':
        case 'R':
          resolve({ type: 'reset' });
          break;
          
        case 'q':
        case 'Q':
        case '\u0003': // Ctrl+C
        case '\u001b': // Esc key
          resolve({ type: 'exit' });
          break;
          
        default:
          // Unknown key, stay in current position
          resolve({ type: 'navigate', index: currentIndex });
          break;
      }
    };
    
    stdin.on('data', onKeyPress);
  });
}

/**
 * Show progress summary
 */
async function showProgressSummary(state) {
  console.clear();
  console.log(createCompletionSummary(state));
  
  console.log(chalk.gray('\nPress any key to continue...'));
  
  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    
    const onKeyPress = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener('data', onKeyPress);
      resolve();
    };
    
    stdin.once('data', onKeyPress);
  });
}

/**
 * Confirm reset action
 */
async function confirmReset() {
  const { confirm } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirm',
    message: 'Are you sure you want to reset all onboarding progress?',
    default: false
  }]);
  
  return confirm;
}

/**
 * Handle entering a specific section
 */
async function handleSectionEntry(menuIndex, state) {
  const section = SECTIONS[menuIndex];
  
  try {
    console.clear();
    
    // Show entering section animation
    const enteringSpinner = ora({
      text: gradient.cristal(`Entering ${section.name}...`),
      spinner: 'arrow3'
    }).start();
    
    await new Promise(resolve => setTimeout(resolve, 800));
    enteringSpinner.stop();
    
    // Run the section
    await runSection(section.id);
    
    // Mark section as completed after successful run
    await completeSection(section.stateKey);
    
    // Show completion animation
    const completionText = chalkAnimation.rainbow(`✅ ${section.name} completed!`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    completionText.stop();
    
  } catch (error) {
    console.error(chalk.red(`Error in section ${section.name}:`, error.message));
    console.log(chalk.gray('\nPress any key to continue...'));
    
    return new Promise((resolve) => {
      const stdin = process.stdin;
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding('utf8');
      
      const onKeyPress = () => {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener('data', onKeyPress);
        resolve();
      };
      
      stdin.once('data', onKeyPress);
    });
  }
}

/**
 * Reset onboarding state
 */
async function resetOnboarding() {
  const { resetState } = await import('./state/onboardingState.js');
  await resetState();
} 