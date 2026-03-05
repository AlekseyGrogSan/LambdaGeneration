import React, { useState, useEffect, useRef } from 'react'; 
import { 
    Box,
    Button,
    Typography,
    Link as MuiLink,
    CircularProgress,
    Avatar,
    TextField,
    IconButton,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

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

const commentsSidebarStyle = {
    width: 340,
    minWidth: 340,
    backgroundColor: '#1f1f1f',
    borderRight: '1px solid #333',
    display: { xs: 'none', md: 'flex' },
    flexDirection: 'column',
    height: '100vh',
    position: 'sticky',
    top: 0,
    left: 0,
};

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

const Sidebar = ({ handleOpen, handleProfileOpen, handlePostOpen, handleCategoryOpen, handleResourcesOpen, handleFaqOpen, currentUser }) => (
    <Box sx={sidebarStyle}>
        <Typography variant="h5" sx={{ color: '#00bfa5', fontWeight: 'bold', textAlign: 'center', mb: 4, letterSpacing: 1 }}>
            Lyambda
        </Typography>

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

const FeedCommentItem = ({
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
}) => (
    <Box
        sx={{
            ml: depth * 1.5,
            mt: 1.5,
            pl: 1.2,
            borderLeft: depth > 0 ? '2px solid #3f3f3f' : 'none',
            width: '100%',
            boxSizing: 'border-box',
        }}
    >
        <Box
            sx={{
                backgroundColor: depth === 0 ? '#222' : '#262626',
                border: '1px solid #333',
                borderRadius: '12px',
                p: 1.2,
            }}
        >
            <Typography variant="body2" sx={{ color: '#00bfa5', fontWeight: 700 }}>
                @{comment.authorName}
            </Typography>

            <Typography variant="body2" sx={{ color: 'white', mt: 0.5, whiteSpace: 'pre-wrap' }}>
                {comment.content}
            </Typography>

            <Typography variant="caption" sx={{ color: '#888', display: 'block', mt: 0.8 }}>
                {new Date(comment.publishDate).toLocaleString('ru-RU')}
            </Typography>

            <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                <IconButton
                    size="small"
                    onClick={() => onLikeToggle(comment.commentId, comment.isLiked)}
                    sx={{ color: comment.isLiked ? '#ff1744' : '#9e9e9e', p: 0.4 }}
                >
                    <FavoriteIcon sx={{ fontSize: 17 }} />
                </IconButton>
                <Typography variant="caption" sx={{ color: '#bdbdbd', ml: 0.4, fontWeight: 700 }}>
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
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <TextField
                        variant="filled"
                        size="small"
                        fullWidth
                        label="Ответить"
                        value={replyInputs[comment.commentId] || ''}
                        onChange={(e) => onReplyTextChange(comment.commentId, e.target.value)}
                        sx={commentInputStyle}
                    />
                    <Button
                        variant="contained"
                        onClick={() => onReplySubmit(comment.commentId, replyInputs[comment.commentId] || '')}
                        sx={{
                            minWidth: 'auto',
                            borderRadius: '10px',
                            backgroundColor: '#00bfa5',
                            px: 1.2,
                            '&:hover': { backgroundColor: '#009e8a' },
                        }}
                    >
                        Отправить
                    </Button>
                </Box>
            )}

            {editEditorOpen[comment.commentId] && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.8 }}>
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
                            px: 1.2,
                            '&:hover': { backgroundColor: '#009e8a' },
                        }}
                    >
                        Сохранить
                    </Button>
                </Box>
            )}
        </Box>

        {comment.repliesOpen && comment.replies?.map((reply) => (
            <FeedCommentItem
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

const CommentsFeedSidebar = ({
    activePost,
    commentsTree,
    commentsLoading,
    commentsError,
    newCommentText,
    currentUserId,
    replyInputs,
    replyEditorOpen,
    editInputs,
    editEditorOpen,
    onNewCommentTextChange,
    onCreateRootComment,
    onReplyTextChange,
    onToggleReplyEditor,
    onReplySubmit,
    onEditTextChange,
    onToggleEditEditor,
    onEditSubmit,
    onDeleteComment,
    onCommentLikeToggle,
    onCommentToggleReplies,
    onClose,
}) => (
    <Box sx={commentsSidebarStyle}>
        <Box sx={{ px: 2, py: 1.3, borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ color: '#00bfa5', fontWeight: 700 }}>
                Комментарии
            </Typography>
            <IconButton onClick={onClose} size="small" sx={{ ml: 'auto', color: '#9e9e9e' }}>
                <CloseIcon fontSize="small" />
            </IconButton>
        </Box>

        <Box sx={{ px: 2, pt: 1, pb: 1.5, borderBottom: '1px solid #333' }}>
            <Typography
                variant="body2"
                sx={{
                    color: 'white',
                    mt: 0.4,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
            >
                {activePost?.title}
            </Typography>
        </Box>

        <Box sx={{ p: 1.5, borderBottom: '1px solid #333' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                    label="Написать комментарий..."
                    variant="filled"
                    fullWidth
                    value={newCommentText}
                    onChange={(e) => onNewCommentTextChange(e.target.value)}
                    sx={commentInputStyle}
                />
                <Button
                    variant="contained"
                    onClick={onCreateRootComment}
                    sx={{
                        borderRadius: '10px',
                        backgroundColor: '#00bfa5',
                        '&:hover': { backgroundColor: '#009e8a' },
                    }}
                >
                    Отпр.
                </Button>
            </Box>

            {commentsError && (
                <Typography sx={{ color: '#ff8a80', mt: 1, fontSize: '0.85rem' }}>{commentsError}</Typography>
            )}
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
            {commentsLoading ? (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                    <CircularProgress size={26} sx={{ color: '#00bfa5' }} />
                </Box>
            ) : commentsTree.length === 0 ? (
                <Typography sx={{ color: '#aaa', fontSize: '0.9rem' }}>
                    Пока нет комментариев. Будьте первым.
                </Typography>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    {commentsTree.map((comment) => (
                        <FeedCommentItem
                            key={comment.commentId}
                            comment={comment}
                            depth={0}
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
                            onLikeToggle={onCommentLikeToggle}
                            onToggleReplies={onCommentToggleReplies}
                        />
                    ))}
                </Box>
            )}
        </Box>
    </Box>
);

const PostPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isResourcesModalOpen, setIsResourcesModalOpen] = useState(false);
    const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
    
    const [viewedProfileId, setViewedProfileId] = useState(null); 
    const [articles, setArticles] = useState([]); 
    const [currentUser, setCurrentUser] = useState(null);
    
    const [pageNumber, setPageNumber] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 5;
    
    const [isLoading, setIsLoading] = useState(false); 
    const [error, setError] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null); 
    const [isViewingDetailPage, setIsViewingDetailPage] = useState(false);
    const [lastViewedArticleId, setLastViewedArticleId] = useState(null); 
    const [shouldOpenComments, setShouldOpenComments] = useState(false);
    const [activeCommentsPost, setActiveCommentsPost] = useState(null);
    const [feedCommentsLoading, setFeedCommentsLoading] = useState(false);
    const [feedCommentsError, setFeedCommentsError] = useState(null);
    const [feedCommentsTree, setFeedCommentsTree] = useState([]);
    const [feedNewCommentText, setFeedNewCommentText] = useState('');
    const [feedReplyInputs, setFeedReplyInputs] = useState({});
    const [feedReplyEditorOpen, setFeedReplyEditorOpen] = useState({});
    const [feedEditInputs, setFeedEditInputs] = useState({});
    const [feedEditEditorOpen, setFeedEditEditorOpen] = useState({});
    const feedCommentAuthorCacheRef = useRef({});

    const articlesContainerRef = useRef(null); 
    const postRefs = useRef({}); 
    const setPostRef = (id) => (el) => { postRefs.current[id] = el; };

    
    const checkAuth = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/Users/MyProfile`, { credentials: 'include' });
            if (response.ok) {
                const userData = await response.json();
                setCurrentUser(userData);
                return true;
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

    useEffect(() => {
        const init = async () => {
            await checkAuth();
            await fetchArticlesPage(1);
        };
        init();
    }, []);

    const handleOpen = () => setIsModalOpen(true); 
    const handleClose = () => { 
        setIsModalOpen(false); 
        checkAuth().then(isAuth => { if(isAuth) fetchArticlesPage(1); });
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
            handleOpen();
        } else {
            setViewedProfileId(null); 
            setIsProfileModalOpen(true);
        }
    };
    
    const handleProfileClose = () => {
        setIsProfileModalOpen(false);
        setViewedProfileId(null);
        fetchArticlesPage(1);
    };
    
    const handleOtherAuthorProfileOpen = (userId) => {
        if (currentUser && currentUser.id === userId) {
            setViewedProfileId(null);
        } else {
            setViewedProfileId(userId);
        }
        setIsProfileModalOpen(true);
    };

    const handlePostClick = (postData, openComments = false) => { 
        setLastViewedArticleId(postData.article_id); 
        setSelectedPost(postData); 
        setIsViewingDetailPage(true);
        setShouldOpenComments(openComments);
    };
    
    const handleBackToFeed = () => { 
        setSelectedPost(null); 
        setIsViewingDetailPage(false); 
        setShouldOpenComments(false);
    };

    const handleLogout = async () => {
        try {
            await fetch(`${API_BASE_URL}/Users/logout`, { 
                method: 'POST', 
                credentials: 'include' 
            });
        } catch (e) {
            console.error("Ошибка при вызове API выхода:", e);
        } finally {
            localStorage.removeItem('authToken');
            setCurrentUser(null); 
            handleProfileClose(); 
        }
    };

    useEffect(() => {
        if (!isViewingDetailPage && lastViewedArticleId) {
            const targetElement = postRefs.current[lastViewedArticleId];
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [isViewingDetailPage, lastViewedArticleId]);

    useEffect(() => {
        const container = articlesContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }
        
        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, [isLoading, hasMore, pageNumber, isViewingDetailPage]);

    const handleScroll = () => {
        const container = articlesContainerRef.current;
        
        if (container && !isViewingDetailPage) {
            const { scrollTop, scrollHeight, clientHeight } = container;
            
            const isNearBottom = scrollTop + clientHeight >= scrollHeight * 0.9; 

            if (isNearBottom && !isLoading && hasMore) {
                console.log('Достигнут низ ленты, загружаем следующую страницу...');
                fetchArticlesPage(pageNumber + 1);
            }
        }
    };

    
    const enrichArticleData = async (article) => {
        const rawId = article.article_id;
        const fetchOptions = { credentials: 'include' };

        const authorReq = fetch(`${API_BASE_URL}/Users/UserProfile/${article.author_id}`).then(r => r.json()).catch(() => ({}));
        const likeCountReq = fetch(`${API_BASE_URL}/Like/getLikes/${rawId}`, fetchOptions).then(r => r.json()).catch(() => ({ countLikes: 0 }));
        
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
            commentsCount: article.countComments ?? article.commentsCount ?? article.comments_count ?? 0,
            tags: article.article_tags || [], 
        };
    };


    const fetchArticlesPage = async (page) => {
        if (isLoading || (!hasMore && page > pageNumber)) return; 

        setIsLoading(true);
        setError(null);
        
        try {
            const url = `${API_BASE_URL}/Articles/getPaginated?page=${page}&size=${pageSize}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Ошибка загрузки статей: ${response.statusText}`);
            }
            
            const data = await response.json(); 
            const newArticlesRaw = data.articles || [];
            
            if (newArticlesRaw.length < pageSize) {
                setHasMore(false);
            }

            const enrichedArticles = await Promise.all(newArticlesRaw.map(enrichArticleData));
            
            setArticles(prevArticles => {
                if (page === 1) {
                    return enrichedArticles;
                } else {
                    const existingIds = new Set(prevArticles.map(a => a.article_id));
                    const uniqueNewArticles = enrichedArticles.filter(a => !existingIds.has(a.article_id));
                    return [...prevArticles, ...uniqueNewArticles];
                }
            });

            setPageNumber(page);

        } catch (err) {
            console.error(err);
            setError('Не удалось загрузить статьи.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLikeToggle = async (rawId, currentIsLiked) => {
        setArticles(prev => prev.map(a => 
            a.article_id === rawId 
                ? { ...a, isLiked: !currentIsLiked, likesCount: currentIsLiked ? a.likesCount - 1 : a.likesCount + 1 }
                : a
        ));

        if (selectedPost && selectedPost.article_id === rawId) {
             setSelectedPost(prev => 
                ({ ...prev, isLiked: !currentIsLiked, likesCount: currentIsLiked ? prev.likesCount - 1 : prev.likesCount + 1 })
            );
        }

        const endpoint = currentIsLiked ? 'unLike' : 'like';
        try {
            const response = await fetch(`${API_BASE_URL}/Like/${endpoint}/${rawId}`, { 
                method: 'POST', 
                credentials: 'include' 
            }); 

            if (response.status === 401 || response.status === 403) {
                setArticles(prev => prev.map(a => 
                    a.article_id === rawId 
                        ? { ...a, isLiked: currentIsLiked, likesCount: currentIsLiked ? a.likesCount + 1 : a.likesCount - 1 }
                        : a
                ));
                 if (selectedPost && selectedPost.article_id === rawId) {
                    setSelectedPost(prev => 
                        ({ ...prev, isLiked: currentIsLiked, likesCount: currentIsLiked ? prev.likesCount + 1 : prev.likesCount - 1 })
                    );
                }
                handleOpen();
                return; 
            }
            
            if (response.ok) {
                const res = await response.json();
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

    const handleCommentsCountChange = (articleId, commentsCount) => {
        setArticles(prev => prev.map(a => (
            a.article_id === articleId ? { ...a, commentsCount } : a
        )));

        if (selectedPost?.article_id === articleId) {
            setSelectedPost(prev => ({ ...prev, commentsCount }));
        }
    };

    useEffect(() => {
        if (!activeCommentsPost) return;
        const updatedPost = articles.find((a) => a.article_id === activeCommentsPost.article_id);
        if (updatedPost) {
            setActiveCommentsPost(updatedPost);
        }
    }, [articles, activeCommentsPost]);

    const getFeedCommentAuthorName = async (userId) => {
        if (feedCommentAuthorCacheRef.current[userId]) {
            return feedCommentAuthorCacheRef.current[userId];
        }

        try {
            const response = await fetch(`${API_BASE_URL}/Users/UserProfile/${userId}`, {
                credentials: 'include',
            });
            if (!response.ok) {
                feedCommentAuthorCacheRef.current[userId] = 'Автор';
                return 'Автор';
            }

            const data = await response.json();
            const name = data.name || 'Автор';
            feedCommentAuthorCacheRef.current[userId] = name;
            return name;
        } catch {
            feedCommentAuthorCacheRef.current[userId] = 'Автор';
            return 'Автор';
        }
    };

    const getFeedCommentLikeStatus = async (commentId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/LikeComment/isLiked/${commentId}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                return false;
            }

            const data = await response.json();
            return data.isLiked || false;
        } catch {
            return false;
        }
    };

    const enrichFeedComment = async (comment) => {
        const commentId = comment.commentId ?? comment.CommentId;
        const authorId = comment.authorId ?? comment.AuthorId;
        const hasReplies = Boolean(comment.hasReplies ?? comment.HasReplies);
        const repliesCount = comment.repliesCount ?? comment.RepliesCount ?? 0;

        const authorName = await getFeedCommentAuthorName(authorId);
        const isLiked = await getFeedCommentLikeStatus(commentId);

        return {
            ...comment,
            commentId,
            authorId,
            hasReplies,
            repliesCount,
            authorName,
            isLiked,
            replies: [],
            repliesOpen: false,
            repliesLoading: false,
            repliesLoaded: false,
        };
    };

    const loadFeedCommentsForPost = async (postData) => {
        if (!postData?.article_id) return;

        setFeedCommentsLoading(true);
        setFeedCommentsError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/Comments/get-comments/${postData.article_id}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Не удалось загрузить комментарии');
            }

            const data = await response.json();
            const tree = await Promise.all((data.comments || []).map(enrichFeedComment));
            setFeedCommentsTree(tree);
            setFeedReplyEditorOpen({});
            setFeedEditEditorOpen({});
            setFeedEditInputs({});
            handleCommentsCountChange(postData.article_id, countTreeComments(tree));
        } catch (err) {
            console.error(err);
            setFeedCommentsError('Ошибка при загрузке комментариев');
        } finally {
            setFeedCommentsLoading(false);
        }
    };

    const handleOpenCommentsSidebar = async (postData) => {
        if (activeCommentsPost?.article_id === postData.article_id) {
            setActiveCommentsPost(null);
            setFeedCommentsTree([]);
            setFeedCommentsError(null);
            setFeedReplyEditorOpen({});
            setFeedEditEditorOpen({});
            setFeedEditInputs({});
            return;
        }

        setActiveCommentsPost(postData);
        setFeedNewCommentText('');
        setFeedReplyInputs({});
        setFeedReplyEditorOpen({});
        setFeedEditEditorOpen({});
        setFeedEditInputs({});
        await loadFeedCommentsForPost(postData);
    };

    const createFeedComment = async (content, parentId = null) => {
        if (!activeCommentsPost?.article_id) {
            return;
        }

        const trimmed = content.trim();
        if (trimmed.length < 5) {
            setFeedCommentsError('Комментарий должен быть не короче 5 символов');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/Comments/create-comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                articleId: activeCommentsPost.article_id,
                parentId,
                content: trimmed,
            }),
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                handleOpen();
                throw new Error('Для комментариев требуется авторизация');
            }
            throw new Error('Не удалось отправить комментарий');
        }

        await loadFeedCommentsForPost(activeCommentsPost);
    };

    const handleFeedCreateRootComment = async () => {
        try {
            setFeedCommentsError(null);
            await createFeedComment(feedNewCommentText);
            setFeedNewCommentText('');
        } catch (err) {
            setFeedCommentsError(err.message);
        }
    };

    const handleFeedReplyChange = (commentId, value) => {
        setFeedReplyInputs((prev) => ({ ...prev, [commentId]: value }));
    };

    const handleFeedEditChange = (commentId, value) => {
        setFeedEditInputs((prev) => ({ ...prev, [commentId]: value }));
    };

    const handleFeedReplySubmit = async (commentId, value) => {
        try {
            setFeedCommentsError(null);
            await createFeedComment(value, commentId);
            setFeedReplyInputs((prev) => ({ ...prev, [commentId]: '' }));
            setFeedReplyEditorOpen((prev) => ({ ...prev, [commentId]: false }));
        } catch (err) {
            setFeedCommentsError(err.message);
        }
    };

    const handleFeedToggleReplyEditor = (commentId) => {
        setFeedReplyEditorOpen((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
    };

    const handleFeedToggleEditEditor = (commentId, currentContent = '') => {
        setFeedEditEditorOpen((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
        setFeedEditInputs((prev) => ({
            ...prev,
            [commentId]: prev[commentId] ?? currentContent,
        }));
    };

    const updateFeedComment = async (commentId, content) => {
        const trimmed = content.trim();
        if (trimmed.length < 5) {
            setFeedCommentsError('Комментарий должен быть не короче 5 символов');
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
            handleOpen();
            throw new Error('Для комментариев требуется авторизация');
        }

        if (!response.ok) {
            throw new Error('Не удалось обновить комментарий');
        }

        return true;
    };

    const handleFeedEditSubmit = async (commentId, value) => {
        try {
            setFeedCommentsError(null);
            const ok = await updateFeedComment(commentId, value);
            if (!ok) return;
            setFeedEditEditorOpen((prev) => ({ ...prev, [commentId]: false }));
            await loadFeedCommentsForPost(activeCommentsPost);
        } catch (err) {
            setFeedCommentsError(err.message);
        }
    };

    const handleFeedDeleteComment = async (comment) => {
        try {
            setFeedCommentsError(null);
            if (comment.hasReplies) {
                const ok = await updateFeedComment(comment.commentId, 'Комментарий удален');
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
                    handleOpen();
                    throw new Error('Для удаления комментария требуется авторизация');
                }

                if (!response.ok) {
                    throw new Error('Не удалось удалить комментарий');
                }
            }
            await loadFeedCommentsForPost(activeCommentsPost);
        } catch (err) {
            setFeedCommentsError(err.message);
        }
    };

    const handleFeedCommentLikeToggle = async (commentId, currentIsLiked) => {
        const endpoint = currentIsLiked ? 'unLike' : 'like';

        setFeedCommentsTree((prev) => updateCommentInTree(prev, commentId, (comment) => ({
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
                handleOpen();
                throw new Error('Для лайков комментариев требуется авторизация');
            }

            if (!response.ok) {
                throw new Error('Не удалось изменить лайк комментария');
            }

            const data = await response.json();
            setFeedCommentsTree((prev) => updateCommentInTree(prev, commentId, (comment) => ({
                ...comment,
                isLiked: !currentIsLiked,
                countLikes: data.countLikes ?? comment.countLikes ?? 0,
            })));
        } catch (err) {
            setFeedCommentsTree((prev) => updateCommentInTree(prev, commentId, (comment) => ({
                ...comment,
                isLiked: currentIsLiked,
                countLikes: currentIsLiked ? (comment.countLikes || 0) + 1 : Math.max((comment.countLikes || 0) - 1, 0),
            })));
            setFeedCommentsError(err.message);
        }
    };

    const handleFeedCloseComments = () => {
        setActiveCommentsPost(null);
        setFeedCommentsTree([]);
        setFeedCommentsError(null);
        setFeedReplyInputs({});
        setFeedReplyEditorOpen({});
        setFeedEditEditorOpen({});
        setFeedEditInputs({});
        setFeedNewCommentText('');
    };

    const fetchFeedRepliesTree = async (parentId) => {
        const response = await fetch(`${API_BASE_URL}/Comments/get-replies/${parentId}`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to load replies');
        }

        const data = await response.json();
        const replies = await Promise.all((data.comments || []).map(async (reply) => {
            const enrichedReply = await enrichFeedComment(reply);

            if (!enrichedReply.hasReplies) {
                return enrichedReply;
            }

            const nestedReplies = await fetchFeedRepliesTree(enrichedReply.commentId);
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

    const handleFeedCommentToggleReplies = async (commentId) => {
        const target = (() => {
            const stack = [...feedCommentsTree];
            while (stack.length) {
                const item = stack.pop();
                if (item.commentId === commentId) return item;
                if (item.replies?.length) stack.push(...item.replies);
            }
            return null;
        })();

        if (!target) return;

        if (target.repliesLoaded) {
            setFeedCommentsTree((prev) => updateCommentInTree(prev, commentId, (comment) => ({
                ...comment,
                repliesOpen: !comment.repliesOpen,
            })));
            return;
        }

        setFeedCommentsTree((prev) => updateCommentInTree(prev, commentId, (comment) => ({
            ...comment,
            repliesLoading: true,
        })));

        try {
            const replies = await fetchFeedRepliesTree(commentId);
            setFeedCommentsTree((prev) => updateCommentInTree(prev, commentId, (comment) => ({
                ...comment,
                replies,
                repliesOpen: true,
                repliesLoading: false,
                repliesLoaded: true,
                repliesCount: replies.length,
            })));
        } catch (err) {
            setFeedCommentsTree((prev) => updateCommentInTree(prev, commentId, (comment) => ({
                ...comment,
                repliesLoading: false,
            })));
            setFeedCommentsError(err.message);
        }
    };
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#121212', overflow: 'hidden' }}>
            {!isViewingDetailPage && activeCommentsPost && (
                <CommentsFeedSidebar
                    activePost={activeCommentsPost}
                    commentsTree={feedCommentsTree}
                    commentsLoading={feedCommentsLoading}
                    commentsError={feedCommentsError}
                    newCommentText={feedNewCommentText}
                    currentUserId={currentUser?.id}
                    replyInputs={feedReplyInputs}
                    replyEditorOpen={feedReplyEditorOpen}
                    editInputs={feedEditInputs}
                    editEditorOpen={feedEditEditorOpen}
                    onNewCommentTextChange={setFeedNewCommentText}
                    onCreateRootComment={handleFeedCreateRootComment}
                    onReplyTextChange={handleFeedReplyChange}
                    onToggleReplyEditor={handleFeedToggleReplyEditor}
                    onReplySubmit={handleFeedReplySubmit}
                    onEditTextChange={handleFeedEditChange}
                    onToggleEditEditor={handleFeedToggleEditEditor}
                    onEditSubmit={handleFeedEditSubmit}
                    onDeleteComment={handleFeedDeleteComment}
                    onCommentLikeToggle={handleFeedCommentLikeToggle}
                    onCommentToggleReplies={handleFeedCommentToggleReplies}
                    onClose={handleFeedCloseComments}
                />
            )}
            
            <Box 
                sx={{ 
                    flex: 1, 
                    height: '100vh', 
                    overflowY: 'auto',
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
                            onUnauthorized={handleOpen}
                            currentUserId={currentUser?.id}
                            onLike={() => handleLikeToggle(selectedPost.article_id, selectedPost.isLiked)}
                            onCommentsCountChange={handleCommentsCountChange}
                            initialOpenComments={shouldOpenComments}
                            containerRef={articlesContainerRef}
                        />
                    </Box>
                ) : (
                    <Box sx={{ width: '100%', maxWidth: '650px', pb: 5 }}>
                        {articles.length === 0 && isLoading && <Typography sx={{color:'white', textAlign:'center', pt: 4}}><CircularProgress sx={{ color: '#00bfa5' }} /></Typography>}
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
                                    onCommentClick={() => handleOpenCommentsSidebar(post)}
                                    onLike={() => handleLikeToggle(post.article_id, post.isLiked)}
                                />
                            </Box>
                        ))}
                        
                        {isLoading && articles.length > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                <CircularProgress size={30} sx={{ color: '#00bfa5' }} />
                            </Box>
                        )}
                        
                        {!hasMore && articles.length > 0 && <Typography sx={{color:'white', textAlign:'center', py: 4}}>Это все статьи!</Typography>}
                        {error && <Typography color="error" sx={{ textAlign: 'center', pt: 4 }}>{error}</Typography>}
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
                onPostSuccess={() => {
                    setArticles([]);
                    setPageNumber(1);
                    setHasMore(true);
                    setTimeout(() => fetchArticlesPage(1), 0);
                }} 
            />
            
            <ForgotPasswordModal open={isForgotModalOpen} handleClose={handleForgotClose} />
            
            <ProfileModal 
                open={isProfileModalOpen} 
                handleClose={handleProfileClose} 
                userId={viewedProfileId} 
                onUnauthorized={handleOpen}
                onLogout={handleLogout} 
                onPostClick={handlePostClick}
                onLikes={handleLikeToggle}
                openProfile={handleOtherAuthorProfileOpen}
            />

            <CategoryModal open={isCategoryModalOpen} handleClose={handleCategoryClose} />
            <ResourcesModal open={isResourcesModalOpen} handleClose={handleResourcesClose} />
            <FaqModal open={isFaqModalOpen} handleClose={handleFaqClose} />
            
        </Box>
    );
};

export default PostPage;
