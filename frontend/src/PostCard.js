import React from 'react';
import {
    Box,
    Card,
    CardMedia,
    Typography,
    IconButton,
    Chip, // <-- НОВЫЙ ИМПОРТ: Для отображения тегов
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

// --- ОБЩИЙ МАССИВ ЦВЕТОВ ДЛЯ ТЕГОВ (дублирован для корректного отображения) ---
const TAG_COLORS = [
    '#ff6f00', // Оранжевый
    '#00e676', // Зеленый
    '#2979ff', // Синий
    '#ff1744', // Красный
    '#e040fb', // Фиолетовый
    '#00bcd4', // Голубой
];
// -------------------------------------------------------------------------


/**
 * PostCard - Компонент для отображения краткой информации о посте в ленте.
 * @param {object} props - Свойства компонента.
 * // ... (другие props)
 * @param {string[]} props.tags - Список тегов поста.
 */
const PostCard = ({ id, nickname, title, imageUrl, likesCount, commentsCount, isLiked, onClick, onLike, tags = [] }) => {
    return (
        <Card
            // Основной обработчик: переход на детальную страницу при клике на карточку
            onClick={() => onClick(id)}
            sx={{
                height: '100%',
                maxHeight: '100%',
                overflowY: 'auto',
                backgroundColor: '#333333',
                borderRadius: '10px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                maxWidth: '700px',
                width: '100%',
                alignSelf: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                // Эффект при наведении для индикации кликабельности
                '&:hover': {
                    transform: 'scale(1.01)',
                    boxShadow: '0 6px 15px rgba(0,0,0,0.6)',
                }
            }}
        >
            {/* Секция Аватара и Имени пользователя */}
            <Box sx={{ display: 'flex', alignItems: 'center', padding: 2 }}>
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
                    <CameraAltIcon sx={{ color: '#333333', fontSize: 20 }} />
                </Box>
                <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                    {nickname}
                </Typography>
            </Box>

            {/* Изображение поста */}
            <CardMedia
                component="img"
                height="400"
                image={imageUrl || 'путь_к_заглушке.jpg'}
                alt={title}
                sx={{
                    objectFit: 'cover',
                }}
            />

            {/* Секция тегов - НОВАЯ */}
            <Box sx={{ padding: '8px 16px', display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {tags.map((tag, index) => (
                    <Chip
                        key={tag}
                        label={`#${tag}`}
                        size="small"
                        sx={{
                            // Циклический выбор цвета
                            backgroundColor: TAG_COLORS[index % TAG_COLORS.length],
                            color: 'white',
                            fontWeight: 'bold'
                        }}
                    />
                ))}
            </Box>

            {/* Секция заголовка и кнопок действий */}
            <Box sx={{ padding: 2, color: 'white' }}>
                <Typography variant="body1" sx={{ marginBottom: 1, fontWeight: 'bold' }}>
                    {title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>

                    {/* Блок Лайков (Иконка + Счетчик) */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            // Цвет иконки зависит от состояния isLiked
                            sx={{ color: isLiked ? 'red' : 'white' }}
                            // Предотвращаем срабатывание onClick родительской Card
                            onClick={(e) => { e.stopPropagation(); onLike(id); }}
                        >
                            <FavoriteIcon sx={{ fontSize: 30 }} />
                        </IconButton>
                        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold' }}>
                            {likesCount}
                        </Typography>
                    </Box>

                    {/* Блок Комментариев (Иконка + Счетчик) */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton sx={{ color: '#00bfa5'}} onClick={(e) => { e.stopPropagation(); console.log('Коммент!'); }}>
                            <ChatBubbleOutlineIcon sx={{ fontSize: 30 }} />
                        </IconButton>
                        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold' }}>
                            {commentsCount}
                        </Typography>
                    </Box>

                    {/* Кнопка Репоста */}
                    <IconButton sx={{ color: '#00bfa5'}} onClick={(e) => { e.stopPropagation(); console.log('Репост!'); }}>
                        <SendIcon sx={{ fontSize: 30 }} />
                    </IconButton>

                </Box>
            </Box>
        </Card>
    );
};

export default PostCard;