import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { ColorModeContext, useColorModeController } from './theme';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

const RootApp = () => {
    const { theme, contextValue } = useColorModeController();

    return (
        <React.StrictMode>
            <ColorModeContext.Provider value={contextValue}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </ThemeProvider>
            </ColorModeContext.Provider>
        </React.StrictMode>
    );
};

root.render(<RootApp />);