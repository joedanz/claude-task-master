/**
 * @file Defines the initial state structure for the onboarding flow.
 */

/**
 * Onboarding state management with persistence
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// State file location
const STATE_FILE = '.taskmaster/onboarding-state.json';

// State schema with versioning
const SCHEMA_VERSION = '1.0.0';

// Default state structure
const defaultState = {
    version: SCHEMA_VERSION,
    currentSection: 0,
    totalSections: 6,
    sections: {
        'project-info': { completed: false, data: {} },
        'ai-provider': { completed: false, data: {} },
        'api-keys': { completed: false, data: {} },
        'features': { completed: false, data: {} },
        'rules': { completed: false, data: {} },
        'review-execute': { completed: false, data: {} }
    },
    executionPlan: [],
    completed: {
        projectInfo: false,
        aiProvider: false,
        apiKeys: false,
        features: false,
        rules: false,
        review: false
    },
    answers: {
        projectInfo: {
            name: '',
            description: '',
            version: '0.1.0',
            author: ''
        },
        aiProvider: {
            provider: null,
            mainModel: null,
            researchModel: null,
            fallbackModel: null
        },
        apiKeys: {
            configured: false,
            validated: false,
            keyValue: null // Store encrypted later
        },
        features: {
            dependencies: true,
            reporting: true,
            aiSuggestions: false,
            collaboration: false
        },
        rules: {
            profiles: [],
            setupAnswers: null // Store answers from rules --setup
        }
    },
    startedAt: null,
    lastUpdatedAt: null,
    completedAt: null
};

// In-memory state
let currentState = null;

/**
 * Get the state file path
 */
async function getStateFilePath() {
    // Try to find project root by looking for package.json
    let currentDir = process.cwd();
    let foundRoot = false;
    
    while (currentDir !== path.dirname(currentDir)) {
        try {
            await fs.access(path.join(currentDir, 'package.json'));
            foundRoot = true;
            break;
        } catch {
            currentDir = path.dirname(currentDir);
        }
    }
    
    if (!foundRoot) {
        currentDir = process.cwd();
    }
    
    return path.join(currentDir, STATE_FILE);
}

/**
 * Load state from disk
 */
export async function loadState() {
    try {
        const statePath = await getStateFilePath();
        const data = await fs.readFile(statePath, 'utf8');
        const savedState = JSON.parse(data);
        
        // Check version compatibility
        if (savedState.version === SCHEMA_VERSION) {
            currentState = { ...defaultState, ...savedState };
        } else {
            // Handle migration if needed in the future
            console.warn('State version mismatch, using defaults');
            currentState = { ...defaultState };
        }
    } catch (error) {
        // File doesn't exist or is invalid, use defaults
        currentState = { ...defaultState };
    }
    
    return currentState;
}

/**
 * Save state to disk
 */
export async function saveState() {
    try {
        const statePath = await getStateFilePath();
        const stateDir = path.dirname(statePath);
        
        // Ensure directory exists
        await fs.mkdir(stateDir, { recursive: true });
        
        // Update timestamp
        currentState.lastUpdatedAt = new Date().toISOString();
        
        // Write state
        await fs.writeFile(
            statePath,
            JSON.stringify(currentState, null, 2),
            'utf8'
        );
        
        return true;
    } catch (error) {
        console.error('Failed to save onboarding state:', error.message);
        return false;
    }
}

/**
 * Get current state
 */
export function getState() {
    return { ...currentState };
}

/**
 * Update section completion
 */
export function completeSection(sectionKey) {
    if (sectionKey in currentState.completed) {
        currentState.completed[sectionKey] = true;
        
        // Check if all sections are complete
        const allComplete = Object.values(currentState.completed).every(v => v);
        if (allComplete && !currentState.completedAt) {
            currentState.completedAt = new Date().toISOString();
        }
        
        return saveState();
    }
    return Promise.resolve(false);
}

/**
 * Update section answers
 */
export function updateSectionAnswers(sectionKey, answers) {
    if (sectionKey in currentState.answers) {
        currentState.answers[sectionKey] = {
            ...currentState.answers[sectionKey],
            ...answers
        };
        return saveState();
    }
    return Promise.resolve(false);
}

/**
 * Set current section
 */
export function setCurrentSection(sectionIndex) {
    currentState.currentSection = sectionIndex;
    return saveState();
}

/**
 * Get completion percentage
 */
export function getCompletionPercentage() {
    const completed = Object.values(currentState.completed).filter(v => v).length;
    return Math.round((completed / currentState.totalSections) * 100);
}

/**
 * Get completed sections count
 */
export function getCompletedCount() {
    return Object.values(currentState.completed).filter(v => v).length;
}

/**
 * Check if onboarding is complete
 */
export function isOnboardingComplete() {
    return currentState.completedAt !== null;
}

/**
 * Reset onboarding state
 */
export async function resetState() {
    currentState = { ...defaultState };
    currentState.startedAt = new Date().toISOString();
    return saveState();
}

/**
 * Initialize onboarding (start or resume)
 */
export async function initializeOnboarding() {
    await loadState();
    
    // If not started yet, set start time
    if (!currentState.startedAt) {
        currentState.startedAt = new Date().toISOString();
        await saveState();
    }
    
    return currentState;
}

// Export section keys for easy reference
export const SECTIONS = {
    PROJECT_INFO: 'projectInfo',
    AI_PROVIDER: 'aiProvider',
    API_KEYS: 'apiKeys',
    FEATURES: 'features',
    RULES: 'rules'
};

/**
 * Update execution plan
 */
export function updateExecutionPlan(steps) {
    currentState.executionPlan.steps = steps;
    currentState.executionPlan.ready = steps.length > 0;
    return saveState();
}

/**
 * Get execution plan
 */
export function getExecutionPlan() {
    return currentState.executionPlan;
}

/**
 * Clear execution plan
 */
export function clearExecutionPlan() {
    currentState.executionPlan = {
        ready: false,
        steps: []
    };
    return saveState();
}

export const initialOnboardingState = {
  currentStep: 0,
  steps: [
    'welcome',
    'projectConfig',
    'modelSelection',
    'completion',
  ],
  projectDetails: {
    name: '',
    description: '',
    version: '0.1.0',
    author: '',
  },
  selectedModels: {
    main: null,
    research: null,
    fallback: null,
  },
  validation: {
    projectName: null,
    version: null,
  },
  error: null,
  isComplete: false,
  canProceed: false,
};

/**
 * Get the current onboarding state
 * @returns {Object} Current state
 */
export function getOnboardingState() {
    if (!currentState) {
        currentState = { ...defaultState };
    }
    return currentState;
}

/**
 * Update the onboarding state
 * @param {Object} newState - New state to merge
 */
export function updateOnboardingState(newState) {
    currentState = { ...currentState, ...newState };
    return saveState();
} 