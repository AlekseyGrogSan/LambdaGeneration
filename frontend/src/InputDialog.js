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
        <Dialog disableRestoreFocus open={open} onClose={onCancel} sx={{ zIndex: 9999 }} PaperProps={{ sx: { bgcolor: '#2a2a2a', color: '#fff', minWidth: '300px' } }}>
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
                    InputProps={{ sx: { color: '#fff' } }}
                    InputLabelProps={{ sx: { color: '#aaa' } }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: '#555' },
                            '&:hover fieldset': { borderColor: '#777' },
                            '&.Mui-focused fieldset': { borderColor: '#00bfa5' },
                        }
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} sx={{ color: '#aaa' }}>Отмена</Button>
                <Button onClick={handleConfirm} sx={{ color: '#00bfa5' }}>ОК</Button>
            </DialogActions>
        </Dialog>
    );
};

export default InputDialog;
