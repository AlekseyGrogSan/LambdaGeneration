import React, { useState, useEffect, useRef } from 'react'; 
import { 
    Box,
    Button,
    Typography,
    Link as MuiLink,
    CircularProgress,
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

const API_BASE_URL = 'http://localhost:5113/api';

// --- СТИЛИ САЙДБАРА (Опущены для краткости) ---
const sidebarStyle = {
    width: 250, 
    minWidth: 250, 
    backgroundColor: '#1f1f1f', 
    padding: 0.5, 
    display: { xs: 'none', md: 'flex' }, 
    flexDirection: 'column',
    justifyContent: 'flex-start', 
    height: '98.9vh', 
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
    padding: '4px 10px', 
    borderRadius: '6px',
    marginBottom: 0.25, 
};
const sidebarButtonStyle = {
    ...commonButtonStyle,
    backgroundColor: '#00bfa5', 
    color: '#ffffff', 
    '&:hover': { backgroundColor: '#00897b' },
};
const profileButtonStyle = {
    ...commonButtonStyle,
    color: '#00bfa5', 
    borderColor: '#00bfa5', 
    borderWidth: '1px', 
    borderStyle: 'solid',
    '&:hover': { borderColor: '#00897b', color: '#00897b', backgroundColor: 'rgba(0, 191, 165, 0.08)' },
};
const buttonContainerStyle = { 
    display: 'flex', 
    flexDirection: 'column', 
    mb: 0.5
};

const Sidebar = ({ handleOpen, handleProfileOpen, handlePostOpen }) => (
    <Box sx={sidebarStyle}>
        <Typography variant="h5" sx={{ color: '#00bfa5', fontWeight: 'bold', textAlign: 'right', mb: 0.5 }}>Lyambda</Typography>
        <Box sx={buttonContainerStyle}> 
            <Button variant="contained" sx={sidebarButtonStyle}>Категории</Button>
            <Button variant="contained" sx={sidebarButtonStyle}>Полезные материалы</Button>
            <Button variant="contained" sx={sidebarButtonStyle}>FAQ</Button>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={buttonContainerStyle}> 
            <Button 
                sx={profileButtonStyle} 
                startIcon={<PersonIcon />} 
                onClick={handleProfileOpen} 
            >
                Мой профиль
            </Button> 
            <Button sx={profileButtonStyle} startIcon={<CloudUploadIcon />} onClick={handlePostOpen}>Опубликовать</Button>
        </Box>
        <Box sx={{ paddingTop: 0, textAlign: 'center' }}> 
            <Typography variant="body2" sx={{ color: '#757575', marginBottom: 0.5 }}>Нет аккаунта?</Typography>
            <MuiLink component="span" onClick={handleOpen} sx={{ color: '#757575', cursor: 'pointer', textDecoration: 'none', '&:hover': { color: '#00bfa5' } }}>
                Зарегистрироваться?
            </MuiLink>
        </Box>
    </Box>
);

const PostPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    
    const [articles, setArticles] = useState([]); 
    const [isLoading, setIsLoading] = useState(false); 
    const [error, setError] = useState(null);
    const hasBeenInitialized = useRef(false);

    const [selectedPost, setSelectedPost] = useState(null); 
    const [isViewingDetailPage, setIsViewingDetailPage] = useState(false);
    
    // --- Refs для скролла ---
    const articlesContainerRef = useRef(null); 
    const postRefs = useRef({}); 
    const [lastViewedArticleId, setLastViewedArticleId] = useState(null); 
    
    // Вспомогательная функция для установки Ref на элемент
    const setPostRef = (id) => (el) => {
        postRefs.current[id] = el;
    };
    // -------------------------

    const handleOpen = () => setIsModalOpen(true); 
    const handleClose = () => setIsModalOpen(false);
    const handlePostOpen = () => setIsPostModalOpen(true);
    const handlePostClose = () => setIsPostModalOpen(false);
    const handleForgotOpen = () => setIsForgotModalOpen(true);
    const handleForgotClose = () => setIsForgotModalOpen(false);
    const handleProfileOpen = () => setIsProfileModalOpen(true);
    const handleProfileClose = () => setIsProfileModalOpen(false);


    /**
     * Обработчик клика: Сохраняет ID поста и переключается на детальный вид.
     */
    const handlePostClick = (postData) => { 
        setLastViewedArticleId(postData.article_id); 
        setSelectedPost(postData); 
        setIsViewingDetailPage(true);
    };
    
    const handleBackToFeed = () => { 
        setSelectedPost(null); 
        setIsViewingDetailPage(false); 
    };

    // --- ВОССТАНОВЛЕНИЕ СКРОЛЛА ---
    useEffect(() => {
        if (!isViewingDetailPage && lastViewedArticleId) {
            const targetElement = postRefs.current[lastViewedArticleId];
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center' 
                });
            }
        }
    }, [isViewingDetailPage, lastViewedArticleId]);


    // --- ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ: ОБОГАЩЕНИЕ ДАННЫМИ ---
    const enrichArticleData = async (article) => {
        const rawId = article.article_id;
        const fetchOptions = { credentials: 'include' }; 

        const authorReq = fetch(`${API_BASE_URL}/Users/UserProfile/${article.author_id}`).then(r => r.json()).catch(() => ({}));
        const likeCountReq = fetch(`${API_BASE_URL}/Like/getLikes/${rawId}`, fetchOptions).then(r => r.json()).catch(() => ({ countLikes: 0 }));
        
        const isLikedReq = fetch(`${API_BASE_URL}/Like/isLiked/${rawId}`, fetchOptions)
            .then(r => {
                if (r.status === 401 || r.status === 403) {
                    return { isLiked: false }; 
                }
                if (!r.ok) {
                     console.error(`Error fetching isLiked status for ${rawId}: ${r.statusText}`);
                     return { isLiked: false }; 
                }
                return r.json();
            })
            .then(data => data.isLiked || false)
            .catch(() => false);
        
        const [authorData, likeCountData, isLikedStatus] = await Promise.all([authorReq, likeCountReq, isLikedReq]);
        
        return {
            ...article,
            nickname: authorData.name || 'Автор',
            title: article.articleTitle || article.article_title || 'Нет названия', 
            article_preview: article.articlePreview || article.article_preview || 'Нет описания',
            article_content: article.article_content || article.articleContent || article.Content || 'Полный текст не был загружен при получении ленты.', 
            likesCount: (typeof likeCountData === 'object' && likeCountData.countLikes !== undefined) ? likeCountData.countLikes : 0,
            imageUrl: article.article_preview, 
            isLiked: isLikedStatus, 
            commentsCount: 0,
            tags: article.article_tags || [], 
        };
    };

    // --- ЗАГРУЗКА СТАТЕЙ ---
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
            hasBeenInitialized.current = true; 

        } catch (err) {
            console.error(err);
            setError('Не удалось загрузить ленту: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- ОБРАБОТЧИК УСПЕШНОЙ ПУБЛИКАЦИИ ---
    const handleFeedUpdate = () => {
        console.log("Публикация прошла успешно. Обновляю ленту...");
        hasBeenInitialized.current = false;
        fetchAllArticles();
    };
    
    useEffect(() => { 
        if (!hasBeenInitialized.current) {
            fetchAllArticles(); 
        }
    }, []);
    
    // --- ЛАЙКИ (Обновление) ---
    const handleLikeToggle = async (rawId, currentIsLiked) => {
        const endpoint = currentIsLiked ? 'unLike' : 'like';
        try {
            const response = await fetch(`${API_BASE_URL}/Like/${endpoint}/${rawId}`, { 
                method: 'POST', 
                credentials: 'include' 
            }); 

            if (response.status === 401 || response.status === 403) {
                handleOpen(); return; 
            }
            if (!response.ok) {
                throw new Error(`Failed to toggle like. Status: ${response.status}`);
            }

            const res = await response.json();
            const newCount = res.countLikes !== undefined ? res.countLikes : 0; 

            if (typeof newCount !== 'number') {
                 console.error("Unexpected response format. Likes not updated.");
                 return;
            }

            setArticles(prev => prev.map(a => {
                if (a.article_id === rawId) { 
                    return { ...a, likesCount: newCount, isLiked: !currentIsLiked };
                }
                return a;
            }));
            
            if (selectedPost?.article_id === rawId) {
                setSelectedPost(prev => ({ ...prev, likesCount: newCount, isLiked: !currentIsLiked }));
            }

        } catch (e) {
            console.error("An error occurred during like toggle:", e);
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#121212', overflow: 'hidden' }}>
            
            <Box 
                sx={{ 
                    flex: 1, 
                    height: '100vh', 
                    overflowY: 'scroll', 
                    // ✅ ВОЗВРАЩЕНО: Scroll Snap Type
                    scrollSnapType: 'y mandatory', 
                    '&::-webkit-scrollbar': { display: 'none' }, 
                    msOverflowStyle: 'none', 
                    scrollbarWidth: 'none', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    scrollBehavior: 'smooth', 
                    willChange: 'scroll-position', 
                    transform: 'translateZ(0)', 
                }}
                ref={articlesContainerRef} 
            >
                
                {isViewingDetailPage && selectedPost ? (
                    <Box sx={{ width: '100%', maxWidth: '650px' }}>
                        <PostDetailPage
                            post={selectedPost}
                            onBack={handleBackToFeed}
                            onLike={() => handleLikeToggle(selectedPost.article_id, selectedPost.isLiked)}
                        />
                    </Box>
                ) : (
                    <Box sx={{ width: '100%', maxWidth: '650px' }}>
                        {isLoading && <Typography sx={{color:'white', textAlign:'center', pt: 2}}><CircularProgress color="primary" sx={{ color: '#00bfa5' }} /> Загрузка статей...</Typography>}
                        {!isLoading && articles.length === 0 && !error && <Typography sx={{color:'white', textAlign:'center', pt: 2}}>Статей пока нет.</Typography>}
                        {error && <Typography color="error" sx={{ textAlign:'center', pt: 2 }}>{error}</Typography>}
                        
                        {articles.map((post) => (
                            <Box
                                key={post.article_id}
                                ref={setPostRef(post.article_id)}
                                sx={{ 
                                    minHeight: '100vh', 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center',
                                    padding: '5vh 0', 
                                    // ✅ ВОЗВРАЩЕНО: Scroll Snap Align
                                    scrollSnapAlign: 'center', 
                                }}
                            >
                                <PostCard
                                    key={`card-${post.article_id}`}
                                    {...post}
                                    onClick={() => handlePostClick(post)}
                                    onLike={() => handleLikeToggle(post.article_id, post.isLiked)}
                                />
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>

            {/* САЙДБАР И МОДАЛКИ */}
            <Sidebar 
                handleOpen={handleOpen} 
                handleProfileOpen={handleProfileOpen} 
                handlePostOpen={handlePostOpen} 
            />
            <RegistrationModal open={isModalOpen} handleClose={handleClose} onForgotPassword={handleForgotOpen} />
            
            <PostCreationModal 
                open={isPostModalOpen} 
                handleClose={handlePostClose} 
                onUnauthorized={handleOpen}
                onPostSuccess={handleFeedUpdate} // Логика обновления сохранена
            />
            
            <ForgotPasswordModal open={isForgotModalOpen} handleClose={handleForgotClose} />
            <ProfileModal open={isProfileModalOpen} handleClose={handleProfileClose} nickname="User" />
        </Box>
    );
};

export default PostPage;