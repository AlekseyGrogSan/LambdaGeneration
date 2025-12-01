import React, { useState, useRef, useCallback } from 'react';
import {
    Box,
    AppBar,
    Toolbar,
    InputBase,
    IconButton,
    Button,
    Typography,
    Link as MuiLink,
    Modal,
    TextField,
    useMediaQuery,
    useTheme
} from '@mui/material';

// Импорт иконок для использования в интерфейсе
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

// --- НОВЫЕ ИМПОРТЫ ДЛЯ РЕДАКТОРА ---
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import LinkIcon from '@mui/icons-material/Link';
import TitleIcon from '@mui/icons-material/Title';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
// ------------------------------------

// Импорт дочерних компонентов
import PostCard from './PostCard';
import PostDetailPage from './PostDetailPage';
import ProfileModal from './ProfileModal';

// Базовый URL для API(пока http://localhost:5113/api)
const API_BASE_URL = 'http://localhost:5113/api';

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
    },
};

// --- КОМПОНЕНТ: Регистрация (RegistrationModal) ---
// --- КОМПОНЕНТ: RegistrationModal (Обновлен для логики) ---
const RegistrationModal = ({ open, handleClose, onForgotPassword }) => {
    // Внутреннее состояние для переключения между Регистрацией и Входом
    const [isRegisterMode, setIsRegisterMode] = useState(true);
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        aboutUser: '', // Только для регистрации
    });
    const [error, setError] = useState('');

    // Внимание: inputStyle должен быть доступен в этой области видимости

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: '400px' },
        bgcolor: '#383838',
        borderRadius: '16px',
        boxShadow: 24,
        p: 4,
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const endpoint = isRegisterMode ? `${API_BASE_URL}/users/register` : `${API_BASE_URL}/users/login`;
        const payload = isRegisterMode
            ? {
                UserName: formData.userName,
                Email: formData.email,
                Password: formData.password,
                aboutUser: formData.aboutUser
            } // Соответствует RegisterUserRequest.cs
            : {
                Email: formData.email,
                Password: formData.password
            }; // Соответствует LoginUserRequest.cs

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                // Если вход успешен, бэкенд возвращает куки (auth_cookies)
                if (!isRegisterMode) {
                    alert('Вход успешен! Куки установлены.');
                    // Здесь можно перезагрузить страницу или обновить состояние пользователя
                } else {
                    alert('Регистрация успешна!');
                    // После регистрации можно автоматически переключиться на вход
                    setIsRegisterMode(false);
                }
                handleClose();

            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Произошла ошибка на сервере.');
            }
        } catch (err) {
            setError(err.message || 'Ошибка сети. Проверьте подключение к интернету.');
        }
    };

    return (
        <Modal open={open} onClose={handleClose} aria-labelledby="modal-title">
            <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
                <Typography id="modal-title" variant="h5" component="h2" sx={{ color: '#ffffff', fontWeight: 300, textAlign: 'center', marginBottom: 1 }}>
                    {isRegisterMode ? 'Регистрация' : 'Вход'}
                </Typography>

                {error && <Typography color="error" sx={{ textAlign: 'center' }}>{error}</Typography>}

                {/* Поля для регистрации */}
                {isRegisterMode && (
                    <TextField
                        label="Имя пользователя"
                        name="userName"
                        variant="filled"
                        fullWidth
                        sx={inputStyle}
                        value={formData.userName}
                        onChange={handleChange}
                        required
                    />
                )}

                {/* Общие поля */}
                <TextField
                    label="Email"
                    name="email"
                    variant="filled"
                    fullWidth
                    type="email"
                    sx={inputStyle}
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <TextField
                    label="Пароль"
                    name="password"
                    variant="filled"
                    fullWidth
                    type="password"
                    sx={inputStyle}
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                {/* Поле "О себе" только для регистрации */}
                {isRegisterMode && (
                    <TextField
                        label="О себе (кратко)"
                        name="aboutUser"
                        variant="filled"
                        fullWidth
                        multiline
                        rows={2}
                        sx={inputStyle}
                        value={formData.aboutUser}
                        onChange={handleChange}
                    />
                )}

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
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
                    {isRegisterMode ? 'Зарегистрироваться' : 'Войти'}
                </Button>

                {/* Секция переключения режимов */}
                <Box sx={{ marginTop: 2, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#bdbdbd' }}>
                        {isRegisterMode ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
                        <MuiLink
                            component="span"
                            onClick={() => {
                                setIsRegisterMode(!isRegisterMode); // Переключаем режим
                                setFormData({ userName: '', email: '', password: '', aboutUser: '' }); // Сброс полей
                                setError('');
                            }}
                            sx={{ color: '#00bfa5', cursor: 'pointer', underline: 'hover', fontWeight: 'bold' }}
                        >
                            {isRegisterMode ? 'Войти' : 'Зарегистрироваться'}
                        </MuiLink>
                    </Typography>

                    {/* Ссылка "Забыли пароль?" отображается только в режиме Входа */}
                    {!isRegisterMode && (
                        <MuiLink
                            component="span"
                            onClick={() => {
                                handleClose(); // Закрываем модальное окно регистрации/входа
                                onForgotPassword(); // Открываем модальное окно "Забыли пароль?"
                            }}
                            sx={{ color: '#bdbdbd', cursor: 'pointer', underline: 'hover', display: 'block', marginTop: 1, fontSize: '0.8rem' }}
                        >
                            Забыли пароль?
                        </MuiLink>
                    )}
                </Box>
            </Box>
        </Modal>
    );
};

// --- КОМПОНЕНТ: Запрос ссылки на сброс пароля (ForgotPasswordModal) ---
const ForgotPasswordModal = ({ open, handleClose }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSent, setIsSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [lastSentEmail, setLastSentEmail] = useState('');

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: '400px' },
        bgcolor: '#383838',
        borderRadius: '16px',
        boxShadow: 24,
        p: 4,
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    };

    // Внимание: inputStyle должен быть доступен в этой области видимости

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true); // <--- Устанавливаем загрузку

        // Соответствует ForgotPasswordRequest.cs
        const payload = { email: email };

        try {
            const response = await fetch(`${API_BASE_URL}/password/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                // УСПЕХ
                setIsSent(true); // <--- Устанавливаем флаг успеха
                setLastSentEmail(email); // <--- Сохраняем почту
                // Удаляем setTimeout(handleClose, 3000), чтобы пользователь сам закрыл или сбросил.
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Ошибка при отправке ссылки.');
                // Не закрываем окно, чтобы пользователь мог исправить ошибку.
            }
        } catch (err) {
            setError('Не удалось подключиться к API.');
        } finally {
            setIsLoading(false); // <--- Снимаем загрузку
        }
    };

    // ---ФУНКЦИЯ: Сброс состояния для ввода новой почты ---
    const handleResetForNewEmail = () => {
        setIsSent(false); // <--- Сбрасываем флаг успеха
        setEmail('');     // Очищаем поле ввода
        setError('');
        setMessage('');
        setLastSentEmail('');
    };

    // --- РЕНДЕРИНГ СООБЩЕНИЯ ОБ УСПЕХЕ ---
    if (isSent) {
        return (
            <Modal open={open} onClose={handleClose} aria-labelledby="forgot-password-modal-title">
                <Box sx={modalStyle}>
                    <Typography variant="h5" component="h2" sx={{ color: '#ffffff', fontWeight: 300, textAlign: 'center', marginBottom: 2 }}>
                        Забыли пароль?
                    </Typography>

                    <Typography sx={{ color: '#00bfa5', textAlign: 'center', fontWeight: 'bold' }}>
                        Ссылка для сброса пароля отправлена на вашу почту!
                    </Typography>

                    <Typography variant="body2" sx={{ color: '#bdbdbd', textAlign: 'center', marginBottom: 2 }}>
                        Проверьте адрес: {lastSentEmail}
                    </Typography>

                    {/* КНОПКА ИСПРАВЛЕНИЯ: Сбрасывает isSent в false */}
                    <Button
                        variant="outlined"
                        fullWidth
                        sx={{
                            color: '#00bfa5',
                            borderColor: '#00bfa5',
                            mt: 2
                        }}
                        onClick={handleResetForNewEmail}
                    >
                        Запросить для другого аккаунта
                    </Button>

                    <Button
                        variant="text"
                        fullWidth
                        sx={{ color: '#bdbdbd' }}
                        onClick={handleClose}
                    >
                        Закрыть
                    </Button>
                </Box>
            </Modal>
        );
    }

    // --- РЕНДЕРИНГ ФОРМЫ ВВОДА (Если isSent === false) ---
    return (
        <Modal open={open} onClose={handleClose} aria-labelledby="forgot-password-modal-title">
            <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
                {/* ... (остальной код формы ввода, как у вас) ... */}

                {/* Уберите 'disabled={!!message}' и замените на 'disabled={isLoading}' */}
                <TextField
                    variant="filled" // Использовать заполненный вариант
                    label="Ваша Почта"
                    sx={{ ...inputStyle, marginBottom: 2 }} // Применяем общий стиль
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading} // <--- ИСПОЛЬЗУЕМ ФЛАГ ЗАГРУЗКИ
                />

                <Button
                    type="submit"
                    variant="contained" // Основная кнопка
                    fullWidth
                    sx={{
                        backgroundColor: '#00bfa5',
                        '&:hover': { backgroundColor: '#00a38f' },
                        color: 'white',
                        fontWeight: 'bold',
                        mt: 1, // Margin Top
                        mb: 2  // Margin Bottom
                    }}
                    disabled={isLoading}
                >
                    {isLoading ? 'Отправка...' : 'Отправить ссылку'}
                </Button>

                {/* ... (Отмена) ... */}
            </Box>
        </Modal>
    );
};
// --- КОМПОНЕНТ: Сброс пароля (ResetPasswordModal) ---
const ResetPasswordModal = ({ open, handleClose }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: '400px' },
        bgcolor: '#383838',
        borderRadius: '16px',
        boxShadow: 24,
        p: 4,
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    };

    // Внимание: inputStyle должен быть доступен в этой области видимости

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError('Пароли не совпадают.');
            return;
        }

        // Соответствует ResetPasswordRequest.cs: public record ResetPasswordRequest(string newPassword);
        const payload = { newPassword: newPassword };

        try {
            const response = await fetch(`${API_BASE_URL}/password/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setMessage('Ваш пароль успешно изменен. Можете войти.');
                // Закрываем модал через 3 секунды
                setTimeout(handleClose, 3000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Ошибка сброса пароля. Возможно, ссылка устарела.');
            }
        } catch (err) {
            setError('Не удалось подключиться к API.');
        }
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="reset-password-modal-title"
        >
            <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
                <Typography id="reset-password-modal-title" variant="h5" component="h2" sx={{ color: '#ffffff', fontWeight: 300, textAlign: 'center', marginBottom: 2 }}>
                    Установите новый пароль
                </Typography>

                {/* Сообщения об ошибке/успехе */}
                {error && <Typography color="error" sx={{ textAlign: 'center' }}>{error}</Typography>}
                {message && <Typography sx={{ color: '#00bfa5', textAlign: 'center' }}>{message}</Typography>}

                {/* Поле для ввода нового пароля */}
                <TextField
                    label="Новый пароль"
                    variant="filled"
                    fullWidth
                    type="password"
                    sx={inputStyle}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={!!message}
                />

                {/* Поле для повтора пароля */}
                <TextField
                    label="Повторите новый пароль"
                    variant="filled"
                    fullWidth
                    type="password"
                    sx={inputStyle}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={!!message}
                />

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={!!message}
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
                    Изменить пароль
                </Button>
            </Box>
        </Modal>
    );
};

// --- НОВЫЙ КОМПОНЕНТ: Панель Инструментов Редактора ---
const EditorToolbar = ({ editorRef }) => {
    // Функция для применения команды форматирования (document.execCommand)
    // Используем useCallback, чтобы избежать лишних перерендеров
    const applyCommand = useCallback((command, value = null) => {
        // Устанавливаем фокус на редактор перед выполнением команды
        if (editorRef.current) {
            editorRef.current.focus();
        }
        // execCommand - ключевая нативная функция для форматирования contenteditable
        document.execCommand(command, false, value);
    }, [editorRef]);

    // Обработчик для вставки ссылки
    const handleInsertLink = () => {
        const url = prompt('Введите URL ссылки:');
        if (url) {
            applyCommand('createLink', url);
        }
    };

    // Обработчик для вставки заголовка (H2)
    const handleInsertHeading = () => {
        // formatBlock используется для тегов блочного уровня (H1, H2, P, DIV)
        applyCommand('formatBlock', '<h2>');
    };


    return (
        <Box
            sx={{
                display: 'flex',
                gap: 1,
                padding: 1,
                backgroundColor: '#555555',
                borderRadius: '8px 8px 0 0',
                border: '1px solid #444444'
            }}
        >
            {/* 1. Жирный */}
            <IconButton
                size="small"
                onClick={() => applyCommand('bold')}
                sx={{ color: '#ffffff', '&:hover': { backgroundColor: '#666666' } }}
            >
                <FormatBoldIcon />
            </IconButton>

            {/* 2. Курсив */}
            <IconButton
                size="small"
                onClick={() => applyCommand('italic')}
                sx={{ color: '#ffffff', '&:hover': { backgroundColor: '#666666' } }}
            >
                <FormatItalicIcon />
            </IconButton>

            {/* 3. Подчеркивание */}
            <IconButton
                size="small"
                onClick={() => applyCommand('underline')}
                sx={{ color: '#ffffff', '&:hover': { backgroundColor: '#666666' } }}
            >
                <FormatUnderlinedIcon />
            </IconButton>

            {/* 4. Ссылка */}
            <IconButton
                size="small"
                onClick={handleInsertLink}
                sx={{ color: '#00bfa5', '&:hover': { backgroundColor: '#666666' } }}
            >
                <LinkIcon />
            </IconButton>

            {/* 5. Заголовок (Тег оглавления, H2) */}
            <IconButton
                size="small"
                onClick={handleInsertHeading}
                sx={{ color: '#ffeb3b', '&:hover': { backgroundColor: '#666666' } }}
            >
                <TitleIcon />
            </IconButton>

            {/* 6. Маркированный список */}
            <IconButton
                size="small"
                onClick={() => applyCommand('insertUnorderedList')}
                sx={{ color: '#ffffff', '&:hover': { backgroundColor: '#666666' } }}
            >
                <FormatListBulletedIcon />
            </IconButton>

            {/* 7. Нумерованный список */}
            <IconButton
                size="small"
                onClick={() => applyCommand('insertOrderedList')}
                sx={{ color: '#ffffff', '&:hover': { backgroundColor: '#666666' } }}
            >
                <FormatListNumberedIcon />
            </IconButton>
        </Box>
    );
};


// --- ОБНОВЛЕННЫЙ КОМПОНЕНТ: Создание поста (PostCreationModal) ---
const PostCreationModal = ({ open, handleClose }) => {
    // 1. Состояние для заголовка
    const [title, setTitle] = useState('');
    // 2. Состояние для контента поста (будет хранить HTML)
    const [content, setContent] = useState('');
    // 3. Состояние для файла (заглушка)
    const [file, setFile] = useState(null);

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
    };

    // Стили для области загрузки файла
    const uploadAreaStyle = {
        border: '2px dashed #00bfa5',
        borderRadius: '12px',
        padding: 2,
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: 'rgba(0, 191, 165, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100px',
    };

    // --- ОБРАБОТЧИК СОХРАНЕНИЯ ---
    const handlePublish = () => {
        // Здесь выполняется логика отправки данных на сервер
        console.log('--- ДАННЫЕ ПОСТА ДЛЯ ОТПРАВКИ ---');
        console.log('Заголовок:', title);
        console.log('Файл:', file ? file.name : 'Нет файла');
        // Содержимое поста (content) уже в формате HTML и готово к сохранению в БД
        console.log('HTML-содержимое:', content);

        // Очистка и закрытие
        setTitle('');
        setContent('');
        setFile(null);
        if (editorRef.current) {
            editorRef.current.innerHTML = '<Typography sx={{ color: "#bdbdbd" }}>Введите текст поста...</Typography>'; // Очищаем содержимое редактора
        }
        handleClose();
    };


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
                    label="Заголовок проекта"
                    variant="filled"
                    fullWidth
                    sx={inputStyle}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                {/* --- 1. Панель Инструментов --- */}
                <EditorToolbar editorRef={editorRef} />

                {/* --- 2. Область Редактирования (contenteditable) --- */}
                <Box
                    ref={editorRef}
                    contentEditable={true} // Ключевой атрибут!
                    onInput={handleContentChange} // Обновляем состояние при любом изменении
                    sx={{
                        minHeight: '200px',
                        padding: 2,
                        // Стиль поля ввода для соответствия inputStyle
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid #444444',
                        borderRadius: '0 0 8px 8px',
                        color: '#ffffff',
                        outline: 'none', // Убрать стандартное синее выделение фокуса
                        cursor: 'text',
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
                    <Typography sx={{ color: '#bdbdbd' }}>Введите текст поста...</Typography>
                </Box>

                <Button
                    variant="contained"
                    fullWidth
                    onClick={handlePublish}
                    disabled={!title || !content} // Отключаем, если нет заголовка или текста
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

// --- ИСХОДНЫЕ ДАННЫЕ ПОСТОВ ---
const initialPostData = [
    // Каждый объект поста содержит данные для отображения в ленте и на детальной странице
    { id: 1, nickname: 'Иван', title: 'Пчёлка', imageUrl: 'https://hozyain.by/wp-content/uploads/2016/07/353307_pchela_cvetok_fon_1680x1050_www.GetBg_.net_.jpg', likesCount: 452, commentsCount: 15, isLiked: false },
    { id: 2, nickname: 'Петр', title: 'Питон', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCTdlxpN40oRq28d7owUaaoj4y37IjSn5RNA&s', likesCount: 120, commentsCount: 8, isLiked: false },
    { id: 3, nickname: 'Анна', title: 'Машинка', imageUrl: 'https://img.gazeta.ru/files3/225/15619225/602fd8501fa16_img-pic_32ratio_900x600-900x600-32191.jpg', likesCount: 88, commentsCount: 2, isLiked: false },
    { id: 4, nickname: 'Сергей', title: 'React', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8-6DCYsJ4l8p3tpBeWn1sHKPFyNV1GrQFQw&s', likesCount: 205, commentsCount: 33, isLiked: true },
    { id: 5, nickname: 'Елена', title: 'Гора', imageUrl: 'https://img.freepik.com/free-photo/beautiful-landscape-with-mountain_23-2148941935.jpg?semt=ais_hybrid&w=740&q=80', likesCount: 99, commentsCount: 10, isLiked: false },
    { id: 5, nickname: 'Елена', title: 'Гора', imageUrl: 'https://img.freepik.com/free-photo/beautiful-landscape-with-mountain_23-2148941935.jpg?semt=ais_hybrid&w=740&q=80', likesCount: 99, commentsCount: 10, isLiked: false },
    { id: 5, nickname: 'Елена', title: 'Гора', imageUrl: 'https://img.freepik.com/free-photo/beautiful-landscape-with-mountain_23-2148941935.jpg?semt=ais_hybrid&w=740&q=80', likesCount: 99, commentsCount: 10, isLiked: false },
    { id: 5, nickname: 'Елена', title: 'Гора', imageUrl: 'https://img.freepik.com/free-photo/beautiful-landscape-with-mountain_23-2148941935.jpg?semt=ais_hybrid&w=740&q=80', likesCount: 99, commentsCount: 10, isLiked: false },
];

// --- СТИЛИ: Боковая панель (Sidebar) ---
const sidebarStyle = {
    width: '250px',
    backgroundColor: '#333333',
    padding: 2,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
};

const sidebarButtonStyle = {
    backgroundColor: '#00bfa5',
    color: 'white',
    fontWeight: 'bold',
    '&:hover': { backgroundColor: '#009688' },
    borderRadius: '8px',
    textTransform: 'none',
    justifyContent: 'flex-start',
    padding: '10px 15px',
};

const profileButtonStyle = {
    ...sidebarButtonStyle,
    backgroundColor: '#333333',
    border: '2px solid #00bfa5',
    color: '#00bfa5',
    '&:hover': { backgroundColor: 'rgba(0, 191, 165, 0.1)' },
};

// --- ОСНОВНОЙ КОМПОНЕНТ: PostPage ---
const PostPage = () => {
    // Состояние: массив постов, используем useState для возможности динамического изменения (лайки)
    const [posts, setPosts] = useState(initialPostData);

    // Состояния для управления видимостью модальных окон
    const [isModalOpen, setIsModalOpen] = useState(false); // Регистрация
    const [isPostModalOpen, setIsPostModalOpen] = useState(false); // Создание поста
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false); // Сброс пароля
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // Состояние для управления навигацией: хранит ID поста, который нужно показать подробно
    const [selectedPostId, setSelectedPostId] = useState(null);

    // Функции для управления модальными окнами
    const handleOpen = () => setIsModalOpen(true);
    const handleClose = () => setIsModalOpen(false);
    const handlePostOpen = () => setIsPostModalOpen(true);
    const handlePostClose = () => setIsPostModalOpen(false);
    const handleForgotOpen = () => setIsForgotModalOpen(true);
    const handleForgotClose = () => setIsForgotModalOpen(false);
    const handleProfileOpen = () => setIsProfileModalOpen(true);
    const handleProfileClose = () => setIsProfileModalOpen(false);

    /**
     * Функция для имитации переключения лайка (без реальной БД).
     * Обновляет состояние 'posts': меняет isLiked и likesCount.
     * @param {number} postId - ID поста, который нужно изменить.
     */
    const handleLikeToggle = (postId) => {
        setPosts(prevPosts =>
            prevPosts.map(post => {
                if (post.id === postId) {
                    const newIsLiked = !post.isLiked;
                    // Увеличиваем или уменьшаем счетчик в зависимости от нового состояния
                    const newLikesCount = newIsLiked ? post.likesCount + 1 : post.likesCount - 1;

                    return {
                        ...post,
                        isLiked: newIsLiked,
                        likesCount: newLikesCount
                    };
                }
                return post;
            })
        );
    };

    /**
     * Функция для перехода на детальную страницу поста.
     * Устанавливает ID выбранного поста в состояние.
     * @param {number} id - ID поста, на который кликнул пользователь.
     */
    const handlePostClick = (id) => {
        setSelectedPostId(id);
    };

    /**
     * Функция для возврата к ленте.
     * Обнуляет ID выбранного поста, заставляя компонент рендерить ленту.
     */
    const handleBackToFeed = () => {
        setSelectedPostId(null);
    };

    const toolbarHeight = 64;
    // Расчет высоты области ленты (весь экран минус высота AppBar)
    const feedHeight = `calc(100vh - ${toolbarHeight}px)`;

    // Находим объект выбранного поста по ID
    const selectedPost = posts.find(post => post.id === selectedPostId);

    // Флаг, определяющий, нужно ли показывать детальную страницу
    const isViewingDetailPage = selectedPostId !== null;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#555555' }}>

            {/* -------------------- ОСНОВНАЯ КОНТЕНТНАЯ ЧАСТЬ (Лента / Детальная страница) -------------------- */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

                {/* 1. Верхняя панель (AppBar) */}
                <AppBar position="static" sx={{ backgroundColor: '#333333', borderRadius: '0', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>

                </AppBar>

                {/* 2. Основной контент: Условный рендеринг */}
                {isViewingDetailPage ? (
                    // Рендерим детальную страницу, передавая данные поста и функции обратного вызова
                    <PostDetailPage
                        post={selectedPost}
                        onBack={handleBackToFeed}
                        onLike={handleLikeToggle}
                    />
                ) : (
                    // Рендерим ленту постов с прокруткой и привязкой к началу поста (scroll-snap)
                    <Box
                        sx={{
                            height: feedHeight,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            overflowY: 'scroll',
                            scrollSnapType: 'y mandatory', // Привязка к началу поста
                            '&::-webkit-scrollbar': { display: 'none' }, // Скрытие скроллбара
                            msOverflowStyle: 'none',
                            scrollbarWidth: 'none',
                        }}
                    >
                        {posts.map(post => (
                            <Box
                                key={post.id}
                                sx={{
                                    scrollSnapAlign: 'start', // Привязка к началу каждого поста
                                    height: '100%',
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: 2,
                                }}
                            >
                                {/* Компонент карточки поста */}
                                <PostCard
                                    id={post.id}
                                    nickname={post.nickname}
                                    title={post.title}
                                    imageUrl={post.imageUrl}
                                    likesCount={post.likesCount}
                                    commentsCount={post.commentsCount}
                                    isLiked={post.isLiked}
                                    onClick={handlePostClick} // Обработчик перехода на детальную страницу
                                    onLike={handleLikeToggle} // Обработчик лайка
                                />
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>

            {/* -------------------- ПРАВАЯ ЧАСТЬ (Боковая панель) -------------------- */}
            <Box sx={sidebarStyle}>

                <Typography variant="h5" sx={{ color: '#00bfa5', fontWeight: 'bold', textAlign: 'right', marginBottom: 2 }}>
                    Lyambda
                </Typography>

                {/* Навигационные кнопки (с использованием flexGrow для растягивания) */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}>
                    <Button variant="contained" sx={sidebarButtonStyle}>Категории</Button>
                    <Button variant="contained" sx={sidebarButtonStyle}>Полезные материалы</Button>
                    <Button variant="contained" sx={sidebarButtonStyle}>FAQ</Button>
                </Box>

                <Box sx={{ borderTop: '1px solid #555555', margin: '16px 0' }} />

                {/* Кнопки действий: Профиль, Публикация, Уведомления */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    marginBottom: 2,
                }}>
                    <Button variant="outlined" sx={profileButtonStyle} startIcon={<PersonIcon />} onClick={handleProfileOpen}>Мой профиль</Button>
                    <Button variant="outlined" sx={profileButtonStyle} startIcon={<CloudUploadIcon />} onClick={handlePostOpen}>
                        Опубликовать
                    </Button>
                </Box>

                {/* Секция входа/регистрации */}
                <Box sx={{ paddingTop: 2, borderTop: '1px solid #555555', textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#bdbdbd', marginBottom: 1 }}>
                        Нет аккаунта?
                    </Typography>
                    <MuiLink
                        component="span"
                        onClick={handleOpen}
                        sx={{ color: '#00bfa5', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Зарегистрироваться
                    </MuiLink>
                </Box>

            </Box>

            {/* -------------------- РЕНДЕРИНГ МОДАЛЬНЫХ ОКОН -------------------- */}
            <RegistrationModal
                open={isModalOpen}
                handleClose={handleClose}
                onForgotPassword={handleForgotOpen}
            />
            <PostCreationModal
                open={isPostModalOpen}
                handleClose={handlePostClose}
            />
            <ForgotPasswordModal
                open={isForgotModalOpen}
                handleClose={handleForgotClose}
            />

            <ProfileModal
                open={isProfileModalOpen}
                handleClose={handleProfileClose}
                // Здесь можно передать никнейм текущего пользователя, если он известен
                nickname="Ваш_Ник"
            />
        </Box>
    );
};

export default PostPage;