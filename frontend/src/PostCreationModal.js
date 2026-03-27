import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    Chip,
    Menu,
    MenuItem,
    Snackbar,
    Alert,
} from '@mui/material';

// Импорт иконок для редактора и галочки
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import LinkIcon from '@mui/icons-material/Link';
import TitleIcon from '@mui/icons-material/Title';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import CodeIcon from '@mui/icons-material/Code';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import { formatBytes, isArticleImageTooLarge, MAX_ARTICLE_IMAGE_BYTES } from './avatarUtils';
import { normalizeContentForSubmit } from './contentFormatting';

// Базовый URL для API (должен быть определен в реальном приложении)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

// --- СПИСОК ДОСТУПНЫХ ТЕГОВ ---
const AVAILABLE_TAGS = [
    'C#', 'Java', 'Python', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'Kotlin',
    'Swift', 'PHP', 'C++', 'C', 'Ruby', 'PascalABC',
    '.NET', 'ASP.NET', 'Entity Framework', 'Spring', 'React', 'Angular', 'Vue',
    'Node.js', 'Django', 'Flask', 'Unity',
    'Math', 'Data Structures', 'LLM', 'ML'
];

// --- СТИЛИ ДЛЯ ПОЛЕЙ ВВОДА (Input Styles) ---
const inputStyle = {
    // Общие стили для полей ввода Material UI в стиле "filled"
    '& .MuiFilledInput-root': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        borderRadius: '8px',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
        },
        '&.Mui-focused': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
        // ✅ ДОБАВЛЕНО: Активируем прокрутку внутри инпута
        overflowY: 'auto', 
        
        // =========================================================
        // !!! КРАСИВАЯ ПОЛОСА ПРОКРУТКИ ДЛЯ МУЛЬТИЛАЙН ИНПУТОВ !!!
        // =========================================================
        '&::-webkit-scrollbar': {
            width: '8px', // Ширина полосы
        },
        '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.05)', // Цвет фона трека
            borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
            background: '#00bfa5', // Цвет самого ползунка (фирменный цвет)
            borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
            background: '#009688', // Цвет ползунка при наведении
        },
    },
    // Стили для меток (label)
    '& .MuiInputLabel-root': {
        color: '#bdbdbd',
        '&.Mui-focused': {
            color: '#00bfa5', // Фирменный цвет при фокусе
        },
    },
    // Убираем нижнюю линию у filled-инпутов
    '& .MuiFilledInput-underline:before, & .MuiFilledInput-underline:after': {
        borderBottom: 'none',
    },
    '& .MuiInputBase-input': {
        padding: '16px 12px 16px 12px',
        maxHeight: '4.5em',
        overflowY: 'auto',
        '&::-webkit-scrollbar': { width: '8px' },
        '&::-webkit-scrollbar-track': { background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px' },
        '&::-webkit-scrollbar-thumb': { background: '#00bfa5', borderRadius: '10px' },
        '&::-webkit-scrollbar-thumb:hover': { background: '#009688' }
    },
};

// --- КОМПОНЕНТ: Панель Инструментов Редактора ---
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

    // Функция проверки: какие стили активны в месте курсора
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


    React.useEffect(() => {
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
        if (editorRef.current) {
            editorRef.current.focus();
        }
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
                backgroundColor: '#555555',
                borderRadius: '8px 8px 0 0',
                border: '1px solid #444444',
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
            <IconButton size="small" onClick={() => applyCommand('bold')} sx={{ ...getButtonStyle(activeStyles.bold), flex: '0 0 auto' }}>
                <FormatBoldIcon />
            </IconButton>

            <IconButton size="small" onClick={() => applyCommand('italic')} sx={{ ...getButtonStyle(activeStyles.italic), flex: '0 0 auto' }}>
                <FormatItalicIcon />
            </IconButton>

            <IconButton size="small" onClick={() => applyCommand('underline')} sx={{ ...getButtonStyle(activeStyles.underline), flex: '0 0 auto' }}>
                <FormatUnderlinedIcon />
            </IconButton>

            <IconButton size="small" onClick={() => {
                const url = prompt('Введите URL:');
                if (url) applyCommand('createLink', url);
            }} sx={{ color: '#00bfa5', flex: '0 0 auto' }}>
                <LinkIcon />
            </IconButton>

            <IconButton size="small" onClick={() => applyCommand('formatBlock', '<h2>')} sx={{ ...getButtonStyle(activeStyles.h2, '#ffeb3b'), flex: '0 0 auto' }}>
                <TitleIcon />
            </IconButton>

            <IconButton size="small" onClick={() => applyCommand('insertUnorderedList')} sx={{ ...getButtonStyle(activeStyles.listBulleted), flex: '0 0 auto' }}>
                <FormatListBulletedIcon />
            </IconButton>

            <IconButton size="small" onClick={() => applyCommand('insertOrderedList')} sx={{ ...getButtonStyle(activeStyles.listNumbered), flex: '0 0 auto' }}>
                <FormatListNumberedIcon />
            </IconButton>

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


// --- ОБНОВЛЕННЫЙ КОМПОНЕНТ: Создание поста (PostCreationModal) ---
const PostCreationModal = ({ open, handleClose, onUnauthorized, onPostSuccess }) => {
    // 1. Состояние для заголовка
    const [title, setTitle] = useState('');
    // 2. Состояние для анонса/превью
    const [preview, setPreview] = useState('');
    // 3. Состояние для контента поста (будет хранить HTML)
    const [content, setContent] = useState('');
    // 4. Состояние для файла (заглушка)
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [imageError, setImageError] = useState(null);
    // 5. Состояние для тегов
    const [selectedTags, setSelectedTags] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

    const showNotification = useCallback((message, severity = 'info') => {
        setNotification({ open: true, message, severity });
    }, []);

    const closeNotification = useCallback(() => {
        setNotification((prev) => ({ ...prev, open: false }));
    }, []);

    // Ссылка на DOM-элемент редактора (div с contenteditable)
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);

    // Обработчик ввода: обновляет состояние 'content' при изменении содержимого
    const handleContentChange = () => {
        if (editorRef.current) {
            // Сохраняем внутренний HTML-код редактора
            setContent(editorRef.current.innerHTML);
        }
    };

    // Стили для центрирования и оформления модального окна
    const modalStyle = {
        position: 'absolute',
        top: { xs: 0, sm: '50%' },
        left: { xs: 0, sm: '50%' },
        transform: { xs: 'none', sm: 'translate(-50%, -50%)' },
        width: { xs: '100vw', sm: '90%', md: '800px' },
        height: { xs: '100dvh', sm: 'auto' },
        bgcolor: '#383838',
        borderRadius: { xs: 0, sm: '16px' },
        boxShadow: 24,
        p: { xs: 2, sm: 4 },
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        // Добавление максимальной высоты и скроллинга для всего модального окна, 
        // чтобы избежать выхода за пределы экрана на маленьких устройствах
        maxHeight: { xs: '100dvh', sm: '90vh' }, 
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        
        '&::-webkit-scrollbar': {
            width: '8px', // Ширина полосы
        },
        '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.05)', // Цвет фона трека
            borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
            background: '#00bfa5', // Цвет самого ползунка (фирменный цвет)
            borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
            background: '#009688', // Цвет ползунка при наведении
        },
        // =========================================================
    };

    // --- ЛОГИКА ТЕГОВ ---
    const handleTagToggle = (tag) => {
        setSelectedTags(prevTags => {
            if (prevTags.includes(tag)) {
                // Удаляем тег
                return prevTags.filter(t => t !== tag);
            } else {
                // Добавляем тег, если лимит не достигнут
                if (prevTags.length < 5) {
                    return [...prevTags, tag];
                }
                return prevTags;
            }
        });
    };
    // --------------------
    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleImageChange = (event) => {
        const nextFile = event.target.files?.[0];
        if (!nextFile) return;

        if (isArticleImageTooLarge(nextFile)) {
            setImageError(`Размер фото не должен превышать ${formatBytes(MAX_ARTICLE_IMAGE_BYTES)}.`);
            setFile(null);
            setImagePreview('');
            return;
        }

        setImageError(null);
        setFile(nextFile);
        const nextPreview = URL.createObjectURL(nextFile);
        setImagePreview((prev) => {
            if (prev && prev.startsWith('blob:')) {
                URL.revokeObjectURL(prev);
            }
            return nextPreview;
        });
    };

    const clearSelectedImage = () => {
        setFile(null);
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

    // --- ОБРАБОТЧИК СОХРАНЕНИЯ (ОБНОВЛЕН) ---
    const handlePublish = async () => {
        if (isLoading) {
            return;
        }

        // Проверка на заполнение всех обязательных полей
        if (!title || !preview || !content) {
            showNotification('Пожалуйста, заполните заголовок, анонс и текст статьи.', 'warning');
            return;
        }

        if (imageError) {
            showNotification(imageError, 'warning');
            return;
        }

        const formData = new FormData();
        const normalizedContent = normalizeContentForSubmit(content);
        formData.append('article_title', title);
        formData.append('article_preview', preview);
        formData.append('article_content', normalizedContent);
        selectedTags.forEach((tag) => formData.append('article_tags', tag));
        if (file) {
            formData.append('picture', file);
        }

        try {
            setIsLoading(true);
            const response = await fetch(`${API_BASE_URL}/Articles/create`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            // 1. Обработка 401 Unauthorized
            if (response.status === 401) {
                showNotification('Для публикации статьи необходимо войти или зарегистрироваться.', 'warning');
                onUnauthorized();
                return;
            }

            // 2. Обработка ошибок (400 Bad Request, 500 Internal Server Error)
            if (!response.ok) {
                let errorDetails = {};
                try {
                    // Пытаемся прочитать JSON для получения деталей ошибки
                    errorDetails = await response.json();
                } catch (e) {
                    console.warn('Не удалось прочитать JSON ошибки. Возможно, ошибка сервера 500 без тела.', e);
                }
                
                const fieldErrors = errorDetails?.errors
                    ? Object.entries(errorDetails.errors)
                        .flatMap(([field, messages]) => {
                            const list = Array.isArray(messages) ? messages : [messages];
                            return list.map((msg) => `${field}: ${msg}`);
                        })
                        .join(' | ')
                    : '';
                const errorMessage = errorDetails.error
                    || errorDetails.reason
                    || (fieldErrors ? `Ошибка валидации: ${fieldErrors}` : `Ошибка публикации: ${response.status} ${response.statusText}`);
                const detailedReason = errorDetails.reason ? ` Причина: ${errorDetails.reason}` : '';
                const suggestion = errorDetails.suggestion ? ` Предложение: ${errorDetails.suggestion}` : '';
                
                showNotification(`Ошибка публикации: ${errorMessage}${detailedReason}${suggestion}`, 'error');
                console.error('Ошибка публикации:', errorDetails);
                return;
            }

            // 3. Успешная публикация (Status 200 OK или 204 No Content)
            
            showNotification('Статья успешно опубликована!', 'success');
            console.log('Статья успешно создана (Статус:', response.status, '). Бэкенд вернул пустое тело.');

            // ✅ КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Вызов функции обновления ленты
            if (onPostSuccess) {
                onPostSuccess();
            }
            
            // Очистка и закрытие
            setTitle('');
            setPreview('');
            setContent('');
            setSelectedTags([]);
            clearSelectedImage();
            if (editorRef.current) {
                editorRef.current.innerHTML = ''; // Очищаем содержимое
            }
            handleClose();

        } catch (error) {
            // Этот блок будет ловить сетевые ошибки или необработанные исключения (например, ошибку парсинга)
            console.error('Произошла ошибка при обработке запроса:', error);
            showNotification(`Произошла ошибка при связи с сервером: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    

    // --- ОСНОВНОЙ РЕНДЕРИНГ МОДАЛЬНОГО ОКНА ---
    return (
        <>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="post-creation-modal-title"
            >
                <Box sx={modalStyle}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography id="post-creation-modal-title" variant="h5" component="h2" sx={{ color: '#ffffff', fontWeight: 300 }}>
                        Создать новый пост
                    </Typography>
                    <IconButton aria-label="Закрыть" onClick={handleClose} sx={{ color: '#bdbdbd' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Поле для ввода заголовка проекта */}
                <TextField
                    label="Заголовок статьи"
                    variant="filled"
                    fullWidth
                    sx={inputStyle}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                {/* Поле для ввода краткого анонса (article_preview) */}
                <TextField
                    label="Краткий анонс статьи (для превью)"
                    variant="filled"
                    fullWidth
                    sx={inputStyle}
                    value={preview}
                    onChange={(e) => setPreview(e.target.value)}
                    multiline
                    // Добавляем rows, чтобы задать начальную высоту и активировать прокрутку при необходимости
                    rows={2} 
                    // ✅ ДОБАВЛЕНО: Ограничивает высоту 4-мя строками, после чего появляется скролл (совместно с maxHeight в inputStyle)
                    maxRows={4} 
                />

                {/* --- Р”РћР‘РђР’Р›Р•РќРР• Р¤РћРўРћ --- */}
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
                        {file && (
                            <Button
                                variant="text"
                                onClick={clearSelectedImage}
                                sx={{ color: '#ff8a80' }}
                            >
                                Убрать
                            </Button>
                        )}
                        <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
                            {file ? `${file.name} (${formatBytes(file.size)})` : 'Файл не выбран'}
                        </Typography>
                    </Box>
                    {imageError && (
                        <Typography variant="body2" sx={{ color: '#ff8a80' }}>
                            {imageError}
                        </Typography>
                    )}
                    {imagePreview && (
                        <Box
                            component="img"
                            src={imagePreview}
                            alt="Превью статьи"
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

                {/* --- СЕКЦИЯ РЕДАКТОРА ТЕКСТА (с красивым скроллом) --- */}
                <Box>
                    {/* --- 1. Панель Инструментов --- */}
                    <EditorToolbar editorRef={editorRef} />

                    {/* --- 2. Область Редактирования (contenteditable) --- */}
                    <Box
                        ref={editorRef}
                        contentEditable={true} // Ключевой атрибут!
                        onInput={handleContentChange} // Обновляем состояние при любом изменении
                        key="content-editable-box"
                        sx={{
                            minHeight: { xs: '180px', sm: '200px' },
                            maxHeight: { xs: '34dvh', sm: '40vh' }, // Установка максимальной высоты
                            overflowY: 'auto', // Добавление вертикальной прокрутки
                            padding: 2,
                            // Стиль поля ввода для соответствия inputStyle
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid #444444',
                            borderRadius: '0 0 8px 8px',
                            color: '#ffffff',
                            outline: 'none', // Убрать стандартное синее выделение фокуса
                            cursor: 'text',
                            
                            // =========================================================
                            // !!! КРАСИВАЯ ПОЛОСА ПРОКРУТКИ ДЛЯ РЕДАКТОРА !!!
                            // =========================================================
                            '&::-webkit-scrollbar': {
                                width: '8px', // Ширина полосы
                            },
                            '&::-webkit-scrollbar-track': {
                                background: 'rgba(255, 255, 255, 0.05)', // Цвет фона трека
                                borderRadius: '10px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: '#00bfa5', // Цвет самого ползунка (фирменный цвет)
                                borderRadius: '10px',
                            },
                            '&::-webkit-scrollbar-thumb:hover': {
                                background: '#009688', // Цвет ползунка при наведении
                            },
                            // =========================================================

                            // Стили для отображения форматированного текста внутри редактора
                            '& *': {
                                color: 'inherit', // Наследуем белый цвет
                            },
                            '& a': {
                                color: '#00bfa5', // Ссылки выделяем цветом
                            },
                            '& h2': {
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                margin: '0.5em 0',
                                color: '#ffeb3b', // Заголовок выделяем цветом
                            },
                            '& ul, & ol': {
                                marginLeft: '20px',
                            }
                        }}
                    >
                    </Box>
                </Box>

                {/* --- СЕКЦИЯ ВЫБОРА ТЕГОВ (ИНТЕГРИРОВАННАЯ) --- */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body1" sx={{ color: '#bdbdbd', fontWeight: 'bold' }}>
                        Выберите теги (до 5)
                    </Typography>

                    {/* Доступные теги для выбора */}
                    <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 1, 
                        // Добавлен небольшой скролл для списка тегов, если их много
                        maxHeight: { xs: '120px', sm: '150px' },
                        overflowY: 'auto',
                        padding: '4px',
                        border: '1px solid #444444',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        
                        // Добавляем красивый скролл для списка тегов
                        '&::-webkit-scrollbar': {
                            width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '10px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: '#00bfa5',
                            borderRadius: '10px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            background: '#009688',
                        },
                    }}>
                        {AVAILABLE_TAGS.map((tag) => {
                            const isSelected = selectedTags.includes(tag);
                            return (
                                <Chip
                                    key={tag}
                                    label={tag}
                                    onClick={() => handleTagToggle(tag)}
                                    // Иконка галочки при выборе
                                    icon={isSelected ? <DoneIcon style={{ color: 'white' }} /> : undefined}
                                    // Отключаем клик, если лимит достигнут и тег не выбран
                                    disabled={selectedTags.length >= 5 && !isSelected} 
                                    sx={{
                                        cursor: 'pointer',
                                        backgroundColor: isSelected ? '#00bfa5' : 'rgba(255, 255, 255, 0.1)',
                                        color: '#ffffff',
                                        border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.2)',
                                        fontSize: '0.9rem',
                                        padding: '8px 4px',
                                        opacity: (selectedTags.length >= 5 && !isSelected) ? 0.5 : 1, // Затемнение при отключении
                                        '&:hover': {
                                            backgroundColor: isSelected ? '#009688' : 'rgba(255, 255, 255, 0.2)',
                                        },
                                    }}
                                />
                            );
                        })}
                    </Box>
                    
                    {/* Индикатор выбранных тегов */}
                    <Typography variant="body2" sx={{ color: '#bdbdbd' }}>
                        Выбрано тегов: {selectedTags.length}/5
                    </Typography>
                </Box>
                
                {/* Кнопка "Опубликовать" */}
                <Box
                    sx={{
                        position: { xs: 'sticky', sm: 'static' },
                        bottom: 0,
                        pt: 1,
                        pb: { xs: 1, sm: 0 },
                        background: { xs: 'linear-gradient(180deg, rgba(56,56,56,0) 0%, rgba(56,56,56,1) 24%)', sm: 'transparent' }
                    }}
                >
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handlePublish}
                        disabled={!title || !preview || !content || isLoading} // Теги и картинка опциональны
                        sx={{
                            marginTop: 1,
                            backgroundColor: '#00bfa5',
                            '&:hover': { backgroundColor: '#009688' },
                            color: '#ffffff',
                            padding: '12px 0',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            borderRadius: '8px'
                        }}
                    >
                        {isLoading ? 'Публикация...' : 'Опубликовать'}
                    </Button>
                </Box>
                </Box>
            </Modal>

            <Snackbar
                open={notification.open}
                autoHideDuration={3500}
                onClose={closeNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={closeNotification} severity={notification.severity} variant="filled" sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default PostCreationModal;
