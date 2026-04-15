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
import ShortcutRoundedIcon from '@mui/icons-material/ShortcutRounded';
import { buildArticleImageUrl, buildAvatarUrl, DEFAULT_AVATAR_SRC } from './avatarUtils';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { formatContentForRender } from './contentFormatting';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

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
    color: '#00e5c9',
    display: 'block',
    mb: 0.5,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    fontSize: { xs: '0.65rem', md: '0.9rem' },
    letterSpacing: { xs: '0.06em', md: '0.04em' },
};

// Функция для генерации цвета тега по его содержимому
const getTagColor = (tag, index) => {
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return TAG_COLORS[(hash + index) % TAG_COLORS.length];
};

const normalizeCodeBlockText = (block) => {
    let html = block.innerHTML || '';
    html = html.replace(/<br\s*[\/]?>/gi, '\n');
    html = html.replace(/<div[^>]*>/gi, '\n');
    html = html.replace(/<\/div>/gi, '');
    html = html.replace(/<p[^>]*>/gi, '\n');
    html = html.replace(/<\/p>/gi, '');

    const temp = document.createElement('textarea');
    temp.innerHTML = html;

    return (temp.value || '')
        .replace(/\r\n?/g, '\n')
        .replace(/\u200b/g, '')
        .trim();
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
    showCommentAction = true,
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
        const shareUrl = `${window.location.origin}/?article=${shareId}`;
        const canUseNativeShare = typeof navigator !== 'undefined'
            && typeof navigator.share === 'function'
            && (
                (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 900px)').matches)
                || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '')
            );

        try {
            if (canUseNativeShare) {
                await navigator.share({
                    title: title || 'Статья Lambda Generation',
                    text: title || 'Посмотри эту статью',
                    url: shareUrl,
                });
                if (onShare) onShare(shareId);
                return;
            }

            await navigator.clipboard.writeText(shareUrl);
            if (onShare) onShare(shareId);
            showShareNotice();
        } catch (err) {
            if (err?.name === 'AbortError') {
                return;
            }

            try {
                window.prompt('Скопируйте ссылку на статью:', shareUrl);
                if (onShare) onShare(shareId);
                showShareNotice();
            } catch (promptError) {
                // ignore
            }
        }
    };

    const contentRef = useRef(null);
    const renderedPreviewContent = formatContentForRender(article_preview || '');

        useEffect(() => {
        if (contentRef.current) {
            contentRef.current.querySelectorAll('pre code').forEach((block) => {
                if (!block.dataset.highlighted) {
                    const codeText = normalizeCodeBlockText(block);

                    const languageClass = Array.from(block.classList).find((cls) => cls.startsWith('language-'));
                    let language = languageClass ? languageClass.replace('language-', '') : '';
                    if (!language || language === 'text') {
                        // try to find it from an older th element if it was an old table
                        const possibleTh = block.closest('table')?.querySelector('th');
                        if (possibleTh && possibleTh.textContent && possibleTh.textContent.trim() !== 'code') {
                            language = possibleTh.textContent.trim();
                        } else {
                            language = 'code';
                        }
                    }

                    // Find the outermost container to replace
                    let container = block;
                    const possibleTable = block.closest('table.code-block-table');
                    if (possibleTable) {
                        container = possibleTable;
                    } else {
                        const possiblePre = block.closest('pre.tg-code-block') || block.closest('pre');
                        if (possiblePre) {
                            container = possiblePre;
                        }
                    }

                    // Build our standard unified block
                    const newWrapper = document.createElement('div');
                    newWrapper.innerHTML = `<table class="tg-code-block code-block-table" style="width: 100%; background: #282c34; border-radius: 8px; border: 1px solid rgba(255,255,255,0.12); border-collapse: separate; border-spacing: 0; margin: 14px 0; overflow: hidden; table-layout: fixed;">
    <thead>
        <tr>
            <th style="padding: 2px 6px; background: #21252b; color: rgba(255,255,255,0.6); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; text-align: left; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.12); user-select: none;">${language.charAt(0).toUpperCase() + language.slice(1)}</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="padding: 10px; overflow-x: auto;">
                <pre style="margin: 0; white-space: pre-wrap !important; word-wrap: break-word; background: transparent;"><code class="language-${language}" style="font-family: Consolas, monospace; font-size: 14px; background: transparent !important; padding: 0 !important; border: none !important;"></code></pre>
            </td>
        </tr>
    </tbody>
</table>`;
                    const newTable = newWrapper.firstElementChild;
                    const newCode = newTable.querySelector('code');
                    newCode.textContent = codeText;
                    
                    if (language && language !== 'code' && hljs.getLanguage(language)) {
                        hljs.highlightElement(newCode);
                    } else {
                        newCode.innerHTML = hljs.highlightAuto(codeText).value;
                    }
                    newCode.dataset.highlighted = 'true';
                    
                    if (container && container.parentNode) {
                        container.parentNode.replaceChild(newTable, container);
                    }
                }
            });
        }
    }, [renderedPreviewContent]);

    return (
        <Card 
            sx={{
                width: '100%',
                maxWidth: '100%',
                backgroundColor: '#2c2c2c',
                borderRadius: '12px',
                height: { xs: 'auto', md: '85vh' },
                minHeight: { xs: 0, md: 'unset' },
                cursor: onClick ? 'pointer' : 'default',
                transition: 'box-shadow 0.25s ease, transform 0.2s ease',
                '&:hover': {
                    boxShadow: { xs: 'none', md: '0 8px 16px rgba(0, 0, 0, 0.4)' },
                },
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                ...sx,
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
            <Box sx={{ p: { xs: 1.25, sm: 1.5, md: 2 }, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: { xs: 'flex-start', md: 'space-between' }, minWidth: 0 }}>
                
                {/* 1. АВТОР и ТЕГИ */}
                <Box>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'stretch', md: 'flex-start' },
                        gap: { xs: 1, md: 0 },
                        mb: { xs: 1, md: 1.5 },
                    }}>
                        
                        {/* КЛИКАБЕЛЬНЫЙ БЛОК АВТОРА */}
                        <Box
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                if (onAuthorClick && authorId) {
                                    onAuthorClick(authorId);
                                }
                            }}
                            sx={{ cursor: onAuthorClick && authorId ? 'pointer' : 'default', minWidth: 0, flex: { md: '0 1 auto' } }}
                        >
                            <Typography variant="body2" sx={{ ...labelStyle, display: { xs: 'none', md: 'block' } }}>
                                Автор
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, md: 1 } }}>
                                <Avatar
                                    src={resolvedAuthorAvatar}
                                    sx={{ width: { xs: 28, md: 34 }, height: { xs: 28, md: 34 }, border: '2px solid #00bfa5' }}
                                    imgProps={{
                                        onError: (e) => {
                                            if (!e.currentTarget.dataset.retried && resolvedAuthorAvatar) {
                                                e.currentTarget.dataset.retried = '1';
                                                e.currentTarget.src = withCacheBust(resolvedAuthorAvatar);
                                                return;
                                            }
                                            e.currentTarget.src = DEFAULT_AVATAR_SRC;
                                        },
                                    }}
                                />
                                <Typography 
                                    variant="h6" 
                                    sx={{
                                        color: '#00e5c9',
                                        fontWeight: 'bold',
                                        fontSize: { xs: '0.95rem', md: '1.25rem' },
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    @{nickname}
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'nowrap',
                                gap: 0.5,
                                overflowX: 'auto',
                                maxWidth: '100%',
                                pb: 0.25,
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#00bfa5 #2c2c2c',
                                '&::-webkit-scrollbar': { height: 4 },
                                '&::-webkit-scrollbar-thumb': { background: '#00bfa5', borderRadius: 4 },
                            }}
                        >
                            {tags.map((tag, index) => (
                                <Chip 
                                    key={index}
                                    label={tag}
                                    size="small"
                                    sx={{ 
                                        backgroundColor: getTagColor(tag, index), 
                                        color: 'white', 
                                        fontWeight: 'bold',
                                        height: { xs: 24, md: 22 },
                                        flexShrink: 0,
                                        fontSize: { xs: '0.7rem', md: '0.8125rem' },
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                </Box>
                
              {/* 2. НАЗВАНИЕ */}
                <Box sx={{ mb: { xs: 1, md: 1.5 } }}>
                    <Typography variant="body2" sx={{ ...labelStyle, display: { xs: 'none', md: 'block' } }}>
                        Название
                    </Typography>
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            color: '#f5f5f5',
                            fontWeight: 'bold',
                            fontSize: { xs: '0.92rem', sm: '1.1rem', md: '1.5rem' },
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            display: '-webkit-box', 
                            WebkitLineClamp: 2, 
                            WebkitBoxOrient: 'vertical',
                            overflowWrap: 'anywhere',
                            wordBreak: 'break-word',
                            lineHeight: { xs: 1.25, md: 1.35 },
                        }}
                    >
                        {title} 
                    </Typography>
                </Box>

                <Box sx={{ flexGrow: { xs: 0, md: 1 }, mb: { xs: 1, md: 2 }, overflow: 'hidden', color: '#d0d0d0' }}>
                    <Typography variant="body2" sx={{ ...labelStyle, display: { xs: 'none', md: 'block' } }}>
                        Описание
                    </Typography>
                    <Typography
                        ref={contentRef}
                        variant="body1"
                        dangerouslySetInnerHTML={{ __html: renderedPreviewContent }}
                        sx={{
                            color: 'inherit',
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            display: '-webkit-box', 
                            WebkitLineClamp: { xs: 3, md: 15 },
                            WebkitBoxOrient: 'vertical',
                            fontSize: { xs: '0.875rem', md: '1rem' },
                            lineHeight: 1.45 } }
                    />
                </Box>
            </Box>

            {showImage && resolvedImageUrl && !imageBroken && (
                <Box sx={{ px: { xs: 1.25, md: 2 }, pb: { xs: 1, md: 1.5 }, width: '100%', boxSizing: 'border-box' }}>
                    <Box
                        component="img"
                        src={resolvedImageUrl}
                        alt="Фото статьи"
                        onError={(e) => {
                            if (!e.currentTarget.dataset.retried && resolvedImageUrl) {
                                e.currentTarget.dataset.retried = '1';
                                e.currentTarget.src = withCacheBust(resolvedImageUrl);
                                return;
                            }
                            setImageBroken(true);
                        }}
                        sx={{
                            width: '100%',
                            maxWidth: '100%',
                            height: { xs: 'auto', md: 200 },
                            maxHeight: { xs: 280, sm: 320, md: 200 },
                            aspectRatio: { xs: '16 / 10', md: 'auto' },
                            objectFit: 'cover',
                            borderRadius: '12px',
                            border: '1px solid #333',
                            display: 'block',
                        }}
                    />
                </Box>
            )}

            <Box sx={{ 
                borderTop: '1px solid #333', 
                px: { xs: 0.5, md: 1.5 },
                py: { xs: 0.75, md: 1.5 },
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                minHeight: { xs: 52, md: 'auto' },
            }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: { xs: 0.5, md: 1.5 }, flexWrap: 'nowrap', width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            sx={{
                                color: isLiked ? '#ff1744' : '#00e5c9',
                                minWidth: 44,
                                minHeight: 44,
                                transition: 'color 0.2s ease, transform 0.15s ease',
                            }}
                            onClick={onLike ? (e) => { e.stopPropagation(); onLike(id); } : (e) => { e.stopPropagation(); }}
                            disabled={!onLike}
                            aria-label="Лайк"
                        >
                            <FavoriteIcon sx={{ fontSize: { xs: 26, md: 30 } }} />
                        </IconButton>
                        <Typography variant="subtitle1" sx={{ color: '#f5f5f5', fontWeight: 'bold', fontSize: { xs: '0.9rem', md: '1rem' } }}>
                            {likesCount}
                        </Typography>
                    </Box>

                    {showCommentAction && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton
                                sx={{
                                    color: '#00e5c9',
                                    minWidth: 44,
                                    minHeight: 44,
                                    transition: 'color 0.2s ease',
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onCommentClick) {
                                        onCommentClick();
                                    }
                                }}
                                aria-label="Комментарии"
                            >
                                <ChatBubbleOutlineIcon sx={{ fontSize: { xs: 26, md: 30 } }} />
                            </IconButton>
                            <Typography variant="subtitle1" sx={{ color: '#f5f5f5', fontWeight: 'bold', fontSize: { xs: '0.9rem', md: '1rem' } }}>
                                {commentsCount}
                            </Typography>
                        </Box>
                    )}

                    {showRepost && (
                        <IconButton
                            sx={{
                                color: '#00e5c9',
                                minWidth: 44,
                                minHeight: 44,
                                ml: 'auto',
                                transition: 'color 0.2s ease',
                            }}
                            onClick={handleShareClick}
                            aria-label="Поделиться"
                        >
                            <ShortcutRoundedIcon sx={{ fontSize: { xs: 26, md: 30 }, transform: 'rotate(-20deg)' }} />
                        </IconButton>
                    )}

                </Box>
            </Box>
        </Card>
    );
};

export default PostCard;
