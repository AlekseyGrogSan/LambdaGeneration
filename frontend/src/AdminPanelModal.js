import React, { useState, useEffect } from 'react';
import ConfirmationDialog from './ConfirmationDialog';
import EditArticleModal from './EditArticleModal';
import InputDialog from './InputDialog';
import {
    Modal,
    Box,
    Typography,
    Button,
    Stack,
    Paper,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

const scrollbarStyle = {
    '&::-webkit-scrollbar': {
        width: '8px',
    },
    '&::-webkit-scrollbar-track': {
        background: 'var(--surface-soft)',
        borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb': {
        background: 'var(--accent-500)',
        borderRadius: '10px',
        border: '2px solid var(--surface-soft)',
    },
    '&::-webkit-scrollbar-thumb:hover': {
        background: 'var(--accent-600)',
    },
    scrollbarWidth: 'thin',
    scrollbarColor: 'var(--accent-500) var(--surface-soft)',
};

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95%', sm: 800 },
    maxHeight: '90vh',
    bgcolor: 'var(--surface-panel)',
    borderRadius: '18px',
    border: '1px solid var(--border-default)',
    boxShadow: 'var(--shadow-soft)',
    px: 4,
    py: 3,
    color: 'var(--text-primary)',
    overflowY: 'auto',
    ...scrollbarStyle,
};

const sectionStyle = {
    mt: 3,
    p: 2.5,
    borderRadius: '14px',
    bgcolor: 'var(--surface-elevated)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)'
};

const AdminPanelModal = ({ open, handleClose }) => {
    const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null });
    const [userList, setUserList] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [userData, setUserData] = useState(null);
    const [status, setStatus] = useState('');
    const [loadingUser, setLoadingUser] = useState(false);
    const [articles, setArticles] = useState([]);
    const [articlesLoading, setArticlesLoading] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [userComments, setUserComments] = useState([]);
    const [userCommentsLoading, setUserCommentsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [editArticleModalOpen, setEditArticleModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [editCommentDialog, setEditCommentDialog] = useState({ open: false, commentId: null, initialText: '' });

    const clearPanelState = () => {
        setUserData(null);
        setArticles([]);
        setSelectedArticle(null);
        setComments([]);
        setUserComments([]);
        setUserCommentsLoading(false);
        setStatus('');
    };

    const fetchUserList = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users`, { credentials: 'include' });
            if (!response.ok) throw new Error('Не удалось получить список пользователей');
            const data = await response.json();
            setUserList(data);
            if (data.length > 0) {
                setSelectedUserId(data[0].userID);
            }
        } catch (err) {
            setStatus(err.message || 'Ошибка загрузки списка пользователей');
        }
    };

    useEffect(() => {
        if (!open) {
            clearPanelState();
            setUserList([]);
            setSelectedUserId('');
        }
        if (open) {
            void fetchUserList();
        }
    }, [open]);

    const handleCloseModal = () => {
        clearPanelState();
        handleClose();
    };

    const fetchUserDetails = async () => {
        const trimmedId = selectedUserId?.trim();
        if (!trimmedId) {
            setStatus('Введите ID пользователя');
            return;
        }
        setLoadingUser(true);
        setStatus('');
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${trimmedId}`, { credentials: 'include' });
            if (!response.ok) {
                throw new Error('Пользователь не найден или вам запрещён доступ');
            }
            const data = await response.json();
            setUserData(data);
            setSelectedArticle(null);
            setComments([]);
            await fetchUserArticles(trimmedId);
            await fetchUserComments(trimmedId);
        } catch (err) {
            setStatus(err.message || 'Не удалось загрузить профиль');
            setUserData(null);
            setArticles([]);
        } finally {
            setLoadingUser(false);
        }
    };

    const fetchUserArticles = async (targetId) => {
        if (!targetId) return;
        setArticlesLoading(true);
        setStatus('');
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${targetId}/articles?page=1&pageSize=20`, { credentials: 'include' });
            if (!response.ok) {
                throw new Error('Не удалось загрузить статьи');
            }
            const data = await response.json();
            setArticles(Array.isArray(data) ? data : []);
        } catch (err) {
            setStatus(err.message || 'Не удалось получить статьи');
        } finally {
            setArticlesLoading(false);
        }
    };

    const handleToggleBan = async () => {
        if (!userData) return;
        setActionLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userData.userID}/ban`, {
                method: 'PATCH',
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Не удалось сменить статус пользователя');
            const data = await response.json();
            setUserData(prev => prev ? { ...prev, isBanned: data.isBanned } : prev);
            setStatus(data.message || 'Статус пользователя обновлён');
        } catch (err) {
            setStatus(err.message || 'Ошибка при смене статуса');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!userData) return;
        setConfirmDialog({
            open: true,
            title: 'Удаление пользователя',
            message: 'Вы действительно хотите удалить этого пользователя?',
            onConfirm: async () => {
                setConfirmDialog(prev => ({ ...prev, open: false }));
                setActionLoading(true);
                try {
                    const response = await fetch(`${API_BASE_URL}/admin/users/${userData.userID}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });
                    if (!response.ok) throw new Error('Не удалось удалить пользователя');
                    const data = await response.json();
                    setStatus(data.message || 'Пользователь удалён');
                    clearPanelState();
                } catch (err) {
                    setStatus(err.message || 'Ошибка удаления');
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    const handleDeleteArticle = async (articleId, articleTitle) => {
        setConfirmDialog({
            open: true,
            title: 'Удаление статьи',
            message: `Удалить статью "${articleTitle}"?`,
            onConfirm: async () => {
                setConfirmDialog(prev => ({ ...prev, open: false }));
                setActionLoading(true);
                try {
                    const response = await fetch(`${API_BASE_URL}/admin/articles/${articleId}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });
                    if (!response.ok) throw new Error('Не удалось удалить статью');
                    const data = await response.json();
                    setArticles(prev => prev.filter((article) => article.articleID !== articleId));
                    if (selectedArticle?.id === articleId) {
                        setSelectedArticle(null);
                        setComments([]);
                    }
                    setStatus(data.message || `Статья "${articleTitle}" удалена`);
                } catch (err) {
                    setStatus(err.message || 'Ошибка удаления статьи');
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    const handleEditArticle = async (articleId) => {
        setArticlesLoading(true);
        setStatus('');
        try {
            const response = await fetch(`${API_BASE_URL}/Articles/getArticleById/${articleId}`);
            if (!response.ok) throw new Error('Не удалось загрузить статью');
            const data = await response.json();
            setEditingArticle({
                id: data.article_id || data.articleID,
                title: data.article_title || data.articleTitle,
                article_preview: data.article_preview || data.articlePreview,
                article_content: data.article_content || data.articleContent,
                tags: data.article_tags?.map(t => t.name || t) || data.articleTags?.map(t => t.name || t) || []
            });
            setEditArticleModalOpen(true);
        } catch (err) {
            setStatus(err.message || 'Ошибка загрузки статьи');
        } finally {
            setArticlesLoading(false);
        }
    };

    const handleEditComment = (commentId, content) => {
        setEditCommentDialog({ open: true, commentId, initialText: content });
    };

    const submitEditComment = async (newContent) => {
        if (!newContent.trim()) return;
        setActionLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/comments/update-comment`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ commentId: editCommentDialog.commentId, content: newContent.trim() })
            });
            if (!response.ok) throw new Error('Не удалось обновить комментарий');
            
            setComments(prev => prev.map(c => c.id === editCommentDialog.commentId ? { ...c, content: newContent.trim() } : c));
            setUserComments(prev => prev.map(c => c.id === editCommentDialog.commentId ? { ...c, content: newContent.trim() } : c));
            setStatus('Комментарий обновлен');
            setEditCommentDialog({ open: false, commentId: null, initialText: '' });
        } catch (err) {
            setStatus(err.message || 'Ошибка редактирования комментария');
        } finally {
            setActionLoading(false);
        }
    };

    const handleLoadComments = async (articleId, articleTitle) => {
        setCommentsLoading(true);
        setStatus('');
        try {
            const response = await fetch(`${API_BASE_URL}/admin/articles/${articleId}/comments`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Не удалось загрузить комментарии');
            const data = await response.json();
            setComments(Array.isArray(data) ? data : []);
            setSelectedArticle({ id: articleId, title: articleTitle });
        } catch (err) {
            setStatus(err.message || 'Ошибка загрузки комментариев');
        } finally {
            setCommentsLoading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        setConfirmDialog({
            open: true,
            title: 'Удаление комментария',
            message: 'Удалить этот комментарий?',
            onConfirm: async () => {
                setConfirmDialog(prev => ({ ...prev, open: false }));
                try {
                    const response = await fetch(`${API_BASE_URL}/admin/comments/${commentId}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });
                    if (!response.ok) throw new Error('Не удалось удалить комментарий');
                    setComments(prev => prev.filter((comment) => comment.id !== commentId));
                    setUserComments(prev => prev.filter((comment) => comment.id !== commentId));
                    setStatus('Комментарий удалён');
                } catch (err) {
                    setStatus(err.message || 'Ошибка удаления комментария');
                }
            }
        });
    };

    const handleDeleteUserComment = async (commentId, commentSnippet) => {
        setConfirmDialog({
            open: true,
            title: 'Удаление комментария',
            message: `Удалить комментарий: "${commentSnippet?.slice(0, 80) || '...'}"?`,
            onConfirm: async () => {
                setConfirmDialog(prev => ({ ...prev, open: false }));
                setActionLoading(true);
                try {
                    const response = await fetch(`${API_BASE_URL}/admin/comments/${commentId}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });
                    if (!response.ok) throw new Error('Не удалось удалить комментарий');
                    setUserComments(prev => prev.filter((comment) => comment.id !== commentId));
                    setComments(prev => prev.filter((comment) => comment.id !== commentId));
                    const messageData = await response.json();
                    setStatus(messageData.message || 'Комментарий удалён');
                } catch (err) {
                    setStatus(err.message || 'Ошибка удаления комментария');
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    const fetchUserComments = async (targetId) => {
        if (!targetId) return;
        setUserCommentsLoading(true);
        setStatus('');
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${targetId}/comments`, { credentials: 'include' });
            if (!response.ok) {
                throw new Error('Не удалось загрузить комментарии пользователя');
            }
            const data = await response.json();
            setUserComments(Array.isArray(data) ? data : []);
        } catch (err) {
            setStatus(err.message || 'Не удалось получить комментарии');
        } finally {
            setUserCommentsLoading(false);
        }
    };

    const handleDeleteAllComments = async () => {
        if (!selectedArticle) return;
        setConfirmDialog({
            open: true,
            title: 'Удаление всех комментариев',
            message: 'Удалить все комментарии к этой статье?',
            onConfirm: async () => {
                setConfirmDialog(prev => ({ ...prev, open: false }));
                setCommentsLoading(true);
                try {
                    const response = await fetch(`${API_BASE_URL}/admin/articles/${selectedArticle.id}/comments`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });
                    if (!response.ok) throw new Error('Не удалось удалить комментарии');
                    const data = await response.json();
                    setComments([]);
                    setStatus(data.message || 'Комментарии удалены');
                } catch (err) {
                    setStatus(err.message || 'Ошибка удаления комментариев');
                } finally {
                    setCommentsLoading(false);
                }
            }
        });
    };

    return (
        <>
        <Modal disableRestoreFocus open={open} onClose={handleCloseModal}>
            <Box sx={modalStyle}>
                <Typography variant="h5" sx={{ mb: 2, color: 'var(--accent-500)' }}>
                    Админ-панель
                </Typography>

                    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ mb: 2 }}>
                        <FormControl
                            variant="filled"
                            sx={{ flex: 1, backgroundColor: 'var(--surface-soft)' }}
                            size="small"
                        >
                            <InputLabel sx={{ color: 'var(--text-primary)' }}>Пользователь</InputLabel>
                            <Select
                                value={selectedUserId}
                                onChange={(event) => setSelectedUserId(event.target.value)}
                                MenuProps={{ PaperProps: { sx: { bgcolor: 'var(--ui-c23)', color: 'var(--text-primary)' } } }}
                                sx={{
                                    color: 'var(--text-primary)',
                                    '.MuiSelect-select': { color: 'var(--text-primary)' },
                                    '.MuiSelect-icon': { color: 'var(--text-primary)' }
                                }}
                            >
                                {userList.map((user) => (
                                    <MenuItem key={user.userID} value={user.userID} sx={{ color: 'var(--text-primary)', '&.Mui-selected': { backgroundColor: 'var(--ui-c179)' } }}>
                                        {user.userName} {user.role ? `(${user.role})` : ''}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            onClick={fetchUserDetails}
                            disabled={loadingUser || !selectedUserId}
                            sx={{ minWidth: 140 }}
                        >
                            {loadingUser ? <CircularProgress size={20} sx={{ color: 'var(--text-primary)' }} /> : 'Загрузить'}
                        </Button>
                    </Stack>

                {status && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        {status}
                    </Alert>
                )}

                {userData && (
                    <Paper elevation={0} sx={{ ...sectionStyle }}>
                        <Stack spacing={1}>
                            <Typography variant="h6" sx={{ color: "var(--text-primary)" }}>{userData.userName}</Typography>
                            <Typography variant="body2">ID: {userData.userID}</Typography>
                            <Typography variant="body2">Email: {userData.email}</Typography>
                            <Typography variant="body2">Роль: {userData.role}</Typography>
                            <Typography variant="body2">
                                Статус: {userData.isBanned ? 'Заблокирован' : 'Активен'}
                            </Typography>
                            <Typography variant="body2">
                                Подписчики: {userData.followersCount} · Подписки: {userData.followingCount} · Статей: {userData.articlesCount}
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                onClick={handleToggleBan}
                                disabled={actionLoading}
                                sx={{ flex: 1 }}
                            >
                                {actionLoading ? (
                                    <CircularProgress size={20} sx={{ color: 'var(--text-primary)' }} />
                                ) : userData.isBanned ? 'Разбанить' : 'Забанить'}
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleDeleteUser}
                                disabled={actionLoading}
                                sx={{ flex: 1 }}
                            >
                                Удалить пользователя
                            </Button>
                        </Stack>
                    </Paper>
                )}


                <Box sx={{ ...sectionStyle }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" sx={{ color: 'var(--text-primary)' }}>Статьи</Typography>
                        <Button
                            variant="text"
                            onClick={() => userData && fetchUserArticles(userData.userID)}
                            size="small"
                            sx={{ color: 'var(--accent-500)', textTransform: 'none' }}
                        >
                            Обновить
                        </Button>
                    </Stack>

                    {articlesLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <CircularProgress size={24} sx={{ color: 'var(--accent-500)' }} />
                        </Box>
                    ) : articles.length === 0 ? (
                        <Typography sx={{ color: 'var(--text-secondary)', mt: 1 }}>Нет статей.</Typography>
                    ) : (
                        <List sx={{ mt: 1, maxHeight: 220, overflowY: 'auto', ...scrollbarStyle }}>
                            {articles.map((article) => (
                                <ListItem key={article.articleID} sx={{ borderBottom: '1px solid color-mix(in oklab, var(--text-primary) 8%, transparent)' }}>
                                    <ListItemText
                                        primary={article.articleTitle || 'Без названия'}
                                        primaryTypographyProps={{ color: 'var(--text-primary)', sx: { fontWeight: 600 } }}
                                        secondary={
                                            <>
                                                <Typography component="span" sx={{ color: 'var(--text-secondary)' }}>
                                                    {new Date(article.createdDate).toLocaleString()}
                                                </Typography>
                                                {' · '}
                                                <Typography component="span" sx={{ color: 'var(--text-secondary)' }}>
                                                    Лайки: {article.countLikes} · Комментарии: {article.countComments}
                                                </Typography>
                                            </>
                                        }
                                    />
                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleEditArticle(article.articleID)}
                                            sx={{ textTransform: 'none', color: 'var(--accent-500)', borderColor: 'var(--accent-500)' }}
                                        >
                                            Редактировать
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleLoadComments(article.articleID, article.articleTitle)}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            Комментарии
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color="error"
                                            onClick={() => handleDeleteArticle(article.articleID, article.articleTitle)}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            Удалить
                                        </Button>
                                    </Stack>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>

                <Box sx={{ ...sectionStyle }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" sx={{ color: 'var(--text-primary)' }}>Комментарии пользователя</Typography>
                        <Button
                            variant="text"
                            onClick={() => userData && fetchUserComments(userData.userID)}
                            size="small"
                            sx={{ color: 'var(--accent-500)', textTransform: 'none' }}
                            disabled={!userData}
                        >
                            Обновить
                        </Button>
                    </Stack>

                    {userCommentsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <CircularProgress size={24} sx={{ color: 'var(--accent-500)' }} />
                        </Box>
                    ) : userComments.length === 0 ? (
                        <Typography sx={{ color: 'var(--text-secondary)', mt: 1 }}>Нет комментариев.</Typography>
                    ) : (
                        <List sx={{ mt: 1, maxHeight: 220, overflowY: 'auto', ...scrollbarStyle }}>
                            {userComments.map((comment) => (
                                <ListItem key={comment.id} sx={{ borderBottom: '1px solid color-mix(in oklab, var(--text-primary) 8%, transparent)' }}>
                                    <ListItemText
                                        primary={comment.content || 'Комментарий без текста'}
                                        primaryTypographyProps={{ color: 'var(--text-primary)' }}
                                        secondary={
                                            <>
                                                <Typography component="span" sx={{ color: 'var(--text-secondary)', display: 'block' }}>
                                                    {comment.articleTitle || 'Статья без названия'}
                                                </Typography>
                                                <Typography component="span" sx={{ color: 'var(--text-secondary)' }}>
                                                    {(comment.datePublish && new Date(comment.datePublish).toLocaleString()) || '—'} · Лайки: {comment.countLikes}
                                                </Typography>
                                            </>
                                        }
                                    />
                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            size="small"
                                            variant="text"
                                            onClick={() => handleEditComment(comment.id, comment.content)}
                                            sx={{ color: 'var(--accent-500)', textTransform: 'none' }}
                                        >
                                            Редактировать
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="text"
                                            color="error"
                                            disabled={actionLoading}
                                            onClick={() => handleDeleteUserComment(comment.id, comment.content)}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            Удалить
                                        </Button>
                                    </Stack>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>

                {selectedArticle && (
                    <Paper elevation={0} sx={{ ...sectionStyle }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" sx={{ color: "var(--text-primary)" }}>Комментарии к «{selectedArticle.title}»</Typography>
                            <Button
                                variant="text"
                                onClick={handleDeleteAllComments}
                                size="small"
                                disabled={commentsLoading}
                                sx={{ color: 'var(--text-secondary)', textTransform: 'none' }}
                            >
                                Удалить все
                            </Button>
                        </Stack>

                        {commentsLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                <CircularProgress size={24} sx={{ color: 'var(--accent-500)' }} />
                            </Box>
                        ) : comments.length === 0 ? (
                            <Typography sx={{ color: 'var(--text-secondary)', mt: 1 }}>Комментариев нет.</Typography>
                        ) : (
                            <List sx={{ mt: 1, maxHeight: 220, overflowY: 'auto', ...scrollbarStyle }}>
                                {comments.map((comment) => (
                                    <ListItem
                                        key={comment.id}
                                        secondaryAction={
                                            <Stack direction="row" spacing={1}>
                                                <Button
                                                    size="small"
                                                    variant="text"
                                                    onClick={() => handleEditComment(comment.id, comment.content)}
                                                    sx={{ color: 'var(--accent-500)', textTransform: 'none' }}
                                                >
                                                    Редактировать
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="text"
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    sx={{ color: 'var(--text-secondary)', textTransform: 'none' }}
                                                >
                                                    Удалить
                                                </Button>
                                            </Stack>
                                        }
                                        sx={{ alignItems: 'flex-start', borderBottom: '1px solid color-mix(in oklab, var(--text-primary) 8%, transparent)' }}
                                    >
                                        <ListItemText
                                            primary={comment.content}
                                            primaryTypographyProps={{ color: "var(--text-primary)" }}
                                            secondary={
                                                <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                                                    Автор: {comment.authorId} · Опубликовано: {new Date(comment.datePublish).toLocaleString()}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Paper>
                )}
            </Box>
        </Modal>

            <ConfirmationDialog
                open={confirmDialog.open}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
                confirmText="Удалить"
                cancelText="Отмена"
                isLoading={actionLoading || commentsLoading}
            />

            {editingArticle && (
                <EditArticleModal
                    isAdmin={true}
                    open={editArticleModalOpen}
                    handleClose={() => {
                        setEditArticleModalOpen(false);
                        setEditingArticle(null);
                    }}
                    post={editingArticle}
                    onUpdateSuccess={(id, updatedData) => {
                        setArticles(prev => prev.map(a => a.articleID === id ? { ...a, articleTitle: updatedData.title || a.articleTitle } : a));
                        setEditingArticle(null);
                    }}
                />
            )}

            <InputDialog
                open={editCommentDialog.open}
                title="Редактировать комментарий"
                initialValue={editCommentDialog.initialText}
                onCancel={() => setEditCommentDialog({ open: false, commentId: null, initialText: '' })}
                onConfirm={submitEditComment}
            />
        </>
    );
};

export default AdminPanelModal;
