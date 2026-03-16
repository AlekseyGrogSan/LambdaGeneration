import React, { useState, useRef, useCallback } from 'react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    Chip 
} from '@mui/material';

// Импорт иконок для редактора и галочки
import DoneIcon from '@mui/icons-material/Done';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import LinkIcon from '@mui/icons-material/Link';
import TitleIcon from '@mui/icons-material/Title';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

// Базовый URL для API (должен быть определен в реальном приложении)
const API_BASE_URL = 'http://localhost:5113/api';

// --- СПИСОК ДОСТУПНЫХ ТЕГОВ ---
const AVAILABLE_TAGS = [
    'C#', 'Java', 'Python', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'Kotlin',
    'Swift', 'PHP', 'C++', 'C', 'Ruby',
    '.NET', 'ASP.NET', 'Entity Framework', 'Spring', 'React', 'Angular', 'Vue',
    'Node.js', 'Django', 'Flask',
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
        // ✅ ДОБАВЛЕНО: Ограничиваем высоту для превью, чтобы активировать скролл
        maxHeight: '4.5em', // Ограничиваем высоту примерно 4-мя строками
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
    
    const getButtonStyle = (isActive, activeColor = '#00bfa5') => ({
        color: isActive ? activeColor : '#ffffff',
        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
        borderRadius: '4px',
        transition: 'all 0.2s',
        '&:hover': { backgroundColor: '#666666' }
    });

    return (
        <Box sx={{ display: 'flex', gap: 1, padding: 1, backgroundColor: '#555555', borderRadius: '8px 8px 0 0', border: '1px solid #444444' }}>
            <IconButton size="small" onClick={() => applyCommand('bold')} sx={getButtonStyle(activeStyles.bold)}>
                <FormatBoldIcon />
            </IconButton>

            <IconButton size="small" onClick={() => applyCommand('italic')} sx={getButtonStyle(activeStyles.italic)}>
                <FormatItalicIcon />
            </IconButton>

            <IconButton size="small" onClick={() => applyCommand('underline')} sx={getButtonStyle(activeStyles.underline)}>
                <FormatUnderlinedIcon />
            </IconButton>

            <IconButton size="small" onClick={() => {
                const url = prompt('Введите URL:');
                if (url) applyCommand('createLink', url);
            }} sx={{ color: '#00bfa5' }}>
                <LinkIcon />
            </IconButton>

            <IconButton size="small" onClick={() => applyCommand('formatBlock', '<h2>')} sx={getButtonStyle(activeStyles.h2, '#ffeb3b')}>
                <TitleIcon />
            </IconButton>

            <IconButton size="small" onClick={() => applyCommand('insertUnorderedList')} sx={getButtonStyle(activeStyles.listBulleted)}>
                <FormatListBulletedIcon />
            </IconButton>

            <IconButton size="small" onClick={() => applyCommand('insertOrderedList')} sx={getButtonStyle(activeStyles.listNumbered)}>
                <FormatListNumberedIcon />
            </IconButton>
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
    // 5. Состояние для тегов
    const [selectedTags, setSelectedTags] = useState([]);

    // Ссылка на DOM-элемент редактора (div с contenteditable)
    const editorRef = useRef(null);

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
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: '600px', md: '800px' },
        bgcolor: '#383838',
        borderRadius: '16px',
        boxShadow: 24,
        p: 4,
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        // Добавление максимальной высоты и скроллинга для всего модального окна, 
        // чтобы избежать выхода за пределы экрана на маленьких устройствах
        maxHeight: '90vh', 
        overflowY: 'auto',
        
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

    // --- ОБРАБОТЧИК СОХРАНЕНИЯ (ОБНОВЛЕН) ---
    const handlePublish = async () => {
        // Проверка на заполнение всех обязательных полей
        if (!title || !preview || !content || selectedTags.length === 0) {
            alert('Пожалуйста, заполните заголовок, анонс, текст и выберите хотя бы один тег.');
            return;
        }

        const postData = {
            article_title: title,
            article_preview: preview,
            article_content: content,
            article_tags: selectedTags // Передаем список строк-тегов
        };

        try {
            const response = await fetch(`${API_BASE_URL}/Articles/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
                credentials: 'include',
            });

            // 1. Обработка 401 Unauthorized
            if (response.status === 401) {
                alert('Для публикации статьи необходимо войти или зарегистрироваться.');
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
                
                const errorMessage = errorDetails.error || errorDetails.reason || `Ошибка публикации: ${response.status} ${response.statusText}`;
                const detailedReason = errorDetails.reason ? ` Причина: ${errorDetails.reason}` : '';
                const suggestion = errorDetails.suggestion ? ` Предложение: ${errorDetails.suggestion}` : '';
                
                alert(`Ошибка публикации: ${errorMessage}${detailedReason}${suggestion}`);
                console.error('Ошибка публикации:', errorDetails);
                return;
            }

            // 3. Успешная публикация (Status 200 OK или 204 No Content)
            
            alert('Статья успешно опубликована! ✅');
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
            if (editorRef.current) {
                editorRef.current.innerHTML = ''; // Очищаем содержимое
            }
            handleClose();

        } catch (error) {
            // Этот блок будет ловить сетевые ошибки или необработанные исключения (например, ошибку парсинга)
            console.error('Произошла ошибка при обработке запроса:', error);
            alert(`Произошла ошибка при связи с сервером: ${error.message}`);
        }
    };

    

    // --- ОСНОВНОЙ РЕНДЕРИНГ МОДАЛЬНОГО ОКНА ---
    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="post-creation-modal-title"
        >
            <Box sx={modalStyle}>
                <Typography id="post-creation-modal-title" variant="h5" component="h2" sx={{ color: '#ffffff', fontWeight: 300, textAlign: 'center', marginBottom: 2 }}>
                    Создать новый пост
                </Typography>

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
                            minHeight: '200px',
                            maxHeight: '40vh', // Установка максимальной высоты
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
                        maxHeight: '150px',
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
                <Button
                    variant="contained"
                    fullWidth
                    onClick={handlePublish}
                    disabled={!title || !preview || !content || selectedTags.length === 0} // Отключаем, если нет заголовка, превью, текста или тегов
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
                    Опубликовать
                </Button>
            </Box>
        </Modal>
    );
};

export default PostCreationModal;
