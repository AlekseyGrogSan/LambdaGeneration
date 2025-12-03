import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    Alert,
    Chip,
    ToggleButton,
    ToggleButtonGroup,
    CircularProgress // Добавлен импорт для использования в кнопке
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import DoneIcon from '@mui/icons-material/Done';
import EditNoteIcon from '@mui/icons-material/EditNote';
import LabelIcon from '@mui/icons-material/Label';
import DeleteIcon from '@mui/icons-material/Delete'; // ✅ ИМПОРТ: Иконка для удаления

// Иконки редактора
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import LinkIcon from '@mui/icons-material/Link';
import TitleIcon from '@mui/icons-material/Title';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

const API_BASE_URL = '/api';

// ТЕ ЖЕ ТЕГИ, ЧТО И ПРИ СОЗДАНИИ
const AVAILABLE_TAGS = [
    'CSharp', 'Java', 'Python', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'Kotlin',
    'Swift', 'PHP', 'C++', 'C', 'Ruby', 'DotNet', 'ASPNET', 'Math',
    'EntityFramework', 'Spring', 'React', 'Angular', 'Vue', 'NodeJS',
    'Django', 'Flask', 'Math', 'DataStructures', 'LLM', 'ML'
];

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95%', sm: 800 },
    maxHeight: '90vh',
    bgcolor: '#2c2c2c',
    border: '1px solid #444',
    borderRadius: '12px',
    boxShadow: 24,
    p: 3,
    color: 'white',
    overflowY: 'auto',
    '&::-webkit-scrollbar': { width: '8px' },
    '&::-webkit-scrollbar-track': { background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px' },
    '&::-webkit-scrollbar-thumb': { background: '#00bfa5', borderRadius: '10px' },
    '&::-webkit-scrollbar-thumb:hover': { background: '#009688' },
};

const inputStyle = {
    '& .MuiFilledInput-root': {
        backgroundColor: '#3a3a3a',
        color: 'white',
        '&:hover': { backgroundColor: '#454545' },
        '&.Mui-focused': { backgroundColor: '#454545' },
    },
    '& .MuiInputLabel-root': { color: '#bdbdbd' },
};

const EditorToolbar = ({ editorRef }) => {
    const applyCommand = useCallback((command, value = null) => {
        if (editorRef.current) editorRef.current.focus();
        document.execCommand(command, false, value);
    }, [editorRef]);

    return (
        <Box sx={{ display: 'flex', gap: 1, padding: 1, backgroundColor: '#444', borderRadius: '8px 8px 0 0', border: '1px solid #555' }}>
            <IconButton size="small" onClick={() => applyCommand('bold')} sx={{ color: '#fff' }}><FormatBoldIcon /></IconButton>
            <IconButton size="small" onClick={() => applyCommand('italic')} sx={{ color: '#fff' }}><FormatItalicIcon /></IconButton>
            <IconButton size="small" onClick={() => applyCommand('underline')} sx={{ color: '#fff' }}><FormatUnderlinedIcon /></IconButton>
            <IconButton size="small" onClick={() => { const url = prompt('URL:'); if(url) applyCommand('createLink', url); }} sx={{ color: '#00bfa5' }}><LinkIcon /></IconButton>
            <IconButton size="small" onClick={() => applyCommand('formatBlock', '<h2>')} sx={{ color: '#ffeb3b' }}><TitleIcon /></IconButton>
            <IconButton size="small" onClick={() => applyCommand('insertUnorderedList')} sx={{ color: '#fff' }}><FormatListBulletedIcon /></IconButton>
            <IconButton size="small" onClick={() => applyCommand('insertOrderedList')} sx={{ color: '#fff' }}><FormatListNumberedIcon /></IconButton>
        </Box>
    );
};

const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        // Мы используем 'credentials: include' для куки, но заголовок Content-Type все равно нужен
        // Токен Authorization (если используется)
        ...(token && { 'Authorization': `Bearer ${token}` }) 
    };
};

// ✅ ДОБАВЛЕН onDeleteSuccess
const EditArticleModal = ({ open, handleClose, post, onUpdateSuccess, onDeleteSuccess }) => {
    // Режим: 'content' или 'tags'
    const [editMode, setEditMode] = useState('content');

    const [title, setTitle] = useState('');
    const [preview, setPreview] = useState('');
    const [content, setContent] = useState(''); 
    const [selectedTags, setSelectedTags] = useState([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    
    const editorRef = useRef(null);

    useEffect(() => {
        if (post && open) {
            setEditMode('content'); // Сброс режима при открытии
            setTitle(post.title || '');
            setPreview(post.article_preview || '');
            setContent(post.article_content || '');
            setSelectedTags(post.tags || []);
            setError(null);
            setSuccessMsg('');
            
            setTimeout(() => {
                if (editorRef.current) {
                    editorRef.current.innerHTML = post.article_content || '';
                }
            }, 100);
        }
    }, [post, open]);

    const handleContentChange = () => {
        if (editorRef.current) {
            setContent(editorRef.current.innerHTML);
        }
    };

    const handleTagToggle = (tag) => {
        setSelectedTags(prevTags => {
            if (prevTags.includes(tag)) {
                return prevTags.filter(t => t !== tag);
            } else {
                if (prevTags.length < 5) {
                    return [...prevTags, tag];
                }
                return prevTags;
            }
        });
    };

    // ✅ НОВЫЙ МЕТОД: Удаление статьи
    const handleDeleteArticle = async () => {
        if (!window.confirm("Вы уверены, что хотите удалить эту статью? Это действие необратимо.")) {
            return;
        }

        setIsLoading(true);
        setError(null); 
        setSuccessMsg(''); 

        try {
            // Используется ваш маршрут DELETE /Articles/delete/{id}
            const response = await fetch(`${API_BASE_URL}/Articles/delete/${post.id}`, { 
                method: 'DELETE', 
                credentials: 'include' // Важно для куки-авторизации
            });

            if (response.ok) {
                // Успех: вызываем колбэк для обновления списка статей в ProfileModal и закрываемся
                onDeleteSuccess(post.id); 
                handleClose(); 
            } else if (response.status === 403) {
                 throw new Error("У вас нет прав для удаления этой статьи. (Вы не автор)");
            } else {
                const errorText = await response.text();
                throw new Error(`Ошибка удаления: ${errorText || response.statusText}`);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    // МЕТОД: Сохранение контента
    const handleSaveContent = async () => {
        setIsLoading(true); setError(null); setSuccessMsg('');
        try {
            const response = await fetch(`${API_BASE_URL}/Articles/update`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    article_id: post.id,
                    article_title: title,
                    article_preview: preview,
                    article_content: content
                })
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Ошибка обновления контента');
            }
            const updatedData = await response.json();
            
            // Сообщаем родителю об обновлении
            onUpdateSuccess(post.id, { ...updatedData });
            setSuccessMsg('Контент успешно обновлен!');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // МЕТОД: Сохранение тегов
    const handleSaveTags = async () => {
        setIsLoading(true); setError(null); setSuccessMsg('');
        try {
            const response = await fetch(`${API_BASE_URL}/Articles/updatetags`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    article_id: post.id,
                    article_tags: selectedTags
                })
            });

            if (!response.ok) throw new Error('Ошибка обновления тегов');
            const updatedData = await response.json();

            // Передаем только article_tags для обновления
            onUpdateSuccess(post.id, { article_tags: updatedData.article_tags });
            setSuccessMsg('Теги успешно обновлены!');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleModeChange = (event, newMode) => {
        if (newMode !== null) {
            setEditMode(newMode);
            setError(null);
            setSuccessMsg('');
            // Если переключаемся на контент, нужно снова инициализировать редактор (DOM мог очиститься)
            if (newMode === 'content') {
                 setTimeout(() => {
                    if (editorRef.current) editorRef.current.innerHTML = content;
                }, 50);
            }
        }
    };

    if (!post) return null;

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyle}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: '#00bfa5', fontWeight: 'bold' }}>
                        Редактирование
                    </Typography>
                    <IconButton onClick={handleClose} sx={{ color: '#bdbdbd' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Переключатель режимов */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <ToggleButtonGroup
                        value={editMode}
                        exclusive
                        onChange={handleModeChange}
                        aria-label="edit mode"
                        sx={{ 
                            bgcolor: '#3a3a3a',
                            '& .MuiToggleButton-root': { color: '#bdbdbd', border: '1px solid #555' },
                            '& .Mui-selected': { color: '#fff !important', bgcolor: '#00bfa5 !important' }
                        }}
                    >
                        <ToggleButton value="content" sx={{ px: 3 }}>
                            <EditNoteIcon sx={{ mr: 1 }} />
                            Статья
                        </ToggleButton>
                        <ToggleButton value="tags" sx={{ px: 3 }}>
                            <LabelIcon sx={{ mr: 1 }} />
                            Теги
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

                {/* --- РЕЖИМ 1: РЕДАКТИРОВАНИЕ КОНТЕНТА --- */}
                {editMode === 'content' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Заголовок"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            fullWidth
                            variant="filled"
                            sx={inputStyle}
                        />
                        <TextField
                            label="Превью (Описание)"
                            value={preview}
                            onChange={(e) => setPreview(e.target.value)}
                            fullWidth
                            multiline
                            rows={2}
                            variant="filled"
                            sx={inputStyle}
                        />
                        
                        <Box>
                            <Typography variant="caption" sx={{ color: '#bdbdbd', mb: 0.5, display: 'block' }}>
                                Полный текст
                            </Typography>
                            <EditorToolbar editorRef={editorRef} />
                            <Box
                                ref={editorRef}
                                contentEditable={true}
                                onInput={handleContentChange}
                                sx={{
                                    minHeight: '200px',
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    p: 2,
                                    bgcolor: '#3a3a3a',
                                    border: '1px solid #555',
                                    borderRadius: '0 0 8px 8px',
                                    color: 'white',
                                    outline: 'none',
                                    '& *': { color: 'inherit' },
                                    '& h2': { color: '#ffeb3b', fontSize: '1.4rem' },
                                    '& a': { color: '#00bfa5' },
                                    '&::-webkit-scrollbar': { width: '8px' },
                                    '&::-webkit-scrollbar-track': { background: 'rgba(255,255,255,0.05)' },
                                    '&::-webkit-scrollbar-thumb': { background: '#00bfa5', borderRadius: '4px' }
                                }}
                            />
                        </Box>
                        
                        <Button 
                            variant="contained" 
                            onClick={handleSaveContent}
                            disabled={isLoading}
                            startIcon={<SaveIcon />}
                            fullWidth
                            sx={{ mt: 1, py: 1.5, bgcolor: '#00bfa5', '&:hover': { bgcolor: '#00897b' }, fontWeight: 'bold' }}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Сохранить изменения в статье'}
                        </Button>
                    </Box>
                )}

                {/* --- РЕЖИМ 2: РЕДАКТИРОВАНИЕ ТЕГОВ --- */}
                {editMode === 'tags' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: '300px' }}>
                        <Typography variant="body1" sx={{ color: '#bdbdbd' }}>
                            Выберите теги (выбрано: {selectedTags.length}/5)
                        </Typography>
                        
                        <Box sx={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: 1, 
                            p: 2,
                            border: '1px solid #444',
                            borderRadius: '8px',
                            bgcolor: 'rgba(255, 255, 255, 0.05)'
                        }}>
                            {AVAILABLE_TAGS.map((tag) => {
                                const isSelected = selectedTags.includes(tag);
                                return (
                                    <Chip
                                        key={tag}
                                        label={tag}
                                        onClick={() => handleTagToggle(tag)}
                                        icon={isSelected ? <DoneIcon style={{ color: 'white' }} /> : undefined}
                                        disabled={selectedTags.length >= 5 && !isSelected}
                                        sx={{
                                            cursor: 'pointer',
                                            backgroundColor: isSelected ? '#00bfa5' : 'rgba(255, 255, 255, 0.1)',
                                            color: '#ffffff',
                                            border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.2)',
                                            '&:hover': {
                                                backgroundColor: isSelected ? '#009688' : 'rgba(255, 255, 255, 0.2)',
                                            },
                                        }}
                                    />
                                );
                            })}
                        </Box>

                        <Box sx={{ flexGrow: 1 }} />

                        <Button 
                            variant="contained" 
                            onClick={handleSaveTags}
                            disabled={isLoading}
                            startIcon={<SaveIcon />}
                            fullWidth
                            sx={{ py: 1.5, bgcolor: '#00bfa5', '&:hover': { bgcolor: '#00897b' }, fontWeight: 'bold' }}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Сохранить новые теги'}
                        </Button>
                    </Box>
                )}
                
                {/* ✅ БЛОК ДЕЙСТВИЙ: Кнопка Удалить */}
                <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #444', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                        onClick={handleDeleteArticle} 
                        color="error"
                        startIcon={<DeleteIcon />}
                        disabled={isLoading}
                        variant="outlined"
                        sx={{ 
                            '&:hover': { backgroundColor: 'rgba(255, 82, 82, 0.1)', borderColor: '#ff5252' },
                            borderColor: '#ff5252',
                            color: '#ff5252',
                            fontSize: '1rem'
                        }}
                    >
                        Удалить статью
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default EditArticleModal;