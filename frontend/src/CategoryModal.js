import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, IconButton, Button, Chip, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '92%', sm: 560, md: 700 },
    bgcolor: '#202020',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    boxShadow: '0 18px 48px rgba(0,0,0,0.55)',
    p: 4,
    color: 'white',
    maxHeight: '85vh',
    overflowY: 'auto',
    '&::-webkit-scrollbar': { width: '8px' },
    '&::-webkit-scrollbar-track': { background: 'rgba(255,255,255,0.05)' },
    '&::-webkit-scrollbar-thumb': { background: '#00bfa5', borderRadius: '8px' },
};

const TAG_CATEGORIES = [
    {
        title: 'Языки',
        tags: [
            { id: 1, label: 'C#' },
            { id: 2, label: 'Java' },
            { id: 3, label: 'Python' },
            { id: 4, label: 'JavaScript' },
            { id: 5, label: 'TypeScript' },
            { id: 6, label: 'Go' },
            { id: 7, label: 'Rust' },
            { id: 8, label: 'Kotlin' },
            { id: 9, label: 'Swift' },
            { id: 10, label: 'PHP' },
            { id: 11, label: 'C++' },
            { id: 12, label: 'C' },
            { id: 13, label: 'Ruby' },
        ],
    },
    {
        title: 'Фреймворки',
        tags: [
            { id: 14, label: '.NET' },
            { id: 15, label: 'ASP.NET' },
            { id: 16, label: 'Entity Framework' },
            { id: 17, label: 'Spring' },
            { id: 18, label: 'React' },
            { id: 19, label: 'Angular' },
            { id: 20, label: 'Vue' },
            { id: 21, label: 'Node.js' },
            { id: 22, label: 'Django' },
            { id: 23, label: 'Flask' },
        ],
    },
    {
        title: 'Технологии',
        tags: [
            { id: 24, label: 'Math' },
            { id: 25, label: 'Data Structures' },
            { id: 26, label: 'LLM' },
            { id: 27, label: 'ML' },
        ],
    },
];

const CategoryModal = ({ open, handleClose, selectedTags = [], onApply }) => {
    const [localSelected, setLocalSelected] = useState([]);

    useEffect(() => {
        if (open) {
            setLocalSelected(selectedTags);
        }
    }, [open, selectedTags]);

    const toggleTag = (tagId) => {
        setLocalSelected((prev) => (
            prev.includes(tagId)
                ? prev.filter((id) => id !== tagId)
                : [...prev, tagId]
        ));
    };

    const handleClear = () => setLocalSelected([]);

    const handleApply = () => {
        if (onApply) onApply(localSelected);
        handleClose();
    };

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
                    Категории
                </Typography>

                {TAG_CATEGORIES.map((group, idx) => (
                    <Box key={group.title} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ color: '#bdbdbd', mb: 1, fontWeight: 700 }}>
                            {group.title}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {group.tags.map((tag) => {
                                const selected = localSelected.includes(tag.id);
                                return (
                                    <Chip
                                        key={tag.id}
                                        label={tag.label}
                                        onClick={() => toggleTag(tag.id)}
                                        sx={{
                                            cursor: 'pointer',
                                            backgroundColor: selected ? '#00bfa5' : 'rgba(255,255,255,0.08)',
                                            color: selected ? '#101010' : '#ffffff',
                                            border: selected ? 'none' : '1px solid rgba(255,255,255,0.15)',
                                            '&:hover': { backgroundColor: selected ? '#00d4b4' : 'rgba(255,255,255,0.15)' },
                                        }}
                                    />
                                );
                            })}
                        </Box>
                        {idx < TAG_CATEGORIES.length - 1 && <Divider sx={{ backgroundColor: '#333', mt: 2 }} />}
                    </Box>
                ))}

                <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'flex-end' }}>
                    <Button onClick={handleClear} sx={{ color: '#bdbdbd' }}>
                        Сбросить
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleApply}
                        sx={{ bgcolor: '#00bfa5', '&:hover': { bgcolor: '#009688' } }}
                    >
                        Применить
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default CategoryModal;
