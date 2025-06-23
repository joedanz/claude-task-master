import React from 'react';
import { Text, Box } from 'ink';

const InputField = ({ label, value = '', placeholder = '' }) => {
  return (
    <Box flexDirection="column">
      <Text>{label}: </Text>
      <Box borderStyle="single" paddingX={1}>
        <Text dimColor={!value}>
          {value || placeholder || 'Enter value...'}
        </Text>
      </Box>
    </Box>
  );
};

export default InputField; 