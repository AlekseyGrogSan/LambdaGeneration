import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Card,
    Typography,
    IconButton,
    Chip,
    Avatar,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import { buildArticleImageUrl, buildAvatarUrl, DEFAULT_AVATAR_SRC } from './avatarUtils';

const API_BASE_URL = 'http://localhost:5113/api';

// --- ОБЩИЙ МАССИВ ЦВЕТОВ ДЛЯ ТЕГОВ ---
const TAG_COLORS = [
    '#ff6f00', 
    '#00e676', 
    '#2979ff', 
    '#ff1744', 
    '#e040fb', 
    '#00bcd4', 
];

// ФИКС: ВЫНОСИМ СТИЛЬ МЕТКИ ЗА ПРЕДЕЛЫ КОМПОНЕНТА
const labelStyle = { 
    color: '#00bfa5', 
    display: 'block', 
    mb: 0.5, 
    textTransform: 'uppercase', 
    fontWeight: 'bold',
    fontSize: '0.9rem' 
};

// Функция для генерации цвета тега по его содержимому
const getTagColor = (tag, index) => {
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return TAG_COLORS[(hash + index) % TAG_COLORS.length];
};

/**
 * PostCard - Компонент для отображения краткой информации о посте в ленте.
 * Принимает props.sx для кастомизации стилей (например, фиксированная высота)
 */
const PostCard = ({ 
    id, 
    nickname, 
    authorAvatar,
    authorId,
    onAuthorClick,
    title, 
    article_preview, 
    likesCount, 
    commentsCount, 
    isLiked, 
    onClick, 
    onLike, 
    onCommentClick,
    tags = [],
    sx = {}, // <-- Принимаем кастомные стили, включая фиксированную высоту
    showRepost = true,
    onShare, // optional share handler (id) => void
    articleImageUrl,
    file_path,
    filePath,
    showImage = true,
}) => {
    const [shareNoticeOpen, setShareNoticeOpen] = useState(false);
    const shareTimerRef = useRef(null);
    const [imageBroken, setImageBroken] = useState(false);

    const withCacheBust = (url) => {
        if (!url) return url;
        return `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`;
    };

    const resolvedImageUrl = articleImageUrl || buildArticleImageUrl(API_BASE_URL, file_path || filePath);
    const resolvedAuthorAvatar = buildAvatarUrl(API_BASE_URL, authorAvatar);

    useEffect(() => {
        return () => {
            if (shareTimerRef.current) {
                clearTimeout(shareTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        setImageBroken(false);
    }, [resolvedImageUrl]);

    const showShareNotice = () => {
        setShareNoticeOpen(true);
        if (shareTimerRef.current) {
            clearTimeout(shareTimerRef.current);
        }
        shareTimerRef.current = setTimeout(() => {
            setShareNoticeOpen(false);
        }, 2000);
    };

    const handleShareClick = async (event) => {
        event.stopPropagation();
        const shareId = id;

        if (onShare) {
            onShare(shareId);
            showShareNotice();
            return;
        }

        const shareUrl = `${window.location.origin}/?article=${shareId}`;

        try {
            await navigator.clipboard.writeText(shareUrl);
        } catch (err) {
            try {
                window.prompt('Скопируйте ссылку на статью:', shareUrl);
            } catch (promptError) {
                // ignore
            }
        } finally {
            showShareNotice();
        }
    };

    return (
        <Card 
            sx={{
                width: '100%',
                backgroundColor: '#2c2c2c', 
                borderRadius: '12px',
                height: '85vh', // По умолчанию для ленты
                minHeight: 'unset', 
                cursor: onClick ? 'pointer' : 'default',
                transition: 'box-shadow 0.3s',
                '&:hover': {
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
                },
                display: 'flex',
                flexDirection: 'column',
                ...sx // <-- Применяем кастомные стили (например, height: '100%')
            }}
            onClick={onClick}
        >
            {shareNoticeOpen && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 2000,
                        backgroundColor: 'rgba(18, 18, 18, 0.95)',
                        border: '1px solid rgba(0, 191, 165, 0.6)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                        px: 3,
                        py: 1.5,
                        pointerEvents: 'none',
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 700 }}>
                        Ссылка на статью скопирована
                    </Typography>
                </Box>
            )}
            <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                
                {/* 1. АВТОР и ТЕГИ */}
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar
                                    src={resolvedAuthorAvatar}
                                    sx={{ width: 34, height: 34, border: '2px solid #00bfa5' }}
                                    imgProps={{
                                        onError: (e) => {
                                            // 1-я ошибка: пробуем тот же URL, но с cache-bust
                                            if (!e.currentTarget.dataset.retried && resolvedAuthorAvatar) {
                                                e.currentTarget.dataset.retried = '1';
                                                e.currentTarget.src = withCacheBust(resolvedAuthorAvatar);
                                                return;
                                            }
                                            // 2-я ошибка: дефолтный аватар
                                            e.currentTarget.src = DEFAULT_AVATAR_SRC;
                                        },
                                    }}
                                />
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
                    {/* САМО НАЗВАНИЕ */}
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            color: 'white', 
                            fontWeight: 'bold',
                            // Ограничение по строкам для заголовка
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            display: '-webkit-box', 
                            WebkitLineClamp: 2, 
                            WebkitBoxOrient: 'vertical',
                        }}
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
                    {/* САМО ОПИСАНИЕ (ПРЕВЬЮ) */}
                    <Typography 
                        variant="body1" 
                        dangerouslySetInnerHTML={{ __html: article_preview }}
                        sx={{ 
                            color: 'inherit',
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            display: '-webkit-box', 
                            WebkitLineClamp: 15, // Адаптировано
                            WebkitBoxOrient: 'vertical',
                        }}
                    />
                </Box>
            </Box>

            {showImage && resolvedImageUrl && !imageBroken && (
                <Box sx={{ px: 2, pb: 1.5 }}>
                    <Box
                        component="img"
                        src={resolvedImageUrl}
                        alt="Фото статьи"
                        onError={(e) => {
                            // 1-й фейл: повторяем с cache-bust (часто после создания файла)
                            if (!e.currentTarget.dataset.retried && resolvedImageUrl) {
                                e.currentTarget.dataset.retried = '1';
                                e.currentTarget.src = withCacheBust(resolvedImageUrl);
                                return;
                            }
                            // 2-й фейл: скрываем картинку
                            setImageBroken(true);
                        }}
                        sx={{
                            width: '100%',
                            height: { xs: 180, sm: 200 },  // ← увеличил с 140/160
                            objectFit: 'cover',
                            borderRadius: '12px',
                            border: '1px solid #333',
                        }}
                    />
                </Box>
            )}

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
                            sx={{ color: isLiked ? '#ff1744' : '#00bfa5' }}
                            // Если onLike не передан (например, в модалке), кнопка неактивна
                            onClick={onLike ? (e) => { e.stopPropagation(); onLike(id); } : (e) => { e.stopPropagation(); }}
                            disabled={!onLike}
                        >
                            <FavoriteIcon sx={{ fontSize: 30 }} />
                        </IconButton>
                        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold' }}>
                            {likesCount}
                        </Typography>
                    </Box>

                    {/* Комментарии */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            sx={{ color: '#00bfa5'}}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onCommentClick) {
                                    onCommentClick();
                                }
                            }}
                        >
                            <ChatBubbleOutlineIcon sx={{ fontSize: 30 }} />
                        </IconButton>
                        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold' }}>
                            {commentsCount}
                        </Typography>
                    </Box>

                    {/* Репост */}
                    {showRepost && (
                        <IconButton
                            sx={{ color: '#00bfa5'}}
                            onClick={handleShareClick}
                        >
                            <SendIcon sx={{ fontSize: 30 }} />
                        </IconButton>
                    )}

                </Box>
            </Box>
        </Card>
    );
};

export default PostCard;
