/**
 * terminal-utils.js
 * Terminal-related utility functions for the Task Master CLI
 */

import { isCI } from 'ci-info';
import os from 'os';
import tty from 'tty';
import process from 'process';
import chalk from 'chalk';
import supportsColor from 'supports-color';
import gradient from 'gradient-string';
import Conf from 'conf';

/**
 * Detects the color support level of the terminal
 * @returns {number} Color level (0 = none, 1 = 16 colors, 2 = 256 colors, 3 = 16 million colors)
 */
function detectColorLevel() {
    if (process.env.FORCE_COLOR === '0' || process.env.NO_COLOR) {
        return 0; // Colors explicitly disabled
    }
    
    if (process.env.FORCE_COLOR === 'true' || process.env.FORCE_COLOR === '1') {
        return 1; // Basic color support forced
    }
    
    if (process.env.FORCE_COLOR === '2' || process.env.FORCE_COLOR === '3') {
        return parseInt(process.env.FORCE_COLOR, 10);
    }
    
    if (process.env.COLORTERM === 'truecolor' || process.env.COLORTERM === '24bit') {
        return 3; // 24-bit truecolor
    }
    
    if (process.env.TERM_PROGRAM === 'iTerm.app' || 
        process.env.TERM_PROGRAM === 'vscode' ||
        process.env.TERM_PROGRAM === 'Hyper' ||
        process.env.WT_SESSION) {
        return 3; // Modern terminals with truecolor support
    }
    
    if (process.env.TERM && (
        process.env.TERM.includes('256') || 
        process.env.TERM === 'xterm-256color' ||
        process.env.TERM === 'screen-256color' ||
        process.env.TERM === 'tmux-256color')) {
        return 2; // 256 colors
    }
    
    if (process.env.TERM && (
        process.env.TERM === 'xterm' ||
        process.env.TERM === 'screen' ||
        process.env.TERM === 'vt100' ||
        process.env.TERM === 'color' ||
        process.env.TERM === 'ansi' ||
        process.env.TERM === 'cygwin' ||
        process.env.TERM.startsWith('xterm-') ||
        process.env.TERM.startsWith('screen-') ||
        process.env.TERM.startsWith('vt') ||
        process.env.TERM.startsWith('rxvt') ||
        process.env.TERM.startsWith('linux'))) {
        return 1; // Basic 16 colors
    }
    
    // Default to no color support if we can't determine
    return 0;
}

/**
 * Checks if the current environment has UTF-8 encoding enabled
 * by examining LC_ALL, LC_CTYPE, and LANG environment variables
 * @returns {boolean} True if UTF-8 encoding is detected
 */
function hasUtf8Encoding() {
    // Check common environment variables for UTF-8 encoding
    const envVars = [
        process.env.LC_ALL,
        process.env.LC_CTYPE,
        process.env.LANG
    ];
    
    // Look for UTF-8 in the environment variables (case insensitive)
    return envVars.some(envVar => 
        envVar && (envVar.toLowerCase().includes('utf8') || envVar.toLowerCase().includes('utf-8'))
    );
}

/**
 * Checks if the terminal can render Unicode characters properly
 * @returns {boolean} True if Unicode rendering is supported
 */
function canRenderUnicode() {
    // If we're in a CI environment, assume Unicode support
    if (process.env.CI) {
        return true;
    }
    
    // Test basic Unicode character rendering
    try {
        // Test if we can print a basic Unicode character
        process.stdout.write('✓');
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Detects if the current environment is a TTY (interactive terminal)
 * @returns {Object} An object containing TTY detection results
 * @property {boolean} isTTY - True if the output is a TTY
 * @property {boolean} isCI - True if running in a CI environment
 * @property {boolean} isDumbTerm - True if the terminal is considered "dumb" (e.g., doesn't support colors)
 * @property {boolean|number} isColorSupported - False if no color support, otherwise the color level (1-3)
 * @property {number} colorLevel - Numeric color level (0-3)
 * @property {boolean} has16m - True if terminal supports 24-bit (16 million) colors
 * @property {boolean} has256 - True if terminal supports 256 colors
 * @property {boolean} hasBasic - True if terminal supports basic 16 colors
 * @property {boolean} isUnicodeSupported - True if the terminal supports Unicode
 * @property {boolean} hasUtf8 - True if UTF-8 encoding is detected
 * @property {boolean} canRenderUnicode - True if terminal can render Unicode characters
 * @property {string} encoding - Detected character encoding
 * @property {string} term - The TERM environment variable value
 * @property {string} termProgram - The TERM_PROGRAM environment variable value if available
 */
function detectTerminalCapabilities() {
    // Check if we're running in a CI environment
    const ci = isCI;
    
    // Check if we're in a TTY environment
    const isTty = process.stdout.isTTY === true;
    
    // Check for dumb terminal (e.g., doesn't support colors, formatting)
    const isDumb = process.env.TERM === 'dumb' || !isTty;
    
    // Detect color support level (0 = none, 1 = 16 colors, 2 = 256 colors, 3 = 16M colors)
    const colorLevel = detectColorLevel();
    const hasBasic = colorLevel >= 1;
    const has256 = colorLevel >= 2;
    const has16m = colorLevel >= 3;
    
    // Check for UTF-8 encoding in environment variables
    const hasUtf8 = hasUtf8Encoding();
    
    // Check if we can actually render Unicode characters
    const canRender = canRenderUnicode();
    
    // Determine Unicode support
    const isUnicodeSupported = hasUtf8 && canRender && (
        // If we're not on a known platform, assume Unicode support
        !process.platform || 
        // Check for modern terminals that support Unicode
        process.env.TERM === 'xterm-256color' ||
        process.env.TERM === 'alacritty' ||
        process.env.TERM === 'xterm-kitty' ||
        process.env.TERM === 'wezterm' ||
        process.env.TERM === 'tmux-256color' ||
        process.env.TERM === 'screen-256color' ||
        // Check for known terminal emulators
        process.env.TERM_PROGRAM === 'vscode' ||
        process.env.TERM_PROGRAM === 'iTerm.app' ||
        process.env.TERM_PROGRAM === 'Hyper' ||
        process.env.WT_SESSION || // Windows Terminal
        // Check for Node.js environments that support Unicode
        process.versions?.node
    );
    
    // Determine character encoding
    const encoding = hasUtf8 ? 'UTF-8' : process.env.LANG?.split('.')[1] || 'unknown';

    return {
        // Basic terminal info
        isTTY: isTty,
        isCI: ci,
        isDumbTerm: isDumb,
        term: process.env.TERM || '',
        termProgram: process.env.TERM_PROGRAM || '',
        
        // Color support
        isColorSupported: colorLevel > 0 ? colorLevel : false,
        colorLevel,
        hasBasic,
        has256,
        has16m,
        
        // Unicode and encoding support
        isUnicodeSupported,
        hasUtf8,
        canRenderUnicode: canRender,
        encoding,
        
        // Platform info
        platform: process.platform,
        arch: process.arch,
        
        // Terminal dimensions if available
        rows: process.stdout.rows,
        columns: process.stdout.columns,
        
        // Environment info
        isWindows: process.platform === 'win32',
        isMacOS: process.platform === 'darwin',
        isLinux: process.platform === 'linux'
    };
}

/**
 * Gets the recommended output format based on terminal capabilities
 * @returns {string} The recommended output format ('rich', 'basic', 'plain')
 */
function getRecommendedOutputFormat() {
    const { isTTY, isDumbTerm, isColorSupported } = detectTerminalCapabilities();
    
    if (!isTTY || isDumbTerm) {
        return 'plain'; // Fall back to plain text for non-TTY or dumb terminals
    }
    
    // Check for rich terminal support (colors, unicode, etc.)
    const { isUnicodeSupported, has256 } = detectTerminalCapabilities();
    
    if (isColorSupported >= 2 && isUnicodeSupported && has256) {
        return 'rich'; // Full rich terminal support with 256+ colors
    }
    
    if (isColorSupported) {
        return 'basic'; // Basic color support
    }
    
    return 'plain'; // No color support
}

/**
 * Gets a color function appropriate for the terminal's color support level
 * @param {Object} chalkInstance - Chalk instance to use
 * @param {string} color - Color name or code
 * @param {string} [fallbackColor] - Fallback color if the primary isn't supported
 * @returns {Function} A chalk color function
 */
function getColorFunction(chalkInstance, color, fallbackColor) {
    const { has16m, has256 } = detectTerminalCapabilities();
    
    // If no color support, return a pass-through function
    if (!chalkInstance.supportsColor || chalkInstance.supportsColor.level === 0) {
        return (text) => text;
    }
    
    // Try to use the requested color
    if (chalkInstance[color]) {
        return chalkInstance[color];
    }
    
    // Try hex/rgb if supported
    if (has16m && /^#?[0-9A-F]{6}$/i.test(color)) {
        return chalkInstance.hex(color);
    }
    
    // Try fallback color if provided
    if (fallbackColor && chalkInstance[fallbackColor]) {
        return chalkInstance[fallbackColor];
    }
    
    // Fall back to no styling
    return (text) => text;
}

/**
 * Gets an appropriate color for a status based on terminal capabilities
 * @param {string} status - Status string (e.g., 'success', 'error', 'warning', 'info')
 * @returns {Function} A chalk color function
 */
function getStatusColor(status) {
    const { has16m, has256 } = detectTerminalCapabilities();
    
    // If no color support, return a pass-through function
    if (!chalk.supportsColor || chalk.supportsColor.level === 0) {
        return (text) => text;
    }
    
    // Define status colors with fallbacks for different color depths
    const statusColors = {
        success: has16m ? '#2ecc71' : has256 ? 'green' : 'green',
        error: has16m ? '#e74c3c' : has256 ? 'red' : 'red',
        warning: has16m ? '#f39c12' : has256 ? 'yellow' : 'yellow',
        info: has16m ? '#3498db' : has256 ? 'blue' : 'blue',
        debug: has16m ? '#9b59b6' : has256 ? 'magenta' : 'magenta'
    };
    
    const color = statusColors[status.toLowerCase()] || 'gray';
    return typeof color === 'string' ? chalk.hex(color) : color;
}

// Cache the terminal capabilities
let terminalCapabilities = null;

/**
 * Gets the terminal capabilities (cached)
 * @returns {Object} Terminal capabilities object with additional format property
 */
function getTerminalCapabilities() {
    if (!terminalCapabilities) {
        const caps = detectTerminalCapabilities();
        const format = getRecommendedOutputFormat();
        terminalCapabilities = {
            ...caps,
            format,
            // Add more terminal capabilities as needed
        };
    }
    return { ...terminalCapabilities }; // Return a copy to prevent modification
}

/**
 * Forces a refresh of the terminal capabilities
 * Useful if terminal environment changes during runtime
 */
function refreshTerminalCapabilities() {
    terminalCapabilities = null; // Reset cache
    return getTerminalCapabilities();
}

// Configuration for Ink UI preferences
const config = new Conf({
    projectName: 'task-master',
    defaults: {
        inkUI: {
            enabled: true,  // Enable by default if supported
            force: false   // Force enable even if not fully supported
        }
    }
});

/**
 * Checks if the current terminal supports Ink UI
 * @returns {Object} Object with support details and a boolean indicating if Ink is supported
 */
function supportsInk() {
    const caps = getTerminalCapabilities();
    
    // Basic requirements for Ink
    const hasBasicRequirements = caps.isTTY && 
                              !caps.isDumbTerm && 
                              caps.isColorSupported && 
                              caps.isUnicodeSupported;
    
    // Check if user has forced Ink UI
    const userForced = config.get('inkUI.force', false);
    
    // Check if user has explicitly disabled Ink UI
    const userDisabled = config.get('inkUI.enabled', true) === false;
    
    // Determine if Ink is supported
    const isSupported = userForced || (hasBasicRequirements && !userDisabled);
    
    return {
        supported: isSupported,
        forced: userForced,
        disabled: userDisabled,
        requirements: {
            isTTY: caps.isTTY,
            isDumbTerm: caps.isDumbTerm,
            hasColor: caps.isColorSupported,
            hasUnicode: caps.isUnicodeSupported,
            meetsRequirements: hasBasicRequirements
        },
        // Include the full capabilities for reference
        capabilities: caps
    };
}

/**
 * Toggles Ink UI support on or off
 * @param {boolean} [enabled] - Optional. Set to true to enable, false to disable, or omit to toggle
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.force] - Force enable Ink UI even if requirements aren't met
 * @returns {Object} The new Ink support status
 */
function useInkUI(enabled, { force = false } = {}) {
    const currentStatus = supportsInk();
    
    // Toggle if no specific value provided
    if (enabled === undefined) {
        enabled = !config.get('inkUI.enabled', true);
    }
    
    // Update configuration
    config.set('inkUI.enabled', enabled);
    config.set('inkUI.force', force);
    
    // Get new status
    const newStatus = supportsInk();
    
    // Log the change
    if (newStatus.supported !== currentStatus.supported) {
        console.log(chalk`{bold ${newStatus.supported ? 'Enabled' : 'Disabled'}} Ink UI support`);
    }
    
    return newStatus;
}

/**
 * Gets the current Ink UI configuration
 * @returns {Object} The current Ink UI configuration
 */
function getInkUIConfig() {
    return {
        enabled: config.get('inkUI.enabled', true),
        force: config.get('inkUI.force', false)
    };
}

export {
    detectTerminalCapabilities,
    getRecommendedOutputFormat,
    getTerminalCapabilities,
    refreshTerminalCapabilities,
    getStatusColor,
    supportsInk,
    useInkUI,
    getInkUIConfig
};
