import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button } from '@mui/material';

// Установите здесь базовый URL вашего API (например, где запущен ваш C# проект)
const API_BASE_URL = '/api'; // Убедитесь, что это правильный URL!

// Определяем состояния, в которых может находиться страница
const STATES = {
    LOADING_TOKEN: 'LOADING_TOKEN',
    SESSION_READY: 'SESSION_READY',
    RESET_SUCCESS: 'RESET_SUCCESS',
    ERROR: 'ERROR',
    PASSWORD_RESETTING: 'PASSWORD_RESETTING'
};

const pageContainerStyle = {
    padding: '20px', 
    maxWidth: '450px', 
    margin: '100px auto', 
    backgroundColor: '#1e1e1e', // Темный фон
    border: '1px solid #333',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
    color: 'white',
    textAlign: 'center',
};

const inputStyleFilled = {
    // Стиль, который вы используете для заполненных полей
    '& .MuiFilledInput-root': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        borderRadius: '8px',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
        },
        '&.Mui-focused': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
    },
    // Стили для меток (label)
    '& .MuiInputLabel-root': {
        color: '#bdbdbd',
        '&.Mui-focused': {
            color: '#00bfa5', // Фирменный цвет при фокусе
        },
    },
    // Убираем нижнюю линию у filled-инпутов
    '& .MuiFilledInput-underline:before, & .MuiFilledInput-underline:after': {
        borderBottom: 'none',
    },
    '& .MuiInputBase-input': {
        padding: '16px 12px 16px 12px',
    },
};

function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // 1. Основное состояние страницы
    const [pageState, setPageState] = useState(STATES.LOADING_TOKEN);
    
    // 2. Состояние формы
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // 3. Состояние обратной связи
    const [message, setMessage] = useState(null);

    const tokenData = searchParams.get('data'); // Извлекаем data={ENCRYPTED_DATA}

    // --- ЭФФЕКТ: СТАРТ СЕССИИ (Шаг 3) ---
    // Выполняется один раз при загрузке страницы, чтобы активировать токен и сохранить куки.
    useEffect(() => {
        if (!tokenData) {
            setMessage('Ошибка: Ссылка для сброса пароля недействительна или отсутствует.');
            setPageState(STATES.ERROR);
            return;
        }

        const startSession = async () => {
            try {
                // Вызываем эндпоинт 'start-session' на бэкенде
                const response = await fetch(`${API_BASE_URL}/Password/start-session?data=${tokenData}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
}               );

                if (response.ok) {
                    setMessage('Токен подтвержден. Введите новый пароль.');
                    setPageState(STATES.SESSION_READY);
                } else {
                    // Обработка ошибок бэкенда (Токен истек, недействителен и т.д.)
                    const errorText = await response.text();
                    setMessage(`Ошибка сессии: ${errorText || 'Неизвестная ошибка.'}`);
                    setPageState(STATES.ERROR);
                }
            } catch (err) {
                setMessage(`Ошибка сети: ${err.message}. Проверьте соединение с API.`);
                setPageState(STATES.ERROR);
            }
        };

        startSession();
    }, [tokenData]); // Зависит только от токена из URL

    // --- ОБРАБОТЧИК: СБРОС ПАРОЛЯ (Шаг 4) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        
        if (newPassword !== confirmPassword) {
            setMessage('Пароли не совпадают!');
            return;
        }
        if (newPassword.length < 6) { // Пример валидации
            setMessage('Пароль должен содержать не менее 6 символов.');
            return;
        }
        
        setPageState(STATES.PASSWORD_RESETTING);

        try {
            // Вызываем эндпоинт 'reset-password' на бэкенде
            const response = await fetch(`${API_BASE_URL}/Password/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    newPassword: newPassword,
                }),
                credentials: 'include' // <--- ДОБАВЬТЕ ЭТУ СТРОКУ
            });

            if (response.ok) {
                setMessage('✅ Пароль успешно изменен! Перенаправление...');
                setPageState(STATES.RESET_SUCCESS);
                
                // Удаляем куки и перенаправляем на логин после успешного сброса
                setTimeout(() => {
                    navigate('/login'); // Измените на ваш путь входа
                }, 3000);

            } else {
                // Если сброс не удался (куки истекли, ошибка сервера)
                const errorText = await response.text();
                setMessage(`❌ Ошибка сброса: ${errorText || 'Неизвестная ошибка.'}`);
                setPageState(STATES.ERROR);
            }
        } catch (err) {
            setMessage(`❌ Ошибка сети: ${err.message}. Не удалось связаться с API.`);
            setPageState(STATES.ERROR);
        }
    };

    // --- ФУНКЦИЯ РЕНДЕРИНГА СОСТОЯНИЙ ---

    // ResetPasswordPage.js (Обновите renderForm)

    const renderForm = () => (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Введите новый пароль
            </Typography>
            
            {/* Поле 1: Новый пароль */}
            <TextField
                variant="filled"
                type="password"
                label="Новый пароль"
                fullWidth
                sx={{ ...inputStyleFilled, mb: 2 }}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={pageState === STATES.PASSWORD_RESETTING}
            />
            
            {/* Поле 2: Подтверждение пароля */}
            <TextField
                variant="filled"
                type="password"
                label="Подтвердите пароль"
                fullWidth
                sx={{ ...inputStyleFilled, mb: 3 }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={pageState === STATES.PASSWORD_RESETTING}
            />

            {/* Кнопка сброса */}
            <Button 
                type="submit" 
                variant="contained" 
                fullWidth
                sx={{ 
                    backgroundColor: '#00bfa5', 
                    '&:hover': { backgroundColor: '#00a38f' },
                    color: 'white',
                    fontWeight: 'bold' 
                }}
                disabled={pageState === STATES.PASSWORD_RESETTING}
            >
                {pageState === STATES.PASSWORD_RESETTING ? 'Сброс...' : 'Сбросить пароль'}
            </Button>
        </Box>
    );

    const renderContent = () => {
        switch (pageState) {
            case STATES.LOADING_TOKEN:
                return <p>Проверка ссылки сброса...</p>;

            case STATES.SESSION_READY:
                return renderForm();
            
            case STATES.PASSWORD_RESETTING:
                return <p>Обработка нового пароля...</p>;

            case STATES.RESET_SUCCESS:
                return <p style={{ color: 'green', fontWeight: 'bold' }}>{message}</p>;

            case STATES.ERROR:
                return <p style={{ color: 'red', fontWeight: 'bold' }}>{message}</p>;
                
            default:
                return <p>Неизвестное состояние.</p>;
        }
    };

    return (
    <Box sx={pageContainerStyle}>
        <Typography variant="h4" sx={{ mb: 4, color: '#00bfa5', fontWeight: 'bold' }}>
            Сброс пароля
        </Typography>
        {renderContent()}
    </Box>
    );
}   

export default ResetPasswordPage;