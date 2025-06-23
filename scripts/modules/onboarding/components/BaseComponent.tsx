import React from 'react';
import { Box, BoxProps } from 'ink';

interface BaseComponentProps extends BoxProps {
  children: React.ReactNode;
}

/**
 * A base component that provides common styling and layout properties.
 * Other components can extend this for consistency.
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Child elements to render.
 * @returns {React.ReactElement} A React element.
 */
const BaseComponent: React.FC<BaseComponentProps> = ({ children, ...props }) => {
  return (
    <Box flexDirection="column" {...props}>
      {children}
    </Box>
  );
};

export default BaseComponent; 