#!/usr/bin/env node

import { 
    getTerminalCapabilities, 
    getStatusColor, 
    supportsInk, 
    useInkUI, 
    getInkUIConfig 
} from './modules/utils/terminal-utils.js';
import gradient from 'gradient-string';
import chalk from 'chalk';

// Get terminal capabilities
const caps = getTerminalCapabilities();

// Display terminal capabilities with colors
const status = (condition, text) => 
    condition ? `✅ ${text}` : `❌ ${text}`;

console.log(chalk.bold('=== Terminal Capabilities ==='));
console.log(`Platform: ${caps.platform} (${caps.arch})`);
console.log(`TTY: ${status(caps.isTTY, 'Interactive terminal')}`);
console.log(`CI Environment: ${status(caps.isCI, 'Running in CI')}`);
console.log(`Dumb Terminal: ${status(caps.isDumbTerm, 'Dumb terminal')}`);

// Color support details
console.log('\n' + chalk.bold('=== Color Support ==='));
console.log(`Level: ${caps.colorLevel} (${getColorLevelName(caps.colorLevel)})`);
console.log(`Basic (16 colors): ${status(caps.hasBasic, 'Supported')}`);
console.log(`256 colors: ${status(caps.has256, 'Supported')}`);
console.log(`16M colors (truecolor): ${status(caps.has16m, 'Supported')}`);

// Terminal info
console.log('\n' + chalk.bold('=== Terminal Info ==='));
console.log(`TERM: ${caps.term || 'Not set'}`);
console.log(`Terminal Program: ${caps.termProgram || 'Unknown'}`);
console.log(`Terminal Size: ${caps.columns}x${caps.rows}`);
console.log(`Unicode: ${status(caps.isUnicodeSupported, 'Unicode supported')}`);
console.log(`Recommended Format: ${chalk.bold(caps.format)}`);

// Test color output with different levels
console.log('\n' + chalk.bold('=== Color Level Tests ==='));
if (caps.hasBasic) {
    console.log('\n' + chalk.bold('16 Colors:'));
    console.log('  ' + [
        chalk.black('black'),
        chalk.red('red'),
        chalk.green('green'),
        chalk.yellow('yellow'),
        chalk.blue('blue'),
        chalk.magenta('magenta'),
        chalk.cyan('cyan'),
        chalk.white('white'),
        chalk.gray('gray')
    ].join(' '));
}

if (caps.has256) {
    console.log('\n' + chalk.bold('256 Colors:'));
    let colors256 = '';
    for (let i = 0; i < 16; i++) {
        colors256 += chalk.bgAnsi256(i)('  ') + ' ';
    }
    console.log('  ' + colors256);
}

if (caps.has16m) {
    console.log('\n' + chalk.bold('Truecolor (16M Colors):'));
    const truecolorGradient = gradient(['#ff0000', '#00ff00', '#0000ff']);
    console.log('  ' + truecolorGradient('This is a truecolor gradient'));
}

// Test status colors
console.log('\n' + chalk.bold('=== Status Colors ==='));
const statuses = ['success', 'error', 'warning', 'info', 'debug'];
statuses.forEach(status => {
    const colorFn = getStatusColor(status);
    console.log(`  ${status.padEnd(8)}: ${colorFn('Sample text')}`);
});

// Test Unicode support
console.log('\n' + chalk.bold('=== Unicode Support ==='));
console.log(`  UTF-8 Encoding: ${caps.hasUtf8 ? '✅' : '❌'} ${caps.encoding}`);
console.log(`  Can Render Unicode: ${caps.canRenderUnicode ? '✅' : '❌'}`);
console.log(`  Unicode Supported: ${caps.isUnicodeSupported ? '✅' : '❌'}`);

// Test various Unicode characters if supported
if (caps.isUnicodeSupported) {
    console.log('\n' + chalk.bold('  Unicode Character Test:'));
    console.log('  ' + '✓ Check mark');
    console.log('  ' + '→ Arrow');
    console.log('  ' + '★ Star');
    console.log('  ' + '☀ Sun');
    console.log('  ' + '🌍 Globe');
    console.log('  ' + '😊 Smiley');
    
    // Test box-drawing characters
    console.log('\n' + chalk.bold('  Box Drawing Test:'));
    console.log('  ' + '┌───────┐');
    console.log('  ' + '│ Hello │');
    console.log('  ' + '└───────┘');
    
    // Test right-to-left text
    console.log('\n' + chalk.bold('  RTL Test:'));
    console.log('  ' + 'مرحبا بالعالم (Hello in Arabic)');
    console.log('  ' + 'こんにちは世界 (Hello in Japanese)');
    console.log('  ' + '안녕하세요 (Hello in Korean)');
} else {
    console.log('\n  Unicode characters not supported in this terminal');
}

// Test gradient with terminal capabilities
console.log('\n' + chalk.bold('=== Gradient Test ==='));
const gradients = {
    'Cool': ['#00b4d8', '#0077b6', '#03045e'],
    'Warm': ['#fb8b24', '#e36414', '#9a031e'],
    'Rainbow': ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3']
};

Object.entries(gradients).forEach(([name, colors]) => {
    if (!caps.hasBasic) {
        console.log(`  ${name}: Gradients not supported`);
        return;
    }
    
    const g = gradient(colors);
    console.log(`  ${name}: ${g(`[${colors.join(' → ')}]`)}`);
});

function getColorLevelName(level) {
    const names = {
        0: 'No color',
        1: '16 colors',
        2: '256 colors',
        3: '16M colors (truecolor)'
    };
    return names[level] || 'Unknown';
}

// Test Ink UI support
console.log('\n' + chalk.bold('=== Ink UI Support ==='));
const inkStatus = supportsInk();
const inkConfig = getInkUIConfig();

console.log('  Ink UI Supported: ' + (inkStatus.supported ? '✅' : '❌'));
console.log('  Current Config:', {
    enabled: inkConfig.enabled ? '✅' : '❌',
    forced: inkConfig.force ? '✅' : '❌'
});

console.log('\n' + chalk.bold('  Requirements:'));
console.log('  - TTY: ' + (inkStatus.requirements.isTTY ? '✅' : '❌'));
console.log('  - Not Dumb Terminal: ' + (!inkStatus.requirements.isDumbTerm ? '✅' : '❌'));
console.log('  - Color Support: ' + (inkStatus.requirements.hasColor ? '✅' : '❌'));
console.log('  - Unicode Support: ' + (inkStatus.requirements.hasUnicode ? '✅' : '❌'));
console.log('  - All Requirements Met: ' + (inkStatus.requirements.meetsRequirements ? '✅' : '❌'));

// Test toggling Ink UI
console.log('\n' + chalk.bold('  Testing Ink UI Toggle:'));

// Save original state
const originalEnabled = inkConfig.enabled;
const originalForced = inkConfig.force;

// Toggle Ink UI
console.log('  Toggling Ink UI...');
const newStatus = useInkUI();
console.log(`  Ink UI is now ${newStatus.supported ? 'enabled' : 'disabled'}`);

// Toggle back to original state
console.log('  Restoring original state...');
useInkUI(originalEnabled, { force: originalForced });
console.log(`  Ink UI is now ${supportsInk().supported ? 'enabled' : 'disabled'}`);

// Test force mode
console.log('\n' + chalk.bold('  Testing Force Mode:'));
const forceStatus = useInkUI(true, { force: true });
console.log('  Force enabled - Supported:', forceStatus.supported, 'Forced:', forceStatus.forced);

// Restore original state
useInkUI(originalEnabled, { force: originalForced });
