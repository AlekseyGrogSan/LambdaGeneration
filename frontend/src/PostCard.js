import React, { useEffect, useRef, useState, useMemo } from 'react';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { createRoot } from 'react-dom/client';

import {
    Box,
    Button,
    Card,
    Typography,
    IconButton,
    Chip,
    Avatar,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShortcutRoundedIcon from '@mui/icons-material/ShortcutRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { buildArticleImageUrl, buildAvatarUrl, DEFAULT_AVATAR_SRC } from './avatarUtils';
import { ProfileIcon } from './profileIcons';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { formatContentForRender, normalizeCodeLanguage } from './contentFormatting';
import { mapTagsToLabels } from './CategoryModal';
import UserRoleBadge from './UserRoleBadge';

const CodeBlock = ({ language, value }) => {
    const [isCopied, setIsCopied] = React.useState(false);
    const [isExpanded, setIsExpanded] = React.useState(false);
    const codeLines = String(value || '').split('\n');
    const isLongCode = codeLines.length > 14;
    const previewValue = isLongCode && !isExpanded
        ? codeLines.slice(0, 14).join('\n')
        : value;

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <Box
            sx={{
                my: 2,
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid var(--ui-c131)',
                boxShadow: '0 16px 36px var(--ui-c108)',
                background: 'linear-gradient(180deg, var(--ui-c150), var(--ui-c146))',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 1.5,
                    py: 1,
                    background: 'linear-gradient(90deg, var(--ui-c167), var(--ui-c149))',
                    borderBottom: '1px solid color-mix(in oklab, var(--text-primary) 8%, transparent)'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Typography variant='caption' sx={{ color: '#ffffff !important', fontWeight: 700, letterSpacing: 0.4, WebkitTextFillColor: '#ffffff !important' }}>
                        {(language || 'text').toUpperCase()}
                    </Typography>
                </Box>
                <IconButton size='small' onClick={handleCopy} sx={{ color: 'var(--ui-c60)', '&:hover': { color: 'var(--ui-c90)' } }}>
                    {isCopied ? <CheckIcon fontSize='small' sx={{ color: 'var(--ui-c39)' }} /> : <ContentCopyIcon fontSize='small' />}
                </IconButton>
            </Box>
            <SyntaxHighlighter
                language={normalizeCodeLanguage(language) !== 'text' ? normalizeCodeLanguage(language) : undefined}
                style={vscDarkPlus}
                showLineNumbers
                lineNumberStyle={{ color: 'var(--ui-c160)', minWidth: '2.2em', paddingRight: '1em' }}
                customStyle={{
                    margin: 0,
                    padding: '18px 20px',
                    fontSize: '0.92rem',
                    lineHeight: 1.58,
                    backgroundColor: 'transparent',
                    fontFamily: 'JetBrains Mono, Fira Code, Consolas, Menlo, monospace'
                }}
            >
                {previewValue}
            </SyntaxHighlighter>
            {isLongCode && (
                <Box
                    sx={{
                        px: 1.5,
                        py: 1,
                        borderTop: '1px solid color-mix(in oklab, var(--text-primary) 8%, transparent)',
                        background: 'linear-gradient(180deg, var(--ui-c147), var(--ui-c210))',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Typography variant='caption' sx={{ color: '#ffffff !important', fontWeight: 700, letterSpacing: 0.4, WebkitTextFillColor: '#ffffff !important' }}>
                        {codeLines.length} строк кода
                    </Typography>
                    <Button
                        size='small'
                        onClick={() => setIsExpanded((prev) => !prev)}
                        sx={{
                            color: 'var(--ui-c63)',
                            textTransform: 'none',
                            fontWeight: 700,
                            minWidth: 'auto',
                            px: 1,
                            '&:hover': { backgroundColor: 'var(--ui-c152)' }
                        }}
                    >
                        {isExpanded ? 'Свернуть' : 'Показать полностью'}
                    </Button>
                </Box>
            )}
        </Box>
    );
};


const normalizeCodeBlockText = (block) => {
    let html = block.innerHTML || '';
    html = html.replace(/<br\s*[\/]?>/gi, '\n');
    html = html.replace(/<div[^>]*>/gi, '\n');
    html = html.replace(/<\/div>/gi, '');
    html = html.replace(/<p[^>]*>/gi, '\n');
    html = html.replace(/<\/p>/gi, '');
    html = html.replace(/<[^>]+>/g, '');

    const temp = document.createElement('textarea');
    temp.innerHTML = html;

    return (temp.value || '')
        .replace(/\r\n?/g, '\n')
        .replace(/\u200b/g, '')
        .trim();
};

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

// --- ОБЩИЙ МАССИВ ЦВЕТОВ ДЛЯ ТЕГОВ ---
const TAG_COLORS = [
    'var(--ui-c97)', 
    'var(--ui-c13)', 
    'var(--ui-c37)', 
    'var(--ui-c94)', 
    'var(--ui-c86)', 
    'var(--ui-c7)', 
];

// ФИКС: ВЫНОСИМ СТИЛЬ МЕТКИ ЗА ПРЕДЕЛЫ КОМПОНЕНТА
const labelStyle = {
    color: 'var(--accent-400)',
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

/**
 * PostCard - Компонент для отображения краткой информации о посте в ленте.
 * Принимает props.sx для кастомизации стилей (например, фиксированная высота)
 */
const PostCard = React.memo(({ 
    id, 
    nickname, 
    authorAvatar,
    authorProfileIcon,
    authorRole,
    authorId,
    onAuthorClick,
    title, 
    article_preview, 
    viewsCount = 0,
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
    const suppressNextClickRef = useRef(false);

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
    const renderedPreviewContent = useMemo(() => formatContentForRender(article_preview || ''), [article_preview]);

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.querySelectorAll('pre code').forEach((block) => {
                if (!block.dataset.highlighted) {
                    const codeText = normalizeCodeBlockText(block);

                    const languageClass = Array.from(block.classList).find((cls) => cls.startsWith('language-'));
                    let language = languageClass ? normalizeCodeLanguage(languageClass.replace('language-', '')) : '';
                    if (!language || language === 'text') {
                        // try to find it from an older th element if it was an old table
                        const possibleTh = block.closest('table')?.querySelector('th');
                        if (possibleTh && possibleTh.textContent && possibleTh.textContent.trim() !== 'code') {
                            language = normalizeCodeLanguage(possibleTh.textContent.trim());
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
                    newWrapper.innerHTML = `<table class="tg-code-block code-block-table" style="width: 100%; background: var(--code-bg); border-radius: 8px; border: 1px solid var(--code-border); border-collapse: separate; border-spacing: 0; margin: 14px 0; overflow: hidden; table-layout: fixed;">
    <thead>
        <tr>
            <th style="padding: 6px 12px; background: var(--code-header-bg); color: var(--code-header-text); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; text-align: left; font-weight: bold; border-bottom: 1px solid var(--code-border); user-select: none;">
                ${language}
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="padding: 12px; overflow-x: auto;">
                <pre style="margin: 0; white-space: pre-wrap !important; word-wrap: break-word; background: transparent;"><code class="language-${language}" style="font-family: Consolas, monospace; font-size: 14px; background: transparent !important; padding: 0 !important; border: none !important; color: var(--text-primary);"></code></pre>
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

    
    React.useEffect(() => {
        const roots = [];
        if (contentRef.current) {
            contentRef.current.querySelectorAll('.code-block-table').forEach((table) => {
                if (table.dataset.replaced) return;
                table.dataset.replaced = 'true';

                const codeBlock = table.querySelector('pre code') || table.querySelector('pre');
                const codeText = codeBlock ? normalizeCodeBlockText(codeBlock) : normalizeCodeBlockText(table);
                const classLanguage = codeBlock
                    ? Array.from(codeBlock.classList).find((cls) => cls.startsWith('language-'))
                    : null;
                const th = table.querySelector('th');
                const languageClass = normalizeCodeLanguage(
                    classLanguage ? classLanguage.replace('language-', '') : (th ? th.textContent.trim() : 'text')
                );

                const parent = table.parentNode;
                const wrapper = document.createElement('div');
                wrapper.className = 'custom-code-block-wrapper';
                parent.insertBefore(wrapper, table);
                table.style.display = 'none';

                const root = createRoot(wrapper);
                roots.push({ root, wrapper, original: table });
                root.render(<CodeBlock language={languageClass} value={codeText} />);
            });

            contentRef.current.querySelectorAll('pre code').forEach((block) => {
                if (block.closest('.code-block-table') || block.closest('.custom-code-block-wrapper') || block.dataset.replaced) return;
                block.dataset.replaced = 'true';
                const codeText = normalizeCodeBlockText(block);

                const languageCls = Array.from(block.classList).find((cls) => cls.startsWith('language-'));
                const language = normalizeCodeLanguage(languageCls ? languageCls.replace('language-', '') : 'text');

                const pre = block.parentNode;
                const wrapper = document.createElement('div');
                wrapper.className = 'custom-code-block-wrapper';
                pre.parentNode.insertBefore(wrapper, pre);
                pre.style.display = 'none';

                const root = createRoot(wrapper);
                roots.push({ root, wrapper, original: pre });
                root.render(<CodeBlock language={language} value={codeText} />);
            });
        }

        return () => {
             roots.forEach(({ root, wrapper, original }) => {
                 setTimeout(() => root.unmount(), 0);
                 if (wrapper && wrapper.parentNode) {
                     wrapper.parentNode.removeChild(wrapper);
                 }
                 if (original) {
                     delete original.dataset.replaced;
                 }
             });
        };
    }); 

    const handleLikeClick = (e) => {
        if (e) e.stopPropagation();
        if (onLike) onLike(id, isLiked); // id instead of articleId, as PostCard receives id prop
    };

    const handleCommentClick = (e) => {
        if (e) e.stopPropagation();
        if (onCommentClick) onCommentClick();
    };

    const handleAuthorClickWrapper = (e) => {
        if (e) e.stopPropagation();
        if (onAuthorClick) onAuthorClick(authorId);
    };

    const handleCardClick = (e) => {
        if (suppressNextClickRef.current) {
            suppressNextClickRef.current = false;
            return;
        }
        if (onClick) onClick();
    };

    const handleCardPointerUp = (e) => {
        if (!onClick || e.pointerType !== 'touch') return;

        const interactiveTarget = e.target?.closest?.('button, a, input, textarea, [role="button"]');
        if (interactiveTarget) return;

        suppressNextClickRef.current = true;
        onClick();
    };

    return (
        <Card 
            sx={{
                width: '100%',
                maxWidth: '100%',
                backgroundColor: 'var(--surface-elevated)',
                borderRadius: '14px',
                border: '1px solid var(--border-default)',
                height: { xs: 'auto', md: '85vh' },
                minHeight: { xs: 0, md: 'unset' },
                cursor: onClick ? 'pointer' : 'default',
                touchAction: 'manipulation',
                transition: 'box-shadow 0.25s ease, transform 0.2s ease',
                '&:hover': {
                    boxShadow: { xs: 'none', md: 'var(--shadow-soft)' },
                },
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                ...sx,
            }}
            onClick={handleCardClick}
            onPointerUp={handleCardPointerUp}
        >
            {shareNoticeOpen && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 2000,
                        backgroundColor: 'var(--surface-panel)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '12px',
                        boxShadow: 'var(--shadow-soft)',
                        px: 3,
                        py: 1.5,
                        pointerEvents: 'none',
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="body1" sx={{ color: 'var(--text-primary)', fontWeight: 700 }}>
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
                            onClick={handleAuthorClickWrapper}
                            sx={{ cursor: onAuthorClick && authorId ? 'pointer' : 'default', minWidth: 0, flex: { md: '0 1 auto' } }}
                        >
                            <Typography variant="body2" sx={{ ...labelStyle, display: { xs: 'none', md: 'block' } }}>
                                Автор
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, md: 1 } }}>
                                <Avatar
                                    src={resolvedAuthorAvatar}
                                    sx={{ width: { xs: 28, md: 34 }, height: { xs: 28, md: 34 }, border: '2px solid var(--accent-500)' }}
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
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0, gap: 0.25 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0, flexWrap: 'wrap' }}>
                                        <Typography 
                                            variant="h6" 
                                            sx={{
                                                color: 'var(--accent-400)',
                                                fontWeight: 'bold',
                                                fontSize: { xs: '0.95rem', md: '1.25rem' },
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {nickname}
                                        </Typography>
                                        <ProfileIcon
                                            icon={authorProfileIcon}
                                            size={20}
                                            sx={{ filter: 'drop-shadow(0 0 4px var(--ui-c128))' }}
                                        />
                                    </Box>
                                    <UserRoleBadge role={authorRole} size="sm" />
                                </Box>
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
                                scrollbarColor: 'var(--accent-500) var(--surface-elevated)',
                                '&::-webkit-scrollbar': { height: 4 },
                                '&::-webkit-scrollbar-thumb': { background: 'var(--accent-500)', borderRadius: 4 },
                            }}
                        >
                            {mapTagsToLabels(Array.isArray(tags) ? tags : []).map((tag, index) => {
                                const strTag = String(tag);
                                return (
                                <Chip 
                                    key={index}
                                    label={strTag}
                                    size="small"
                                    sx={{ 
                                        backgroundColor: getTagColor(strTag, index), 
                                        color: 'var(--text-primary)', 
                                        fontWeight: 'bold',
                                        height: { xs: 24, md: 22 },
                                        flexShrink: 0,
                                        fontSize: { xs: '0.7rem', md: '0.8125rem' },
                                    }}
                                />
                            )})}
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
                            color: 'var(--text-primary)',
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

                <Box sx={{ flexGrow: { xs: 0, md: 1 }, mb: { xs: 1, md: 2 }, overflow: 'hidden', color: 'var(--text-secondary)' }}>
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
                            lineHeight: 1.45,
                            '[data-theme="light"] & [style*="color: white"], [data-theme="light"] & [style*="color:white"], [data-theme="light"] & [style*="color:#fff"], [data-theme="light"] & [style*="color: #fff"], [data-theme="light"] & [style*="color: rgb(255, 255, 255)"], [data-theme="light"] & font[color="white"]': {
                                color: 'var(--text-primary) !important',
                            },
                        } }
                    />
                </Box>
            </Box>

            {showImage && resolvedImageUrl && !imageBroken && (
                <Box sx={{ px: { xs: 1.25, md: 2 }, pb: { xs: 1, md: 1.5 }, width: '100%', boxSizing: 'border-box' }}>
                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: '100%',
                            height: { xs: 180, sm: 220, md: 200 },
                            position: 'relative',
                            borderRadius: '12px',
                            border: '1px solid var(--border-default)',
                            backgroundColor: 'transparent',
                            overflow: 'hidden',
                        }}
                    >
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
                                position: 'absolute',
                                inset: 0,
                                margin: 'auto',
                                width: 'auto',
                                height: 'auto',
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                objectPosition: 'center',
                                borderRadius: '11px',
                                display: 'block',
                            }}
                        />
                    </Box>
                </Box>
            )}

            <Box sx={{ 
                borderTop: '1px solid var(--border-default)', 
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
                                color: isLiked ? 'var(--ui-c94)' : 'var(--accent-400)',
                                minWidth: 44,
                                minHeight: 44,
                                transition: 'color 0.2s ease, transform 0.15s ease',
                            }}
                            onClick={handleLikeClick}
                            disabled={!onLike}
                            aria-label="Лайк"
                        >
                            <FavoriteIcon sx={{ fontSize: { xs: 26, md: 30 } }} />
                        </IconButton>
                        <Typography variant="subtitle1" sx={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: { xs: '0.9rem', md: '1rem' } }}>
                            {likesCount}
                        </Typography>
                    </Box>

                    {showCommentAction && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton
                                sx={{
                                    color: 'var(--accent-400)',
                                    minWidth: 44,
                                    minHeight: 44,
                                    transition: 'color 0.2s ease',
                                }}
                                onClick={handleCommentClick}
                                aria-label="Комментарии"
                            >
                                <ChatBubbleOutlineIcon sx={{ fontSize: { xs: 26, md: 30 } }} />
                            </IconButton>
                            <Typography variant="subtitle1" sx={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: { xs: '0.9rem', md: '1rem' } }}>
                                {commentsCount}
                            </Typography>
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                        <IconButton
                            sx={{
                                color: 'var(--accent-400)',
                                minWidth: 44,
                                minHeight: 44,
                                transition: 'color 0.2s ease',
                            }}
                            disableRipple
                            disableFocusRipple
                            aria-label="Просмотры"
                        >
                            <VisibilityOutlinedIcon sx={{ fontSize: { xs: 24, md: 28 } }} />
                        </IconButton>
                        <Typography variant="subtitle1" sx={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: { xs: '0.9rem', md: '1rem' } }}>
                            {viewsCount}
                        </Typography>
                    </Box>

                    {showRepost && (
                        <IconButton
                            sx={{
                                color: 'var(--accent-400)',
                                minWidth: 44,
                                minHeight: 44,
                                ml: 0.5,
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
});

export default PostCard;
