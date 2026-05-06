import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

const InputDialog = ({ open, title, label, initialValue = '', onConfirm, onCancel, placeholder }) => {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        if (open) {
            setValue(initialValue);
        }
    }, [open, initialValue]);

    const handleConfirm = () => {
        onConfirm(value);
    };

    return (
        <Dialog disableRestoreFocus open={open} onClose={onCancel} sx={{ zIndex: 9999 }} PaperProps={{ sx: { bgcolor: 'var(--ui-c38)', color: 'var(--text-primary)', minWidth: '300px' } }}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label={label}
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    InputProps={{ sx: { color: 'var(--text-primary)' } }}
                    InputLabelProps={{ sx: { color: 'var(--ui-c66)' } }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'var(--ui-c48)' },
                            '&:hover fieldset': { borderColor: 'var(--ui-c52)' },
                            '&.Mui-focused fieldset': { borderColor: 'var(--accent-500)' },
                        }
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} sx={{ color: 'var(--ui-c66)' }}>Отмена</Button>
                <Button onClick={handleConfirm} sx={{ color: 'var(--accent-500)' }}>ОК</Button>
            </DialogActions>
        </Dialog>
    );
};

export default InputDialog;
