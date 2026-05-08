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
import AvatarCropDialog from './AvatarCropDialog';
import ForgotPasswordModal from './ForgotPasswordModal';
import { formatBytes, isAvatarTooLarge, MAX_AVATAR_BYTES } from './avatarUtils';
import { buildModerationErrorMessage } from './moderationFlags';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

const inputStyle = {
    '& .MuiFilledInput-root': {
        backgroundColor: 'var(--surface-input)',
        color: 'var(--text-primary)',
        borderRadius: '8px',
        transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': { backgroundColor: 'color-mix(in oklab, var(--surface-input) 90%, var(--bg-elevated))' },
        '&.Mui-focused': {
            backgroundColor: 'color-mix(in oklab, var(--surface-input) 86%, var(--bg-elevated))',
            boxShadow: 'inset 0 0 0 1px color-mix(in oklab, var(--accent-500) 40%, transparent)',
        },
    },
    '& .MuiInputLabel-root': {
        color: 'var(--text-secondary)',
        '&.Mui-focused': { color: 'var(--accent-500)' },
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
            const moderationMessage = buildModerationErrorMessage(payload);
            if (moderationMessage) return moderationMessage;

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

const RegistrationModal = ({ open, handleClose, onForgotPassword, onAuthSuccess, initialMode = 'login' }) => {
    const [isRegisterMode, setIsRegisterMode] = useState(initialMode === 'register');
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        aboutUser: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [pendingEmail, setPendingEmail] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarError, setAvatarError] = useState('');
    const [cropImageSrc, setCropImageSrc] = useState(null);
    const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false); // НОВОЕ: состояние для модалки сброса пароля

    useEffect(() => {
        if (open) {
            setIsRegisterMode(initialMode === 'register');
        }
    }, [open, initialMode]);

    useEffect(() => {
        if (!open) {
            setFormData({ userName: '', email: '', password: '', aboutUser: '' });
            setError('');
            setSuccess('');
            setShowVerification(false);
            setPendingEmail('');
            setAvatarFile(null);
            setAvatarError('');
            setIsSubmitting(false);
            setCropImageSrc(null);
            setIsCropDialogOpen(false);
            setShowForgotPassword(false); // Сброс при закрытии
        }
    }, [open]);

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: '400px' },
        bgcolor: 'var(--surface-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-soft)',
        p: 4,
        color: 'var(--text-primary)',
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
            e.target.value = '';
            return;
        }
        setAvatarError('');
        const reader = new FileReader();
        reader.onload = () => {
            setCropImageSrc(reader.result);
            setIsCropDialogOpen(true);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleCropCancel = () => {
        setIsCropDialogOpen(false);
        setCropImageSrc(null);
    };

    const handleCropComplete = (croppedFile) => {
        setIsCropDialogOpen(false);
        if (!croppedFile) return;
        const fileToUpload = croppedFile instanceof File
            ? croppedFile
            : new File([croppedFile], 'avatar.jpg', { type: croppedFile.type || 'image/jpeg' });
        setAvatarFile(fileToUpload);
        setCropImageSrc(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setError('');
        setSuccess('');
        setIsSubmitting(true);

        if (!validateEmail(formData.email)) {
            setError('Введите корректный адрес электронной почты.');
            setIsSubmitting(false);
            return;
        }

        if (isRegisterMode && formData.password.length < 6) {
            setError('Пароль должен быть не менее 6 символов.');
            setIsSubmitting(false);
            return;
        }
        if (isRegisterMode && avatarError) {
            setError(avatarError);
            setIsSubmitting(false);
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
                credentials: 'include',
            });

            if (response.ok) {
                if (isRegisterMode) {
                    setPendingEmail(formData.email);
                    setShowVerification(true);
                } else {
                    if (onAuthSuccess) {
                        await onAuthSuccess();
                    }
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
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerificationSuccess = () => {
        setShowVerification(false);
        setIsRegisterMode(false);
        setSuccess('Почта подтверждена! Теперь вы можете войти.');
    };

    // НОВОЕ: обработчик открытия модалки сброса пароля
    const handleOpenForgotPassword = () => {
        setShowForgotPassword(true);
    };

    // НОВОЕ: обработчик закрытия модалки сброса пароля
    const handleCloseForgotPassword = () => {
        setShowForgotPassword(false);
    };

    return (
        <>
            <Modal disableRestoreFocus open={open && !showVerification} onClose={handleClose}>
                <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
                    <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 300 }}>
                        {isRegisterMode ? 'Регистрация' : 'Вход'}
                    </Typography>

                    {error && <Typography color="error" textAlign="center">{error}</Typography>}
                    {success && <Typography sx={{ color: 'var(--accent-500)' }} textAlign="center">{success}</Typography>}

                    {isRegisterMode && (
                        <TextField label="Имя" name="userName" variant="filled" fullWidth sx={inputStyle} value={formData.userName} onChange={handleChange} required />
                    )}
                    <TextField label="Email" name="email" variant="filled" fullWidth sx={inputStyle} value={formData.email} onChange={handleChange} required />
                    <TextField label="Пароль" name="password" type="password" variant="filled" fullWidth sx={inputStyle} value={formData.password} onChange={handleChange} required />
                    
                    {isRegisterMode && (
                        <TextField
                            label="О себе"
                            name="aboutUser"
                            variant="filled"
                            fullWidth
                            multiline
                            rows={2}
                            sx={inputStyle}
                            value={formData.aboutUser}
                            onChange={handleChange}
                            required={false}
                            inputProps={{ required: false }}
                        />
                    )}
                    {isRegisterMode && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button
                                variant="outlined"
                                component="label"
                                sx={{ color: 'var(--accent-500)', borderColor: 'var(--accent-500)', '&:hover': { borderColor: 'var(--accent-600)', backgroundColor: 'color-mix(in oklab, var(--accent-500) 8%, transparent)' } }}
                            >
                                Загрузить аватар
                                <input hidden type="file" accept="image/*" onChange={handleAvatarChange} />
                            </Button>
                            {avatarFile && (
                                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                                    {avatarFile.name}
                                </Typography>
                            )}
                            {avatarError && (
                                <Typography variant="caption" sx={{ color: 'var(--ui-c98)' }}>
                                    {avatarError}
                                </Typography>
                            )}
                            <Typography variant="caption" sx={{ color: 'var(--ui-c53)' }}>
                                Максимум {formatBytes(MAX_AVATAR_BYTES)}
                            </Typography>
                        </Box>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={isSubmitting}
                        sx={{ bgcolor: 'var(--accent-500)', '&:hover': { bgcolor: 'var(--accent-600)' }, mt: 1 }}
                    >
                        {isSubmitting
                            ? 'Отправка...'
                            : (isRegisterMode ? 'Зарегистрироваться' : 'Войти')}
                    </Button>
                        
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <MuiLink
                            onClick={() => {
                                setIsRegisterMode(!isRegisterMode);
                                setAvatarFile(null);
                                setAvatarError('');
                            }}
                            sx={{ color: 'var(--accent-500)', cursor: 'pointer' }}
                        >
                            {isRegisterMode ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Регистрация'}
                        </MuiLink>
                    </Box>

                    {/* НОВОЕ: ссылка "Забыли пароль?" - показываем только в режиме входа */}
                    {!isRegisterMode && (
                        <Box sx={{ textAlign: 'center', mt: 1 }}>
                            <MuiLink
                                onClick={handleOpenForgotPassword}
                                sx={{ color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem' }}
                            >
                                Забыли пароль?
                            </MuiLink>
                        </Box>
                    )}
                </Box>
            </Modal>

            <AvatarCropDialog
                open={isCropDialogOpen}
                imageSrc={cropImageSrc}
                onClose={handleCropCancel}
                onCropComplete={handleCropComplete}
            />

            <EmailVerificationModal
                open={showVerification}
                handleClose={() => setShowVerification(false)}
                email={pendingEmail}
                onVerificationSuccess={handleVerificationSuccess}
            />

            {/* НОВОЕ: модальное окно восстановления пароля */}
            <ForgotPasswordModal
                open={showForgotPassword}
                handleClose={handleCloseForgotPassword}
            />
        </>
    );
};

export default RegistrationModal;