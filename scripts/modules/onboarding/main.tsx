#!/usr/bin/env tsx

import React, { useState, useEffect } from 'react';
import { render, Text, Box, useInput, useApp } from 'ink';
import BaseComponent from './components/BaseComponent.tsx';
import InfoBox from './components/InfoBox.tsx';
import LoadingSpinner from './components/LoadingSpinner.tsx';
import ProgressBar from './components/ProgressBar.tsx';
import { initialOnboardingState } from './state/onboardingState.js';

const OnboardingApp = () => {
  const [state, setState] = useState(initialOnboardingState);
  const { exit } = useApp();

  useInput((input, key) => {
    if (key.escape || (key.ctrl && input === 'c')) {
      exit();
    }
  });

  const currentStepName = state.steps[state.currentStep];

  const renderWelcomeStep = () => (
    <BaseComponent>
      <Text bold color="cyan">🎨 Welcome to Task Master!</Text>
      <Text> </Text>
      <InfoBox>
        Task Master helps you manage development tasks with AI-powered assistance.
        Let's get you set up with an interactive onboarding experience.
      </InfoBox>
      <Text> </Text>
      <Text dimColor>Press any key to continue, or Esc to exit...</Text>
    </BaseComponent>
  );

  const renderProjectConfigStep = () => (
    <BaseComponent>
      <Text bold color="yellow">📋 Project Configuration</Text>
      <Text> </Text>
      <InfoBox>
        We'll help you configure your project settings, including name, 
        description, and initial version.
      </InfoBox>
      <Text> </Text>
      <Text dimColor>This step will be interactive in the next version...</Text>
    </BaseComponent>
  );

  const renderModelSelectionStep = () => (
    <BaseComponent>
      <Text bold color="green">🤖 AI Model Selection</Text>
      <Text> </Text>
      <InfoBox>
        Choose your preferred AI models for different tasks:
        - Main model for task generation
        - Research model for enhanced analysis
        - Fallback model for reliability
      </InfoBox>
      <Text> </Text>
      <Text dimColor>Model selection interface coming soon...</Text>
    </BaseComponent>
  );

  const renderCompletionStep = () => (
    <BaseComponent>
      <Text bold color="magenta">🎉 Setup Complete!</Text>
      <Text> </Text>
      <InfoBox>
        Your Task Master environment is ready! You can now:
        - Create tasks with 'task-master add-task'
        - View tasks with 'task-master list'
        - Get the next task with 'task-master next'
      </InfoBox>
      <Text> </Text>
      <Text color="green">Press any key to exit and start using Task Master!</Text>
    </BaseComponent>
  );

  const renderCurrentStep = () => {
    switch (currentStepName) {
      case 'welcome':
        return renderWelcomeStep();
      case 'projectConfig':
        return renderProjectConfigStep();
      case 'modelSelection':
        return renderModelSelectionStep();
      case 'completion':
        return renderCompletionStep();
      default:
        return (
          <BaseComponent>
            <Text color="red">Unknown step: {currentStepName}</Text>
          </BaseComponent>
        );
    }
  };

  // Auto-advance through steps for demo (in real version, this would be user-driven)
  useEffect(() => {
    if (state.currentStep < state.steps.length - 1) {
      const timer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          currentStep: prev.currentStep + 1
        }));
      }, 3000); // 3 seconds per step for demo

      return () => clearTimeout(timer);
    }
  }, [state.currentStep, state.steps.length]);

  return (
    <BaseComponent>
      <ProgressBar steps={state.steps} currentStep={state.currentStep} />
      <Text> </Text>
      {renderCurrentStep()}
      {state.currentStep < state.steps.length - 1 && (
        <>
          <Text> </Text>
          <LoadingSpinner text="Moving to next step..." />
        </>
      )}
    </BaseComponent>
  );
};

// Only render if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  render(<OnboardingApp />);
}

export default OnboardingApp; 