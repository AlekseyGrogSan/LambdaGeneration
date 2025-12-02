import React, { useState } from 'react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
} from '@mui/material';

// Базовый URL для API
const API_BASE_URL = 'http://localhost:5113/api';

// --- СТИЛИ ДЛЯ ПОЛЕЙ ВВОДА (Input Styles) ---
const inputStyle = {
    // Общие стили для полей ввода Material UI в стиле "filled"
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

// --- КОМПОНЕНТ: Запрос ссылки на сброс пароля (ForgotPasswordModal) ---
const ForgotPasswordModal = ({ open, handleClose }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSent, setIsSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [lastSentEmail, setLastSentEmail] = useState('');

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: '400px' },
        bgcolor: '#383838',
        borderRadius: '16px',
        boxShadow: 24,
        p: 4,
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true);

        // Соответствует ForgotPasswordRequest.cs
        const payload = { email: email };

        try {
            const response = await fetch(`${API_BASE_URL}/password/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                // УСПЕХ
                setIsSent(true);
                setLastSentEmail(email);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Ошибка при отправке ссылки.');
            }
        } catch (err) {
            setError('Не удалось подключиться к API.');
        } finally {
            setIsLoading(false);
        }
    };

    // ---ФУНКЦИЯ: Сброс состояния для ввода новой почты ---
    const handleResetForNewEmail = () => {
        setIsSent(false);
        setEmail('');
        setError('');
        setMessage('');
        setLastSentEmail('');
    };

    // --- РЕНДЕРИНГ СООБЩЕНИЯ ОБ УСПЕХЕ ---
    if (isSent) {
        return (
            <Modal open={open} onClose={handleClose} aria-labelledby="forgot-password-modal-title">
                <Box sx={modalStyle}>
                    <Typography variant="h5" component="h2" sx={{ color: '#ffffff', fontWeight: 300, textAlign: 'center', marginBottom: 2 }}>
                        Забыли пароль?
                    </Typography>

                    <Typography sx={{ color: '#00bfa5', textAlign: 'center', fontWeight: 'bold' }}>
                        Ссылка для сброса пароля отправлена на вашу почту!
                    </Typography>

                    <Typography variant="body2" sx={{ color: '#bdbdbd', textAlign: 'center', marginBottom: 2 }}>
                        Проверьте адрес: {lastSentEmail}
                    </Typography>

                    {/* КНОПКА ИСПРАВЛЕНИЯ: Сбрасывает isSent в false */}
                    <Button
                        variant="outlined"
                        fullWidth
                        sx={{
                            color: '#00bfa5',
                            borderColor: '#00bfa5',
                            mt: 2
                        }}
                        onClick={handleResetForNewEmail}
                    >
                        Запросить для другого аккаунта
                    </Button>

                    <Button
                        variant="text"
                        fullWidth
                        sx={{ color: '#bdbdbd' }}
                        onClick={handleClose}
                    >
                        Закрыть
                    </Button>
                </Box>
            </Modal>
        );
    }

    // --- РЕНДЕРИНГ ФОРМЫ ВВОДА (Если isSent === false) ---
    return (
        <Modal open={open} onClose={handleClose} aria-labelledby="forgot-password-modal-title">
            <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
                <Typography id="forgot-password-modal-title" variant="h5" component="h2" sx={{ color: '#ffffff', fontWeight: 300, textAlign: 'center', marginBottom: 2 }}>
                    Восстановление пароля
                </Typography>
                <Typography variant="body2" sx={{ color: '#bdbdbd', textAlign: 'center', marginBottom: 2 }}>
                    Введите email, чтобы получить ссылку для сброса пароля.
                </Typography>

                {error && <Typography color="error" sx={{ textAlign: 'center' }}>{error}</Typography>}

                <TextField
                    variant="filled" // Использовать заполненный вариант
                    label="Ваша Почта"
                    sx={{ ...inputStyle, marginBottom: 2 }} // Применяем общий стиль
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading} // ИСПОЛЬЗУЕМ ФЛАГ ЗАГРУЗКИ
                />

                <Button
                    type="submit"
                    variant="contained" // Основная кнопка
                    fullWidth
                    sx={{
                        backgroundColor: '#00bfa5',
                        '&:hover': { backgroundColor: '#00a38f' },
                        color: 'white',
                        fontWeight: 'bold',
                        mt: 1, // Margin Top
                        mb: 2  // Margin Bottom
                    }}
                    disabled={isLoading}
                >
                    {isLoading ? 'Отправка...' : 'Отправить ссылку'}
                </Button>

                <Button
                    variant="text"
                    fullWidth
                    sx={{ color: '#bdbdbd' }}
                    onClick={handleClose}
                    disabled={isLoading}
                >
                    Отмена
                </Button>

            </Box>
        </Modal>
    );
};

export default ForgotPasswordModal;