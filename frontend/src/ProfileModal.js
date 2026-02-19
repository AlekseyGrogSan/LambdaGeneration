import React, { useState, useEffect } from 'react'; 
import {
    Box,
    Typography,
    Modal,
    IconButton,
    Button,
    Divider,
    Grid,
    TextField,
    CircularProgress,
    Alert,
    Dialog,         
    DialogTitle,    
    DialogContent,  
    DialogActions   
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save'; 
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DeleteIcon from '@mui/icons-material/Delete'; 
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
    backgroundColor: '#1e1e1e', 
    borderRadius: '16px', 
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.7)',
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
        backgroundColor: '#2c2c2c',
        color: 'white',
        fontSize: '1.1rem', 
        '&:hover': { backgroundColor: '#3a3a3a' },
        '&.Mui-focused': { backgroundColor: '#3a3a3a' }
    },
    '& .MuiInputLabel-root': { color: '#bdbdbd' },
};

const cardContainerStyle = { 
    height: '420px', 
    position: 'relative',
    // ✅ ВОССТАНОВЛЕНО: Стиль для показа оверлея при наведении
    '&:hover .edit-overlay': { opacity: 1 } 
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
            fetchProfileData();
        }
    }, [open, userId]);

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
                            <Box sx={{ width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 2 }}>
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

                        {isMyProfile && (
                            <Box sx={{ mt: 3 }}>
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
                            </Box>
                        )}
                    </Box>

                    <Divider sx={{ backgroundColor: '#333' }} />

                    {/* --- СЕКЦИЯ "О СЕБЕ" --- */}
                    <Box sx={{ p: 4, textAlign: 'center', backgroundColor: '#1e1e1e' }}>
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
                            Публикации ({userPosts.length})
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
                                                        // В своем профиле клик открывает модалку редактирования
                                                        setEditingPost(post); 
                                                    } else {
                                                        // В чужом профиле клик открывает PostDetailPage
                                                        handleClose(); 
                                                        if (onPostClick){
                                                            onPostClick(post);
                                                        }
                                                    }
                                                }}
                                                onLike={() => onLikes(post.article_id, post.isLiked)}
                                            />
                                            
                                            {/* ✅ ВОССТАНОВЛЕНО: Оверлей с кнопкой редактирования при наведении (только для моих постов) */}
                                            {isMyProfile && (
                                                <Box 
                                                    className="edit-overlay"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        backgroundColor: 'rgba(0,0,0,0.6)',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        opacity: 0, // Изначально скрыто
                                                        transition: 'opacity 0.2s',
                                                        borderRadius: '12px',
                                                        zIndex: 2
                                                    }}
                                                >
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<EditIcon />}
                                                        onClick={() => setEditingPost(post)}
                                                        sx={{ bgcolor: '#00bfa5', '&:hover': { bgcolor: '#00897b' } }}
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
        </>
    );
};

export default ProfileModal;