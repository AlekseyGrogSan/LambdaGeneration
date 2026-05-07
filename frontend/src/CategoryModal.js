import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, IconButton, Button, Chip, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '92%', sm: 560, md: 700 },
    bgcolor: 'var(--surface-panel)',
    border: '1px solid color-mix(in oklab, var(--text-primary) 8%, transparent)',
    borderRadius: '16px',
    boxShadow: 'var(--shadow-soft)',
    p: 4,
    color: 'var(--text-primary)',
    maxHeight: '85vh',
    overflowY: 'auto',
    '&::-webkit-scrollbar': { width: '8px' },
    '&::-webkit-scrollbar-track': { background: 'var(--surface-soft)' },
    '&::-webkit-scrollbar-thumb': { background: 'var(--accent-500)', borderRadius: '8px' },
};

export const TAG_CATEGORIES = [
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
            { id: 28, label: 'PascalABC' },
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
            { id: 29, label: 'Unity' },
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

export const mapTagsToLabels = (tags) => {
    if (!tags || !Array.isArray(tags)) return [];
    const allTags = TAG_CATEGORIES.flatMap(c => c.tags);
    return tags.map(t => {
        if (typeof t === 'number') {
            const found = allTags.find(tagObj => tagObj.id === t);
            return found ? found.label : t.toString();
        }
        return t;
    });
};

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
        <Modal disableRestoreFocus
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
                <Typography id="category-modal-title" variant="h6" component="h2" sx={{ color: 'var(--accent-500)', fontWeight: 'bold', mb: 2 }}>
                    Категории
                </Typography>

                {TAG_CATEGORIES.map((group, idx) => (
                    <Box key={group.title} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ color: 'var(--text-secondary)', mb: 1, fontWeight: 700 }}>
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
                                            backgroundColor: selected ? 'var(--accent-500)' : 'var(--surface-elevated)',
                                            color: selected ? 'var(--accent-contrast)' : 'var(--text-primary)',
                                            border: selected ? 'none' : '1px solid var(--border-default)',
                                            '&:hover': {
                                                backgroundColor: selected
                                                    ? 'var(--accent-600)'
                                                    : 'color-mix(in oklab, var(--surface-soft) 92%, var(--surface-elevated))',
                                            },
                                        }}
                                    />
                                );
                            })}
                        </Box>
                        {idx < TAG_CATEGORIES.length - 1 && <Divider sx={{ backgroundColor: 'var(--border-default)', mt: 2 }} />}
                    </Box>
                ))}

                <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'flex-end' }}>
                    <Button onClick={handleClear} sx={{ color: 'var(--text-secondary)' }}>
                        Сбросить
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleApply}
                        sx={{ bgcolor: 'var(--accent-500)', '&:hover': { bgcolor: 'var(--accent-600)' } }}
                    >
                        Применить
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default CategoryModal;
