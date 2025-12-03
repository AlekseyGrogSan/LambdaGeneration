import React from 'react';
import { Modal, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: '#2c2c2c',
    border: '2px solid #000',
    borderRadius: '12px',
    boxShadow: 24,
    p: 4,
    color: 'white',
};

const CategoryModal = ({ open, handleClose }) => {
    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="category-modal-title"
            aria-describedby="category-modal-description"
        >
            <Box sx={style}>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <Typography id="category-modal-title" variant="h6" component="h2" sx={{ color: '#00bfa5', fontWeight: 'bold', mb: 2 }}>
                    Категории постов (Теги)
                </Typography>
                <Typography id="category-modal-description" sx={{ mt: 2 }}>
                    Здесь будет функционал для выбора тегов, фильтрации ленты и поиска по категориям.
                </Typography>
            </Box>
        </Modal>
    );
};

export default CategoryModal;