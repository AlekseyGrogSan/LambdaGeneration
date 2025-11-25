import React, { useState } from 'react';
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

// Импорт дочерних компонентов
import PostCard from './PostCard';
import PostDetailPage from './PostDetailPage';

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
const RegistrationModal = ({ open, handleClose }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Стиль для контейнера формы с правой стороны модального окна
    const formContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: { xs: 3, md: 5 },
        backgroundColor: '#383838',
        borderRadius: { xs: 0, md: '0 16px 16px 0' },
        height: '100%',
        gap: 1.5,
    };

    // Стиль для градиентной рекламной области с левой стороны
    const gradientContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: 4,
        background: 'linear-gradient(135deg, #00838f 0%, #00bfa5 100%)',
        borderRadius: { xs: 0, md: '16px 0 0 16px' },
        height: '100%',
        minHeight: { xs: '200px', md: '500px' }
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="registration-modal-title"
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: { xs: 0, md: 2 },
            }}
        >
            {/* Контейнер для двухколоночной сетки (форма и градиент) */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    maxWidth: { xs: '100%', md: '1000px' },
                    width: '100%',
                    maxHeight: { xs: '100vh', md: 'auto' },
                    height: { xs: '100vh', md: '600px' },
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                    borderRadius: { xs: 0, md: '16px' },
                    overflow: 'hidden',
                }}
            >
                <Box sx={gradientContainerStyle}>
                    {/* Текст внутри градиентного блока */}
                    <Typography
                        variant="caption"
                        sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', fontStyle: 'italic', fontSize: '0.8rem' }}
                    >
                        к во вкладке браузера отвечает парны
                    </Typography>
                </Box>

                {/* Форма регистрации */}
                <Box sx={formContainerStyle}>
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        sx={{ color: '#ffffff', fontWeight: 300, marginBottom: 4, textAlign: isMobile ? 'center' : 'left' }}
                    >
                        Регистрация
                    </Typography>

                    {/* Поля ввода */}
                    <TextField label="NickName" variant="filled" fullWidth sx={inputStyle} />
                    <TextField label="Почта" variant="filled" fullWidth type="email" sx={inputStyle} />
                    <TextField label="Номер телефона" variant="filled" fullWidth type="tel" sx={inputStyle} />
                    <TextField label="Пароль" variant="filled" fullWidth type="password" sx={inputStyle} />
                    <TextField label="Повторите пароль" variant="filled" fullWidth type="password" sx={inputStyle} />

                    {/* Кнопка отправки формы */}
                    <Button
                        variant="contained"
                        fullWidth
                        sx={{
                            marginTop: 1,
                            marginBottom: 1,
                            backgroundColor: '#00bfa5',
                            '&:hover': { backgroundColor: '#009688' },
                            color: '#ffffff',
                            padding: '12px 0',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            borderRadius: '8px'
                        }}
                    >
                        Зарегистрироваться
                    </Button>

                    {/* Ссылка для перехода на вход */}
                    <Box sx={{ marginTop: 2, textAlign: isMobile ? 'center' : 'left' }}>
                        <Typography variant="body2" sx={{ color: '#bdbdbd' }}>
                            Уже есть аккаунт?{' '}
                            <MuiLink component="span" onClick={handleClose} sx={{ color: '#00bfa5', cursor: 'pointer', underline: 'hover' }}>
                                Войти
                            </MuiLink>
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
};

// --- КОМПОНЕНТ: Создание поста (PostCreationModal) ---
const PostCreationModal = ({ open, handleClose }) => {

    // Стили для центрирования и оформления модального окна
    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: '600px', md: '700px' },
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
                />

                {/* Область для прикрепления файла (картинка/видео) */}
                <Box sx={uploadAreaStyle}>
                    <CloudUploadIcon sx={{ fontSize: 40, color: '#00bfa5', mb: 1 }} />
                    <Typography variant="body1" sx={{ color: '#bdbdbd' }}>
                        Нажмите или перетащите файл (Изображение/Видео)
                    </Typography>
                    {/* Скрытый input для выбора файла */}
                    <input type="file" hidden accept="image/*,video/*" />
                </Box>

                {/* Поле для ввода основного текста поста */}
                <TextField
                    label="Введите текст поста (до 10000 символов)"
                    variant="filled"
                    fullWidth
                    multiline
                    rows={8}
                    sx={inputStyle}
                />

                <Button
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
                    onClick={handleClose}
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

    // Состояние для управления навигацией: хранит ID поста, который нужно показать подробно
    const [selectedPostId, setSelectedPostId] = useState(null);

    // Функции для управления модальными окнами
    const handleOpen = () => setIsModalOpen(true);
    const handleClose = () => setIsModalOpen(false);
    const handlePostOpen = () => setIsPostModalOpen(true);
    const handlePostClose = () => setIsPostModalOpen(false);

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
                    <Toolbar>
                        {/* Поле поиска */}
                        <InputBase
                            placeholder="Поиск"
                            sx={{
                                flexGrow: 1,
                                color: 'white',
                                backgroundColor: '#555555',
                                borderRadius: '8px',
                                padding: '5px 15px',
                                marginRight: 2
                            }}
                            startAdornment={<SearchIcon sx={{ color: '#00bfa5', marginRight: 1 }} />}
                        />
                        <IconButton color="inherit">
                            <MoreVertIcon sx={{ color: '#00bfa5' }} />
                        </IconButton>
                    </Toolbar>
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
                    <Button variant="contained" sx={sidebarButtonStyle}>Статьи</Button>
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
                    <Button variant="outlined" sx={profileButtonStyle} startIcon={<PersonIcon />}>Мой профиль</Button>
                    <Button variant="outlined" sx={profileButtonStyle} startIcon={<CloudUploadIcon />} onClick={handlePostOpen}>
                        Опубликовать
                    </Button>
                    <Button variant="outlined" sx={profileButtonStyle} startIcon={<NotificationsIcon />}>Уведомления</Button>
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
            <RegistrationModal open={isModalOpen} handleClose={handleClose} />
            <PostCreationModal open={isPostModalOpen} handleClose={handlePostClose} />
        </Box>
    );
};

export default PostPage;