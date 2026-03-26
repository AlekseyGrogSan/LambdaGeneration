import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
    CircularProgress, // Добавлен импорт для использования в кнопке
    Menu,
    MenuItem
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
import CodeIcon from '@mui/icons-material/Code';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import { buildArticleImageUrl, formatBytes, isArticleImageTooLarge, MAX_ARTICLE_IMAGE_BYTES } from './avatarUtils';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

// ТЕ ЖЕ ТЕГИ, ЧТО И ПРИ СОЗДАНИИ
const AVAILABLE_TAGS = [
    'C#', 'Java', 'Python', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'Kotlin',
    'Swift', 'PHP', 'C++', 'C', 'Ruby', 'PascalABC',
    '.NET', 'ASP.NET', 'Entity Framework', 'Spring', 'React', 'Angular', 'Vue',
    'Node.js', 'Django', 'Flask', 'Unity',
    'Math', 'Data Structures', 'LLM', 'ML'
];

const modalStyle = {
    position: 'absolute',
    top: { xs: 0, sm: '50%' },
    left: { xs: 0, sm: '50%' },
    transform: { xs: 'none', sm: 'translate(-50%, -50%)' },
    width: { xs: '100vw', sm: '95%', md: 800 },
    height: { xs: '100dvh', sm: 'auto' },
    maxHeight: { xs: '100dvh', sm: '90vh' },
    bgcolor: '#2c2c2c',
    border: '1px solid #444',
    borderRadius: { xs: 0, sm: '12px' },
    boxShadow: 24,
    p: { xs: 2, sm: 3 },
    color: 'white',
    overflowY: 'auto',
    overscrollBehavior: 'contain',
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
    const [activeStyles, setActiveStyles] = useState({
        bold: false,
        italic: false,
        underline: false,
        listBulleted: false,
        listNumbered: false,
        h2: false
    });
    const [fontSizeAnchor, setFontSizeAnchor] = useState(null);

    const updateToolbarStatus = useCallback(() => {
        setActiveStyles({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            listBulleted: document.queryCommandState('insertUnorderedList'),
            listNumbered: document.queryCommandState('insertOrderedList'),
            h2: document.queryCommandValue('formatBlock') === 'h2'
        });
    }, []);

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        editor.addEventListener('mouseup', updateToolbarStatus);
        editor.addEventListener('keyup', updateToolbarStatus);

        return () => {
            editor.removeEventListener('mouseup', updateToolbarStatus);
            editor.removeEventListener('keyup', updateToolbarStatus);
        };
    }, [editorRef, updateToolbarStatus]);

    const applyCommand = useCallback((command, value = null) => {
        if (editorRef.current) editorRef.current.focus();
        document.execCommand(command, false, value);
        updateToolbarStatus();
    }, [editorRef, updateToolbarStatus]);

    const insertCodeBlock = useCallback(() => {
        const lang = prompt('Введите язык программирования (например, python, javascript, cpp) или оставьте пустым:', 'text');
        if (lang === null) return; // cancelled
        
        // We use a table because contenteditable handles cursor placement around tables much better than nested divs
        const codeHTML = `<br><table class="code-block-table" style="width: 100%; background: #282c34; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); border-collapse: separate; border-spacing: 0; margin: 10px 0; overflow: hidden;">
            <thead>
                <tr>
                    <th style="padding: 4px 12px; color: rgba(255,255,255,0.5); font-family: monospace; font-size: 11px; text-align: right; user-select: none; font-weight: normal; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        ${lang || 'code'}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding: 12px;">
                        <pre style="margin: 0; white-space: pre-wrap; font-family: Consolas, monospace; font-size: 14px;"><code class="${lang ? 'language-' + lang : 'language-text'}">// Ваш код...</code></pre>
                    </td>
                </tr>
            </tbody>
        </table><br><div style="min-height: 20px;"></div>`;
        applyCommand('insertHTML', codeHTML);
    }, [applyCommand]);

    const getButtonStyle = (isActive, activeColor = '#00bfa5') => ({
        color: isActive ? activeColor : '#ffffff',
        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
        borderRadius: '4px',
        transition: 'all 0.2s',
        '&:hover': { backgroundColor: '#666666' }
    });

    return (
        <Box
            sx={{
                display: 'flex',
                gap: 1,
                padding: 1,
                backgroundColor: '#444',
                borderRadius: '8px 8px 0 0',
                border: '1px solid #555',
                flexWrap: 'nowrap',
                overflowX: 'auto',
                overflowY: 'hidden',
                scrollbarWidth: 'thin',
                scrollbarColor: '#00bfa5 rgba(255,255,255,0.08)',
                paddingBottom: '6px',
                '&::-webkit-scrollbar': {
                    height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                    borderRadius: '999px',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: 'linear-gradient(90deg, #00d4b8, #00a58f)',
                    borderRadius: '999px',
                    border: '1px solid rgba(255,255,255,0.28)',
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.16)',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                    background: 'linear-gradient(90deg, #00e0c2, #00b39b)',
                },
                '&::-webkit-scrollbar-corner': {
                    background: 'transparent',
                },
            }}
        >
            <IconButton size="small" onClick={() => applyCommand('bold')} sx={{ ...getButtonStyle(activeStyles.bold), flex: '0 0 auto' }}><FormatBoldIcon /></IconButton>
            <IconButton size="small" onClick={() => applyCommand('italic')} sx={{ ...getButtonStyle(activeStyles.italic), flex: '0 0 auto' }}><FormatItalicIcon /></IconButton>
            <IconButton size="small" onClick={() => applyCommand('underline')} sx={{ ...getButtonStyle(activeStyles.underline), flex: '0 0 auto' }}><FormatUnderlinedIcon /></IconButton>
            <IconButton size="small" onClick={() => { const url = prompt('URL:'); if(url) applyCommand('createLink', url); }} sx={{ color: '#00bfa5', flex: '0 0 auto' }}><LinkIcon /></IconButton>
            <IconButton size="small" onClick={() => applyCommand('formatBlock', '<h2>')} sx={{ ...getButtonStyle(activeStyles.h2, '#ffeb3b'), flex: '0 0 auto' }}><TitleIcon /></IconButton>
            <IconButton size="small" onClick={() => applyCommand('insertUnorderedList')} sx={{ ...getButtonStyle(activeStyles.listBulleted), flex: '0 0 auto' }}><FormatListBulletedIcon /></IconButton>
            <IconButton size="small" onClick={() => applyCommand('insertOrderedList')} sx={{ ...getButtonStyle(activeStyles.listNumbered), flex: '0 0 auto' }}><FormatListNumberedIcon /></IconButton>
            
            <Box sx={{ width: '1px', backgroundColor: '#666', marginX: 1, my: 0.5 }} />

            <IconButton size="small" onClick={insertCodeBlock} sx={{ color: '#00bfa5', flex: '0 0 auto' }} title="Вставить код">
                <CodeIcon />
            </IconButton>

            <IconButton size="small" onClick={(e) => setFontSizeAnchor(e.currentTarget)} sx={{ color: '#ffffff', flex: '0 0 auto' }} title="Размер текста">
                <FormatSizeIcon />
            </IconButton>
            <Menu
                anchorEl={fontSizeAnchor}
                open={Boolean(fontSizeAnchor)}
                onClose={() => setFontSizeAnchor(null)}
                sx={{ zIndex: 1600 }}
                PaperProps={{
                    sx: {
                        backgroundColor: '#333',
                        color: 'white',
                    }
                }}
            >
                <MenuItem onClick={() => { applyCommand('fontSize', '2'); setFontSizeAnchor(null); }}>Маленький</MenuItem>
                <MenuItem onClick={() => { applyCommand('fontSize', '3'); setFontSizeAnchor(null); }}>Обычный</MenuItem>
                <MenuItem onClick={() => { applyCommand('fontSize', '4'); setFontSizeAnchor(null); }}>Большой</MenuItem>
                <MenuItem onClick={() => { applyCommand('fontSize', '5'); setFontSizeAnchor(null); }}>Огромный</MenuItem>
            </Menu>
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
const EditArticleModal = ({ open, handleClose, post, onUpdateSuccess, onDeleteSuccess, container, disablePortal }) => {
    // Режим: 'content' или 'tags'
    const [editMode, setEditMode] = useState('content');

    const [title, setTitle] = useState('');
    const [preview, setPreview] = useState('');
    const [content, setContent] = useState(''); 
    const [selectedTags, setSelectedTags] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [imageError, setImageError] = useState(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);
    const existingPictureFileRef = useRef(null);
    const existingPictureFetchPromiseRef = useRef(null);

    const existingPictureUrl = useMemo(() => {
        if (!post) return '';
        const path = post.file_path || post.filePath || post.articleImageUrl || post.article_image_url || post.picture || '';
        return buildArticleImageUrl(API_BASE_URL, path);
    }, [post]);

    useEffect(() => {
        if (post && open) {
            setEditMode('content'); // Сброс режима при открытии
            setTitle(post.title || '');
            setPreview(post.article_preview || '');
            setContent(post.article_content || '');
            setSelectedTags(post.tags || []);
            setError(null);
            setSuccessMsg('');
            setImageFile(null);
            setImageError(null);
            setImagePreview('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            
            setTimeout(() => {
                if (editorRef.current) {
                    editorRef.current.innerHTML = post.article_content || '';
                }
            }, 100);
        }
    }, [post, open]);

    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    useEffect(() => {
        existingPictureFileRef.current = null;
        existingPictureFetchPromiseRef.current = null;
    }, [existingPictureUrl, open]);

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

    const handleImageChange = (event) => {
        const nextFile = event.target.files?.[0];
        if (!nextFile) return;

        if (isArticleImageTooLarge(nextFile)) {
            setImageError(`Размер фото не должен превышать ${formatBytes(MAX_ARTICLE_IMAGE_BYTES)}.`);
            setImageFile(null);
            setImagePreview('');
            return;
        }

        setImageError(null);
        setImageFile(nextFile);
        const nextPreview = URL.createObjectURL(nextFile);
        setImagePreview((prev) => {
            if (prev && prev.startsWith('blob:')) {
                URL.revokeObjectURL(prev);
            }
            return nextPreview;
        });
    };

    const clearSelectedImage = () => {
        setImageFile(null);
        setImageError(null);
        setImagePreview((prev) => {
            if (prev && prev.startsWith('blob:')) {
                URL.revokeObjectURL(prev);
            }
            return '';
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getPictureForUpload = useCallback(async (selectedFile) => {
        if (selectedFile) return selectedFile;
        if (!existingPictureUrl) return null;
        if (existingPictureFileRef.current) return existingPictureFileRef.current;
        if (!existingPictureFetchPromiseRef.current) {
            existingPictureFetchPromiseRef.current = (async () => {
                const response = await fetch(existingPictureUrl, { credentials: 'include' });
                if (!response.ok) {
                    throw new Error('Unable to download the current article image. Please choose a new photo.');
                }
                const blob = await response.blob();
                let filename = 'article-image.png';
                try {
                    const urlObj = new URL(existingPictureUrl, window.location.origin);
                    const candidate = urlObj.pathname.split('/').pop();
                    if (candidate && candidate.includes('.')) filename = candidate;
                } catch {
                    const fallback = existingPictureUrl.split('/').pop()?.split('?')[0];
                    if (fallback && fallback.includes('.')) filename = fallback;
                }
                const file = new File([blob], filename, { type: blob.type || 'image/png' });
                existingPictureFileRef.current = file;
                return file;
            })();
        }
        try {
            return await existingPictureFetchPromiseRef.current;
        } finally {
            existingPictureFetchPromiseRef.current = null;
        }
    }, [existingPictureUrl]);

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
        if (imageError) {
            setError(imageError);
            return;
        }

        setIsLoading(true); setError(null); setSuccessMsg('');
        try {
            const pictureFile = await getPictureForUpload(imageFile);
            if (!pictureFile) {
                const message = existingPictureUrl
                    ? 'Unable to load the current article image. Please select a new photo before saving.'
                    : 'This article does not have an image yet. Choose a file to save your changes.';
                throw new Error(message);
            }
            const formData = new FormData();
            formData.append('article_id', post.id);
            formData.append('article_title', title);
            formData.append('article_preview', preview);
            formData.append('article_content', content);
            formData.append('picture', pictureFile);

            const response = await fetch(`${API_BASE_URL}/Articles/update`, {
                method: 'PUT',
                credentials: 'include',
                body: formData
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
        <Modal
            open={open}
            onClose={handleClose}
            container={container}
            disablePortal={disablePortal}
            sx={{ zIndex: 1500 }}
        >
            <Box sx={modalStyle}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                        position: { xs: 'sticky', sm: 'static' },
                        top: 0,
                        py: 0.5,
                        zIndex: 2,
                        backgroundColor: '#2c2c2c'
                    }}
                >
                    <Typography variant="h6" sx={{ color: '#00bfa5', fontWeight: 'bold' }}>
                        Редактирование
                    </Typography>
                    <IconButton aria-label="Закрыть" onClick={handleClose} sx={{ color: '#bdbdbd' }}>
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
                            width: { xs: '100%', sm: 'auto' },
                            '& .MuiToggleButton-root': { color: '#bdbdbd', border: '1px solid #555' },
                            '& .Mui-selected': { color: '#fff !important', bgcolor: '#00bfa5 !important' }
                        }}
                    >
                        <ToggleButton value="content" sx={{ px: { xs: 1.5, sm: 3 }, flex: { xs: 1, sm: 'none' } }}>
                            <EditNoteIcon sx={{ mr: 1 }} />
                            Статья
                        </ToggleButton>
                        <ToggleButton value="tags" sx={{ px: { xs: 1.5, sm: 3 }, flex: { xs: 1, sm: 'none' } }}>
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
                                    minHeight: { xs: '180px', sm: '200px' },
                                    maxHeight: { xs: '34dvh', sm: '300px' },
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

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="body2" sx={{ color: '#bdbdbd', fontWeight: 'bold' }}>
                                Фото статьи (до {formatBytes(MAX_ARTICLE_IMAGE_BYTES)})
                            </Typography>
                            <input
                                ref={fileInputRef}
                                hidden
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => fileInputRef.current?.click()}
                                    sx={{ color: '#00bfa5', borderColor: '#00bfa5', '&:hover': { borderColor: '#009688', backgroundColor: 'rgba(0, 191, 165, 0.08)' } }}
                                >
                                    Выбрать фото
                                </Button>
                                {imageFile && (
                                    <Button
                                        variant="text"
                                        onClick={clearSelectedImage}
                                        sx={{ color: '#ff8a80' }}
                                    >
                                        Убрать
                                    </Button>
                                )}
                                <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
                                    {imageFile ? `${imageFile.name} (${formatBytes(imageFile.size)})` : 'Файл не выбран'}
                                </Typography>
                            </Box>
                            {imageError && (
                                <Typography variant="body2" sx={{ color: '#ff8a80' }}>
                                    {imageError}
                                </Typography>
                            )}
                            {(imagePreview || post?.articleImageUrl || post?.file_path || post?.filePath) && (
                                <Box
                                    component="img"
                                    src={imagePreview || buildArticleImageUrl(API_BASE_URL, post?.file_path || post?.filePath || post?.articleImageUrl)}
                                    alt="Фото статьи"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    sx={{
                                        width: '100%',
                                        maxHeight: 220,
                                        borderRadius: '12px',
                                        objectFit: 'cover',
                                        border: '1px solid #444',
                                    }}
                                />
                            )}
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
                            maxHeight: { xs: '42dvh', sm: 'none' },
                            overflowY: { xs: 'auto', sm: 'visible' },
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
