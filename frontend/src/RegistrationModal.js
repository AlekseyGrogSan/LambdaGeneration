import React, { useState } from 'react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    Link as MuiLink,
} from '@mui/material';

// Базовый URL для API
const API_BASE_URL = '/api';

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

// --- КОМПОНЕНТ: RegistrationModal (С ЛОГИКОЙ БЭКЕНДА) ---
const RegistrationModal = ({ open, handleClose, onForgotPassword }) => {
    // Внутреннее состояние для переключения между Регистрацией и Входом
    const [isRegisterMode, setIsRegisterMode] = useState(true);
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        aboutUser: '', // Только для регистрации
    });
    const [error, setError] = useState('');

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    /**
     * Асинхронная функция для отправки данных на регистрацию или вход.
     * Обрабатывает ответы сервера и устанавливает ошибки или закрывает модальное окно.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const endpoint = isRegisterMode ? `${API_BASE_URL}/users/register` : `${API_BASE_URL}/users/login`;
        const payload = isRegisterMode
            ? {
                UserName: formData.userName,
                Email: formData.email,
                Password: formData.password,
                aboutUser: formData.aboutUser
            } // Соответствует RegisterUserRequest.cs
            : {
                Email: formData.email,
                Password: formData.password
            }; // Соответствует LoginUserRequest.cs

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                // --- ВАЖНОЕ ИЗМЕНЕНИЕ ---
                credentials: 'include', // Включаем учетные данные (куки)
            });

            if (response.ok) {
                // Если вход успешен, бэкенд возвращает куки (auth_cookies)
                if (!isRegisterMode) {
                    alert('Вход успешен! Куки установлены.');
                    // Здесь можно перезагрузить страницу или обновить состояние пользователя
                } else {
                    alert('Регистрация успешна!');
                    // После регистрации можно автоматически переключиться на вход
                    setIsRegisterMode(false);
                }
                handleClose();

            } else {
                // Обработка ошибок (например, 400 Bad Request, 401 Unauthorized)
                const errorData = await response.json();
                // Бэкенд возвращает сообщение об ошибке, которое мы выводим пользователю
                setError(errorData.message || errorData.reason || 'Произошла ошибка при обработке запроса.');
                console.error('Ошибка API:', errorData);
            }
        } catch (err) {
            // Обработка ошибок сети
            setError('Ошибка сети. Проверьте подключение к серверу.');
            console.error('Ошибка сети:', err);
        }
    };

    return (
        <Modal open={open} onClose={handleClose} aria-labelledby="modal-title">
            <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
                <Typography id="modal-title" variant="h5" component="h2" sx={{ color: '#ffffff', fontWeight: 300, textAlign: 'center', marginBottom: 1 }}>
                    {isRegisterMode ? 'Регистрация' : 'Вход'}
                </Typography>

                {/* Вывод сообщения об ошибке */}
                {error && <Typography color="error" sx={{ textAlign: 'center' }}>{error}</Typography>}

                {/* Поле для имени пользователя (только при регистрации) */}
                {isRegisterMode && (
                    <TextField
                        label="Имя пользователя"
                        name="userName"
                        variant="filled"
                        fullWidth
                        sx={inputStyle}
                        value={formData.userName}
                        onChange={handleChange}
                        required
                    />
                )}

                {/* Общие поля: Email */}
                <TextField
                    label="Email"
                    name="email"
                    variant="filled"
                    fullWidth
                    type="email"
                    sx={inputStyle}
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                {/* Общие поля: Пароль */}
                <TextField
                    label="Пароль"
                    name="password"
                    variant="filled"
                    fullWidth
                    type="password"
                    sx={inputStyle}
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                {/* Поле "О себе" (только при регистрации) */}
                {isRegisterMode && (
                    <TextField
                        label="О себе (кратко)"
                        name="aboutUser"
                        variant="filled"
                        fullWidth
                        multiline
                        rows={2}
                        sx={inputStyle}
                        value={formData.aboutUser}
                        onChange={handleChange}
                    />
                )}

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                        marginTop: 1,
                        backgroundColor: '#00bfa5',
                        '&:hover': { backgroundColor: '#009688' },
                        color: '#ffffff',
                        padding: '12px 0',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        borderRadius: '8px'
                    }}
                >
                    {isRegisterMode ? 'Зарегистрироваться' : 'Войти'}
                </Button>

                {/* Секция переключения режимов */}
                <Box sx={{ marginTop: 2, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#bdbdbd' }}>
                        {isRegisterMode ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
                        <MuiLink
                            component="span"
                            onClick={() => {
                                setIsRegisterMode(!isRegisterMode); // Переключаем режим
                                setFormData({ userName: '', email: '', password: '', aboutUser: '' }); // Сброс полей
                                setError('');
                            }}
                            sx={{ color: '#00bfa5', cursor: 'pointer', underline: 'hover', fontWeight: 'bold' }}
                        >
                            {isRegisterMode ? 'Войти' : 'Зарегистрироваться'}
                        </MuiLink>
                    </Typography>

                    {/* Ссылка "Забыли пароль?" отображается только в режиме Входа */}
                    {!isRegisterMode && (
                        <MuiLink
                            component="span"
                            onClick={() => {
                                handleClose(); // Закрываем модальное окно регистрации/входа
                                onForgotPassword(); // Открываем модальное окно "Забыли пароль?"
                            }}
                            sx={{ color: '#bdbdbd', cursor: 'pointer', underline: 'hover', display: 'block', marginTop: 1, fontSize: '0.8rem' }}
                        >
                            Забыли пароль?
                        </MuiLink>
                    )}
                </Box>
            </Box>
        </Modal>
    );
};

export default RegistrationModal;