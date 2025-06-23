import React from 'react';
import { Box, Text } from 'ink';

const InfoBox = ({ children }) => {
  return (
    <Box borderStyle="round" padding={1} borderColor="cyan">
      <Text>{children}</Text>
    </Box>
  );
};

export default InfoBox; 