import React from 'react';
import { Box, CardMedia, Typography, IconButton, Button } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';

/**
 * PostDetailPage - Компонент для отображения полного поста.
 * * @param {object} props.post - Объект поста со всеми данными (title, imageUrl, isLiked, counts).
 * @param {function} props.onBack - Функция для возврата к ленте.
 * @param {function} props.onLike - Функция для переключения лайка.
 */
const PostDetailPage = ({ post, onBack, onLike }) => {

    // Проверка наличия данных
    if (!post) {
        return (
            <Box sx={{ p: 4, color: 'white', textAlign: 'center' }}>
                <Typography variant="h6">Пост не найден.</Typography>
                <Button onClick={onBack} sx={{ color: '#00bfa5', mt: 2 }}>
                    Вернуться к ленте
                </Button>
            </Box>
        );
    }

    // Стили для контейнера с текстом поста (имитация поля ввода)
    const inputStyleFilled = {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        borderRadius: '8px',
        padding: '16px',
    };

    // Имитация длинного текста поста, ограниченного 10000 символами
    const longPostText = "" +
        "Так называемая, заглушка \n" +
        "Так называемая, заглушка \n" +
        "Так называемая, заглушка \n" +
        "Так называемая, заглушка \n" +
        "Так называемая, заглушка \n" +
        "Так называемая, заглушка \n" +
        "Так называемая, заглушка \n" +
        "Так называемая, заглушка \n" +
        "Так называемая, заглушка \n" +
        "Так называемая, заглушка \n" +
        "Так называемая, заглушка \n";

    // Обрезка текста до 10000 символов
    const postContent = longPostText.substring(0, 10000);


    return (
        <Box
            sx={{
                flexGrow: 1,
                backgroundColor: '#555555',
                padding: { xs: 2, md: 4 },
                overflowY: 'auto',
                height: '100vh',
                color: 'white'
            }}
        >
            {/* Кнопка возврата */}
            <Button
                onClick={onBack}
                sx={{
                    color: '#00bfa5',
                    fontWeight: 'bold',
                    marginBottom: 3,
                    fontSize: '1rem',
                    padding: 0
                }}
            >
                {'< Вернуться к ленте'}
            </Button>

            {/* Основной контейнер поста */}
            <Box sx={{
                maxWidth: '800px',
                margin: '0 auto',
                backgroundColor: '#333333',
                borderRadius: '16px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                p: { xs: 2, md: 4 }
            }}>

                {/* Заголовок поста и аватар пользователя */}
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: '#00bfa5',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 1,
                            border: '2px solid #00bfa5'
                        }}
                    >
                        <PersonIcon sx={{ color: '#333333', fontSize: 20 }} />
                    </Box>
                    <Typography
                        variant="h5"
                        component="h1"
                        sx={{ color: '#ffffff', fontWeight: 'bold' }}
                    >
                        {post.nickname} / {post.title}
                    </Typography>
                </Box>

                {/* Изображение поста */}
                <CardMedia
                    component="img"
                    image={post.imageUrl}
                    alt={post.title}
                    sx={{
                        width: '100%',
                        maxHeight: '500px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        marginBottom: 3
                    }}
                />

                {/* Блок с полным текстом поста */}
                <Box sx={{...inputStyleFilled, marginBottom: 3, whiteSpace: 'pre-wrap'}}>
                    <Typography variant="body1" sx={{ color: '#ffffff', lineHeight: 1.6 }}>
                        {postContent}
                    </Typography>
                </Box>

                {/* Кнопки действий и счетчики */}
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>

                    {/* Лайки: Иконка и Счетчик */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            // Цвет иконки зависит от состояния isLiked
                            sx={{ color: post.isLiked ? 'red' : 'white' }}
                            onClick={() => onLike(post.id)}
                        >
                            <FavoriteIcon sx={{ fontSize: 30 }} />
                        </IconButton>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                            {post.likesCount}
                        </Typography>
                    </Box>

                    {/* Комментарии: Иконка и Счетчик */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton sx={{ color: '#00bfa5' }}>
                            <ChatBubbleOutlineIcon sx={{ fontSize: 30 }} />
                        </IconButton>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                            {post.commentsCount}
                        </Typography>
                    </Box>

                    {/* Репост */}
                    <IconButton sx={{ color: '#00bfa5' }}>
                        <SendIcon sx={{ fontSize: 30 }} />
                    </IconButton>

                </Box>

            </Box>
        </Box>
    );
};

export default PostDetailPage;