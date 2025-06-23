import React from 'react';
import { Box, Text } from 'ink';

interface ProgressBarProps {
  steps: string[];
  currentStep: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep }) => {
  const percent = Math.round((currentStep / steps.length) * 100);
  const progressChars = '█'.repeat(Math.floor(currentStep / steps.length * 20));
  const remainingChars = '░'.repeat(20 - Math.floor(currentStep / steps.length * 20));
  
  return (
    <Box flexDirection="column">
      <Text>
        Progress: Step {currentStep + 1} of {steps.length} ({percent}%)
      </Text>
      <Text color="cyan">
        [{progressChars}{remainingChars}]
      </Text>
    </Box>
  );
};

export default ProgressBar; 