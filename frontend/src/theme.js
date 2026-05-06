import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { createTheme } from '@mui/material/styles';

const THEME_STORAGE_KEY = 'lambda.ui.theme.v2';
const AVAILABLE_MODES = ['dark', 'light', 'neutral-gray'];

export const ColorModeContext = createContext({
    mode: 'dark',
    toggleColorMode: () => {},
});

const getInitialMode = () => {
    try {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (AVAILABLE_MODES.includes(saved)) return saved;
    } catch (_) {
        // Ignore storage issues and fallback to media query.
    }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches) {
        return 'light';
    }
    return 'dark';
};

const getPaletteByMode = (mode) => ({
    mode: mode === 'neutral-gray' ? 'light' : mode,
    primary: { main: '#1bcf9c' },
    secondary: { main: '#37d6ff' },
    error: { main: '#ff5d6c' },
    warning: { main: '#f4b95c' },
    success: { main: '#22cf88' },
    info: { main: '#5cb8ff' },
    background:
        mode === 'dark'
            ? { default: '#060b14', paper: '#0d1523' }
            : mode === 'neutral-gray'
              ? { default: '#ECECEC', paper: '#E2E2E2' }
              : { default: '#f3f8fb', paper: '#ffffff' },
    text:
        mode === 'dark'
            ? { primary: '#eef6ff', secondary: '#a6bed8' }
            : mode === 'neutral-gray'
              ? { primary: '#2F2F2F', secondary: '#6B6B6B' }
              : { primary: '#13253c', secondary: '#4c637e' },
    divider:
        mode === 'dark'
            ? 'rgba(120, 159, 194, 0.28)'
            : mode === 'neutral-gray'
              ? '#CFCFCF'
              : 'rgba(44, 83, 125, 0.18)',
});

export const createAppTheme = (mode) =>
    createTheme({
        palette: getPaletteByMode(mode),
        shape: { borderRadius: 14 },
        typography: {
            fontFamily: '"Inter", "Segoe UI", "Roboto", "Arial", sans-serif',
            h1: { fontWeight: 800, color: 'var(--text-strong)' },
            h2: { fontWeight: 800, color: 'var(--text-strong)' },
            h3: { fontWeight: 700, color: 'var(--text-strong)' },
            h4: { fontWeight: 700, color: 'var(--text-strong)' },
            h5: { fontWeight: 700, color: 'var(--text-strong)' },
            h6: { fontWeight: 700, color: 'var(--text-strong)' },
            button: { textTransform: 'none', fontWeight: 700 },
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        transition: 'background-color 240ms ease, color 240ms ease',
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        border: '1px solid var(--border-default)',
                        boxShadow: 'var(--shadow-soft)',
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundColor: 'var(--surface-elevated)',
                        border: '1px solid var(--border-default)',
                        boxShadow: 'var(--shadow-soft)',
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        paddingInline: 16,
                    },
                    containedPrimary: {
                        color: 'var(--accent-contrast)',
                        background: 'linear-gradient(120deg, var(--accent-400), var(--accent-500))',
                        boxShadow: '0 8px 18px rgba(27, 207, 156, 0.28)',
                    },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        backgroundColor: 'var(--surface-input)',
                    },
                },
            },
            MuiFilledInput: {
                styleOverrides: {
                    root: {
                        backgroundColor: 'var(--surface-input)',
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        borderRadius: 16,
                    },
                },
            },
        },
    });

export const useColorModeController = () => {
    const [mode, setMode] = useState(getInitialMode);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', mode);
        try {
            localStorage.setItem(THEME_STORAGE_KEY, mode);
        } catch (_) {
            // Ignore storage failures.
        }
    }, [mode]);

    const toggleColorMode = useCallback(() => {
        setMode((prev) => {
            const idx = AVAILABLE_MODES.indexOf(prev);
            const nextIdx = idx === -1 ? 0 : (idx + 1) % AVAILABLE_MODES.length;
            return AVAILABLE_MODES[nextIdx];
        });
    }, []);

    const contextValue = useMemo(() => ({ mode, toggleColorMode }), [mode, toggleColorMode]);
    const theme = useMemo(() => createAppTheme(mode), [mode]);

    return { mode, theme, contextValue };
};
