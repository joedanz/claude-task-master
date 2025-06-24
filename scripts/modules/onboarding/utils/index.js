/**
 * Utility functions for the onboarding module
 */

import chalk from 'chalk';
import gradient from 'gradient-string';

/**
 * Validate project name
 * @param {string} name - Project name to validate
 * @returns {boolean} - Whether the name is valid
 */
export function validateProjectName(name) {
    if (!name || name.trim().length === 0) {
        return 'Project name is required';
    }
    
    // Check for valid npm package name
    const validName = /^[a-z0-9-_]+$/;
    if (!validName.test(name)) {
        return 'Project name must contain only lowercase letters, numbers, hyphens, and underscores';
    }
    
    if (name.length > 214) {
        return 'Project name must be less than 214 characters';
    }
    
    return true;
}

/**
 * Validate version format
 * @param {string} version - Version string to validate
 * @returns {boolean|string} - True if valid, error message if not
 */
export function validateVersion(version) {
    if (!version) return true; // Optional
    
    const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
    
    if (!semverRegex.test(version)) {
        return 'Version must follow semantic versioning (e.g., 1.0.0, 2.1.0-beta.1)';
    }
    
    return true;
}

/**
 * Center text horizontally
 * @param {string} text - Text to center
 * @param {number} width - Total width
 * @returns {string} - Centered text
 */
export function centerText(text, width) {
    const termWidth = width || process.stdout.columns || 80;
    // Remove ANSI escape codes to get true text length
    const stripAnsi = (str) => str.replace(/\u001b\[[0-9;]*m/g, '');
    const textLength = stripAnsi(text).length;
    const padding = Math.max(0, Math.floor((termWidth - textLength) / 2));
    return ' '.repeat(padding) + text;
}

/**
 * Create a visual separator
 * @param {string} char - Character to use
 * @param {number} length - Length of separator
 * @param {string} style - Gradient style to apply
 * @returns {string} - Styled separator
 */
export function createSeparator(char = '═', length = 60, style = 'rainbow') {
    const separator = char.repeat(length);
    
    switch (style) {
        case 'rainbow':
            return gradient.rainbow(separator);
        case 'pastel':
            return gradient.pastel(separator);
        case 'cristal':
            return gradient.cristal(separator);
        case 'teen':
            return gradient.teen(separator);
        case 'mind':
            return gradient.mind(separator);
        case 'morning':
            return gradient.morning(separator);
        case 'vice':
            return gradient.vice(separator);
        default:
            return chalk.gray(separator);
    }
}

/**
 * Create a loading animation frame
 * @param {number} frame - Current frame number
 * @param {string} text - Text to display
 * @returns {string} - Animated text
 */
export function createLoadingFrame(frame, text) {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    const spinner = frames[frame % frames.length];
    return `${chalk.cyan(spinner)} ${text}`;
}

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size
 */
export function formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Create a stylized box around text
 * @param {string} text - Text to box
 * @param {object} options - Box options
 * @returns {string} - Boxed text
 */
export function createBox(text, options = {}) {
    const {
        padding = 1,
        borderStyle = 'single',
        borderColor = 'cyan',
        width = 0
    } = options;
    
    const borders = {
        single: {
            topLeft: '┌',
            topRight: '┐',
            bottomLeft: '└',
            bottomRight: '┘',
            horizontal: '─',
            vertical: '│'
        },
        double: {
            topLeft: '╔',
            topRight: '╗',
            bottomLeft: '╚',
            bottomRight: '╝',
            horizontal: '═',
            vertical: '║'
        },
        round: {
            topLeft: '╭',
            topRight: '╮',
            bottomLeft: '╰',
            bottomRight: '╯',
            horizontal: '─',
            vertical: '│'
        }
    };
    
    const border = borders[borderStyle] || borders.single;
    const lines = text.split('\n');
    const stripAnsi = (str) => str.replace(/\u001b\[[0-9;]*m/g, '');
    const maxLength = Math.max(width, ...lines.map(line => stripAnsi(line).length));
    const paddedWidth = maxLength + (padding * 2);
    
    const colorize = chalk[borderColor] || chalk.white;
    
    // Top border
    let result = colorize(border.topLeft + border.horizontal.repeat(paddedWidth) + border.topRight) + '\n';
    
    // Content with padding
    for (let i = 0; i < padding; i++) {
        result += colorize(border.vertical) + ' '.repeat(paddedWidth) + colorize(border.vertical) + '\n';
    }
    
    for (const line of lines) {
        const lineLength = stripAnsi(line).length;
        const rightPadding = paddedWidth - lineLength - padding;
        result += colorize(border.vertical) + ' '.repeat(padding) + line + ' '.repeat(rightPadding) + colorize(border.vertical) + '\n';
    }
    
    for (let i = 0; i < padding; i++) {
        result += colorize(border.vertical) + ' '.repeat(paddedWidth) + colorize(border.vertical) + '\n';
    }
    
    // Bottom border
    result += colorize(border.bottomLeft + border.horizontal.repeat(paddedWidth) + border.bottomRight);
    
    return result;
}

/**
 * Create an animated transition effect
 * @param {string} from - Starting text
 * @param {string} to - Ending text
 * @param {number} steps - Number of animation steps
 * @returns {Array<string>} - Array of animation frames
 */
export function createTransition(from, to, steps = 10) {
    const frames = [];
    
    for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const opacity = Math.round(255 * (1 - progress));
        const fromColor = chalk.rgb(opacity, opacity, opacity);
        const toOpacity = Math.round(255 * progress);
        const toColor = chalk.rgb(toOpacity, toOpacity, toOpacity);
        
        if (i < steps / 2) {
            frames.push(fromColor(from));
        } else {
            frames.push(toColor(to));
        }
    }
    
    return frames;
} 