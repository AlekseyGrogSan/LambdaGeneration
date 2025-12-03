import React, { useState, useEffect, useRef } from 'react'; 
import { 
    Box,
    Button,
    Typography,
    Link as MuiLink,
    CircularProgress,
    Avatar
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// Компоненты
import PostCard from './PostCard';
import PostDetailPage from './PostDetailPage';
import ProfileModal from './ProfileModal';
import RegistrationModal from './RegistrationModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import PostCreationModal from './PostCreationModal';
import CategoryModal from './CategoryModal'; 
import ResourcesModal from './ResourcesModal';
import FaqModal from './FaqModal';

const API_BASE_URL = 'http://localhost:5113/api';

// --- СТИЛИ САЙДБАРА ---
const sidebarStyle = {
    width: 250, 
    minWidth: 250, 
    backgroundColor: '#1f1f1f', 
    padding: 2, 
    display: { xs: 'none', md: 'flex' }, 
    flexDirection: 'column',
    justifyContent: 'flex-start', 
    height: '95.5vh', 
    borderLeft: '1px solid #333',
    position: 'sticky', 
    top: 0, 
    right: 0,
    overflowY: 'hidden', 
};

const commonButtonStyle = {
    fontWeight: 'bold', 
    textTransform: 'none', 
    fontSize: '0.9rem', 
    justifyContent: 'flex-start', 
    padding: '8px 16px', 
    borderRadius: '8px',
    marginBottom: 1, 
    width: '100%'
};

const sidebarButtonStyle = {
    ...commonButtonStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    color: '#ffffff', 
    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
};

const profileButtonStyle = {
    ...commonButtonStyle,
    color: '#00bfa5', 
    borderColor: '#00bfa5', 
    borderWidth: '1px', 
    borderStyle: 'solid',
    '&:hover': { borderColor: '#00897b', color: '#00897b', backgroundColor: 'rgba(0, 191, 165, 0.08)' },
};

// --- КОМПОНЕНТ SIDEBAR (Обновленный) ---
const Sidebar = ({ handleOpen, handleProfileOpen, handlePostOpen, handleCategoryOpen, handleResourcesOpen, handleFaqOpen, currentUser }) => (
    <Box sx={sidebarStyle}>
        <Typography variant="h5" sx={{ color: '#00bfa5', fontWeight: 'bold', textAlign: 'center', mb: 4, letterSpacing: 1 }}>
            Lyambda
        </Typography>
        
        {/* Индикатор пользователя */}
        {currentUser ? (
            <Box sx={{ mb: 3, p: 2, bgcolor: '#2c2c2c', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: '#00bfa5' }}>{currentUser.name[0]?.toUpperCase()}</Avatar>
                <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="subtitle2" sx={{ color: '#bdbdbd', fontSize: '0.75rem' }}>Вы вошли как:</Typography>
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentUser.name}
                    </Typography>
                </Box>
            </Box>
        ) : (
             <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#757575', mb: 1 }}>Вы гость</Typography>
             </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}> 
            {/* ✅ ОБНОВЛЕННЫЕ КНОПКИ */}
            <Button variant="contained" sx={sidebarButtonStyle} onClick={handleCategoryOpen}>Категории</Button> 
            <Button variant="contained" sx={sidebarButtonStyle} onClick={handleResourcesOpen}>Полезные материалы</Button>
            <Button variant="contained" sx={sidebarButtonStyle} onClick={handleFaqOpen}>FAQ</Button>
        </Box>

        <Box sx={{ mt: 'auto' }}> 
            <Button 
                sx={profileButtonStyle} 
                startIcon={<PersonIcon />} 
                onClick={handleProfileOpen} 
            >
                {currentUser ? 'Мой профиль' : 'Войти / Профиль'}
            </Button> 
            <Button sx={profileButtonStyle} startIcon={<CloudUploadIcon />} onClick={handlePostOpen}>
                Опубликовать
            </Button>
        </Box>
        
        {!currentUser && (
            <Box sx={{ paddingTop: 2, textAlign: 'center' }}> 
                <Typography variant="body2" sx={{ color: '#757575', marginBottom: 0.5 }}>Нет аккаунта?</Typography>
                <MuiLink component="span" onClick={handleOpen} sx={{ color: '#757575', cursor: 'pointer', textDecoration: 'none', '&:hover': { color: '#00bfa5' } }}>
                    Зарегистрироваться?
                </MuiLink>
            </Box>
        )}
    </Box>
);

// --- MAIN COMPONENT ---
const PostPage = () => {
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isResourcesModalOpen, setIsResourcesModalOpen] = useState(false);
    const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
    
    // Data states
    const [viewedProfileId, setViewedProfileId] = useState(null); 
    const [articles, setArticles] = useState([]); 
    const [currentUser, setCurrentUser] = useState(null); // Текущий залогиненный пользователь
    
    // UI states
    const [isLoading, setIsLoading] = useState(false); 
    const [error, setError] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null); 
    const [isViewingDetailPage, setIsViewingDetailPage] = useState(false);
    const [lastViewedArticleId, setLastViewedArticleId] = useState(null); 

    const articlesContainerRef = useRef(null); 
    const postRefs = useRef({}); 
    const setPostRef = (id) => (el) => { postRefs.current[id] = el; };

    // --- АВТОРИЗАЦИЯ И ИНИЦИАЛИЗАЦИЯ ---
    
    // Проверка, вошел ли пользователь (по кукам)
    const checkAuth = async () => {
        try {
            // Пытаемся получить профиль. Если 200 OK - мы залогинены.
            const response = await fetch(`${API_BASE_URL}/Users/MyProfile`, { credentials: 'include' });
            if (response.ok) {
                const userData = await response.json();
                setCurrentUser(userData);
                return true; // Auth successful
            } else {
                setCurrentUser(null);
                return false;
            }
        } catch (e) {
            console.error("Auth check failed", e);
            setCurrentUser(null);
            return false;
        }
    };

    // При первой загрузке
    useEffect(() => {
        const init = async () => {
            await checkAuth(); // Сначала проверяем кто мы
            await fetchAllArticles(); // Потом грузим статьи (уже с куками если есть)
        };
        init();
    }, []);

    // --- ACTIONS ---
    const handleOpen = () => setIsModalOpen(true); 
    const handleClose = () => { 
        setIsModalOpen(false); 
        // Если окно закрылось (например, после успешного входа/регистрации внутри модалки), проверим auth снова
        checkAuth().then(isAuth => { if(isAuth) fetchAllArticles(); });
    };
    
    const handlePostOpen = () => setIsPostModalOpen(true);
    const handlePostClose = () => setIsPostModalOpen(false);
    const handleForgotOpen = () => setIsForgotModalOpen(true);
    const handleForgotClose = () => setIsForgotModalOpen(false);

    const handleCategoryOpen = () => setIsCategoryModalOpen(true);
    const handleCategoryClose = () => setIsCategoryModalOpen(false);
    
    const handleResourcesOpen = () => setIsResourcesModalOpen(true);
    const handleResourcesClose = () => setIsResourcesModalOpen(false);
    
    const handleFaqOpen = () => setIsFaqModalOpen(true);
    const handleFaqClose = () => setIsFaqModalOpen(false);

    const handleProfileOpen = () => {
        if (!currentUser) {
            // Если не залогинен - открываем регистрацию/вход
            handleOpen();
        } else {
            setViewedProfileId(null); 
            setIsProfileModalOpen(true);
        }
    };
    
    const handleProfileClose = () => {
        setIsProfileModalOpen(false);
        setViewedProfileId(null);
        // Обновляем ленту, вдруг в профиле мы что-то изменили
        fetchAllArticles(); 
    };
    
    const handleOtherAuthorProfileOpen = (userId) => {
        // Если кликнули на себя же
        if (currentUser && currentUser.id === userId) {
            setViewedProfileId(null);
        } else {
            setViewedProfileId(userId);
        }
        setIsProfileModalOpen(true);
    };

    const handlePostClick = (postData) => { 
        setLastViewedArticleId(postData.article_id); 
        setSelectedPost(postData); 
        setIsViewingDetailPage(true);
    };
    
    const handleBackToFeed = () => { 
        setSelectedPost(null); 
        setIsViewingDetailPage(false); 
    };

    const handleLogout = async () => {
        try {
            // 1. Вызываем эндпоинт бэкенда для удаления cookie
            await fetch(`${API_BASE_URL}/Users/logout`, { 
                method: 'POST', 
                credentials: 'include' 
            });
        } catch (e) {
            console.error("Ошибка при вызове API выхода:", e);
        } finally {
            // 2. В любом случае очищаем состояние на фронтенде
            localStorage.removeItem('authToken'); // На всякий случай, если используете
            setCurrentUser(null); // <--- ЭТО КЛЮЧЕВОЕ ИЗМЕНЕНИЕ
            handleProfileClose(); // Закрываем модальное окно профиля
        }
    };

    // Скролл к последней позиции
    useEffect(() => {
        if (!isViewingDetailPage && lastViewedArticleId) {
            const targetElement = postRefs.current[lastViewedArticleId];
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [isViewingDetailPage, lastViewedArticleId]);

    // --- DATA FETCHING ---
    
    const enrichArticleData = async (article) => {
        const rawId = article.article_id;
        const fetchOptions = { credentials: 'include' }; // ВАЖНО: шлет куки

        const authorReq = fetch(`${API_BASE_URL}/Users/UserProfile/${article.author_id}`).then(r => r.json()).catch(() => ({}));
        const likeCountReq = fetch(`${API_BASE_URL}/Like/getLikes/${rawId}`, fetchOptions).then(r => r.json()).catch(() => ({ countLikes: 0 }));
        
        // ВАЖНО: Этот запрос вернет true только если куки валидны и совпадают с userId
        const isLikedReq = fetch(`${API_BASE_URL}/Like/isLiked/${rawId}`, fetchOptions)
            .then(r => {
                if (r.status === 401 || r.status === 403) return { isLiked: false }; 
                if (!r.ok) return { isLiked: false }; 
                return r.json();
            })
            .then(data => data.isLiked || false)
            .catch(() => false);
        
        const [authorData, likeCountData, isLikedStatus] = await Promise.all([authorReq, likeCountReq, isLikedReq]);
        
        return {
            ...article,
            article_id: article.article_id, 
            author_id: article.author_id, 
            nickname: authorData.name || 'Автор',
            authorBio: authorData.aboutUser || 'Описание недоступно.',
            title: article.articleTitle || article.article_title || 'Нет названия', 
            article_preview: article.articlePreview || article.article_preview || 'Нет описания',
            article_content: article.article_content || article.articleContent || '...', 
            likesCount: likeCountData.countLikes || 0,
            imageUrl: article.article_preview, 
            isLiked: isLikedStatus, 
            commentsCount: 0,
            tags: article.article_tags || [], 
        };
    };

    const fetchAllArticles = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/Articles/getAll`);
            if (!response.ok) throw new Error('Ошибка загрузки ленты');
            
            const { articles: data } = await response.json(); 
            
            if (!data || data.length === 0) {
                setArticles([]);
                return;
            }

            const enrichedArticlesPromises = data.map(enrichArticleData);
            const enrichedArticles = await Promise.all(enrichedArticlesPromises);
            
            setArticles(enrichedArticles);

        } catch (err) {
            console.error(err);
            setError('Не удалось загрузить ленту.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- LIKE LOGIC ---
    const handleLikeToggle = async (rawId, currentIsLiked) => {
        // Оптимистичное обновление UI
        setArticles(prev => prev.map(a => 
            a.article_id === rawId 
                ? { ...a, isLiked: !currentIsLiked, likesCount: currentIsLiked ? a.likesCount - 1 : a.likesCount + 1 }
                : a
        ));

        const endpoint = currentIsLiked ? 'unLike' : 'like';
        try {
            const response = await fetch(`${API_BASE_URL}/Like/${endpoint}/${rawId}`, { 
                method: 'POST', 
                credentials: 'include' 
            }); 

            if (response.status === 401 || response.status === 403) {
                // Откат изменений если не авторизован
                setArticles(prev => prev.map(a => 
                    a.article_id === rawId 
                        ? { ...a, isLiked: currentIsLiked, likesCount: currentIsLiked ? a.likesCount + 1 : a.likesCount - 1 }
                        : a
                ));
                handleOpen(); // Открыть окно входа
                return; 
            }
            
            if (response.ok) {
                const res = await response.json();
                // Синхронизация точного числа с сервера
                const realCount = res.countLikes;
                setArticles(prev => prev.map(a => 
                    a.article_id === rawId ? { ...a, likesCount: realCount } : a
                ));
                if (selectedPost?.article_id === rawId) {
                    setSelectedPost(prev => ({ ...prev, likesCount: realCount, isLiked: !currentIsLiked }));
                }
            }
        } catch (e) {
            console.error("Like error:", e);
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#121212', overflow: 'hidden' }}>
            
            <Box 
                sx={{ 
                    flex: 1, 
                    height: '100vh', 
                    overflowY: 'scroll', 
                    scrollSnapType: 'y mandatory', 
                    '&::-webkit-scrollbar': { display: 'none' }, 
                    msOverflowStyle: 'none', 
                    scrollbarWidth: 'none', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    scrollBehavior: 'smooth', 
                }}
                ref={articlesContainerRef} 
            >
                
                {isViewingDetailPage && selectedPost ? (
                    <Box sx={{ width: '100%', maxWidth: '680px' }}>
                        <PostDetailPage
                            post={selectedPost}
                            onBack={handleBackToFeed}
                            nickname={selectedPost.nickname}
                            authorId={selectedPost.author_id} 
                            onAuthorClick={handleOtherAuthorProfileOpen} 
                            onLike={() => handleLikeToggle(selectedPost.article_id, selectedPost.isLiked)}
                            containerRef={articlesContainerRef} // <-- Передаем реф контейнера
                        />
                    </Box>
                ) : (
                    <Box sx={{ width: '100%', maxWidth: '650px', pb: 5 }}>
                        {isLoading && <Typography sx={{color:'white', textAlign:'center', pt: 4}}><CircularProgress sx={{ color: '#00bfa5' }} /></Typography>}
                        {!isLoading && articles.length === 0 && !error && <Typography sx={{color:'white', textAlign:'center', pt: 4}}>Статей пока нет.</Typography>}
                        
                        {articles.map((post) => (
                            <Box
                                key={post.article_id}
                                ref={setPostRef(post.article_id)}
                                sx={{ 
                                    minHeight: '100vh', 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center',
                                    padding: '20px 0', 
                                    scrollSnapAlign: 'center', 
                                }}
                            >
                                <PostCard
                                    {...post}
                                    authorId={post.author_id} 
                                    onAuthorClick={handleOtherAuthorProfileOpen} 
                                    onClick={() => handlePostClick(post)}
                                    onLike={() => handleLikeToggle(post.article_id, post.isLiked)}
                                />
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>

            <Sidebar 
                handleOpen={handleOpen} 
                handleProfileOpen={handleProfileOpen} 
                handlePostOpen={handlePostOpen}
                handleCategoryOpen={handleCategoryOpen} 
                handleResourcesOpen={handleResourcesOpen} 
                handleFaqOpen={handleFaqOpen}
                currentUser={currentUser}
                
            />
            
            <RegistrationModal 
                open={isModalOpen} 
                handleClose={handleClose} 
                onForgotPassword={handleForgotOpen} 
            />
            
            <PostCreationModal 
                open={isPostModalOpen} 
                handleClose={handlePostClose} 
                onUnauthorized={handleOpen}
                onPostSuccess={fetchAllArticles} 
            />
            
            <ForgotPasswordModal open={isForgotModalOpen} handleClose={handleForgotClose} />
            
            <ProfileModal 
                open={isProfileModalOpen} 
                handleClose={handleProfileClose} 
                userId={viewedProfileId} 
                onUnauthorized={handleOpen}
                onLogout={handleLogout} // ✅ ПЕРЕДАЕМ НОВУЮ ФУНКЦИЮ СЮДА
            />

            {/* ✅ НОВЫЕ КОМПОНЕНТЫ-ЗАГЛУШКИ */}
            <CategoryModal open={isCategoryModalOpen} handleClose={handleCategoryClose} />
            <ResourcesModal open={isResourcesModalOpen} handleClose={handleResourcesClose} />
            <FaqModal open={isFaqModalOpen} handleClose={handleFaqClose} />
            
        </Box>
    );
};

export default PostPage;