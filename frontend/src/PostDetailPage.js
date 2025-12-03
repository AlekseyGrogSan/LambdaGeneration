import React, {useEffect} from 'react';
import {
    Box,
    Typography,
    IconButton,
    Button,
    TextField,
    Chip
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// --- ОБЩИЙ МАССИВ ЦВЕТОВ ДЛЯ ТЕГОВ ---
const TAG_COLORS = [
    '#ff6f00', 
    '#00e676', 
    '#2979ff', 
    '#ff1744', 
    '#e040fb', 
    '#00bcd4', 
];

const commentInputStyle = {
    '& .MuiFilledInput-root': {
        backgroundColor: '#2c2c2c',
        color: 'white',
        '&:hover': { backgroundColor: '#3a3a3a' },
        '&.Mui-focused': { backgroundColor: '#3a3a3a' },
    },
    '& .MuiInputLabel-root': { color: '#bdbdbd' },
};

// ✅ ФИКС: ВЫНОСИМ СТИЛЬ МЕТКИ ЗА ПРЕДЕЛЫ КОМПОНЕНТА ДЛЯ ИЗБЕЖАНИЯ NO-UNDEF
const labelStyle = { 
    color: '#00bfa5', 
    display: 'block', 
    mb: 0.5, 
    textTransform: 'uppercase', 
    fontWeight: 'bold',
    fontSize: '0.9rem' 
};

/**
 * PostDetailPage - Компонент для отображения полного поста.
 */
const PostDetailPage = ({
    post,
    onBack,
    onLike,
    onAuthorClick,
    nickname, 
    authorId,
    containerRef, // <-- Новый пропс: реф контейнера ленты
}) => {
    
    // Исправленный useEffect: скроллим контейнер ленты
    useEffect(() => {
        if (containerRef && containerRef.current) {
            // Прокручиваем контейнер ленты к самому верху
            containerRef.current.scrollTop = 0;
        } else {
            // Fallback: прокручиваем окно браузера
            window.scrollTo(0, 0);
        }
    }, [containerRef]); // Зависимость от containerRef
    
    if (!post) return <Box sx={{ color: 'white' }}>Пост не найден.</Box>;

    const getTagColor = (tag, index) => {
        const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return TAG_COLORS[(hash + index) % TAG_COLORS.length];
    };
    

    return (
        <Box 
            sx={{
                backgroundColor: '#2c2c2c',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                m: 2, 
                pb: 2, 
                color: 'white'
            }}
        >
            {/* Кнопка "Назад" */}
            <Box sx={{ p: 2, borderBottom: '1px solid #333', display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={onBack} sx={{ color: '#00bfa5' }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" sx={{ color: 'white', ml: 1 }}>Назад к ленте</Typography>
            </Box>

            <Box sx={{ p: 2 }}>
                
                {/* МЕТКА "НАЗВАНИЕ" */}
                <Typography variant="body2" sx={labelStyle}>
                    Название
                </Typography>
                {/* Заголовок */}
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {post.title}
                </Typography>

                {/* МЕТКА "АВТОР" */}
                {/* КЛИКАБЕЛЬНЫЙ БЛОК АВТОРА */}
                        <Box
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                if (onAuthorClick && authorId) {
                                    onAuthorClick(authorId);
                                }
                            }}
                            sx={{ cursor: onAuthorClick && authorId ? 'pointer' : 'default' }}
                        >
                            {/* МЕТКА: АВТОР */}
                            <Typography variant="body2" sx={labelStyle}>
                                Автор
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PersonIcon sx={{ color: '#00bfa5', mr: 1, fontSize: 30 }} />
                                <Typography 
                                    variant="h6" 
                                    sx={{ color: '#00bfa5', fontWeight: 'bold' }}
                                >
                                    {nickname}
                                </Typography>
                            </Box>
                        </Box>
                
                {/* Теги */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    {post.tags.map((tag, index) => (
                        <Chip
                            key={index}
                            label={tag}
                            sx={{
                                backgroundColor: getTagColor(tag, index),
                                color: 'white',
                                fontWeight: 'bold',
                            }}
                        />
                    ))}
                </Box>

                {/* ОСНОВНОЙ КОНТЕНТ СТАТЬИ (Рендеринг HTML) */}
                <Box 
                    dangerouslySetInnerHTML={{ __html: post.article_content }}
                    sx={{ 
                        color: 'white', 
                        lineHeight: 1.6, 
                        whiteSpace: 'pre-wrap', 
                        // Стили для корректного отображения тегов 
                        // ✅ УВЕЛИЧЕННЫЕ РАЗМЕРЫ ШРИФТОВ
                        '& h1': { fontSize: '2.4rem', mt: 3, mb: 1, color: '#00bfa5' },
                        '& h2': { fontSize: '2rem', mt: 2, mb: 1, color: 'white' },
                        '& h3': { fontSize: '1.7rem', mt: 1.5, mb: 0.5, color: 'white' },
                        '& p': { marginBottom: 1, marginTop: 1, fontSize: '1.15rem' }, // Основное изменение здесь
                        '& strong': { fontWeight: 'bold', color: 'white' },
                    }}
                />

            </Box>

            {/* Панель взаимодействия */}
            <Box sx={{ 
                p: 2, 
                borderTop: '1px solid #333', 
                display: 'flex', 
                gap: 3,
                alignItems: 'center' 
            }}>
                
                {/* 1. Лайки */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton 
                        onClick={onLike}
                        sx={{ color: post.isLiked ? '#ff1744' : 'white', p: 0.5 }}
                    >
                        <FavoriteIcon sx={{ fontSize: 24 }} />
                    </IconButton>
                    <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold', ml: 0.5 }}>
                        {post.likesCount}
                    </Typography>
                </Box>

                {/* 2. Комментарии */}
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
                    sx={commentInputStyle}
                />
            </Box>

        </Box>
    );
};

export default PostDetailPage;