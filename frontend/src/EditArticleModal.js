import React, { useState, useEffect, useRef, useCallback } from 'react';
import ConfirmationDialog from './ConfirmationDialog';
import InputDialog from './InputDialog';
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
    MenuItem,
    Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import DoneIcon from '@mui/icons-material/Done';
import EditNoteIcon from '@mui/icons-material/EditNote';
import LabelIcon from '@mui/icons-material/Label';
import DeleteIcon from '@mui/icons-material/Delete'; // ✅ ИМПОРТ: Иконка для удаления
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

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
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { buildArticleImageUrl, formatBytes, isArticleImageTooLarge, MAX_ARTICLE_IMAGE_BYTES } from './avatarUtils';
import { normalizeContentForSubmit, formatContentForRender, normalizeCodeLanguage, formatCodeLanguageLabel } from './contentFormatting';
import { buildModerationErrorMessage } from './moderationFlags';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

// ТЕ ЖЕ ТЕГИ, ЧТО И ПРИ СОЗДАНИИ
const AVAILABLE_TAGS = [
    'C#', 'Java', 'Python', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'Kotlin',
    'Swift', 'PHP', 'C++', 'C', 'Ruby', 'PascalABC',
    '.NET', 'ASP.NET', 'Entity Framework', 'Spring', 'React', 'Angular', 'Vue',
    'Node.js', 'Django', 'Flask', 'Unity',
    'Math', 'Data Structures', 'LLM', 'ML'
];

const AI_EDIT_MODES = [
    { value: 'official_style', label: 'Официальный стиль' },
    { value: 'add_information', label: 'Добавить информацию' },
    { value: 'add_emotions', label: 'Добавить эмоции' },
    { value: 'fix_errors', label: 'Исправить ошибки' }
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
        overflowY: 'auto',
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
    },
    '& .MuiInputLabel-root': { color: '#bdbdbd' },
    '& .MuiInputBase-input': {
        padding: '16px 12px 16px 12px',
        maxHeight: '4.5em',
        overflowY: 'auto',
        '&::-webkit-scrollbar': { width: '8px' },
        '&::-webkit-scrollbar-track': { background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px' },
        '&::-webkit-scrollbar-thumb': { background: '#00bfa5', borderRadius: '10px' },
        '&::-webkit-scrollbar-thumb:hover': { background: '#009688' }
    }
};

const EditorToolbar = ({ editorRef, setInputDialog, onOpenAiPanel, aiBusy, aiHasSuggestion }) => {
    const selectionRangeRef = useRef(null);
    const [activeStyles, setActiveStyles] = useState({
        bold: false,
        italic: false,
        underline: false,
        listBulleted: false,
        listNumbered: false,
        h2: false
    });
    const [fontSizeAnchor, setFontSizeAnchor] = useState(null);
    const [textColorAnchor, setTextColorAnchor] = useState(null);
    const [helpAnchor, setHelpAnchor] = useState(null);
    const [currentTextColor, setCurrentTextColor] = useState('#ffffff');

    const highlightEditorCodeBlocks = useCallback(() => {
        const editor = editorRef.current;
        if (!editor) return;

        editor.querySelectorAll('table.code-block-table pre code').forEach((block) => {
            const languageCls = Array.from(block.classList).find((cls) => cls.startsWith('language-'));
            const normalizedLang = normalizeCodeLanguage(languageCls ? languageCls.replace('language-', '') : 'text');
            const plainText = block.textContent || '';

            block.className = `language-${normalizedLang}`;
            block.textContent = plainText;

            try {
                if (normalizedLang !== 'text' && hljs.getLanguage(normalizedLang)) {
                    hljs.highlightElement(block);
                }
            } catch {
                // Ignore highlight errors for unsupported languages.
            }
        });
    }, [editorRef]);

    const basicTextColors = [
        { name: 'Черный', value: '#000000' },
        { name: 'Белый', value: '#ffffff' },
        { name: 'Красный', value: '#f44336' },
        { name: 'Оранжевый', value: '#ff9800' },
        { name: 'Желтый', value: '#ffeb3b' },
        { name: 'Зеленый', value: '#4caf50' },
        { name: 'Синий', value: '#2196f3' }
    ];

    const textEditorShortcuts = [
        { combo: 'Ctrl+B', action: 'Жирный текст' },
        { combo: 'Ctrl+I', action: 'Курсив' },
        { combo: 'Ctrl+U', action: 'Подчеркнутый текст' },
        { combo: 'Ctrl+Shift+8', action: 'Маркированный список' },
        { combo: 'Ctrl+Shift+7', action: 'Нумерованный список' },
        { combo: 'Ctrl+Alt+2', action: 'Заголовок H2' },
        { combo: 'Ctrl+K', action: 'Добавить ссылку' },
        { combo: 'Ctrl+Shift+0', action: 'Сбросить цвет текста (по умолчанию)' }
    ];

    const saveSelection = useCallback(() => {
        const editor = editorRef.current;
        const selection = window.getSelection();
        if (!editor || !selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        if (editor.contains(range.commonAncestorContainer)) {
            selectionRangeRef.current = range.cloneRange();
        }
    }, [editorRef]);

    const restoreSelection = useCallback(() => {
        const selection = window.getSelection();
        const savedRange = selectionRangeRef.current;
        if (!selection || !savedRange) return;

        selection.removeAllRanges();
        selection.addRange(savedRange);
    }, []);

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
        editor.addEventListener('mouseup', saveSelection);
        editor.addEventListener('keyup', saveSelection);

        return () => {
            editor.removeEventListener('mouseup', updateToolbarStatus);
            editor.removeEventListener('keyup', updateToolbarStatus);
            editor.removeEventListener('mouseup', saveSelection);
            editor.removeEventListener('keyup', saveSelection);
        };
    }, [editorRef, updateToolbarStatus, saveSelection]);

    const applyCommand = useCallback((command, value = null) => {
        if (editorRef.current) editorRef.current.focus();
        restoreSelection();
        document.execCommand(command, false, value);
        saveSelection();
        updateToolbarStatus();
    }, [editorRef, updateToolbarStatus, restoreSelection, saveSelection]);

    const applyTextColor = useCallback((color) => {
        if (editorRef.current) {
            editorRef.current.focus();
            restoreSelection();
        }

        document.execCommand('styleWithCSS', false, true);
        document.execCommand('foreColor', false, color);
        setCurrentTextColor(color);
        saveSelection();
        updateToolbarStatus();
    }, [editorRef, restoreSelection, saveSelection, updateToolbarStatus]);

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const onKeyDown = (event) => {
            if (!(event.ctrlKey || event.metaKey)) return;

            const key = event.key.toLowerCase();

            if (key === 'b') {
                event.preventDefault();
                applyCommand('bold');
                return;
            }

            if (key === 'i') {
                event.preventDefault();
                applyCommand('italic');
                return;
            }

            if (key === 'u') {
                event.preventDefault();
                applyCommand('underline');
                return;
            }

            if (key === 'k') {
                event.preventDefault();
                const url = prompt('URL:');
                if (url) applyCommand('createLink', url);
                return;
            }

            if (event.shiftKey && key === '8') {
                event.preventDefault();
                applyCommand('insertUnorderedList');
                return;
            }

            if (event.shiftKey && key === '7') {
                event.preventDefault();
                applyCommand('insertOrderedList');
                return;
            }

            if (event.altKey && key === '2') {
                event.preventDefault();
                applyCommand('formatBlock', '<h2>');
                return;
            }

            if (event.shiftKey && key === '0') {
                event.preventDefault();
                applyTextColor('#ffffff');
            }
        };

        editor.addEventListener('keydown', onKeyDown);

        return () => {
            editor.removeEventListener('keydown', onKeyDown);
        };
    }, [editorRef, applyCommand, applyTextColor]);

    const insertCodeBlock = useCallback(() => {
        setInputDialog({
            open: true,
            title: 'Добавление кода',
            label: 'Введите язык программирования (например, python, javascript) или оставьте пустым',
            initialValue: 'text',
            onConfirm: (lang) => {
                setInputDialog(prev => ({ ...prev, open: false }));
                const normalizedLang = normalizeCodeLanguage(lang || 'text');
                const languageLabel = formatCodeLanguageLabel(normalizedLang);
                const codeHTML = `<br><table class="tg-code-block code-block-table" data-language="${normalizedLang}" style="width: 100%; background: linear-gradient(180deg, #121820, #0d1117); border-radius: 12px; border: 1px solid rgba(0,229,201,0.25); border-collapse: separate; border-spacing: 0; margin: 14px 0; overflow: hidden; table-layout: fixed;"><thead><tr><th style="padding: 8px 12px; background: linear-gradient(90deg, #18202a, #141a22); color: rgba(206,231,255,0.9); font-family: 'JetBrains Mono', Consolas, monospace; font-size: 12px; text-align: left; font-weight: 700; letter-spacing: 0.4px; border-bottom: 1px solid rgba(255,255,255,0.08); user-select: none;">${languageLabel}</th></tr></thead><tbody><tr><td style="padding: 14px; overflow-x: auto;"><pre style="margin: 0; white-space: pre-wrap !important; word-wrap: break-word; background: transparent;"><code class="language-${normalizedLang}" style="font-family: 'JetBrains Mono', Consolas, monospace; font-size: 14px; line-height: 1.55; background: transparent !important; padding: 0 !important; border: none !important; color: #e6edf3;">// Ваш код...</code></pre></td></tr></tbody></table><br><div style="min-height: 20px;"></div>`;
                applyCommand('insertHTML', codeHTML);

                setTimeout(() => {
                    highlightEditorCodeBlocks();
                }, 0);
            }
        });
    }, [applyCommand, highlightEditorCodeBlocks, setInputDialog]);

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

            <IconButton
                size="small"
                onClick={(e) => { saveSelection(); setTextColorAnchor(e.currentTarget); }}
                sx={{
                    color: currentTextColor,
                    flex: '0 0 auto',
                    borderBottom: `2px solid ${currentTextColor}`,
                    borderRadius: '4px',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
                title="Цвет текста"
            >
                <FormatColorTextIcon />
            </IconButton>

            <Menu
                anchorEl={textColorAnchor}
                open={Boolean(textColorAnchor)}
                onClose={() => setTextColorAnchor(null)}
                sx={{ zIndex: 1600 }}
                PaperProps={{
                    sx: {
                        backgroundColor: '#333',
                        color: 'white'
                    }
                }}
            >
                <MenuItem
                    onClick={() => {
                        applyTextColor('#ffffff');
                        setTextColorAnchor(null);
                    }}
                >
                    Сбросить цвет (по умолчанию)
                </MenuItem>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

                {basicTextColors.map((colorOption) => (
                    <MenuItem
                        key={colorOption.value}
                        onClick={() => {
                            applyTextColor(colorOption.value);
                            setTextColorAnchor(null);
                        }}
                        sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}
                    >
                        <Box
                            sx={{
                                width: 14,
                                height: 14,
                                borderRadius: '50%',
                                backgroundColor: colorOption.value,
                                border: colorOption.value === '#ffffff' ? '1px solid #777' : 'none'
                            }}
                        />
                        {colorOption.name}
                    </MenuItem>
                ))}
            </Menu>
            
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

            <Box sx={{ marginLeft: 'auto' }} />

            <IconButton
                size="small"
                onClick={(e) => onOpenAiPanel?.(e.currentTarget)}
                sx={{
                    color: aiHasSuggestion ? '#00e5c9' : '#cde9e4',
                    border: '1px solid rgba(0,229,201,0.35)',
                    width: 26,
                    height: 26,
                    flex: '0 0 auto',
                    '&:hover': { backgroundColor: 'rgba(0,229,201,0.12)' }
                }}
                title="AI-редактор"
            >
                {aiBusy ? <CircularProgress size={14} color="inherit" /> : <AutoFixHighIcon sx={{ fontSize: 16 }} />}
            </IconButton>

            <IconButton
                size="small"
                onClick={(e) => setHelpAnchor(e.currentTarget)}
                sx={{
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.25)',
                    width: 24,
                    height: 24,
                    flex: '0 0 auto',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.12)' }
                }}
                title="Горячие клавиши"
            >
                <PriorityHighIcon sx={{ fontSize: 14 }} />
            </IconButton>

            <Menu
                anchorEl={helpAnchor}
                open={Boolean(helpAnchor)}
                onClose={() => setHelpAnchor(null)}
                sx={{ zIndex: 1600 }}
                PaperProps={{
                    sx: {
                        backgroundColor: '#232323',
                        color: 'white',
                        width: 340,
                        border: '1px solid rgba(255,255,255,0.12)'
                    }
                }}
            >
                <Box
                    sx={{
                        p: 1.5,
                        maxHeight: 220,
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': {
                            width: '8px'
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'rgba(255, 255, 255, 0.06)',
                            borderRadius: '10px'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: 'linear-gradient(180deg, #00d4b8, #00a58f)',
                            borderRadius: '10px'
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            background: 'linear-gradient(180deg, #00e0c2, #00b39b)'
                        },
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#00bfa5 rgba(255,255,255,0.06)'
                    }}
                >
                    <Typography sx={{ fontWeight: 700, color: '#00bfa5', mb: 1 }}>
                        Горячие клавиши редактора
                    </Typography>
                    {textEditorShortcuts.map((shortcut) => (
                        <Box key={shortcut.combo} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.7 }}>
                            <Typography sx={{ color: '#e0e0e0', fontWeight: 600 }}>{shortcut.combo}</Typography>
                            <Typography sx={{ color: '#bdbdbd', textAlign: 'right' }}>{shortcut.action}</Typography>
                        </Box>
                    ))}
                </Box>
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

const flattenErrorMessages = (errors) => {
    if (!errors) return '';
    if (typeof errors === 'string') return errors;
    if (Array.isArray(errors)) {
        return errors.filter(Boolean).join(' ');
    }
    if (typeof errors === 'object') {
        return Object.entries(errors)
            .map(([field, value]) => {
                const messages = Array.isArray(value) ? value : [value];
                const joined = messages.filter(Boolean).join(' ');
                return joined ? `${field}: ${joined}` : '';
            })
            .filter(Boolean)
            .join(' ');
    }
    return '';
};

const extractApiErrorMessage = async (response, fallback = 'Ошибка запроса') => {
    const clone = response.clone();

    try {
        const payload = await response.json();
        if (payload) {
            const moderationMessage = buildModerationErrorMessage(payload);
            if (moderationMessage) return moderationMessage;

            if (payload.message) return payload.message;
            if (payload.detail) return payload.detail;
            if (payload.error) {
                return payload.error;
            }
            const flattened = flattenErrorMessages(
                payload.errors ?? payload.Errors ?? payload.modelState ?? payload.response ?? payload
            );
            if (flattened) return flattened;
        }
    } catch {
        // Ignore JSON parse errors
    }

    try {
        const text = await clone.text();
        if (text) return text;
    } catch {
        // Ignore text parse errors
    }

    return fallback;
};

// ✅ ДОБАВЛЕН onDeleteSuccess
        const EditArticleModal = ({ open, handleClose, post, onUpdateSuccess, onDeleteSuccess, container, disablePortal, isAdmin = false }) => {
    const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null });
    const [inputDialog, setInputDialog] = useState({ open: false, title: '', label: '', initialValue: '', onConfirm: null });
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

    const [aiEditMode, setAiEditMode] = useState('official_style');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [aiOriginalContent, setAiOriginalContent] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [aiPanelAnchorEl, setAiPanelAnchorEl] = useState(null);
    const aiTypingTimerRef = useRef(null);
    
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);
    useEffect(() => {
        if (post && open) {
            setEditMode('content'); // Сброс режима при открытии
            setAiEditMode('official_style');
            setTitle(post.title || '');
            setPreview(post.article_preview || '');
            setContent(post.article_content || '');
            setSelectedTags(post.tags || []);
            setError(null);
            setSuccessMsg('');
            resetAiSuggestion();
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
            if (aiTypingTimerRef.current) {
                clearInterval(aiTypingTimerRef.current);
                aiTypingTimerRef.current = null;
            }
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleContentChange = () => {
        if (editorRef.current) {
            setContent(editorRef.current.innerHTML);
        }
    };

    const setEditorHtml = useCallback((html) => {
        setContent(html);
        if (editorRef.current) {
            editorRef.current.innerHTML = html;
        }
    }, []);

    const stopAiTypingAnimation = useCallback(() => {
        if (aiTypingTimerRef.current) {
            clearInterval(aiTypingTimerRef.current);
            aiTypingTimerRef.current = null;
        }
        setIsAiTyping(false);
    }, []);

    const tokenizeHtmlForTyping = useCallback((html) => {
        const chunks = (html || '').split(/(<[^>]+>)/g).filter(Boolean);
        const tokens = [];

        chunks.forEach((chunk) => {
            if (chunk.startsWith('<') && chunk.endsWith('>')) {
                tokens.push({ isTag: true, value: chunk });
            } else {
                for (const char of chunk) {
                    tokens.push({ isTag: false, value: char });
                }
            }
        });

        return tokens;
    }, []);

    const splitWordsPreserveSpaces = useCallback((text) => {
        return (text || '').split(/(\s+)/);
    }, []);

    const buildWordSwapFrames = useCallback((oldHtml, newHtml) => {
        const oldTokens = tokenizeHtmlForTyping(oldHtml || '');
        const newTokens = tokenizeHtmlForTyping(newHtml || '');

        if (oldTokens.length !== newTokens.length) {
            return null;
        }

        for (let i = 0; i < oldTokens.length; i += 1) {
            if (oldTokens[i].isTag !== newTokens[i].isTag) {
                return null;
            }
            if (oldTokens[i].isTag && oldTokens[i].value !== newTokens[i].value) {
                return null;
            }
        }

        const partsByToken = {};
        const changes = [];

        for (let i = 0; i < oldTokens.length; i += 1) {
            if (oldTokens[i].isTag) continue;

            const oldParts = splitWordsPreserveSpaces(oldTokens[i].value);
            const newParts = splitWordsPreserveSpaces(newTokens[i].value);

            if (oldParts.length !== newParts.length) {
                return null;
            }

            partsByToken[i] = [...oldParts];

            for (let j = 0; j < oldParts.length; j += 1) {
                if (oldParts[j] !== newParts[j]) {
                    changes.push({ tokenIdx: i, partIdx: j, next: newParts[j] });
                }
            }
        }

        if (!changes.length) {
            return [newHtml];
        }

        const maxChanges = 90;
        const effectiveChanges = changes.slice(0, maxChanges);
        const frames = [];
        const changesPerFrame = 2;

        const buildHtmlFromState = () => {
            return oldTokens
                .map((token, idx) => (token.isTag ? token.value : (partsByToken[idx] || []).join('')))
                .join('');
        };

        for (let i = 0; i < effectiveChanges.length; i += changesPerFrame) {
            for (let j = i; j < Math.min(i + changesPerFrame, effectiveChanges.length); j += 1) {
                const change = effectiveChanges[j];
                partsByToken[change.tokenIdx][change.partIdx] = change.next;
            }
            frames.push(buildHtmlFromState());
        }

        frames.push(newHtml);
        return frames;
    }, [splitWordsPreserveSpaces, tokenizeHtmlForTyping]);

    const startAiTypingAnimation = useCallback((fullHtml) => {
        stopAiTypingAnimation();
        const tokens = tokenizeHtmlForTyping(fullHtml);

        if (!tokens.length) {
            setEditorHtml('');
            return;
        }

        setEditorHtml('');
        setIsAiTyping(true);

        let index = 0;
        let currentHtml = '';
        aiTypingTimerRef.current = setInterval(() => {
            if (index >= tokens.length) {
                setEditorHtml(fullHtml);
                stopAiTypingAnimation();
                return;
            }

            let appendChunk = '';
            let steps = 0;

            while (index < tokens.length && steps < 5) {
                const token = tokens[index];
                appendChunk += token.value;
                index += 1;
                steps += token.isTag ? 2 : 1;

                if (!token.isTag) {
                    break;
                }
            }

            currentHtml += appendChunk;
            setEditorHtml(currentHtml);

            if (index >= tokens.length) {
                setEditorHtml(fullHtml);
                stopAiTypingAnimation();
            }
        }, 14);
    }, [setEditorHtml, stopAiTypingAnimation, tokenizeHtmlForTyping]);

    const startAiWordSwapAnimation = useCallback((oldHtml, newHtml) => {
        stopAiTypingAnimation();
        const frames = buildWordSwapFrames(oldHtml, newHtml);

        if (!frames || !frames.length) {
            return false;
        }

        setIsAiTyping(true);
        let frameIdx = 0;

        aiTypingTimerRef.current = setInterval(() => {
            if (frameIdx >= frames.length) {
                setEditorHtml(newHtml);
                stopAiTypingAnimation();
                return;
            }

            setEditorHtml(frames[frameIdx]);
            frameIdx += 1;

            if (frameIdx >= frames.length) {
                setEditorHtml(newHtml);
                stopAiTypingAnimation();
            }
        }, 85);

        return true;
    }, [buildWordSwapFrames, setEditorHtml, stopAiTypingAnimation]);

    const getSelectedHtmlFromEditor = useCallback(() => {
        const editor = editorRef.current;
        const selection = window.getSelection();

        if (!editor || !selection || selection.rangeCount === 0 || selection.isCollapsed) {
            return '';
        }

        const range = selection.getRangeAt(0);
        if (!editor.contains(range.commonAncestorContainer)) {
            return '';
        }

        const fragmentContainer = document.createElement('div');
        fragmentContainer.appendChild(range.cloneContents());
        return fragmentContainer.innerHTML.trim();
    }, []);

    const resetAiSuggestion = useCallback(() => {
        stopAiTypingAnimation();
        setAiSuggestion(null);
        setAiOriginalContent('');
    }, [stopAiTypingAnimation]);

    const handleOpenAiPanel = useCallback((anchorEl) => {
        setAiPanelAnchorEl(anchorEl);
    }, []);

    const handleCloseAiPanel = useCallback(() => {
        setAiPanelAnchorEl(null);
    }, []);

    const handleAiEditRequest = async () => {
        const baselineContent = editorRef.current?.innerHTML ?? content;

        if (!baselineContent.trim()) {
            setError('Добавьте текст статьи перед AI-редактированием.');
            return;
        }

        setAiLoading(true);
        setError(null);
        setSuccessMsg('');

        try {
            setAiOriginalContent(baselineContent);

            const selectedHtml = getSelectedHtmlFromEditor();
            const normalizedContent = normalizeContentForSubmit(baselineContent);

            const response = await fetch(`${API_BASE_URL}/Articles/ai-edit`, {
                method: 'POST',
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    article_content: normalizedContent,
                    mode: aiEditMode,
                    selected_html: selectedHtml || null
                })
            });

            if (!response.ok) {
                const errorMessage = await extractApiErrorMessage(response, 'Ошибка AI-редактирования');
                throw new Error(errorMessage);
            }

            const payload = await response.json();
            const rawEditedHtml = payload?.edited_content || '';
            const editedHtml = normalizeContentForSubmit(rawEditedHtml);

            if (payload?.no_changes) {
                setAiSuggestion(null);
                setSuccessMsg('ИИ не предложил изменений для текущего текста.');
                return;
            }

            if (!editedHtml.trim()) {
                throw new Error('ИИ вернул пустой результат.');
            }

            setAiSuggestion({
                editedContent: editedHtml,
                sourceWasSelection: Boolean(payload?.applied_to_selection),
                totalTokens: Number(payload?.total_tokens || 0)
            });

            const useSoftWordChanges = aiEditMode === 'add_emotions' || aiEditMode === 'fix_errors';
            if (useSoftWordChanges) {
                const startedSoftAnimation = startAiWordSwapAnimation(baselineContent, editedHtml);
                if (!startedSoftAnimation) {
                    startAiTypingAnimation(editedHtml);
                }
            } else {
                startAiTypingAnimation(editedHtml);
            }
        } catch (err) {
            setError(err.message || 'Ошибка AI-редактирования');
        } finally {
            setAiLoading(false);
        }
    };

    const handleApproveAiChanges = () => {
        if (!aiSuggestion?.editedContent) return;

        stopAiTypingAnimation();
        const nextContent = aiSuggestion.editedContent;
        setEditorHtml(nextContent);

        setSuccessMsg('AI-изменения применены. Проверьте результат и сохраните статью.');
        resetAiSuggestion();
    };

    const handleRejectAiChanges = () => {
        stopAiTypingAnimation();
        if (aiOriginalContent) {
            setEditorHtml(aiOriginalContent);
        }
        resetAiSuggestion();
        setSuccessMsg('AI-изменения отклонены.');
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

    // ✅ НОВЫЙ МЕТОД: Удаление статьи
    const handleDeleteArticle = async () => {
        setConfirmDialog({
            open: true,
            title: 'Удалить статью',
            message: 'Вы уверены, что хотите удалить эту статью? Это действие необратимо.',
            onConfirm: async () => {
                setConfirmDialog(prev => ({ ...prev, open: false }));
                setIsLoading(true);
                setError(null); 
                setSuccessMsg(''); 

                try {
                    const deleteUrl = isAdmin ? `${API_BASE_URL}/admin/articles/${post.id}` : `${API_BASE_URL}/Articles/delete/${post.id}`;
                    // Используется ваш маршрут DELETE /Articles/delete/{id} или admin delete
                    const response = await fetch(deleteUrl, { 
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
                        const errorText = await extractApiErrorMessage(response, response.statusText || 'Неизвестная ошибка');
                        throw new Error(`Ошибка удаления: ${errorText}`);
                    }
                } catch (err) {
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            }
        });
    };
    
    // МЕТОД: Сохранение контента
    const handleSaveContent = async () => {
        if (imageError) {
            setError(imageError);
            return;
        }

        if (!title.trim() || !preview.trim() || !content.trim()) {
            setError('Для сохранения заполните название, превью и основной контент статьи.');
            return;
        }

        setIsLoading(true); setError(null); setSuccessMsg('');
        try {
            const formData = new FormData();
            const normalizedContent = normalizeContentForSubmit(content);
            formData.append('article_id', post.id);
            formData.append('article_title', title);
            formData.append('article_preview', preview);
            formData.append('article_content', normalizedContent);
            if (imageFile) {
                formData.append('picture', imageFile);
            }

        const updateUrl = `${API_BASE_URL}/Articles/update`;
        const response = await fetch(updateUrl, {
            method: 'PUT',
            body: formData,
            credentials: 'include'
        });

            if (!response.ok) {
                const errorMessage = await extractApiErrorMessage(response, 'Ошибка обновления контента');
                throw new Error(errorMessage);
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
            const updateTagsUrl = `${API_BASE_URL}/Articles/updatetags`;
            const response = await fetch(updateTagsUrl, {
                method: 'PUT',
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    article_id: post.id,
                    article_tags: selectedTags
                })
            });

            if (!response.ok) {
                const errorMessage = await extractApiErrorMessage(response, 'Ошибка обновления тегов');
                throw new Error(errorMessage);
            }
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
            resetAiSuggestion();
            setAiPanelAnchorEl(null);
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
        <>
        <Modal disableRestoreFocus
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
                            <EditorToolbar
                                editorRef={editorRef}
                                setInputDialog={setInputDialog}
                                onOpenAiPanel={handleOpenAiPanel}
                                aiBusy={aiLoading}
                                aiHasSuggestion={Boolean(aiSuggestion)}
                            />
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

                            <Menu
                                anchorEl={aiPanelAnchorEl}
                                open={Boolean(aiPanelAnchorEl)}
                                onClose={handleCloseAiPanel}
                                sx={{ zIndex: 1700 }}
                                PaperProps={{
                                    sx: {
                                        width: { xs: '92vw', sm: 520 },
                                        maxWidth: '92vw',
                                        backgroundColor: '#1d2a2a',
                                        border: '1px solid rgba(0,191,165,0.35)',
                                        color: '#d6fff8',
                                        p: 1.4
                                    }
                                }}
                            >
                                <Typography sx={{ color: '#9ff5e8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                                    <AutoFixHighIcon fontSize="small" /> AI-редактор
                                </Typography>

                                <Typography variant="caption" sx={{ color: '#b9e9e2' }}>
                                    Если выделить часть текста в редакторе, ИИ изменит только этот фрагмент. Это снижает расход токенов.
                                </Typography>

                                <ToggleButtonGroup
                                    value={aiEditMode}
                                    exclusive
                                    onChange={(e, newMode) => {
                                        if (newMode) setAiEditMode(newMode);
                                    }}
                                    sx={{
                                        mt: 1,
                                        flexWrap: 'wrap',
                                        gap: 0.6,
                                        '& .MuiToggleButton-root': {
                                            color: '#cde9e4',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '8px !important',
                                            textTransform: 'none',
                                            px: 1.2,
                                            py: 0.5,
                                            fontSize: '0.78rem'
                                        },
                                        '& .Mui-selected': {
                                            color: '#ffffff !important',
                                            bgcolor: '#00bfa5 !important',
                                            borderColor: '#00bfa5 !important'
                                        }
                                    }}
                                >
                                    {AI_EDIT_MODES.map((mode) => (
                                        <ToggleButton key={mode.value} value={mode.value}>
                                            {mode.label}
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>

                                <Button
                                    variant="outlined"
                                    onClick={handleAiEditRequest}
                                    disabled={aiLoading || isLoading}
                                    startIcon={aiLoading ? <CircularProgress size={18} color="inherit" /> : <AutoFixHighIcon />}
                                    sx={{
                                        mt: 1,
                                        color: '#00d8bf',
                                        borderColor: '#00bfa5',
                                        fontWeight: 700,
                                        '&:hover': {
                                            borderColor: '#00d8bf',
                                            bgcolor: 'rgba(0,191,165,0.1)'
                                        }
                                    }}
                                >
                                    {aiLoading ? 'ИИ редактирует...' : 'Запустить AI-редактирование'}
                                </Button>

                                {aiSuggestion && (
                                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1.1 }}>
                                        <Typography variant="caption" sx={{ color: '#bde8e2' }}>
                                            {aiSuggestion.sourceWasSelection ? 'Изменен выделенный фрагмент.' : 'Изменена вся статья.'}
                                        </Typography>

                                        {isAiTyping && (
                                            <Typography variant="caption" sx={{ color: '#9ee9de' }}>
                                                ИИ печатает изменения прямо в основном поле...
                                            </Typography>
                                        )}

                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            <Button
                                                variant="contained"
                                                onClick={handleApproveAiChanges}
                                                startIcon={<CheckCircleOutlineIcon />}
                                                sx={{ bgcolor: '#00bfa5', '&:hover': { bgcolor: '#00897b' } }}
                                            >
                                                Принять изменения
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                onClick={handleRejectAiChanges}
                                                startIcon={<HighlightOffIcon />}
                                                sx={{ color: '#ff9e9e', borderColor: '#ff9e9e' }}
                                            >
                                                Отклонить
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </Menu>
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
                                        objectPosition: 'left center',
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

            <InputDialog
                open={inputDialog.open}
                title={inputDialog.title}
                label={inputDialog.label}
                initialValue={inputDialog.initialValue}
                onConfirm={inputDialog.onConfirm}
                onCancel={() => setInputDialog(prev => ({ ...prev, open: false }))}
            />

            <ConfirmationDialog
                open={confirmDialog.open}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
                confirmText="Удалить"
                cancelText="Отмена"
                isLoading={isLoading}
            />
        </>
    );
};

export default EditArticleModal;
