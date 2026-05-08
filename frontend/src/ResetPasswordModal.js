import React, { useState } from 'react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
} from '@mui/material';

// Базовый URL для API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

// --- СТИЛИ ДЛЯ ПОЛЕЙ ВВОДА (Input Styles) ---
const inputStyle = {
    // Общие стили для полей ввода Material UI в стиле "filled"
    '& .MuiFilledInput-root': {
        backgroundColor: 'var(--ui-c176)',
        color: 'var(--text-primary)',
        borderRadius: '8px',
        '&:hover': {
            backgroundColor: 'var(--ui-c178)',
        },
        '&.Mui-focused': {
            backgroundColor: 'var(--ui-c181)',
        },
    },
    // Стили для меток (label)
    '& .MuiInputLabel-root': {
        color: 'var(--text-secondary)',
        '&.Mui-focused': {
            color: 'var(--accent-500)', // Фирменный цвет при фокусе
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

// --- КОМПОНЕНТ: Сброс пароля (ResetPasswordModal) ---
const ResetPasswordModal = ({ open, handleClose }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: '400px' },
        bgcolor: 'var(--surface-panel)',
        borderRadius: '16px',
        boxShadow: 24,
        p: 4,
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError('Пароли не совпадают.');
            return;
        }

        // Соответствует ResetPasswordRequest.cs: public record ResetPasswordRequest(string newPassword);
        const payload = { newPassword: newPassword };

        try {
            const response = await fetch(`${API_BASE_URL}/password/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setMessage('Ваш пароль успешно изменен. Можете войти.');
                // Закрываем модал через 3 секунды
                setTimeout(handleClose, 3000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Ошибка сброса пароля. Возможно, ссылка устарела.');
            }
        } catch (err) {
            setError('Не удалось подключиться к API.');
        }
    };

    return (
        <Modal disableRestoreFocus
            open={open}
            onClose={handleClose}
            aria-labelledby="reset-password-modal-title"
        >
            <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
                <Typography id="reset-password-modal-title" variant="h5" component="h2" sx={{ color: 'var(--text-primary)', fontWeight: 300, textAlign: 'center', marginBottom: 2 }}>
                    Установите новый пароль
                </Typography>

                {/* Сообщения об ошибке/успехе */}
                {error && <Typography color="error" sx={{ textAlign: 'center' }}>{error}</Typography>}
                {message && <Typography sx={{ color: 'var(--accent-500)', textAlign: 'center' }}>{message}</Typography>}

                {/* Поле для ввода нового пароля */}
                <TextField
                    label="Новый пароль"
                    variant="filled"
                    fullWidth
                    type="password"
                    sx={inputStyle}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={!!message}
                />

                {/* Поле для повтора пароля */}
                <TextField
                    label="Повторите новый пароль"
                    variant="filled"
                    fullWidth
                    type="password"
                    sx={inputStyle}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={!!message}
                />

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={!!message}
                    sx={{
                        marginTop: 1,
                        backgroundColor: 'var(--accent-500)',
                        '&:hover': { backgroundColor: 'var(--accent-600)' },
                        color: 'var(--text-primary)',
                        padding: '12px 0',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        borderRadius: '8px'
                    }}
                >
                    Изменить пароль
                </Button>
            </Box>
        </Modal>
    );
};

export default ResetPasswordModal;