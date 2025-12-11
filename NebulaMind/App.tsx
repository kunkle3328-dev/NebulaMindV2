/**
 * Minimal app context used by some components.  The real NebulaMind app
 * defines a broader context including themes and job management.  In
 * this simplified environment we provide only a `useTheme` hook that
 * returns a static palette.  Components that import useTheme will not
 * break when the full context is absent.
 */
import React from 'react';

export const useTheme = () => {
  return {
    theme: {
      colors: {
        primary: 'indigo',
      },
    },
  };
};

// Placeholder component exports to satisfy React Router imports in other
// modules.  The real application would define routing and global state here.
const App: React.FC = () => {
  return <div>Placeholder App</div>;
};

export default App;