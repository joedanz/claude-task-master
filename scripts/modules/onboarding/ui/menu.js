/**
 * Menu component for onboarding sections
 */

import chalk from 'chalk';
import gradient from 'gradient-string';
import ansiEscapes from 'ansi-escapes';
import boxen from 'boxen';

// Section definitions
export const MENU_SECTIONS = [
    {
        key: 'projectInfo',
        title: 'Project Configuration',
        description: 'Set project name, description, and version'
    },
    {
        key: 'aiProvider',
        title: 'AI Provider Setup',
        description: 'Choose AI provider and models'
    },
    {
        key: 'apiKeys',
        title: 'API Key Configuration',
        description: 'Configure API keys for your chosen provider'
    },
    {
        key: 'features',
        title: 'Feature Selection',
        description: 'Enable or disable Task Master features'
    },
    {
        key: 'rules',
        title: 'Project Rules Setup',
        description: 'Select coding assistant profiles'
    },
    {
        key: 'review',
        title: '🚀 Review & Apply Settings',
        description: 'Review all settings and apply configurations',
        special: true
    }
];

/**
 * Get status icon for a section
 */
function getStatusIcon(isCompleted, isSelected) {
    if (isCompleted) {
        return chalk.green('✔');
    } else if (isSelected) {
        return chalk.yellow('▶');
    } else {
        return chalk.gray('○');
    }
}

/**
 * Display the menu
 */
export function displayMenu(state, selectedIndex) {
    console.log(chalk.bold('\nSections:\n'));
    
    MENU_SECTIONS.forEach((section, index) => {
        const isCompleted = state.completed[section.key];
        const isSelected = index === selectedIndex;
        const isSpecial = section.special;
        
        // Special handling for review section
        let icon;
        if (isSpecial) {
            icon = isSelected ? chalk.yellow('▶') : chalk.yellow('★');
        } else {
            icon = getStatusIcon(isCompleted, isSelected);
        }
        
        // Build menu line
        let line = `  ${icon} `;
        
        if (isSelected) {
            line += isSpecial ? chalk.bold.yellow(section.title) : chalk.bold.cyan(section.title);
        } else if (isCompleted) {
            line += chalk.green(section.title);
        } else if (isSpecial) {
            line += chalk.yellow(section.title);
        } else {
            line += chalk.white(section.title);
        }
        
        // Add description on selected item
        if (isSelected) {
            line += '\n    ' + chalk.gray(section.description);
        }
        
        console.log(line);
        
        // Add spacing between items
        if (index < MENU_SECTIONS.length - 1) {
            console.log();
        }
    });
}

/**
 * Get section by index
 */
export function getSectionByIndex(index) {
    return MENU_SECTIONS[index] || null;
}

/**
 * Get total sections count
 */
export function getTotalSections() {
    return MENU_SECTIONS.length;
}

const MENU_ITEMS = [
  { id: 'project-info', label: '📋 Project Information', section: 'projectInfo', key: '1' },
  { id: 'ai-provider', label: '🤖 AI Provider Setup', section: 'aiProvider', key: '2' },
  { id: 'api-keys', label: '🔑 API Keys Configuration', section: 'apiKeys', key: '3' },
  { id: 'features', label: '✨ Features Selection', section: 'features', key: '4' },
  { id: 'rules', label: '📐 Coding Assistant Rules', section: 'rules', key: '5' },
  { id: 'review', label: '🚀 Review & Execute', section: 'review', key: '6' }
];

/**
 * Get completion status indicator
 */
function getStatusIndicator(isCompleted, isSelected) {
  if (isCompleted) {
    return isSelected ? chalk.green.bold('✅') : chalk.green('✅');
  } else {
    return isSelected ? chalk.yellow.bold('⏳') : chalk.gray('⭕');
  }
}

/**
 * Create progress bar
 */
function createProgressBar(percentage, width = 40) {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  
  const filledBar = '█'.repeat(filled);
  const emptyBar = '░'.repeat(empty);
  
  // Color the progress bar based on completion
  let coloredBar;
  if (percentage === 100) {
    coloredBar = chalk.green(filledBar) + chalk.gray(emptyBar);
  } else if (percentage >= 50) {
    coloredBar = chalk.yellow(filledBar) + chalk.gray(emptyBar);
  } else {
    coloredBar = chalk.red(filledBar) + chalk.gray(emptyBar);
  }
  
  return `${coloredBar} ${percentage}%`;
}

/**
 * Create the main menu with completion status
 */
export function createMenu(selectedIndex, state) {
  const completedSections = state.completed || {};
  const completedCount = Object.values(completedSections).filter(Boolean).length;
  const totalSections = MENU_ITEMS.length;
  const percentage = Math.round((completedCount / totalSections) * 100);
  
  // Create progress section
  const progressSection = boxen(
    chalk.white.bold('Onboarding Progress') + '\n\n' +
    createProgressBar(percentage, 50) + '\n' +
    chalk.gray(`${completedCount} of ${totalSections} sections completed`),
    {
      padding: { top: 0, bottom: 0, left: 2, right: 2 },
      borderStyle: 'round',
      borderColor: percentage === 100 ? 'green' : percentage >= 50 ? 'yellow' : 'cyan',
      align: 'center'
    }
  );

  // Create menu items with status indicators and hotkeys
  const menuItems = MENU_ITEMS.map((item, index) => {
    const isSelected = index === selectedIndex;
    const isCompleted = completedSections[item.section] || false;
    const statusIndicator = getStatusIndicator(isCompleted, isSelected);
    
    // Create hotkey display
    const hotkeyDisplay = isSelected ? 
      chalk.yellow.bold(`[${item.key}]`) : 
      chalk.gray(`[${item.key}]`);
    
    let itemText = `${hotkeyDisplay} ${statusIndicator} ${item.label}`;
    
    if (isSelected) {
      // Highlight selected item
      itemText = chalk.white.bold(`▶ ${itemText}`);
      itemText = boxen(itemText, {
        padding: { top: 0, bottom: 0, left: 1, right: 1 },
        borderStyle: 'round',
        borderColor: isCompleted ? 'green' : 'cyan',
        backgroundColor: isCompleted ? undefined : '#001122'
      });
    } else {
      itemText = `  ${itemText}`;
      if (isCompleted) {
        itemText = chalk.dim(itemText);
      }
    }
    
    return itemText;
  }).join('\n\n');

  // Create the complete menu
  const menuBox = boxen(
    chalk.white.bold('Select a section to configure:') + '\n' +
    chalk.gray('Use ↑/↓ arrows to navigate, Enter to select, or press 1-6 for direct access') + '\n\n' +
    menuItems,
    {
      padding: { top: 1, bottom: 1, left: 2, right: 2 },
      borderStyle: 'double',
      borderColor: 'cyan',
      title: '📋 Task Master Onboarding',
      titleAlignment: 'center'
    }
  );

  return progressSection + '\n\n' + menuBox;
}

/**
 * Create completion summary
 */
export function createCompletionSummary(state) {
  const completedSections = state.completed || {};
  const sections = MENU_ITEMS.map(item => ({
    name: item.label,
    completed: completedSections[item.section] || false,
    key: item.key
  }));
  
  const completedCount = sections.filter(s => s.completed).length;
  const totalSections = sections.length;
  const percentage = Math.round((completedCount / totalSections) * 100);
  
  const sectionsList = sections.map(section => {
    const status = section.completed ? chalk.green('✅ Complete') : chalk.red('❌ Incomplete');
    const keyDisplay = chalk.gray(`[${section.key}]`);
    return `  ${keyDisplay} ${section.name}: ${status}`;
  }).join('\n');
  
  return boxen(
    chalk.white.bold('Onboarding Status Summary') + '\n\n' +
    createProgressBar(percentage, 50) + '\n\n' +
    sectionsList + '\n\n' +
    (percentage === 100 
      ? chalk.green.bold('🎉 Onboarding Complete! Ready to start using Task Master.')
      : chalk.yellow(`⏳ ${totalSections - completedCount} sections remaining to complete onboarding.`)
    ),
    {
      padding: 1,
      borderStyle: 'double',
      borderColor: percentage === 100 ? 'green' : 'yellow',
      title: '📊 Progress Report',
      titleAlignment: 'center'
    }
  );
}

/**
 * Animate menu transition (placeholder for future enhancement)
 */
export function animateMenuTransition() {
  // Could add transition animations here
  console.clear();
} 