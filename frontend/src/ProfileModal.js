import React, { useState, useEffect } from 'react'; 
import {
    Box,
    Typography,
    Modal,
    IconButton,
    Button,
    ButtonBase,
    Divider,
    Grid,
    TextField,
    CircularProgress,
    Alert,
    Dialog,         
    DialogTitle,    
    DialogContent,  
    DialogActions,
    List,
    ListItem,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save'; 
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DeleteIcon from '@mui/icons-material/Delete'; 
import VisibilityIcon from '@mui/icons-material/Visibility';
import PostCard from './PostCard'; 
import EditArticleModal from './EditArticleModal'; 

const API_BASE_URL = 'http://localhost:5113/api';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95%', sm: 1000, md: 1200 }, 
    maxHeight: '90vh', 
    backgroundColor: 'rgba(22, 22, 22, 0.97)', 
    borderRadius: '16px', 
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.65)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    padding: '0', 
    color: 'white',
    overflowY: 'auto',
    
    '&::-webkit-scrollbar': {
        width: '8px',
    },
    '&::-webkit-scrollbar-track': {
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb': {
        background: '#00bfa5',
        borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
        background: '#009688',
    },
};

const inputStyle = {
    '& .MuiFilledInput-root': {
        backgroundColor: 'rgba(44, 44, 44, 0.85)',
        color: 'white',
        fontSize: '1.1rem', 
        borderRadius: '12px',
        boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
        '&:hover': { backgroundColor: 'rgba(58, 58, 58, 0.9)' },
        '&.Mui-focused': { backgroundColor: 'rgba(58, 58, 58, 0.9)' }
    },
    '& .MuiInputLabel-root': { color: '#bdbdbd' },
};

const cardContainerStyle = { 
    height: '420px', 
    position: 'relative',
    // ✅ ВОССТАНОВЛЕНО: Стиль для показа оверлея при наведении
    '&:hover .actions-overlay': { opacity: 1 } 
};

const sectionStyle = {
    p: 4,
    backgroundColor: 'rgba(30, 30, 30, 0.78)',
    borderRadius: '20px',
    boxShadow: '0 14px 30px rgba(0, 0, 0, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.05)'
};

const statCardStyle = {
    width: '100%',
    textAlign: 'center',
    padding: '16px 18px',
    borderRadius: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    boxShadow: '0 10px 24px rgba(0, 0, 0, 0.35)',
    boxSizing: 'border-box',
    transition: 'transform 0.2s, box-shadow 0.2s, background-color 0.2s'
};

const glassButtonStyle = {
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
    textTransform: 'none',
    whiteSpace: 'nowrap'
};

const getAuthHeaders = () => {
    return { 
        'Content-Type': 'application/json', 
    };
};

const ProfileModal = ({ open, handleClose, userId, onUnauthorized, onLogout, onPostClick, onLikes, openProfile }) => {
    const isMyProfile = userId === null; 
    const [profileData, setProfileData] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editData, setEditData] = useState({ name: '', email: '', aboutUser: '' });
    
    const [editingPost, setEditingPost] = useState(null); 
    
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [deleteConfirmData, setDeleteConfirmData] = useState({ email: '', password: '' });
    const [isDeletingUser, setIsDeletingUser] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    
    const [isFollowingListOpen, setIsFollowingListOpen] = useState(false);
    const [followingList, setFollowingList] = useState([]);
    const [isFollowingListLoading, setIsFollowingListLoading] = useState(false);
    const [followingListError, setFollowingListError] = useState(null);
    const [isFollowingUser, setIsFollowingUser] = useState(false);
    const [isFollowBusy, setIsFollowBusy] = useState(false);
    
    const [error, setError] = useState(null);

    // --- FETCHING LOGIC ---

    const fetchProfileData = async () => {
        if (!open) return;
        setIsLoading(true);
        setError(null);
        try {
            let profileEndpoint = '';
            let postsEndpoint = '';
            const fetchOptions = { credentials: 'include' };
            
            if (isMyProfile) {
                profileEndpoint = `${API_BASE_URL}/Users/MyProfile`; 
                postsEndpoint = `${API_BASE_URL}/Articles/getAllMyArticles`; 
            } else {
                profileEndpoint = `${API_BASE_URL}/Users/UserProfile/${userId}`;
                postsEndpoint = `${API_BASE_URL}/Articles/getAllOtherAuthor/${userId}`; 
            }

            // 1. Профиль
            const profileResponse = await fetch(profileEndpoint, fetchOptions);
            
            if (profileResponse.status === 401 || profileResponse.status === 403) {
                 if (isMyProfile) {
                     handleClose();
                     if (onUnauthorized) onUnauthorized();
                     throw new Error('Сессия истекла.');
                 }
            }
            if (!profileResponse.ok) throw new Error(`Ошибка загрузки профиля: ${profileResponse.status}`);
            
            const profileJson = await profileResponse.json();
            setProfileData(profileJson);
            
            setEditData({ 
                name: profileJson.name, 
                email: isMyProfile ? profileJson.email : '',
                aboutUser: profileJson.aboutUser || '' 
            });

            // 2. Посты
            const postsResponse = await fetch(postsEndpoint, fetchOptions);
            if (!postsResponse.ok) {
                setUserPosts([]); 
                return;
            }
            
            const postsJson = await postsResponse.json(); 
            const formattedPosts = (postsJson.articles || []).map(article => ({
                id: article.article_id,           // Используется для ключей React
                article_id: article.article_id,   // ВАЖНО: Используется для API лайков в PostPage
                author_id: article.author_id,
                authorId: article.author_id,
                nickname: profileJson.name || 'Автор', 
                title: article.article_title,
                article_preview: article.article_preview, 
                article_content: article.article_content, 
                likesCount: article.countLikes || 0,
                commentsCount: article.comments_count || 0,
                isLiked: article.is_liked || false,
                tags: article.article_tags || [],
            }));
            setUserPosts(formattedPosts);

        } catch (err) {
            if (err.message.includes("Сессия истекла")) return; 
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            setIsEditingProfile(false); 
            setIsFollowingListOpen(false);
            setFollowingListError(null);
            setIsFollowingListLoading(false);
            setIsFollowingUser(false);
            fetchProfileData();
        }
    }, [open, userId]);

    useEffect(() => {
        const loadFollowingForStatus = async () => {
            if (!open || isMyProfile) return;
            try {
                const response = await fetch(`${API_BASE_URL}/Users/following`, { credentials: 'include' });
                if (response.status === 401 || response.status === 403) return;
                if (!response.ok) return;
                const following = await response.json();
                setFollowingList(following);
                setIsFollowingUser(Array.isArray(following) && following.some(u => u.id === userId));
            } catch {
                // ignore follow status errors
            }
        };
        loadFollowingForStatus();
    }, [open, userId, isMyProfile]);

    // --- PROFILE UPDATE LOGIC (опущен для краткости) ---
    const handleSaveProfile = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const requestBody = {
                name: editData.name,
                email: editData.email,
                aboutUser: editData.aboutUser
            }; 

            const response = await fetch(`${API_BASE_URL}/Users`, {
                method: 'PUT', 
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(requestBody)
            });
            
            if (response.status === 401 || response.status === 403) {
                 handleClose(); 
                 if (onUnauthorized) onUnauthorized();
                 throw new Error('Сессия истекла.');
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Не удалось обновить профиль.');
            }

            const updatedProfile = await response.json(); 
            setProfileData(updatedProfile);
            setEditData({ 
                name: updatedProfile.name, 
                email: updatedProfile.email, 
                aboutUser: updatedProfile.aboutUser || '' 
            });
            setIsEditingProfile(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- ARTICLE HANDLERS (опущен для краткости) ---
    
    const handleArticleUpdateSuccess = (articleId, updatedData) => {
        setUserPosts(prevPosts => 
            prevPosts.map(post => {
                if (post.id === articleId) {
                    return { 
                        ...post, 
                        title: updatedData.article_title || updatedData.articleTitle || post.title,
                        article_preview: updatedData.article_preview || updatedData.articlePreview || post.article_preview,
                        article_content: updatedData.article_content || updatedData.articleContent || post.article_content,
                        tags: updatedData.article_tags || updatedData.articleTags || post.tags
                    };
                }
                return post;
            })
        );
    };
    
    const handleArticleDeleteSuccess = (articleId) => {
        setUserPosts(prevPosts => prevPosts.filter(post => post.id !== articleId));
        setEditingPost(null); 
    };

    const normalizeCount = (value) => {
        if (Array.isArray(value)) return value.length;
        if (typeof value === 'number') return value;
        if (value === null || value === undefined) return 0;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    };

    const subscribersCount = normalizeCount(profileData?.subscribersCount ?? profileData?.followersCount ?? profileData?.countSubscribers ?? profileData?.followers);
    const followingCount = normalizeCount(profileData?.followingCount ?? profileData?.countFollowing ?? profileData?.following);
    const articlesCount = normalizeCount(profileData?.articlesCount ?? profileData?.countArticles ?? userPosts.length);

    const handleOpenFollowingList = async () => {
        if (!isMyProfile) return;
        setIsFollowingListOpen(true);
        if (followingList.length > 0) return;
        setIsFollowingListLoading(true);
        setFollowingListError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/Users/following`, { credentials: 'include' });
            if (response.status === 401 || response.status === 403) {
                if (onUnauthorized) onUnauthorized();
                throw new Error('Необходимо войти в аккаунт.');
            }
            if (!response.ok) throw new Error('Не удалось загрузить подписки.');
            const data = await response.json();
            setFollowingList(Array.isArray(data) ? data : []);
        } catch (err) {
            setFollowingListError(err.message || 'Ошибка загрузки подписок.');
        } finally {
            setIsFollowingListLoading(false);
        }
    };

    const handleCloseFollowingList = () => setIsFollowingListOpen(false);

    const handleToggleFollow = async () => {
        if (isMyProfile || !userId) return;
        setIsFollowBusy(true);
        try {
            const endpoint = isFollowingUser 
                ? `${API_BASE_URL}/Users/unsubscribe/${userId}` 
                : `${API_BASE_URL}/Users/subscribe/${userId}`;
            const response = await fetch(endpoint, { 
                method: isFollowingUser ? 'DELETE' : 'POST', 
                credentials: 'include'
            });
            if (response.status === 401 || response.status === 403) {
                if (onUnauthorized) onUnauthorized();
                throw new Error('Необходимо войти в аккаунт.');
            }
            if (!response.ok) throw new Error('Не удалось изменить подписку.');

            const delta = isFollowingUser ? -1 : 1;
            setIsFollowingUser(!isFollowingUser);
            setProfileData(prev => {
                if (!prev) return prev;
                const current = normalizeCount(prev.subscribersCount ?? prev.followersCount);
                const next = Math.max(0, current + delta);
                return { 
                    ...prev, 
                    subscribersCount: next,
                    followersCount: next
                };
            });
        } catch (err) {
            setError(err.message || 'Не удалось изменить подписку.');
        } finally {
            setIsFollowBusy(false);
        }
    };

    // --- USER DELETE LOGIC (опущен для краткости) ---
    
    const handleDeleteUserOpen = () => {
        if (!isMyProfile) return;
        setIsDeleteConfirmOpen(true);
        setDeleteError(null);
        setDeleteConfirmData({ email: profileData?.email || '', password: '' }); 
    }
    const handleDeleteUserClose = () => setIsDeleteConfirmOpen(false);

    const handleConfirmDeleteUser = async () => {
        if (!profileData || deleteConfirmData.email !== profileData.email) {
            setDeleteError('Email не совпадает с вашим текущим email.');
            return;
        }
        
        setIsDeletingUser(true);
        setDeleteError(null);

        try {
            const requestBody = {
                email: deleteConfirmData.email,
                password: deleteConfirmData.password 
            };
            
            const response = await fetch(`${API_BASE_URL}/Users`, {
                method: 'DELETE', 
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(requestBody)
            });

            if (response.status === 401 || response.status === 403) {
                 throw new Error('Неверный пароль или сессия истекла. Попробуйте войти снова.');
            }

            if (!response.ok) {
                const errorText = await response.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    throw new Error(errorJson.message || errorJson.error || 'Не удалось удалить аккаунт.');
                } catch {
                    throw new Error(errorText || 'Не удалось удалить аккаунт.');
                }
            }
            
            handleDeleteUserClose();
            handleClose(); 
            if (onLogout) onLogout(); 

        } catch (err) {
            setDeleteError(err.message);
        } finally {
            setIsDeletingUser(false);
        }
    };
    
    if (!profileData && isLoading) return null; 
    if (!profileData) return null;


    return (
        <>
            <Modal open={open} onClose={handleClose}>
                <Box sx={modalStyle}>
                    
                    <IconButton
                        onClick={handleClose}
                        sx={{ position: 'absolute', top: 15, right: 15, color: '#bdbdbd', zIndex: 5 }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {/* --- ВЕРХНЯЯ ЧАСТЬ ПРОФИЛЯ (ИМЯ/EMAIL/ДАТА) --- */}
                    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(180deg, #252525 0%, #1e1e1e 100%)' }}>
                        
                        <AccountCircleIcon sx={{ fontSize: 100, color: '#00bfa5', mb: 2 }} />

                        {/* ✅ ВОССТАНОВЛЕНО: Отображение имени и email (если не редактируется) */}
                        {isMyProfile && isEditingProfile ? (
                            <Box sx={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 2, p: 2, borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.04)', boxShadow: '0 10px 24px rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <TextField
                                    label="Имя пользователя"
                                    value={editData.name}
                                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                                    fullWidth
                                    variant="filled"
                                    sx={inputStyle}
                                />
                                <TextField
                                    label="Email"
                                    value={editData.email}
                                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                                    fullWidth
                                    variant="filled"
                                    sx={inputStyle}
                                />
                            </Box>
                        ) : (
                            <>
                                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5 }}>
                                    {profileData.name}
                                </Typography>
                                {isMyProfile && (
                                    <Typography variant="h6" sx={{ color: '#00bfa5', mb: 1 }}>
                                        {profileData.email}
                                    </Typography>
                                )}
                            </>
                        )}

                        <Typography variant="body1" sx={{ color: '#757575', mt: 1 }}>
                            На сайте с {new Date(profileData.createDate).toLocaleDateString()}
                        </Typography>

                        <Box sx={{ mt: 3, width: '100%', maxWidth: 720, mx: 'auto' }}>
                            <Grid container spacing={2} justifyContent="center">
                                <Grid item xs={12} sm={4}>
                                    <ButtonBase
                                        onClick={isMyProfile ? handleOpenFollowingList : undefined}
                                        sx={{
                                            ...statCardStyle,
                                            display: 'block',
                                            cursor: isMyProfile ? 'pointer' : 'default',
                                            '&:hover': isMyProfile ? { 
                                                transform: 'translateY(-2px)', 
                                                boxShadow: '0 14px 30px rgba(0,0,0,0.45)',
                                                backgroundColor: 'rgba(0, 191, 165, 0.12)'
                                            } : undefined
                                        }}
                                    >
                                        <Stack spacing={0.5}>
                                            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                                {followingCount}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#bdbdbd', letterSpacing: 0.3 }}>
                                                Подписки
                                            </Typography>
                                        </Stack>
                                    </ButtonBase>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Box sx={statCardStyle}>
                                        <Stack spacing={0.5}>
                                            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                                {subscribersCount}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#bdbdbd', letterSpacing: 0.3 }}>
                                                Подписчики
                                            </Typography>
                                        </Stack>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Box sx={statCardStyle}>
                                        <Stack spacing={0.5}>
                                            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                                {articlesCount}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#bdbdbd', letterSpacing: 0.3 }}>
                                                Статьи
                                            </Typography>
                                        </Stack>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>

                        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {isMyProfile ? (
                                <>
                                    {isEditingProfile ? (
                                        <Button
                                            startIcon={<SaveIcon />}
                                            onClick={handleSaveProfile}
                                            variant="contained"
                                            size="large"
                                            sx={{ bgcolor: '#00bfa5', '&:hover': { bgcolor: '#00897b' } }}
                                        >
                                            Сохранить изменения
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outlined"
                                            startIcon={<EditIcon />}
                                            onClick={() => setIsEditingProfile(true)}
                                            sx={{
                                                color: '#00bfa5',
                                                borderColor: '#00bfa5',
                                                fontSize: '1rem',
                                                padding: '6px 20px',
                                                '&:hover': { borderColor: '#00a38f', backgroundColor: 'rgba(0, 191, 165, 0.1)' }
                                            }}
                                        >
                                            Редактировать профиль
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <Button
                                    variant={isFollowingUser ? 'outlined' : 'contained'}
                                    onClick={handleToggleFollow}
                                    disabled={isFollowBusy}
                                    sx={{
                                        bgcolor: isFollowingUser ? 'transparent' : '#00bfa5',
                                        color: isFollowingUser ? '#00bfa5' : '#101010',
                                        borderColor: '#00bfa5',
                                        '&:hover': { 
                                            bgcolor: isFollowingUser ? 'rgba(0, 191, 165, 0.1)' : '#00897b',
                                            borderColor: '#00a38f'
                                        }
                                    }}
                                >
                                    {isFollowingUser ? 'Отписаться' : 'Подписаться'}
                                </Button>
                            )}
                        </Box>
                    </Box>

                    <Divider sx={{ backgroundColor: '#333' }} />

                    {/* --- СЕКЦИЯ "О СЕБЕ" --- */}
                    <Box sx={{ ...sectionStyle, m: 3, textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ color: '#bdbdbd', fontWeight: 'bold', mb: 2 }}>
                            О себе
                        </Typography>
                        
                        {isMyProfile && isEditingProfile ? (
                            <TextField
                                label="Расскажите о себе"
                                value={editData.aboutUser}
                                onChange={(e) => setEditData({...editData, aboutUser: e.target.value})}
                                fullWidth
                                multiline
                                rows={4}
                                variant="filled"
                                sx={{ maxWidth: 800, margin: '0 auto', ...inputStyle }}
                            />
                        ) : (
                            // ✅ ИСПРАВЛЕНО: Теперь здесь только один компонент
                            <Typography variant="h6" sx={{ color: 'white', lineHeight: 1.6, maxWidth: 800, margin: '0 auto', fontWeight: 300 }}>
                                {profileData.aboutUser || (isMyProfile ? 'Добавьте информацию о себе, чтобы другие пользователи узнали вас лучше.' : 'Пользователь не добавил описание.')}
                            </Typography>
                        )}
                    </Box>

                    <Divider sx={{ backgroundColor: '#333' }} />
                    
                    {/* --- ПУБЛИКАЦИИ --- */}
                    <Box sx={{ p: 4 }}>
                        <Typography variant="h4" sx={{ mb: 3, color: '#00bfa5', fontWeight: 'bold' }}>
                            Публикации ({articlesCount})
                        </Typography>

                        <Grid container spacing={3}>
                            {userPosts.length > 0 ? (
                                userPosts.map((post) => (
                                    <Grid item xs={12} sm={6} lg={4} key={post.id}>
                                        <Box sx={cardContainerStyle}>
                                            <PostCard
                                                {...post}
                                                sx = {{ height: '100%' }}
                                                authorId={post.author_id} 
                                                onClick={() => {
                                                    if (isMyProfile) {
                                                        handleClose();
                                                        if (onPostClick){
                                                            onPostClick(post, { returnToProfile: true, profileUserId: null });
                                                        }
                                                    } else {
                                                        handleClose(); 
                                                        if (onPostClick){
                                                            onPostClick(post, { returnToProfile: true, profileUserId: userId });
                                                        }
                                                    }
                                                }}
                                                onLike={() => onLikes(post.article_id, post.isLiked)}
                                            />
                                            
                                            {/* ✅ ВОССТАНОВЛЕНО: Оверлей с кнопками (только для моих постов) */}
                                            {isMyProfile && (
                                                <Box 
                                                    className="actions-overlay"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        backgroundColor: 'rgba(0,0,0,0.6)',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        gap: 2,
                                                        opacity: 0, // Изначально скрыто
                                                        transition: 'opacity 0.2s',
                                                        borderRadius: '12px',
                                                        zIndex: 2
                                                    }}
                                                >
                                                    <Button
                                                        variant="outlined"
                                                        startIcon={<VisibilityIcon />}
                                                        fullWidth
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleClose();
                                                            if (onPostClick){
                                                                onPostClick(post, { returnToProfile: true, profileUserId: null });
                                                            }
                                                        }}
                                                        sx={{ 
                                                            ...glassButtonStyle,
                                                            color: 'white',
                                                            borderColor: 'rgba(255,255,255,0.6)',
                                                            maxWidth: 220,
                                                            '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.18)' } 
                                                        }}
                                                    >
                                                        Просмотреть
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<EditIcon />}
                                                        fullWidth
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingPost(post);
                                                        }}
                                                        sx={{ 
                                                            ...glassButtonStyle,
                                                            maxWidth: 220,
                                                            bgcolor: 'rgba(0, 191, 165, 0.35)',
                                                            color: 'white',
                                                            borderColor: 'rgba(0, 191, 165, 0.5)',
                                                            '&:hover': { bgcolor: 'rgba(0, 151, 136, 0.45)' } 
                                                        }}
                                                    >
                                                        Редактировать
                                                    </Button>
                                                </Box>
                                            )}
                                        </Box>
                                    </Grid>
                                ))
                            ) : (
                                <Box sx={{ p: 2, color: '#777', width: '100%', textAlign: 'center' }}>
                                    <Typography variant="h6">Статей пока нет.</Typography>
                                </Box>
                            )}
                        </Grid>
                    </Box>


                    {/* --- КНОПКИ УПРАВЛЕНИЯ АККАУНТОМ --- */}
                    {isMyProfile && (
                        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', gap: 3, borderTop: '1px solid #333' }}>
                            <Button
                                variant="text"
                                startIcon={<LogoutIcon />}
                                onClick={onLogout} 
                                sx={{
                                    color: '#ff5252',
                                    fontSize: '1.1rem',
                                    '&:hover': { backgroundColor: 'rgba(255, 82, 82, 0.1)' }
                                }}
                            >
                                Выйти из аккаунта
                            </Button>
                            
                            <Button
                                variant="outlined"
                                startIcon={<DeleteIcon />}
                                onClick={handleDeleteUserOpen} 
                                sx={{
                                    color: '#ff5252',
                                    borderColor: '#ff5252',
                                    fontSize: '1.1rem',
                                    '&:hover': { 
                                        backgroundColor: 'rgba(255, 82, 82, 0.1)',
                                        borderColor: '#ff5252' 
                                    }
                                }}
                            >
                                Удалить аккаунт
                            </Button>
                        </Box>
                    )}
                </Box>
            </Modal>

            {/* --- МОДАЛЬНОЕ ОКНО ДЛЯ РЕДАКТИРОВАНИЯ СТАТЬИ --- */}
            <EditArticleModal 
                open={!!editingPost}
                handleClose={() => setEditingPost(null)}
                post={editingPost}
                onUpdateSuccess={handleArticleUpdateSuccess}
                onDeleteSuccess={handleArticleDeleteSuccess} 
            />
            
            {/* --- МОДАЛЬНОЕ ОКНО ДЛЯ УДАЛЕНИЯ ПОЛЬЗОВАТЕЛЯ --- */}
            <Dialog 
                open={isDeleteConfirmOpen} 
                onClose={handleDeleteUserClose}
                PaperProps={{ sx: { backgroundColor: '#1e1e1e', color: 'white', borderRadius: '12px' } }}
            >
                <DialogTitle sx={{ color: '#ff5252', fontWeight: 'bold' }}>
                    Подтвердите удаление аккаунта
                </DialogTitle>
                <DialogContent>
                    {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
                    <Typography sx={{ color: '#bdbdbd', mb: 2 }}>
                        Это действие **необратимо**. Все ваши публикации и данные будут удалены. 
                        Для подтверждения введите ваш Email и Пароль.
                    </Typography>
                    
                    <TextField
                        label="Ваш Email"
                        type="email"
                        fullWidth
                        margin="normal"
                        value={deleteConfirmData.email}
                        onChange={(e) => setDeleteConfirmData({...deleteConfirmData, email: e.target.value})}
                        variant="filled"
                        sx={inputStyle}
                        InputProps={{ readOnly: true }} 
                    />
                    <TextField
                        label="Ваш Пароль"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={deleteConfirmData.password}
                        onChange={(e) => setDeleteConfirmData({...deleteConfirmData, password: e.target.value})}
                        variant="filled"
                        sx={inputStyle}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleDeleteUserClose} sx={{ color: '#00bfa5' }}>
                        Отмена
                    </Button>
                    <Button 
                        onClick={handleConfirmDeleteUser} 
                        color="error"
                        variant="contained"
                        disabled={isDeletingUser || deleteConfirmData.email !== profileData?.email || deleteConfirmData.password.length === 0}
                    >
                        {isDeletingUser ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Удалить аккаунт'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={isFollowingListOpen}
                onClose={handleCloseFollowingList}
                PaperProps={{ sx: { backgroundColor: '#1b1b1b', color: 'white', borderRadius: '12px', minWidth: { xs: '90vw', sm: 520 } } }}
            >
                <DialogTitle sx={{ color: '#00bfa5', fontWeight: 'bold' }}>
                    Мои подписки
                </DialogTitle>
                <DialogContent>
                    {isFollowingListLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress size={28} sx={{ color: '#00bfa5' }} />
                        </Box>
                    )}
                    {followingListError && <Alert severity="error" sx={{ mb: 2 }}>{followingListError}</Alert>}
                    {!isFollowingListLoading && followingList.length === 0 && !followingListError && (
                        <Typography sx={{ color: '#bdbdbd', textAlign: 'center', py: 2 }}>
                            У вас пока нет подписок.
                        </Typography>
                    )}
                    {!isFollowingListLoading && followingList.length > 0 && (
                        <List sx={{ width: '100%' }}>
                            {followingList.map((user) => (
                                <ListItem key={user.id} disablePadding>
                                    <ListItemButton
                                        onClick={() => {
                                            handleCloseFollowingList();
                                            if (openProfile) {
                                                openProfile(user.id, {
                                                    returnToProfile: true,
                                                    returnProfileUserId: isMyProfile ? null : userId,
                                                });
                                            }
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: '#00bfa5' }}>
                                                {user.name?.[0]?.toUpperCase() || 'U'}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={user.name || 'Пользователь'}
                                            secondary={
                                                <span style={{ color: '#9e9e9e' }}>
                                                    Подписчики: {user.followersCount ?? 0} · Подписки: {user.followingCount ?? 0} · Статьи: {user.articlesCount ?? 0}
                                                </span>
                                            }
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseFollowingList} sx={{ color: '#00bfa5' }}>
                        Закрыть
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ProfileModal;
