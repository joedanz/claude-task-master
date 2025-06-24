/**
 * @file InkAdapter.js - Bridge layer between classic CLI init and enhanced Ink-based UI
 * 
 * This adapter implements the Hexagonal Architecture pattern, acting as a bridge
 * between CLI commands and UI flows while maintaining backward compatibility.
 */

import { execSync } from 'child_process';
import path from 'path';

/**
 * InkAdapter - Bridge layer for routing between classic and enhanced initialization flows
 * 
 * This class provides static methods to:
 * - Detect appropriate flow type based on CLI flags and terminal capabilities
 * - Route execution to either classic or enhanced initialization
 * - Convert results between different flow formats for compatibility
 */
class InkAdapter {
  /**
   * Main entry point for enhanced initialization flow
   * Routes to appropriate flow based on detection logic
   * 
   * @param {Object} options - CLI options and flags
   * @param {boolean} options.classic - Force classic flow
   * @param {boolean} options.yes - Skip prompts and use defaults
   * @param {string} options.name - Project name
   * @param {boolean} options.skipInstall - Skip dependency installation
   * @param {boolean} options.addAliases - Add shell aliases
   * @param {string} options.projectRoot - Project root directory
   * @returns {Promise<Object>} Initialization result
   */
  static async runEnhancedInit(options = {}) {
    try {
      // Validate input options
      const normalizedOptions = this._normalizeOptions(options);
      
      // Detect which flow to use
      const flowType = this.detectFlowType(normalizedOptions);
      
      console.log(`🎨 Task Master Init - Using ${flowType} flow`);
      
      // Route to appropriate flow
      if (flowType === 'classic') {
        return await this._runLegacyInit(normalizedOptions);
      } else {
        return await this._runInkUIInit(normalizedOptions);
      }
    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      throw new Error(`InkAdapter initialization failed: ${error.message}`);
    }
  }

  /**
   * Detects which flow type to use based on CLI flags and terminal capabilities
   * 
   * @param {Object} options - Normalized CLI options
   * @returns {string} Flow type: 'classic' or 'enhanced'
   */
  static detectFlowType(options) {
    // Force classic flow if explicitly requested
    if (options.classic) {
      return 'classic';
    }

    // Check terminal capabilities
    if (!this._supportsInkUI()) {
      return 'classic';
    }

    // Check for non-interactive mode
    if (options.yes || !process.stdin.isTTY) {
      return 'classic';
    }

    // Default to enhanced flow if all checks pass
    return 'enhanced';
  }

  /**
   * Converts results from enhanced flow to legacy format for backward compatibility
   * 
   * @param {Object} result - Result from enhanced flow
   * @returns {Object} Result in legacy format
   */
  static convertToLegacyFormat(result) {
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid result object provided for conversion');
    }

    // Map enhanced result format to legacy format
    const legacyResult = {
      success: result.success !== false,
      projectName: result.projectDetails?.name || result.projectName || 'task-master-project',
      projectPath: result.projectPath || process.cwd(),
      configCreated: result.configCreated !== false,
      tasksCreated: result.tasksCreated !== false,
      gitInitialized: result.gitInitialized !== false,
      aliasesAdded: result.aliasesAdded !== false,
      message: result.message || 'Project initialized successfully'
    };

    // Include any additional properties from the original result
    Object.keys(result).forEach(key => {
      if (!legacyResult.hasOwnProperty(key)) {
        legacyResult[key] = result[key];
      }
    });

    return legacyResult;
  }

  /**
   * Normalizes and validates CLI options
   * 
   * @private
   * @param {Object} options - Raw CLI options
   * @returns {Object} Normalized options
   */
  static _normalizeOptions(options) {
    const normalized = {
      classic: Boolean(options.classic),
      yes: Boolean(options.yes),
      name: options.name || options.projectName || '',
      description: options.description || '',
      version: options.version || '0.1.0',
      author: options.author || '',
      skipInstall: Boolean(options.skipInstall),
      addAliases: Boolean(options.addAliases),
      projectRoot: options.projectRoot || process.cwd(),
      // Add any additional options
      ...options
    };

    return normalized;
  }

  /**
   * Checks if the current terminal supports Ink UI
   * 
   * @private
   * @returns {boolean} True if Ink UI is supported
   */
  static _supportsInkUI() {
    // TEMPORARY: Disable enhanced Ink UI flow until components are properly implemented
    // The original Ink components were removed due to JSX syntax errors in Node.js
    // This forces the classic flow to be used for now
    return false;
    
    /* Original implementation - restore when Ink components are fixed:
    try {
      // Check if we're in a TTY (interactive terminal)
      if (!process.stdout.isTTY) {
        return false;
      }

      // Check for CI environments where Ink UI should be disabled
      if (process.env.CI || process.env.CONTINUOUS_INTEGRATION) {
        return false;
      }

      // Check if terminal supports colors
      if (!this._supportsColor()) {
        return false;
      }

      // Check if React and Ink are available
      try {
        require.resolve('react');
        require.resolve('ink');
        return true;
      } catch (error) {
        return false;
      }
    } catch (error) {
      return false;
    }
    */
  }

  /**
   * Checks if the terminal supports colors
   * 
   * @private
   * @returns {boolean} True if colors are supported
   */
  static _supportsColor() {
    // Check common color support indicators
    if (process.env.FORCE_COLOR) {
      return true;
    }

    if (process.env.NO_COLOR || process.env.NODE_DISABLE_COLORS) {
      return false;
    }

    // Check TERM environment variable
    const term = process.env.TERM;
    if (term && (term.includes('color') || term.includes('256') || term === 'xterm-256color')) {
      return true;
    }

    return false;
  }

  /**
   * Runs the legacy initialization flow
   * 
   * @private
   * @param {Object} options - Normalized options
   * @returns {Promise<Object>} Legacy initialization result
   */
  static async _runLegacyInit(options) {
    try {
      // Import the existing init logic
      const { initializeProject } = await import('../../init.js');
      
      // Call legacy initialization with options
      const result = await initializeProject(options);
      
      return {
        success: true,
        flowType: 'classic',
        ...result
      };
    } catch (error) {
      throw new Error(`Legacy initialization failed: ${error.message}`);
    }
  }

  /**
   * Runs the enhanced Ink UI initialization flow
   * 
   * @private
   * @param {Object} options - Normalized options
   * @returns {Promise<Object>} Enhanced initialization result
   */
  static async _runInkUIInit(options) {
    try {
      // This will be implemented when we integrate with the onboarding UI
      // For now, return a placeholder result
      return {
        success: true,
        flowType: 'enhanced',
        message: 'Enhanced Ink UI initialization (placeholder)',
        projectDetails: {
          name: options.name || 'task-master-project',
          description: options.description || '',
          version: options.version || '0.1.0'
        },
        projectPath: options.projectRoot,
        configCreated: true,
        tasksCreated: true,
        gitInitialized: true,
        aliasesAdded: options.addAliases
      };
    } catch (error) {
      throw new Error(`Enhanced UI initialization failed: ${error.message}`);
    }
  }
}

export default InkAdapter; 