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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save'; 
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PostCard from './PostCard'; 
import EditArticleModal from './EditArticleModal'; // [NEW] Импорт нового компонента

const API_BASE_URL = 'http://localhost:5113/api';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95%', sm: 1000, md: 1200 }, 
    maxHeight: '90vh', 
    backgroundColor: '#1e1e1e', 
    border: '1px solid #333',
    borderRadius: '16px', // Более скругленные углы
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.7)',
    padding: '0', // Паддинг убран, чтобы скролл был красивым по краям
    color: 'white',
    overflowY: 'auto',
    
    // [FIX] Красивый скроллбар как в PostCreationModal
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
        fontSize: '1.1rem', // Увеличенный шрифт ввода
        '&:hover': { backgroundColor: '#3a3a3a' },
        '&.Mui-focused': { backgroundColor: '#3a3a3a' }
    },
    '& .MuiInputLabel-root': { color: '#bdbdbd' },
};

const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken'); 
    return { 
        'Content-Type': 'application/json', 
        ...(token && { 'Authorization': `Bearer ${token}` }) 
    };
};

const ProfileModal = ({ open, handleClose, userId, onUnauthorized, onLogout, onPostClick }) => {
    const isMyProfile = userId === null; 
    const [profileData, setProfileData] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Редактирование профиля
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editData, setEditData] = useState({ name: '', email: '', aboutUser: '' });
    
    // Редактирование статьи (Модальное окно)
    const [editingPost, setEditingPost] = useState(null); // Объект статьи для редактирования
    
    const [error, setError] = useState(null);

    const fetchProfileData = async () => {
        if (!open) return;
        setIsLoading(true);
        setError(null);
        try {
            let profileEndpoint = '';
            let postsEndpoint = '';
            const headers = getAuthHeaders(); 
            const fetchOptions = { headers, credentials: 'include' };
            
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
                id: article.article_id,
                authorId: article.author_id,
                nickname: profileJson.name || 'Автор', 
                title: article.article_title,
                article_preview: article.article_preview, 
                article_content: article.article_content, 
                likesCount: article.likes_count || 0,
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

    // [FIX] Исправленный метод сохранения профиля
    const handleSaveProfile = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const requestBody = {
                name: editData.name,
                email: editData.email,
                aboutUser: editData.aboutUser
            }; 

            // [FIX] URL изменен на /Users (без /update), Метод изменен на PUT
            const response = await fetch(`${API_BASE_URL}/Users`, {
                method: 'PUT', 
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(requestBody)
            });
            
            if (response.status === 401 || response.status === 403) {
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

    // Callback после успешного обновления статьи из модального окна
    const handleArticleUpdateSuccess = (articleId, updatedData) => {
        setUserPosts(prevPosts => 
            prevPosts.map(post => 
                post.id === articleId ? { 
                    ...post, 
                    title: updatedData.article_title || updatedData.articleTitle,
                    article_preview: updatedData.article_preview || updatedData.articlePreview,
                    article_content: updatedData.article_content || updatedData.articleContent,
                    tags: updatedData.article_tags || updatedData.articleTags
                } : post
            )
        );
    };

    if (!profileData && isLoading) return null; // Или лоадер
    if (!profileData) return null;

    // [FIX] Фиксированная высота для карточек в сетке
    const cardContainerStyle = { 
        height: '420px', // Единая высота для всех карточек
        position: 'relative',
        '&:hover .edit-overlay': { opacity: 1 } // Показываем кнопку редактирования при наведении
    };

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

                    {/* --- ВЕРХНЯЯ ЧАСТЬ ПРОФИЛЯ --- */}
                    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(180deg, #252525 0%, #1e1e1e 100%)' }}>
                        
                        <AccountCircleIcon sx={{ fontSize: 100, color: '#00bfa5', mb: 2 }} />

                        {/* Редактирование Имени и Email */}
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
                            // [FIX] Увеличенные шрифты
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

                        {/* Кнопки управления профилем */}
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
                            // [FIX] Увеличенный шрифт описания
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
                                                // [FIX] Передаем стиль для карточки, чтобы она занимала 100% высоты контейнера
                                                sx={{ height: '100%' }} 
                                                onLike={() => {}}
                                                onClick={() => {
                                                    if (isMyProfile) {
                                                        // Если это свой профиль, открываем модалку для редактирования
                                                        setEditingPost(post);
                                                    } else {
                                                        // Если это чужой профиль, закрываем текущую модалку 
                                                        // и вызываем функцию для открытия страницы поста
                                                        handleClose(); 
                                                        if (onPostClick) {
                                                            onPostClick(post);
                                                        }
                                                    }
                                                }}
                                                onEdit={() => setEditingPost(post)}
                                            />
                                            
                                            {/* Оверлей с кнопкой редактирования (только для моих постов) */}
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
                                                        opacity: 0,
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

                    {/* --- КНОПКА ВЫХОДА --- */}
                    {isMyProfile && (
                        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', borderTop: '1px solid #333' }}>
                            <Button
                                variant="text"
                                startIcon={<LogoutIcon />}
                                // ✅ 3. ИСПОЛЬЗУЕМ ПРОПС onLogout НАПРЯМУЮ
                                onClick={onLogout} 
                                sx={{
                                    color: '#ff5252',
                                    fontSize: '1.1rem',
                                    '&:hover': { backgroundColor: 'rgba(255, 82, 82, 0.1)' }
                                }}
                            >
                                Выйти из аккаунта
                            </Button>
                        </Box>
                    )}
                </Box>
            </Modal>

            {/* --- ОТДЕЛЬНОЕ МОДАЛЬНОЕ ОКНО ДЛЯ РЕДАКТИРОВАНИЯ СТАТЬИ --- */}
            {/* Оно рендерится поверх профиля благодаря z-index Material UI */}
            <EditArticleModal 
                open={!!editingPost}
                handleClose={() => setEditingPost(null)}
                post={editingPost}
                onUpdateSuccess={handleArticleUpdateSuccess}
            />
        </>
    );
};

export default ProfileModal;