import React, { useState, useEffect } from 'react';
import { Text } from 'ink';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  const [frame, setFrame] = useState(0);
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame(prevFrame => (prevFrame + 1) % frames.length);
    }, 100);

    return () => clearInterval(timer);
  }, [frames.length]);

  return (
    <Text>
      <Text color="cyan">{frames[frame]}</Text> {text}
    </Text>
  );
};

export default LoadingSpinner; 