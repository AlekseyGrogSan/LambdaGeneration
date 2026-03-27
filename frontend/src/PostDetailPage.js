import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Typography,
    IconButton,
    TextField,
    Chip,
    Button,
    Collapse,
    CircularProgress,
    Avatar,
    SwipeableDrawer,
    useMediaQuery,
    useTheme,
    Snackbar,
    Alert,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShortcutRoundedIcon from '@mui/icons-material/ShortcutRounded';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { buildArticleImageUrl, buildAvatarUrl, DEFAULT_AVATAR_SRC } from './avatarUtils';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { formatContentForRender } from './contentFormatting';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

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
        borderRadius: '10px',
        '&:hover': { backgroundColor: '#3a3a3a' },
        '&.Mui-focused': { backgroundColor: '#3a3a3a' },
    },
    '& .MuiInputLabel-root': { color: '#bdbdbd' },
};

const labelStyle = {
    color: '#00bfa5',
    display: 'block',
    mb: 0.5,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    fontSize: '0.9rem',
};

const MAX_COMMENT_DEPTH = 2;

const countTreeComments = (comments = []) => comments.reduce(
    (sum, comment) => sum + 1 + countTreeComments(comment.replies || []),
    0,
);

const updateCommentInTree = (tree, commentId, updater) => tree.map((item) => {
    if (item.commentId === commentId) {
        return updater(item);
    }

    if (item.replies?.length) {
        return { ...item, replies: updateCommentInTree(item.replies, commentId, updater) };
    }

    return item;
});

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

const CommentItem = ({
    comment,
    depth,
    currentUserId,
    replyInputs,
    replyEditorOpen,
    editInputs,
    editEditorOpen,
    onReplyTextChange,
    onToggleReplyEditor,
    onReplySubmit,
    onEditTextChange,
    onToggleEditEditor,
    onEditSubmit,
    onDeleteComment,
    onLikeToggle,
    onToggleReplies,
}) => {
    const canReply = depth < MAX_COMMENT_DEPTH;

    return (
    <Box
        sx={{
            ml: Math.min(depth, 3) * 1.5,
            mt: 1.5,
            pl: 1.5,
            borderLeft: depth > 0 ? '2px solid #3f3f3f' : 'none',
        }}
    >
        <Box
            sx={{
                backgroundColor: depth === 0 ? '#222' : '#262626',
                border: '1px solid #333',
                borderRadius: '12px',
                p: 1.5,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                    src={buildAvatarUrl(API_BASE_URL, comment.authorAvatar)}
                    sx={{ width: 28, height: 28, border: '1px solid #00bfa5' }}
                    imgProps={{
                        onError: (e) => {
                            e.currentTarget.src = DEFAULT_AVATAR_SRC;
                        },
                    }}
                />
                <Typography variant="body2" sx={{ color: '#00bfa5', fontWeight: 700 }}>
                    @{comment.authorName}
                </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: 'white', mt: 0.5, whiteSpace: 'pre-wrap' }}>
                {comment.content}
            </Typography>
            <Typography variant="caption" sx={{ color: '#888', display: 'block', mt: 1 }}>
                {new Date(comment.publishDate).toLocaleString('ru-RU')}
            </Typography>

            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                <IconButton
                    size="small"
                    onClick={() => onLikeToggle(comment.commentId, comment.isLiked)}
                    sx={{ color: comment.isLiked ? '#ff1744' : '#9e9e9e', p: 0.5 }}
                >
                    <FavoriteIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <Typography variant="caption" sx={{ color: '#bdbdbd', ml: 0.5, fontWeight: 700 }}>
                    {comment.countLikes || 0}
                </Typography>

                {(comment.hasReplies || (comment.replies?.length > 0)) && (
                    <Button
                        size="small"
                        startIcon={comment.repliesOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        onClick={() => onToggleReplies(comment.commentId)}
                        sx={{
                            ml: 1,
                            color: '#00bfa5',
                            textTransform: 'none',
                            borderRadius: '8px',
                            minWidth: 'auto',
                            px: 1,
                        }}
                    >
                        {comment.repliesLoading
                            ? 'Загрузка...'
                            : comment.repliesOpen
                                ? 'Скрыть ответы'
                                : (comment.repliesCount > 0
                                    ? `Показать ответы (${comment.repliesCount})`
                                    : 'Показать ответы')}
                    </Button>
                )}

                {canReply && (
                    <Button
                        size="small"
                        onClick={() => onToggleReplyEditor(comment.commentId)}
                        sx={{
                            ml: 1,
                            color: '#00bfa5',
                            textTransform: 'none',
                            borderRadius: '8px',
                            minWidth: 'auto',
                            px: 1,
                        }}
                    >
                        Ответить на комментарий
                    </Button>
                )}

                {currentUserId && comment.authorId === currentUserId && (
                    <Button
                        size="small"
                        onClick={() => onToggleEditEditor(comment.commentId, comment.content)}
                        sx={{
                            ml: 1,
                            color: '#80d8ff',
                            textTransform: 'none',
                            borderRadius: '8px',
                            minWidth: 'auto',
                            px: 1,
                        }}
                    >
                        Редактировать
                    </Button>
                )}

                {currentUserId && comment.authorId === currentUserId && (
                    <Button
                        size="small"
                        startIcon={<DeleteOutlineIcon fontSize="small" />}
                        onClick={() => onDeleteComment(comment)}
                        sx={{
                            ml: 1,
                            color: '#ff8a80',
                            textTransform: 'none',
                            borderRadius: '8px',
                            minWidth: 'auto',
                            px: 1,
                        }}
                    >
                        Удалить
                    </Button>
                )}
            </Box>

            {replyEditorOpen[comment.commentId] && (
                <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                        variant="filled"
                        size="small"
                        fullWidth
                        label="Ответить"
                        value={replyInputs[comment.commentId] || ''}
                        onChange={(e) => onReplyTextChange(comment.commentId, e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onReplySubmit(comment.commentId, replyInputs[comment.commentId] || '', depth);
                            }
                        }}
                        sx={commentInputStyle}
                    />
                    <Button
                        variant="contained"
                        onClick={() => onReplySubmit(comment.commentId, replyInputs[comment.commentId] || '', depth)}
                        sx={{
                            minWidth: 'auto',
                            borderRadius: '10px',
                            backgroundColor: '#00bfa5',
                            '&:hover': { backgroundColor: '#009e8a' },
                        }}
                    >
                        Отправить
                    </Button>
                </Box>
            )}

            {editEditorOpen[comment.commentId] && (
                <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                        variant="filled"
                        size="small"
                        fullWidth
                        label="Изменить комментарий"
                        value={editInputs[comment.commentId] ?? ''}
                        onChange={(e) => onEditTextChange(comment.commentId, e.target.value)}
                        sx={commentInputStyle}
                    />
                    <Button
                        variant="contained"
                        onClick={() => onEditSubmit(comment.commentId, editInputs[comment.commentId] ?? '')}
                        sx={{
                            minWidth: 'auto',
                            borderRadius: '10px',
                            backgroundColor: '#00bfa5',
                            '&:hover': { backgroundColor: '#009e8a' },
                        }}
                    >
                        Сохранить
                    </Button>
                </Box>
            )}
        </Box>

        {comment.repliesOpen && comment.replies?.map((reply) => (
            <CommentItem
                key={reply.commentId}
                comment={reply}
                depth={depth + 1}
                currentUserId={currentUserId}
                replyInputs={replyInputs}
                replyEditorOpen={replyEditorOpen}
                editInputs={editInputs}
                editEditorOpen={editEditorOpen}
                onReplyTextChange={onReplyTextChange}
                onToggleReplyEditor={onToggleReplyEditor}
                onReplySubmit={onReplySubmit}
                onEditTextChange={onEditTextChange}
                onToggleEditEditor={onToggleEditEditor}
                onEditSubmit={onEditSubmit}
                onDeleteComment={onDeleteComment}
                onLikeToggle={onLikeToggle}
                onToggleReplies={onToggleReplies}
            />
        ))}
    </Box>
    );
};

const PostDetailPage = ({
    post,
    onBack,
    onLike,
    onAuthorClick,
    onUnauthorized,
    currentUserId,
    nickname,
    authorId,
    authorAvatar,
    containerRef,
    onCommentsCountChange,
    initialOpenComments = false,
    backLabel
}) => {
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsError, setCommentsError] = useState(null);
    const [commentsTree, setCommentsTree] = useState([]);
    const [newCommentText, setNewCommentText] = useState('');
    const [replyInputs, setReplyInputs] = useState({});
    const [replyEditorOpen, setReplyEditorOpen] = useState({});
    const [editInputs, setEditInputs] = useState({});
    const [editEditorOpen, setEditEditorOpen] = useState({});
    const authorCacheRef = useRef({});
    const [imageBroken, setImageBroken] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
    const theme = useTheme();
    const isDesktopComments = useMediaQuery(theme.breakpoints.up(768));
    const contentRef = useRef(null);
    const renderedArticleContent = formatContentForRender(post?.article_content || '');

    const showNotification = (message, severity = 'info') => {
        setNotification({ open: true, message, severity });
    };

    const closeNotification = () => {
        setNotification((prev) => ({ ...prev, open: false }));
    };

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.querySelectorAll('pre code').forEach((block) => {
                if (!block.dataset.highlighted) {
                    const codeText = normalizeCodeBlockText(block);
                    block.textContent = codeText;

                    const languageClass = Array.from(block.classList).find((cls) => cls.startsWith('language-'));
                    const language = languageClass ? languageClass.replace('language-', '') : '';

                    if (language && hljs.getLanguage(language)) {
                        hljs.highlightElement(block);
                    } else {
                        block.innerHTML = hljs.highlightAuto(codeText).value;
                    }
                }
            });
        }
    }, [renderedArticleContent]);

    useEffect(() => {
        if (containerRef && containerRef.current) {
            containerRef.current.scrollTop = 0;
        } else {
            window.scrollTo(0, 0);
        }
    }, [containerRef]);

    useEffect(() => {
        if (initialOpenComments) {
            setCommentsOpen(true);
            loadComments();
        }
    }, [initialOpenComments, post.article_id]);

    useEffect(() => {
        setImageBroken(false);
    }, [post.article_id]);

    if (!post) return <Box sx={{ color: 'white' }}>Пост не найден.</Box>;

    const articleImageUrl = post.articleImageUrl || buildArticleImageUrl(API_BASE_URL, post.file_path || post.filePath);

    const getTagColor = (tag, index) => {
        const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return TAG_COLORS[(hash + index) % TAG_COLORS.length];
    };

    const getAuthorInfo = async (userId) => {
        if (authorCacheRef.current[userId]) {
            return authorCacheRef.current[userId];
        }

        try {
            const response = await fetch(`${API_BASE_URL}/Users/UserProfile/${userId}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                const fallback = { name: 'Автор', avatar: null };
                authorCacheRef.current[userId] = fallback;
                return fallback;
            }

            const data = await response.json();
            const info = {
                name: data.name || 'Автор',
                avatar: data.pathAvatar ?? data.PathAvatar ?? null,
            };
            authorCacheRef.current[userId] = info;
            return info;
        } catch {
            const fallback = { name: 'Автор', avatar: null };
            authorCacheRef.current[userId] = fallback;
            return fallback;
        }
    };

    const enrichComment = async (comment) => {
        const commentId = comment.commentId ?? comment.CommentId;
        const authorId = comment.authorId ?? comment.AuthorId;
        const hasReplies = Boolean(comment.hasReplies ?? comment.HasReplies);
        const repliesCount = comment.repliesCount ?? comment.RepliesCount ?? 0;

        const authorInfo = await getAuthorInfo(authorId);
        const isLikedResponse = await fetch(`${API_BASE_URL}/LikeComment/isLiked/${commentId}`, {
            credentials: 'include',
        }).catch(() => null);
        const isLiked = isLikedResponse && isLikedResponse.ok
            ? (await isLikedResponse.json()).isLiked || false
            : false;

        return {
            ...comment,
            commentId,
            authorId,
            hasReplies,
            repliesCount,
            authorName: authorInfo.name,
            authorAvatar: authorInfo.avatar,
            isLiked,
            replies: [],
            repliesOpen: false,
            repliesLoading: false,
            repliesLoaded: false,
        };
    };

    const loadComments = async () => {
        setCommentsLoading(true);
        setCommentsError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/Comments/get-comments/${post.article_id}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Не удалось загрузить комментарии');
            }

            const data = await response.json();
            const baseComments = data.comments || [];
            const tree = await Promise.all(baseComments.map(enrichComment));

            setCommentsTree(tree);
            setReplyEditorOpen({});
            setEditEditorOpen({});
            setEditInputs({});
            onCommentsCountChange?.(post.article_id, countTreeComments(tree));
        } catch (error) {
            console.error(error);
            setCommentsError('Ошибка при загрузке комментариев');
        } finally {
            setCommentsLoading(false);
        }
    };

    const handleToggleComments = async () => {
        const nextOpen = !commentsOpen;
        setCommentsOpen(nextOpen);

        if (nextOpen) {
            await loadComments();
        }
    };

    const handleShareArticle = async (e) => {
        e.stopPropagation();
        const shareUrl = `${window.location.origin}/?article=${post.article_id}`;
        const canUseNativeShare = typeof navigator !== 'undefined'
            && typeof navigator.share === 'function'
            && (
                (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 900px)').matches)
                || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '')
            );

        try {
            if (canUseNativeShare) {
                await navigator.share({
                    title: post.title || 'Статья Lambda Generation',
                    text: post.title || 'Посмотри эту статью',
                    url: shareUrl,
                });
                return;
            }

            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(shareUrl);
                showNotification('Ссылка скопирована в буфер обмена', 'success');
            } else {
                window.prompt('Скопируйте ссылку на статью:', shareUrl);
            }
        } catch (err) {
            if (err?.name === 'AbortError') {
                return;
            }

            console.error('Copy/share failed', err);
            try {
                await navigator.clipboard.writeText(shareUrl);
                showNotification('Ссылка скопирована в буфер обмена', 'success');
            } catch {
                window.prompt('Скопируйте ссылку на статью:', shareUrl);
            }
        }
    };

    const createComment = async (content, parentId = null) => {
        const trimmed = content.trim();
        if (trimmed.length < 2) {
            setCommentsError('Комментарий должен быть не короче 2 символов');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/Comments/create-comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                articleId: post.article_id,
                parentId,
                content: trimmed,
            }),
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                onUnauthorized?.();
                throw new Error('Для комментариев требуется авторизация');
            }
            throw new Error('Не удалось отправить комментарий');
        }

        await loadComments();
    };

    const handleCreateRootComment = async () => {
        try {
            setCommentsError(null);
            await createComment(newCommentText);
            setNewCommentText('');
        } catch (error) {
            setCommentsError(error.message);
        }
    };

    const handleReplyChange = (commentId, value) => {
        setReplyInputs((prev) => ({ ...prev, [commentId]: value }));
    };

    const handleToggleReplyEditor = (commentId) => {
        setReplyEditorOpen((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
    };

    const handleEditChange = (commentId, value) => {
        setEditInputs((prev) => ({ ...prev, [commentId]: value }));
    };

    const handleToggleEditEditor = (commentId, currentContent = '') => {
        setEditEditorOpen((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
        setEditInputs((prev) => ({
            ...prev,
            [commentId]: prev[commentId] ?? currentContent,
        }));
    };

    const updateComment = async (commentId, content) => {
        const trimmed = content.trim();
        if (trimmed.length < 2) {
            setCommentsError('Комментарий должен быть не короче 2 символов');
            return false;
        }

        const response = await fetch(`${API_BASE_URL}/Comments/update-comment`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                commentId,
                content: trimmed,
            }),
        });

        if (response.status === 401 || response.status === 403) {
            onUnauthorized?.();
            throw new Error('Для комментариев требуется авторизация');
        }

        if (!response.ok) {
            throw new Error('Не удалось обновить комментарий');
        }

        return true;
    };

    const handleReplySubmit = async (commentId, value, depth) => {
        if (depth >= MAX_COMMENT_DEPTH) {
            setReplyEditorOpen((prev) => ({ ...prev, [commentId]: false }));
            return;
        }

        try {
            setCommentsError(null);
            await createComment(value, commentId);
            setReplyInputs((prev) => ({ ...prev, [commentId]: '' }));
            setReplyEditorOpen((prev) => ({ ...prev, [commentId]: false }));
        } catch (error) {
            setCommentsError(error.message);
        }
    };

    const handleEditSubmit = async (commentId, value) => {
        try {
            setCommentsError(null);
            const ok = await updateComment(commentId, value);
            if (!ok) return;
            setEditEditorOpen((prev) => ({ ...prev, [commentId]: false }));
            await loadComments();
        } catch (error) {
            setCommentsError(error.message);
        }
    };

    const handleDeleteComment = async (comment) => {
        try {
            setCommentsError(null);
            if (comment.hasReplies) {
                const ok = await updateComment(comment.commentId, 'Комментарий удален');
                if (!ok) return;
            } else {
                const response = await fetch(`${API_BASE_URL}/Comments/delete-comment`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(comment.commentId),
                });

                if (response.status === 401 || response.status === 403) {
                    onUnauthorized?.();
                    throw new Error('Для удаления комментария требуется авторизация');
                }

                if (!response.ok) {
                    throw new Error('Не удалось удалить комментарий');
                }
            }

            await loadComments();
        } catch (error) {
            setCommentsError(error.message);
        }
    };

    const handleCommentLikeToggle = async (commentId, currentIsLiked) => {
        const endpoint = currentIsLiked ? 'unLike' : 'like';

        setCommentsTree((prev) => updateCommentInTree(prev, commentId, (comment) => ({
            ...comment,
            isLiked: !currentIsLiked,
            countLikes: currentIsLiked ? Math.max((comment.countLikes || 0) - 1, 0) : (comment.countLikes || 0) + 1,
        })));

        try {
            const response = await fetch(`${API_BASE_URL}/LikeComment/${endpoint}/${commentId}`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.status === 401 || response.status === 403) {
                onUnauthorized?.();
                throw new Error('Для лайков комментариев требуется авторизация');
            }

            if (!response.ok) {
                throw new Error('Не удалось изменить лайк комментария');
            }

            const data = await response.json();
            setCommentsTree((prev) => updateCommentInTree(prev, commentId, (comment) => ({
                ...comment,
                isLiked: !currentIsLiked,
                countLikes: data.countLikes ?? comment.countLikes ?? 0,
            })));
        } catch (error) {
            setCommentsTree((prev) => updateCommentInTree(prev, commentId, (comment) => ({
                ...comment,
                isLiked: currentIsLiked,
                countLikes: currentIsLiked ? (comment.countLikes || 0) + 1 : Math.max((comment.countLikes || 0) - 1, 0),
            })));
            setCommentsError(error.message);
        }
    };

    const fetchRepliesTree = async (parentId) => {
        const response = await fetch(`${API_BASE_URL}/Comments/get-replies/${parentId}`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to load replies');
        }

        const data = await response.json();
        const replies = await Promise.all((data.comments || []).map(async (reply) => {
            const enrichedReply = await enrichComment(reply);

            if (!enrichedReply.hasReplies) {
                return enrichedReply;
            }

            const nestedReplies = await fetchRepliesTree(enrichedReply.commentId);
            return {
                ...enrichedReply,
                replies: nestedReplies,
                repliesOpen: nestedReplies.length > 0,
                repliesLoading: false,
                repliesLoaded: true,
                repliesCount: nestedReplies.length,
            };
        }));

        return replies;
    };

    const handleToggleReplies = async (commentId) => {
        const target = (() => {
            const stack = [...commentsTree];
            while (stack.length) {
                const item = stack.pop();
                if (item.commentId === commentId) return item;
                if (item.replies?.length) stack.push(...item.replies);
            }
            return null;
        })();

        if (!target) return;

        if (target.repliesLoaded) {
            setCommentsTree((prev) => updateCommentInTree(prev, commentId, (comment) => ({
                ...comment,
                repliesOpen: !comment.repliesOpen,
            })));
            return;
        }

        setCommentsTree((prev) => updateCommentInTree(prev, commentId, (comment) => ({
            ...comment,
            repliesLoading: true,
        })));

        try {
            const replies = await fetchRepliesTree(commentId);
            setCommentsTree((prev) => updateCommentInTree(prev, commentId, (comment) => ({
                ...comment,
                replies,
                repliesOpen: true,
                repliesLoading: false,
                repliesLoaded: true,
                repliesCount: replies.length,
            })));
        } catch (error) {
            setCommentsTree((prev) => updateCommentInTree(prev, commentId, (comment) => ({
                ...comment,
                repliesLoading: false,
            })));
            setCommentsError(error.message);
        }
    };

    return (
        <Box
            sx={{
                backgroundColor: '#2c2c2c',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                m: { xs: 0, sm: 1, md: 2 },
                pb: 2,
                color: 'white',
            }}
        >
            <Box sx={{ p: { xs: 1.25, md: 2 }, borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton
                    onClick={onBack}
                    aria-label="Назад"
                    sx={{
                        color: '#00e5c9',
                        minWidth: 44,
                        minHeight: 44,
                        transition: 'background-color 0.2s ease',
                        '&:hover': { backgroundColor: 'rgba(0, 191, 165, 0.1)' },
                    }}
                >
                    <ArrowBackIcon />
                </IconButton>
                <Typography
                    variant="h6"
                    sx={{
                        color: '#f5f5f5',
                        ml: 0.5,
                        fontSize: { xs: '1rem', md: '1.25rem' },
                        fontWeight: 700,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {backLabel || 'Назад к ленте'}
                </Typography>
            </Box>

            <Box sx={{ p: { xs: 1.25, md: 2 } }}>
                <Typography variant="body2" sx={labelStyle}>Название</Typography>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 'bold',
                        mb: 2,
                        fontSize: { xs: '1.1rem', sm: '1.35rem', md: '2.125rem' },
                        lineHeight: { xs: 1.25, md: 1.35 },
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                    }}
                >
                    {post.title}
                </Typography>

                <Box
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onAuthorClick && authorId) {
                            onAuthorClick(authorId);
                        }
                    }}
                    sx={{ cursor: onAuthorClick && authorId ? 'pointer' : 'default' }}
                >
                    <Typography variant="body2" sx={labelStyle}>Автор</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                            src={buildAvatarUrl(API_BASE_URL, authorAvatar)}
                            sx={{ width: 34, height: 34, border: '2px solid #00bfa5' }}
                            imgProps={{
                                onError: (e) => {
                                    e.currentTarget.src = DEFAULT_AVATAR_SRC;
                                },
                            }}
                        />
                        <Typography variant="h6" sx={{ color: '#00bfa5', fontWeight: 'bold' }}>
                            {nickname}
                        </Typography>
                    </Box>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'nowrap',
                        gap: 0.75,
                        mb: 3,
                        overflowX: 'auto',
                        maxWidth: '100%',
                        pb: 0.5,
                        scrollbarWidth: 'thin',
                        '&::-webkit-scrollbar': { height: 4 },
                    }}
                >
                    {post.tags.map((tag, index) => (
                        <Chip
                            key={index}
                            label={tag}
                            sx={{
                                backgroundColor: getTagColor(tag, index),
                                color: 'white',
                                fontWeight: 'bold',
                                borderRadius: '10px',
                                flexShrink: 0,
                            }}
                        />
                    ))}
                </Box>

                {articleImageUrl && !imageBroken && (
                    <Box sx={{ mb: 3 }}>
                        <Box
                            component="img"
                            src={articleImageUrl}
                            alt="Фото статьи"
                            onError={() => setImageBroken(true)}
                            sx={{
                                width: '100%',
                                maxHeight: 420,
                                objectFit: 'cover',
                                borderRadius: '14px',
                                border: '1px solid #333',
                            }}
                        />
                    </Box>
                )}


                <Box
                    ref={contentRef}
                    dangerouslySetInnerHTML={{ __html: renderedArticleContent }}
                    sx={{
                        color: 'white',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        '& h1': { fontSize: '2.4rem', mt: 3, mb: 1, color: '#00bfa5' },
                        '& h2': { fontSize: '2rem', mt: 2, mb: 1, color: 'white' },
                        '& h3': { fontSize: '1.7rem', mt: 1.5, mb: 0.5, color: 'white' },
                        '& p': { marginBottom: 1, marginTop: 1, fontSize: '1.15rem' },
                        '& strong': { fontWeight: 'bold', color: 'white' },
                        '& .tg-code-block': {
                            background: '#1f2937',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '10px',
                            padding: '12px 14px',
                            margin: '14px 0',
                            overflowX: 'auto',
                            whiteSpace: 'pre',
                            fontSize: '0.95rem',
                        },
                        '& .hljs': { background: 'transparent !important', padding: '0 !important' },
                    }}
                />
            </Box>

            <Box
                sx={{
                    px: { xs: 1, md: 2 },
                    py: { xs: 1, md: 2 },
                    borderTop: '1px solid #333',
                    display: 'flex',
                    gap: { xs: 1, md: 3 },
                    alignItems: 'center',
                    flexWrap: 'nowrap',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                        onClick={onLike}
                        aria-label="Лайк"
                        sx={{ color: post.isLiked ? '#ff1744' : '#00e5c9', minWidth: 44, minHeight: 44 }}
                    >
                        <FavoriteIcon sx={{ fontSize: 26 }} />
                    </IconButton>
                    <Typography variant="subtitle1" sx={{ color: '#f5f5f5', fontWeight: 'bold', ml: 0.25 }}>
                        {post.likesCount}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                        onClick={handleToggleComments}
                        aria-label="Комментарии"
                        sx={{ color: commentsOpen ? '#048b79' : '#00e5c9', minWidth: 44, minHeight: 44 }}
                    >
                        <ChatBubbleOutlineIcon sx={{ fontSize: 26 }} />
                    </IconButton>
                    <Typography variant="subtitle1" sx={{ color: '#f5f5f5', fontWeight: 'bold', ml: 0.25 }}>
                        {post.commentsCount}
                    </Typography>
                </Box>

                <IconButton
                    sx={{ color: '#00e5c9', minWidth: 44, minHeight: 44, ml: 'auto' }}
                    onClick={handleShareArticle}
                >
                    <ShortcutRoundedIcon sx={{ fontSize: 24, transform: 'rotate(-20deg)' }} />
                </IconButton>
            </Box>

            {isDesktopComments && (
                <Collapse in={commentsOpen} timeout="auto" unmountOnExit>
                    <Box sx={{ p: 2, borderTop: '1px solid #333' }}>
                        <Typography variant="h6" sx={{ color: '#f5f5f5', mb: 2 }}>Комментарии</Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <TextField
                                label="Написать комментарий..."
                                variant="filled"
                                fullWidth
                                value={newCommentText}
                                onChange={(e) => setNewCommentText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleCreateRootComment();
                                    }
                                }}
                                sx={commentInputStyle}
                            />

                            <Button
                                variant="contained"
                                onClick={handleCreateRootComment}
                                sx={{
                                    borderRadius: '10px',
                                    backgroundColor: '#00bfa5',
                                    px: 2,
                                    '&:hover': { backgroundColor: '#009e8a' },
                                }}
                            >
                                Отправить
                            </Button>
                        </Box>

                        {commentsError && (
                            <Typography sx={{ color: '#ff8a80', mb: 1 }}>{commentsError}</Typography>
                        )}

                        {commentsLoading ? (
                            <Box sx={{ py: 2, textAlign: 'center' }}>
                                <CircularProgress size={28} sx={{ color: '#00bfa5' }} />
                            </Box>
                        ) : commentsTree.length === 0 ? (
                            <Typography sx={{ color: '#bdbdbd' }}>Пока нет комментариев. Будьте первым.</Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                {commentsTree.map((comment) => (
                                    <CommentItem
                                        key={comment.commentId}
                                        comment={comment}
                                        depth={0}
                                        currentUserId={currentUserId}
                                        replyInputs={replyInputs}
                                        replyEditorOpen={replyEditorOpen}
                                        editInputs={editInputs}
                                        editEditorOpen={editEditorOpen}
                                        onReplyTextChange={handleReplyChange}
                                        onToggleReplyEditor={handleToggleReplyEditor}
                                        onReplySubmit={handleReplySubmit}
                                        onEditTextChange={handleEditChange}
                                        onToggleEditEditor={handleToggleEditEditor}
                                        onEditSubmit={handleEditSubmit}
                                        onDeleteComment={handleDeleteComment}
                                        onLikeToggle={handleCommentLikeToggle}
                                        onToggleReplies={handleToggleReplies}
                                    />
                                ))}
                            </Box>
                        )}
                    </Box>
                </Collapse>
            )}

            {!isDesktopComments && (
                <SwipeableDrawer
                    anchor="bottom"
                    open={commentsOpen}
                    onClose={() => setCommentsOpen(false)}
                    onOpen={() => {}}
                    disableDiscovery
                    PaperProps={{
                        sx: {
                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,
                            height: 'min(92vh, 780px)',
                            maxHeight: '92vh',
                            width: '100%',
                            maxWidth: '100vw',
                            overflow: 'hidden',
                            backgroundColor: '#1f1f1f',
                            transition: 'transform 0.25s ease-out',
                        },
                    }}
                >
                    <Box
                        sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            maxWidth: '100vw',
                        }}
                    >
                        <Box
                            sx={{
                                flexShrink: 0,
                                px: 2,
                                py: 1.25,
                                borderBottom: '1px solid #333',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <Typography variant="h6" sx={{ color: '#00e5c9', fontWeight: 700, fontSize: '1.05rem' }}>
                                Комментарии
                            </Typography>
                            <IconButton
                                onClick={() => setCommentsOpen(false)}
                                aria-label="Закрыть"
                                sx={{ ml: 'auto', minWidth: 44, minHeight: 44, color: '#bdbdbd' }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>

                        <Box
                            sx={{
                                flex: 1,
                                minHeight: 0,
                                overflowY: 'auto',
                                p: 2,
                                pt: 1.5,
                            }}
                        >
                            {commentsError && (
                                <Typography sx={{ color: '#ff8a80', mb: 1 }}>{commentsError}</Typography>
                            )}

                            {commentsLoading ? (
                                <Box sx={{ py: 2, textAlign: 'center' }}>
                                    <CircularProgress size={28} sx={{ color: '#00bfa5' }} />
                                </Box>
                            ) : commentsTree.length === 0 ? (
                                <Typography sx={{ color: '#bdbdbd' }}>Пока нет комментариев. Будьте первым.</Typography>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    {commentsTree.map((comment) => (
                                        <CommentItem
                                            key={comment.commentId}
                                            comment={comment}
                                            depth={0}
                                            currentUserId={currentUserId}
                                            replyInputs={replyInputs}
                                            replyEditorOpen={replyEditorOpen}
                                            editInputs={editInputs}
                                            editEditorOpen={editEditorOpen}
                                            onReplyTextChange={handleReplyChange}
                                            onToggleReplyEditor={handleToggleReplyEditor}
                                            onReplySubmit={handleReplySubmit}
                                            onEditTextChange={handleEditChange}
                                            onToggleEditEditor={handleToggleEditEditor}
                                            onEditSubmit={handleEditSubmit}
                                            onDeleteComment={handleDeleteComment}
                                            onLikeToggle={handleCommentLikeToggle}
                                            onToggleReplies={handleToggleReplies}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>

                        <Box
                            sx={{
                                flexShrink: 0,
                                borderTop: '1px solid #333',
                                p: 2,
                                pb: 'calc(12px + env(safe-area-inset-bottom, 0px))',
                                backgroundColor: '#181818',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1 }}>
                                <TextField
                                    label="Написать комментарий..."
                                    variant="filled"
                                    fullWidth
                                    value={newCommentText}
                                    onChange={(e) => setNewCommentText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleCreateRootComment();
                                        }
                                    }}
                                    sx={{
                                        ...commentInputStyle,
                                        '& .MuiFilledInput-root': {
                                            ...commentInputStyle['& .MuiFilledInput-root'],
                                            minHeight: 48,
                                        },
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleCreateRootComment}
                                    sx={{
                                        borderRadius: '10px',
                                        backgroundColor: '#00bfa5',
                                        minWidth: 88,
                                        minHeight: 48,
                                        alignSelf: 'stretch',
                                        '&:hover': { backgroundColor: '#009e8a' },
                                    }}
                                >
                                    Отпр.
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </SwipeableDrawer>
            )}

            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={closeNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={closeNotification} severity={notification.severity} variant="filled" sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default PostDetailPage;
