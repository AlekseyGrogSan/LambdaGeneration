import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, CircularProgress } from '@mui/material';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

const EmailVerificationModal = ({ open, handleClose, email, onVerificationSuccess }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60); // Таймер на 60 секунд
    const [canResend, setCanResend] = useState(false);
    const [error, setError] = useState('');

    // Логика таймера
    useEffect(() => {
        let interval = null;
        if (open && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [open, timer]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/Users/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
                credentials: 'include',
            });

            if (response.ok) {
                onVerificationSuccess();
            } else {
                const text = await response.text();
                setError(text || 'Неверный код');
            }
        } catch (err) {
            setError('Ошибка сети');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setCanResend(false);
        setTimer(60);
        try {
            await fetch(`${API_BASE_URL}/Users/resend-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(email),
                credentials: 'include',
            });
        } catch (err) {
            setError('Не удалось отправить код');
        }
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 350, bgcolor: '#363636', p: 4, borderRadius: 4, color: '#fff' }}>
                <Typography variant="h5" textAlign="center" gutterBottom>Подтверждение</Typography>
                <Typography variant="body2" textAlign="center" sx={{ color: '#bdbdbd', mb: 2 }}>Код отправлен на {email}</Typography>
                
                {error && <Typography color="error" variant="caption" display="block" textAlign="center">{error}</Typography>}

                <TextField
                    fullWidth
                    label="Код из письма"
                    variant="filled"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    sx={{ input: { color: '#fff' }, mb: 2 }}
                />

                <Button fullWidth variant="contained" onClick={handleVerify} disabled={loading} sx={{ bgcolor: '#00bea5' }}>
                    {loading ? <CircularProgress size={24} /> : 'Подтвердить'}
                </Button>

                <Button 
                    fullWidth 
                    disabled={!canResend} 
                    onClick={handleResend}
                    sx={{ mt: 1, color: canResend ? '#00bfa5' : '#b1b1b1' }}
                >
                    {canResend ? 'Отправить код повторно' : `Повторная отправка через ${timer}с`}
                </Button>
            </Box>
        </Modal>
    );
};

export default EmailVerificationModal;