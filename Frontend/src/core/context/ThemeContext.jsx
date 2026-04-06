import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme || 'dark';
    }
    return 'dark';
  });

  // Apply theme via data-theme attribute on <html>
  // This drives all CSS custom properties in tokens.css
  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = document.documentElement;
    const body = document.body;

    // Set the data-theme attribute — this is the ONLY thing needed
    // All colors, backgrounds, etc. are handled by CSS custom properties
    root.setAttribute('data-theme', theme);

    // Maintain backward compatibility with existing components
    // that still use body.algo-dark/algo-light or root.dark
    root.classList.remove('dark');
    body.classList.remove('algo-light', 'algo-dark');

    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('algo-dark');
    } else {
      body.classList.add('algo-light');
    }

    // Remove inline background styles — now handled by tokens.css
    body.style.removeProperty('background');

    return () => {
      root.classList.remove('dark');
      body.classList.remove('algo-light', 'algo-dark');
    };
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
