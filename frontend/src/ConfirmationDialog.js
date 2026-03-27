import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography
} from '@mui/material';

const ConfirmationDialog = ({
    open,
    title = 'Подтверждение',
    message = 'Вы уверены?',
    onConfirm,
    onCancel,
    confirmText = 'Подтвердить',
    cancelText = 'Отмена',
    isLoading = false
}) => {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            maxWidth="xs"
            fullWidth
            sx={{ zIndex: 9999 }}
            PaperProps={{
                sx: {
                    backgroundColor: '#1e1e1e', // matching lambda generation dark theme mostly
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }
            }}
        >
            <DialogTitle sx={{ color: '#fff', fontWeight: 600 }}>
                {title}
            </DialogTitle>
            <DialogContent>
                <Typography sx={{ color: '#bdbdbd', mt: 1 }}>
                    {message}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button
                    onClick={onCancel}
                    variant="outlined"
                    disabled={isLoading}
                    sx={{
                        color: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        '&:hover': { borderColor: 'rgba(255, 255, 255, 0.5)' }
                    }}
                >
                    {cancelText}
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    disabled={isLoading}
                    sx={{
                        backgroundColor: '#d32f2f',
                        '&:hover': { backgroundColor: '#b71c1c' },
                        '&:disabled': { opacity: 0.6 }
                    }}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationDialog;
