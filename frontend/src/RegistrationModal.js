import React, { useEffect, useState } from 'react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    Link as MuiLink,
} from '@mui/material';
import EmailVerificationModal from './EmailVerificationModal';
import { formatBytes, isAvatarTooLarge, MAX_AVATAR_BYTES } from './avatarUtils';

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

const flattenErrorMessages = (errors) => {
    if (!errors) return '';
    if (typeof errors === 'string') return errors;
    if (Array.isArray(errors)) {
        return errors.filter(Boolean).join(' ');
    }
    if (typeof errors === 'object') {
        return Object.entries(errors)
            .map(([field, value]) => {
                const messages = Array.isArray(value) ? value : [value];
                const joined = messages.filter(Boolean).join(' ');
                return joined ? `${field}: ${joined}` : '';
            })
            .filter(Boolean)
            .join(' ');
    }
    return '';
};

const extractApiErrorMessage = async (response) => {
    const clone = response.clone();
    try {
        const payload = await response.json();
        if (payload) {
            if (payload.message) return payload.message;
            if (payload.detail) return payload.detail;
            if (payload.error) return payload.error;
            const flattened = flattenErrorMessages(
                payload.errors ?? payload.Errors ?? payload.modelState ?? payload.response ?? payload
            );
            if (flattened) return flattened;
        }
    } catch (e) {
        // Ignore JSON parsing issues
    }

    try {
        const text = await clone.text();
        if (text) return text;
    } catch {
        // Ignore text parsing issues
    }

    return response.statusText || 'Ошибка запроса';
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
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarError, setAvatarError] = useState('');

    useEffect(() => {
        if (!open) {
            setFormData({ userName: '', email: '', password: '', aboutUser: '' });
            setError('');
            setSuccess('');
            setShowVerification(false);
            setPendingEmail('');
            setAvatarFile(null);
            setAvatarError('');
        }
    }, [open]);

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

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (isAvatarTooLarge(file)) {
            setAvatarError(`Размер аватара не должен превышать ${formatBytes(MAX_AVATAR_BYTES)}.`);
            setAvatarFile(null);
            return;
        }
        setAvatarError('');
        setAvatarFile(file);
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
        if (isRegisterMode && avatarError) {
            setError(avatarError);
            return;
        }

        const endpoint = isRegisterMode ? `${API_BASE_URL}/Users/register` : `${API_BASE_URL}/Users/login`;
        const payload = isRegisterMode
            ? (() => {
                const form = new FormData();
                form.append('UserName', formData.userName || '');
                form.append('Email', formData.email || '');
                form.append('Password', formData.password || '');
                form.append('aboutUser', formData.aboutUser || '');
                if (avatarFile) {
                    form.append('Avatar', avatarFile);
                }
                return form;
            })()
            : {
                Email: formData.email,
                Password: formData.password
            };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: isRegisterMode ? undefined : { 'Content-Type': 'application/json' },
                body: isRegisterMode ? payload : JSON.stringify(payload),
                credentials: 'include', // Важно для сессии на бэкенде
            });

            if (response.ok) {
                if (isRegisterMode) {
                    setPendingEmail(formData.email);
                    setShowVerification(true); // Открываем верификацию
                } else {
                    handleClose();
                    setFormData({ userName: '', email: '', password: '', aboutUser: '' });
                    setAvatarFile(null);
                    setAvatarError('');
                }
            } else {
                const errorMessage = await extractApiErrorMessage(response);
                setError(errorMessage || 'Ошибка запроса');
            }
        } catch (err) {
            setError('Не удалось связаться с сервером. Проверьте подключение и повторите попытку.');
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
                        <TextField label="О себе" name="aboutUser" variant="filled" fullWidth multiline rows={2} sx={inputStyle} value={formData.aboutUser} onChange={handleChange} required={false} />
                    )}
                    {isRegisterMode && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button
                                variant="outlined"
                                component="label"
                                sx={{ color: '#00bfa5', borderColor: '#00bfa5', '&:hover': { borderColor: '#009688', backgroundColor: 'rgba(0, 191, 165, 0.08)' } }}
                            >
                                Загрузить аватар
                                <input hidden type="file" accept="image/*" onChange={handleAvatarChange} />
                            </Button>
                            {avatarFile && (
                                <Typography variant="body2" sx={{ color: '#bdbdbd' }}>
                                    {avatarFile.name}
                                </Typography>
                            )}
                            {avatarError && (
                                <Typography variant="caption" sx={{ color: '#ff8a80' }}>
                                    {avatarError}
                                </Typography>
                            )}
                            <Typography variant="caption" sx={{ color: '#7e7e7e' }}>
                                Максимум {formatBytes(MAX_AVATAR_BYTES)}
                            </Typography>
                        </Box>
                    )}
                    {isRegisterMode && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button
                                variant="outlined"
                                component="label"
                                sx={{ color: '#00bfa5', borderColor: '#00bfa5', '&:hover': { borderColor: '#009688', backgroundColor: 'rgba(0, 191, 165, 0.08)' } }}
                            >
                                Загрузить аватар
                                <input hidden type="file" accept="image/*" onChange={handleAvatarChange} />
                            </Button>
                            {avatarFile && (
                                <Typography variant="body2" sx={{ color: '#bdbdbd' }}>
                                    {avatarFile.name}
                                </Typography>
                            )}
                            {avatarError && (
                                <Typography variant="caption" sx={{ color: '#ff8a80' }}>
                                    {avatarError}
                                </Typography>
                            )}
                            <Typography variant="caption" sx={{ color: '#7e7e7e' }}>
                                Максимум {formatBytes(MAX_AVATAR_BYTES)}
                            </Typography>
                        </Box>
                    )}

                    <Button type="submit" variant="contained" fullWidth sx={{ bgcolor: '#00bfa5', '&:hover': { bgcolor: '#009688' }, mt: 1 }}>
                        {isRegisterMode ? 'Зарегистрироваться' : 'Войти'}
                    </Button>
                        
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <MuiLink
                            onClick={() => {
                                setIsRegisterMode(!isRegisterMode);
                                setAvatarFile(null);
                                setAvatarError('');
                            }}
                            sx={{ color: '#00bfa5', cursor: 'pointer' }}
                        >
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
