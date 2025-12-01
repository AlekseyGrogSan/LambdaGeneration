import React from 'react';
import {
    Box,
    CardMedia,
    Typography,
    IconButton,
    Button,
    TextField
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

/**
 * PostDetailPage - Компонент для отображения полного поста.
 * Внешний вид адаптирован под стиль карточки (PostCard).
 * @param {object} props.post - Объект поста со всеми данными (title, imageUrl, isLiked, counts).
 * @param {function} props.onBack - Функция для возврата к ленте.
 * @param {function} props.onLike - Функция для переключения лайка.
 */
const PostDetailPage = ({ post, onBack, onLike }) => {

    // Проверка наличия данных
    if (!post) {
        return (
            <Box sx={{ p: 4, color: 'white', textAlign: 'center' }}>
                <Typography variant="h6">Пост не найден.</Typography>
                {/* Кнопка "Вернуться к ленте" в блоке ошибки удалена */}
            </Box>
        );
    }

    // Стили для поля ввода комментария, чтобы соответствовали PostPage
    const commentInputStyle = {
        '& .MuiFilledInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            borderRadius: '8px',
        },
        '& .MuiInputLabel-root': {
            color: '#bdbdbd',
        },
        // Убираем нижнюю линию у filled input для более чистого вида
        '& .MuiFilledInput-underline:before': { borderBottom: 'none' },
        '& .MuiFilledInput-underline:after': { borderBottom: 'none' },
    };

    // Стили для контейнера с текстом поста/описанием (соответствует фону)
    const descriptionBoxStyle = {
        backgroundColor: '#121212', // Фон страницы, чтобы описание не выделялось отдельным блоком
        color: 'white',
        padding: '0 16px', // Отступы только слева и справа
        textAlign: 'left',
        mt: 2,
        mb: 2,
    };

    return (
        // Главный контейнер поста, оформлен как большая "карточка"
        <Box
            sx={{
                backgroundColor: '#1e1e1e', // Фон, как у карточки
                minHeight: '100vh',
                maxWidth: '800px',
                margin: '20px auto', // Центрируем и добавляем отступы
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)', // Добавляем тень
                overflow: 'hidden' // Обрезаем углы изображения
            }}
        >

            {/* HEADER: Кнопка "Назад" и информация о пользователе */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderBottom: '1px solid #333',
                    backgroundColor: '#1e1e1e', // Сохраняем фон карточки
                }}
            >
                {/* ⬅️ Кнопка НАЗАД */}
                <IconButton
                    onClick={onBack}
                    sx={{ color: '#00bfa5', mr: 1 }}
                >
                    <ArrowBackIcon />
                </IconButton>

                {/* Иконка профиля */}
                <IconButton sx={{ color: '#bdbdbd', mr: 1, p: 0 }}>
                    <PersonIcon />
                </IconButton>

                {/* НИКНЕЙМ */}
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {post.nickname}
                </Typography>

            </Box>

            {/* Изображение поста */}
            <CardMedia
                component="img"
                image={post.imageUrl}
                alt={post.title}
                sx={{
                    width: '100%',
                    maxHeight: '70vh',
                    objectFit: 'cover',
                }}
            />

            {/* Заголовок и Описание */}
            <Box sx={{ p: 2, pt: 1 }}>
                {/* ЗАГОЛОВОК */}
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                    {post.title}
                </Typography>

                {/* ОПИСАНИЕ (MOCK) - Вставляем прямо в Box с отступами, без отдельного background */}
                <Typography variant="body1" sx={{ color: 'white', mt: 1 }}>
                    Это полное описание поста: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </Typography>
            </Box>


            {/* Панель действий: Лайки, Комментарии, Репост (Как в PostCard) */}
            <Box sx={{ p: 2, display: 'flex', gap: 3, alignItems: 'center', borderTop: '1px solid #333' }}>

                {/* 1. Блок Лайк (Иконка + Счетчик) */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                        // Цвет иконки зависит от состояния isLiked
                        sx={{ color: post.isLiked ? 'red' : 'white', p: 0.5 }} // Уменьшаем padding иконки
                        onClick={() => onLike(post.id)}
                    >
                        <FavoriteIcon sx={{ fontSize: 24 }} /> {/* Уменьшаем размер иконки */}
                    </IconButton>
                    <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold', ml: 0.5 }}>
                        {post.likesCount}
                    </Typography>
                </Box>

                {/* 2. Комментарии: Иконка и Счетчик */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton sx={{ color: '#00bfa5', p: 0.5 }}>
                        <ChatBubbleOutlineIcon sx={{ fontSize: 24 }} />
                    </IconButton>
                    <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold', ml: 0.5 }}>
                        {post.commentsCount}
                    </Typography>
                </Box>

                {/* 3. Репост */}
                <IconButton sx={{ color: '#00bfa5' }}>
                    <SendIcon sx={{ fontSize: 24 }} />
                </IconButton>

            </Box>

            {/* Секция комментариев */}
            <Box sx={{ p: 2, borderTop: '1px solid #333' }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>Комментарии</Typography>
                <TextField
                    label="Написать комментарий..."
                    variant="filled"
                    fullWidth
                    margin="normal"
                    // Используем объединенный стиль для поля ввода
                    sx={commentInputStyle}
                />
            </Box>

        </Box>
    );
};

export default PostDetailPage;