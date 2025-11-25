import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
// PostPage еще не существует, но мы готовимся его импортировать
// import PostPage from './PostPage';

// Настраиваем темную тему и фирменные цвета
const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#00bfa5', // Основной цвет (бирюзовый/зеленый)
        },
        secondary: {
            main: '#333333', // Цвет фона для панелей
        },
        background: {
            default: '#555555', // Цвет основного фона
            paper: '#383838', // Цвет карточек и модальных окон
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
    },
});

function App() {
    // На этом этапе рендерим заглушку, пока PostPage не будет создан
    return (
        <ThemeProvider theme={theme}>
            <div style={{color: 'white', padding: '20px'}}>Loading App...</div>
            {/* <PostPage /> */}
        </ThemeProvider>
    );
}

export default App;