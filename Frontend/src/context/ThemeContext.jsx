import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Initialize from localStorage or default
    const [appearance, setAppearance] = useState(() => {
        const savedTheme = localStorage.getItem('theme') || 'latte';
        const savedDensity = localStorage.getItem('density') || 'comfortable';
        return { theme: savedTheme, density: savedDensity };
    });

    // Apply side effects whenever appearance changes
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', appearance.theme);
        document.documentElement.setAttribute('data-density', appearance.density);

        // Save to localStorage
        localStorage.setItem('theme', appearance.theme);
        localStorage.setItem('density', appearance.density);
    }, [appearance]);

    return (
        <ThemeContext.Provider value={{ appearance, setAppearance }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
