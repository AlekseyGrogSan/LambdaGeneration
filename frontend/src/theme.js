import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { createTheme } from '@mui/material/styles';

const THEME_STORAGE_KEY = 'lambda.ui.theme.v2';
const AVAILABLE_MODES = ['dark', 'light'];

export const ColorModeContext = createContext({
    mode: 'dark',
    toggleColorMode: () => {},
    setColorMode: () => {},
});

const getInitialMode = () => {
    try {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (AVAILABLE_MODES.includes(saved)) return saved;
    } catch (_) {
        // Ignore storage issues and fallback to media query.
    }
    return 'dark';
};

const getPaletteByMode = (mode) => ({
    mode: mode,
    primary: { main: '#13a065' },
    secondary: { main: '#37d6ff' },
    error: { main: '#ff5d6c' },
    warning: { main: '#f4b95c' },
    success: { main: '#139861' },
    info: { main: '#5cb8ff' },
    background:
        mode === 'dark'
            ? { default: '#121212', paper: '#1b1b1b' }
            : { default: '#f3f8fb', paper: '#ffffff' },
    text:
        mode === 'dark'
            ? { primary: '#f5f5f5', secondary: '#bdbdbd' }
            : { primary: '#111827', secondary: '#344256' },
    divider:
        mode === 'dark'
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(44, 83, 125, 0.18)',
});

export const createAppTheme = (mode) =>
    createTheme({
        palette: getPaletteByMode(mode),
        shape: { borderRadius: 14 },
        typography: {
            fontFamily: '"Manrope", "Segoe UI", "Roboto", "Arial", sans-serif',
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

    const setColorMode = useCallback((nextMode) => {
        if (!AVAILABLE_MODES.includes(nextMode)) return;
        setMode(nextMode);
    }, []);

    const contextValue = useMemo(
        () => ({ mode, toggleColorMode, setColorMode }),
        [mode, toggleColorMode, setColorMode]
    );
    const theme = useMemo(() => createAppTheme(mode), [mode]);

    return { mode, theme, contextValue };
};
