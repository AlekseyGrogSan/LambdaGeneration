import React, { useState } from 'react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    Link as MuiLink,
} from '@mui/material';
import EmailVerificationModal from './EmailVerificationModal';

const API_BASE_URL = 'http://localhost:5113/api';

const inputStyle = {
    '& .MuiFilledInput-root': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        borderRadius: '8px',
        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
        '&.Mui-focused': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
    },
    '& .MuiInputLabel-root': {
        color: '#bdbdbd',
        '&.Mui-focused': { color: '#00bfa5' },
    },
    '& .MuiFilledInput-underline:before, & .MuiFilledInput-underline:after': {
        borderBottom: 'none',
    },
};

const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

const RegistrationModal = ({ open, handleClose, onForgotPassword }) => {
    const [isRegisterMode, setIsRegisterMode] = useState(true);
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        aboutUser: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showVerification, setShowVerification] = useState(false);
    const [pendingEmail, setPendingEmail] = useState('');

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateEmail(formData.email)) {
            setError('Введите корректный адрес электронной почты.');
            return;
        }

        if (isRegisterMode && formData.password.length < 6) {
            setError('Пароль должен быть не менее 6 символов.');
            return;
        }

        const endpoint = isRegisterMode ? `${API_BASE_URL}/Users/register` : `${API_BASE_URL}/Users/login`;
        const payload = isRegisterMode
            ? {
                UserName: formData.userName,
                Email: formData.email,
                Password: formData.password,
                aboutUser: formData.aboutUser
            }
            : {
                Email: formData.email,
                Password: formData.password
            };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include', // Важно для сессии на бэкенде
            });

            if (response.ok) {
                if (isRegisterMode) {
                    setPendingEmail(formData.email);
                    setShowVerification(true); // Открываем верификацию
                } else {
                    handleClose();
                    setFormData({ userName: '', email: '', password: '', aboutUser: '' });
                }
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Ошибка запроса');
            }
        } catch (err) {
            setError('Ошибка сети');
        }
    };

    const handleVerificationSuccess = () => {
        setShowVerification(false);
        setIsRegisterMode(false); // Переключаем на вход после успеха
        setSuccess('Почта подтверждена! Теперь вы можете войти.');
    };

    return (
        <>
            <Modal open={open && !showVerification} onClose={handleClose}>
                <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
                    <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 300 }}>
                        {isRegisterMode ? 'Регистрация' : 'Вход'}
                    </Typography>

                    {error && <Typography color="error" textAlign="center">{error}</Typography>}
                    {success && <Typography sx={{ color: '#00bfa5' }} textAlign="center">{success}</Typography>}

                    {isRegisterMode && (
                        <TextField label="Имя" name="userName" variant="filled" fullWidth sx={inputStyle} value={formData.userName} onChange={handleChange} required />
                    )}
                    <TextField label="Email" name="email" variant="filled" fullWidth sx={inputStyle} value={formData.email} onChange={handleChange} required />
                    <TextField label="Пароль" name="password" type="password" variant="filled" fullWidth sx={inputStyle} value={formData.password} onChange={handleChange} required />
                    
                    {isRegisterMode && (
                        <TextField label="О себе" name="aboutUser" variant="filled" fullWidth multiline rows={2} sx={inputStyle} value={formData.aboutUser} onChange={handleChange} />
                    )}

                    <Button type="submit" variant="contained" fullWidth sx={{ bgcolor: '#00bfa5', '&:hover': { bgcolor: '#009688' }, mt: 1 }}>
                        {isRegisterMode ? 'Зарегистрироваться' : 'Войти'}
                    </Button>
                        
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <MuiLink onClick={() => setIsRegisterMode(!isRegisterMode)} sx={{ color: '#00bfa5', cursor: 'pointer' }}>
                            {isRegisterMode ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Регистрация'}
                        </MuiLink>
                    </Box>
                </Box>
            </Modal>

            <EmailVerificationModal
                open={showVerification}
                handleClose={() => setShowVerification(false)}
                email={pendingEmail}
                onVerificationSuccess={handleVerificationSuccess}
            />
        </>
    );
};

export default RegistrationModal;