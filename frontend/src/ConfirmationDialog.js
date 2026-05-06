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
        <Dialog disableRestoreFocus
            open={open}
            onClose={onCancel}
            maxWidth="xs"
            fullWidth
            sx={{ zIndex: 9999 }}
            PaperProps={{
                sx: {
                    backgroundColor: 'var(--surface-panel)', // matching lambda generation dark theme mostly
                    color: 'white',
                    border: '1px solid var(--ui-c176)'
                }
            }}
        >
            <DialogTitle sx={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {title}
            </DialogTitle>
            <DialogContent>
                <Typography sx={{ color: 'var(--text-secondary)', mt: 1 }}>
                    {message}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button
                    onClick={onCancel}
                    variant="outlined"
                    disabled={isLoading}
                    sx={{
                        color: 'var(--text-primary)',
                        borderColor: 'var(--ui-c183)',
                        '&:hover': { borderColor: 'var(--ui-c184)' }
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
                        backgroundColor: 'var(--ui-c81)',
                        '&:hover': { backgroundColor: 'var(--ui-c68)' },
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
