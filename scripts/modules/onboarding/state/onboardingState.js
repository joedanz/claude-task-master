/**
 * @file Defines the initial state structure for the onboarding flow.
 */

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