import React, { useState, useEffect } from 'react';
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
        background: '#1a1a1a',
        borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb': {
        background: '#00bfa5',
        borderRadius: '10px',
        border: '2px solid #1a1a1a',
    },
    '&::-webkit-scrollbar-thumb:hover': {
        background: '#009e8a',
    },
    scrollbarWidth: 'thin',
    scrollbarColor: '#00bfa5 #1a1a1a',
};

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95%', sm: 800 },
    maxHeight: '90vh',
    bgcolor: '#181818',
    borderRadius: '18px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
    px: 4,
    py: 3,
    color: 'white',
    overflowY: 'auto',
    ...scrollbarStyle,
};

const sectionStyle = {
    mt: 3,
    p: 2.5,
    borderRadius: '14px',
    bgcolor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#fff'
};

const AdminPanelModal = ({ open, handleClose }) => {
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
        if (!window.confirm('Вы действительно хотите удалить этого пользователя?')) return;
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
    };

    const handleDeleteArticle = async (articleId, articleTitle) => {
        if (!window.confirm(`Удалить статью "${articleTitle}"?`)) return;
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
        if (!window.confirm('Удалить этот комментарий?')) return;
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
    };

    const handleDeleteUserComment = async (commentId, commentSnippet) => {
        if (!window.confirm(`Удалить комментарий: "${commentSnippet?.slice(0, 80) || '...'}"?`)) return;
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
        if (!window.confirm('Удалить все комментарии к этой статье?')) return;
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
    };

    return (
        <Modal open={open} onClose={handleCloseModal}>
            <Box sx={modalStyle}>
                <Typography variant="h5" sx={{ mb: 2, color: '#00bfa5' }}>
                    Админ-панель
                </Typography>

                    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ mb: 2 }}>
                        <FormControl
                            variant="filled"
                            sx={{ flex: 1, backgroundColor: '#222' }}
                            size="small"
                        >
                            <InputLabel sx={{ color: '#fff' }}>Пользователь</InputLabel>
                            <Select
                                value={selectedUserId}
                                onChange={(event) => setSelectedUserId(event.target.value)}
                                MenuProps={{ PaperProps: { sx: { bgcolor: '#181818' } } }}
                                sx={{
                                    color: '#fff',
                                    '.MuiSelect-icon': { color: '#fff' }
                                }}
                            >
                                {userList.map((user) => (
                                    <MenuItem key={user.userID} value={user.userID}>
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
                            {loadingUser ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Загрузить'}
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
                            <Typography variant="h6" sx={{ color: "#fff" }}>{userData.userName}</Typography>
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
                                    <CircularProgress size={20} sx={{ color: '#fff' }} />
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
                        <Typography variant="h6" sx={{ color: '#fff' }}>Статьи</Typography>
                        <Button
                            variant="text"
                            onClick={() => userData && fetchUserArticles(userData.userID)}
                            size="small"
                            sx={{ color: '#00bfa5', textTransform: 'none' }}
                        >
                            Обновить
                        </Button>
                    </Stack>

                    {articlesLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <CircularProgress size={24} sx={{ color: '#00bfa5' }} />
                        </Box>
                    ) : articles.length === 0 ? (
                        <Typography sx={{ color: '#bbb', mt: 1 }}>Нет статей.</Typography>
                    ) : (
                        <List sx={{ mt: 1, maxHeight: 220, overflowY: 'auto', ...scrollbarStyle }}>
                            {articles.map((article) => (
                                <ListItem key={article.articleID} sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                    <ListItemText
                                        primary={article.articleTitle || 'Без названия'}
                                        primaryTypographyProps={{ color: '#fff', sx: { fontWeight: 600 } }}
                                        secondary={
                                            <>
                                                <Typography component="span" sx={{ color: '#aaa' }}>
                                                    {new Date(article.createdDate).toLocaleString()}
                                                </Typography>
                                                {' · '}
                                                <Typography component="span" sx={{ color: '#aaa' }}>
                                                    Лайки: {article.countLikes} · Комментарии: {article.countComments}
                                                </Typography>
                                            </>
                                        }
                                    />
                                    <Stack direction="row" spacing={1}>
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
                        <Typography variant="h6" sx={{ color: '#fff' }}>Комментарии пользователя</Typography>
                        <Button
                            variant="text"
                            onClick={() => userData && fetchUserComments(userData.userID)}
                            size="small"
                            sx={{ color: '#00bfa5', textTransform: 'none' }}
                            disabled={!userData}
                        >
                            Обновить
                        </Button>
                    </Stack>

                    {userCommentsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <CircularProgress size={24} sx={{ color: '#00bfa5' }} />
                        </Box>
                    ) : userComments.length === 0 ? (
                        <Typography sx={{ color: '#bbb', mt: 1 }}>Нет комментариев.</Typography>
                    ) : (
                        <List sx={{ mt: 1, maxHeight: 220, overflowY: 'auto', ...scrollbarStyle }}>
                            {userComments.map((comment) => (
                                <ListItem key={comment.id} sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                    <ListItemText
                                        primary={comment.content || 'Комментарий без текста'}
                                        primaryTypographyProps={{ color: '#fff' }}
                                        secondary={
                                            <>
                                                <Typography component="span" sx={{ color: '#aaa', display: 'block' }}>
                                                    {comment.articleTitle || 'Статья без названия'}
                                                </Typography>
                                                <Typography component="span" sx={{ color: '#aaa' }}>
                                                    {(comment.datePublish && new Date(comment.datePublish).toLocaleString()) || '—'} · Лайки: {comment.countLikes}
                                                </Typography>
                                            </>
                                        }
                                    />
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
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>

                {selectedArticle && (
                    <Paper elevation={0} sx={{ ...sectionStyle }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" sx={{ color: "#fff" }}>Комментарии к «{selectedArticle.title}»</Typography>
                            <Button
                                variant="text"
                                onClick={handleDeleteAllComments}
                                size="small"
                                disabled={commentsLoading}
                                sx={{ color: '#ff8a80', textTransform: 'none' }}
                            >
                                Удалить все
                            </Button>
                        </Stack>

                        {commentsLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                <CircularProgress size={24} sx={{ color: '#00bfa5' }} />
                            </Box>
                        ) : comments.length === 0 ? (
                            <Typography sx={{ color: '#bbb', mt: 1 }}>Комментариев нет.</Typography>
                        ) : (
                            <List sx={{ mt: 1, maxHeight: 220, overflowY: 'auto', ...scrollbarStyle }}>
                                {comments.map((comment) => (
                                    <ListItem
                                        key={comment.id}
                                        secondaryAction={
                                            <Button
                                                size="small"
                                                variant="text"
                                                onClick={() => handleDeleteComment(comment.id)}
                                                sx={{ color: '#ff8a80', textTransform: 'none' }}
                                            >
                                                Удалить
                                            </Button>
                                        }
                                        sx={{ alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
                                    >
                                        <ListItemText
                                            primary={comment.content}
                                            primaryTypographyProps={{ color: "#fff" }}
                                            secondary={
                                                <Typography variant="caption" sx={{ color: '#aaa' }}>
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
    );
};

export default AdminPanelModal;
