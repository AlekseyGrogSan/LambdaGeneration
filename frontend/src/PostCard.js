import React from 'react';
import {
    Box,
    Card,
    Typography,
    IconButton,
    Chip,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person'; 

// --- ОБЩИЙ МАССИВ ЦВЕТОВ ДЛЯ ТЕГОВ ---
const TAG_COLORS = [
    '#ff6f00', 
    '#00e676', 
    '#2979ff', 
    '#ff1744', 
    '#e040fb', 
    '#00bcd4', 
];

// ✅ ФИКС: ВЫНОСИМ СТИЛЬ МЕТКИ ЗА ПРЕДЕЛЫ КОМПОНЕНТА
const labelStyle = { 
    color: '#00bfa5', 
    display: 'block', 
    mb: 0.5, 
    textTransform: 'uppercase', 
    fontWeight: 'bold',
    fontSize: '0.9rem' 
};

/**
 * PostCard - Компонент для отображения краткой информации о посте в ленте.
 */
const PostCard = ({ 
    id, 
    nickname, 
    title, 
    article_preview, 
    likesCount, 
    commentsCount, 
    isLiked, 
    onClick, 
    onLike, 
    tags = [] 
}) => {

    const getTagColor = (tag, index) => {
        const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return TAG_COLORS[(hash + index) % TAG_COLORS.length];
    };

    return (
        <Card 
            sx={{
                width: '100%',
                backgroundColor: '#1f1f1f',
                borderRadius: '12px',
                height: '85vh', 
                minHeight: 'unset', 
                cursor: 'pointer',
                transition: 'box-shadow 0.3s',
                '&:hover': {
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
                },
                display: 'flex',
                flexDirection: 'column',
            }}
            onClick={onClick}
        >
            <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                
                {/* 1. АВТОР и ТЕГИ */}
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        
                        <Box>
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
                                    @{nickname}
                                </Typography>
                            </Box>
                        </Box>
                        
                        {/* Теги */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 0.5 }}>
                            {tags.map((tag, index) => (
                                <Chip 
                                    key={index}
                                    label={tag}
                                    size="small"
                                    sx={{ 
                                        backgroundColor: getTagColor(tag, index), 
                                        color: 'white', 
                                        fontWeight: 'bold',
                                        height: '22px', 
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                </Box>
                
              {/* 2. НАЗВАНИЕ */}
                <Box sx={{ mb: 1.5 }}>
                    {/* МЕТКА НАЗВАНИЯ */}
                    <Typography variant="body2" sx={labelStyle}>
                        Название
                    </Typography>
                    {/* ✅ ПРОВЕРКА: САМО НАЗВАНИЕ */}
                    <Typography 
                        variant="h5" 
                        sx={{ color: 'white', fontWeight: 'bold' }}
                    >
                        {title} 
                    </Typography>
                </Box>

                {/* 3. ОПИСАНИЕ (ПРЕВЬЮ ТЕКСТ) */}
                <Box sx={{ flexGrow: 1, mb: 2, overflow: 'hidden', color: '#bdbdbd' }}>
                    {/* МЕТКА: ОПИСАНИЕ */}
                    <Typography variant="body2" sx={labelStyle}>
                        Описание
                    </Typography>
                    {/* ✅ ФИКС: САМО ОПИСАНИЕ (ПРЕВЬЮ) */}
                    <Typography 
                        variant="body1" 
                        dangerouslySetInnerHTML={{ __html: article_preview }}
                        sx={{ 
                            color: 'inherit',
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            display: '-webkit-box', 
                            WebkitLineClamp: 15, // Указываем, сколько строк показывать
                            WebkitBoxOrient: 'vertical',
                            // ... (другие стили для HTML)
                        }}
                    />
                </Box>
            </Box>

            {/* Панель взаимодействия (Лайки, Комментарии, Репост) */}
            <Box sx={{ 
                borderTop: '1px solid #333', 
                p: 1.5, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
            }}>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    
                    {/* Лайки */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            sx={{ color: isLiked ? '#ff1744' : 'white' }}
                            onClick={(e) => { e.stopPropagation(); onLike(id); }}
                        >
                            <FavoriteIcon sx={{ fontSize: 30 }} />
                        </IconButton>
                        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold' }}>
                            {likesCount}
                        </Typography>
                    </Box>

                    {/* Комментарии */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton sx={{ color: '#00bfa5'}} onClick={(e) => { e.stopPropagation(); console.log('Коммент!'); }}>
                            <ChatBubbleOutlineIcon sx={{ fontSize: 30 }} />
                        </IconButton>
                        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold' }}>
                            {commentsCount}
                        </Typography>
                    </Box>

                    {/* Репост */}
                    <IconButton sx={{ color: '#00bfa5'}} onClick={(e) => { e.stopPropagation(); console.log('Репост!'); }}>
                        <SendIcon sx={{ fontSize: 30 }} />
                    </IconButton>

                </Box>
            </Box>
        </Card>
    );
};

export default PostCard;