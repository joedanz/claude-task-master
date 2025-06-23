/**
 * @file Manages the persistence of the onboarding state.
 */
import Conf from 'conf';

// Initialize conf with a specific project name for onboarding
const config = new Conf({ projectName: 'task-master-onboarding' });

/**
 * Saves the current onboarding state.
 * @param {object} state - The onboarding state object.
 */
export const saveProgress = (state) => {
  config.set('onboardingState', state);
};

/**
 * Loads the saved onboarding state.
 * @returns {object | undefined} The saved state, or undefined if none exists.
 */
export const loadProgress = () => {
  return config.get('onboardingState');
};

/**
 * Clears any saved onboarding progress.
 */
export const clearProgress = () => {
  config.delete('onboardingState');
}; 