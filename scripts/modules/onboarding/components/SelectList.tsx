import React from 'react';
import { Text, Box } from 'ink';

const SelectList = ({ items = [], selectedIndex = 0 }) => {
  return (
    <Box flexDirection="column">
      {items.map((item, index) => (
        <Box key={index}>
          <Text color={index === selectedIndex ? 'cyan' : 'white'}>
            {index === selectedIndex ? '❯ ' : '  '}
            {typeof item === 'string' ? item : item.label || item.value}
          </Text>
        </Box>
      ))}
    </Box>
  );
};

export default SelectList; 