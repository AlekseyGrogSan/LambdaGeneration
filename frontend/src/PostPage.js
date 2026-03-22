import React, { useState, useEffect, useRef, useCallback } from 'react'; 
import { 
    Box,
    Button,
    Typography,
    Link as MuiLink,
    CircularProgress,
    Avatar,
    TextField,
    IconButton,
    InputAdornment,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    useMediaQuery,
    useTheme,
    SwipeableDrawer,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

import PostCard from './PostCard';
import PostDetailPage from './PostDetailPage';
import ProfileModal from './ProfileModal';
import MobileBottomNav from './MobileBottomNav';
import MobileFeedSegmentedControl from './MobileFeedSegmentedControl';
import MobileFeedListSkeleton from './MobileFeedListSkeleton';
import { useFeedTabSwipe } from './useFeedTabSwipe';
import RegistrationModal from './RegistrationModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import PostCreationModal from './PostCreationModal';
import CategoryModal from './CategoryModal'; 
import ResourcesModal from './ResourcesModal';
import FaqModal from './FaqModal';
import AdminPanelModal from './AdminPanelModal';
import { buildArticleImageUrl, buildAvatarUrl, DEFAULT_AVATAR_SRC } from './avatarUtils';

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
    display: 'none',
    '@media (min-width: 768px)': {
        display: 'flex',
    },
    flexDirection: 'column',
    height: '100vh',
    position: 'sticky',
    top: 0,
    left: 0,
};

const commentsDrawerInnerSx = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#1f1f1f',
    overflow: 'hidden',
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
    display: 'none',
    '@media (min-width: 768px)': {
        display: 'flex',
    },
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: '100vh',
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

const adminButtonStyle = {
    ...commonButtonStyle,
    backgroundColor: '#c62828',
    color: '#fff',
    '&:hover': { backgroundColor: '#ff1744' }
};

const scrollbarStyle = {
    '&::-webkit-scrollbar': {
        width: '8px', // Ширина вертикального скролла
    },
    '&::-webkit-scrollbar-track': {
        background: '#1a1a1a', // Цвет дорожки (чуть темнее фона)
        borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb': {
        background: '#00bfa5', // Цвет ползунка (ваш основной зеленый)
        borderRadius: '10px',
        border: '2px solid #1a1a1a', // Отступ вокруг ползунка, чтобы он казался тоньше
    },
    '&::-webkit-scrollbar-thumb:hover': {
        background: '#009e8a', // Цвет при наведении
    },
    // Для Firefox
    scrollbarWidth: 'thin',
    scrollbarColor: '#00bfa5 #1a1a1a',
};

const Sidebar = ({ handleOpen, handleProfileOpen, handlePostOpen, handleCategoryOpen, handleResourcesOpen, handleFaqOpen, handleAdminOpen, isAdmin, currentUser }) => (
    <Box sx={sidebarStyle}>
        <Typography variant="h5" sx={{ color: '#00bfa5', fontWeight: 'bold', textAlign: 'center', mb: 4, letterSpacing: 1 }}>
            Lyambda
        </Typography>

        {currentUser ? (
            <Box sx={{ mb: 3, p: 2, bgcolor: '#2c2c2c', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                    src={buildAvatarUrl(API_BASE_URL, currentUser.pathAvatar ?? currentUser.PathAvatar)}
                    sx={{ bgcolor: '#00bfa5' }}
                    imgProps={{
                        onError: (e) => {
                            e.currentTarget.src = DEFAULT_AVATAR_SRC;
                        },
                    }}
                >
                    {currentUser.name[0]?.toUpperCase()}
                </Avatar>
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

        <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {isAdmin && (
                <Button
                    sx={adminButtonStyle}
                    startIcon={<DeleteOutlineIcon />}
                    onClick={handleAdminOpen}
                >
                    Админ-панель
                </Button>
            )}
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
            ml: Math.min(depth, 3) * 1.2,
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
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onReplySubmit(comment.commentId, replyInputs[comment.commentId] || '');
                            }
                        }}
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

        {comment.repliesOpen && comment.replies?.map((reply) => {
            const newDepth = depth + 1;
            return (
                <FeedCommentItem
                    key={reply.commentId}
                    comment={reply}
                    depth={newDepth}
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
            );
        })}
    </Box>
);

const CommentsFeedSidebar = ({
    variant = 'desktop',
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
}) => {
    const isDrawer = variant === 'drawer';

    const header = (
        <Box sx={{ px: 2, py: isDrawer ? 1.5 : 1.3, borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            <Typography variant="h6" sx={{ color: '#00e5c9', fontWeight: 700, fontSize: isDrawer ? '1.05rem' : undefined }}>
                Комментарии
            </Typography>
            <IconButton
                onClick={onClose}
                aria-label="Закрыть комментарии"
                sx={{
                    ml: 'auto',
                    color: '#bdbdbd',
                    minWidth: 44,
                    minHeight: 44,
                    transition: 'background-color 0.2s ease',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
                }}
            >
                <CloseIcon />
            </IconButton>
        </Box>
    );

    const titleBlock = (
        <Box sx={{ px: 2, pt: 1, pb: 1.5, borderBottom: '1px solid #333', flexShrink: 0 }}>
            <Typography
                variant="body2"
                sx={{
                    color: '#f5f5f5',
                    mt: 0.4,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
            >
                {activePost?.title}
            </Typography>
        </Box>
    );

    const inputBlock = (
        <Box
            sx={{
                p: 1.5,
                borderTop: isDrawer ? '1px solid #333' : undefined,
                borderBottom: !isDrawer ? '1px solid #333' : undefined,
                flexShrink: 0,
                backgroundColor: isDrawer ? '#181818' : 'transparent',
                pb: isDrawer ? 'calc(12px + env(safe-area-inset-bottom, 0px))' : 1.5,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1 }}>
                <TextField
                    label="Написать комментарий..."
                    variant="filled"
                    fullWidth
                    value={newCommentText}
                    onChange={(e) => onNewCommentTextChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            onCreateRootComment();
                        }
                    }}
                    sx={{
                        ...commentInputStyle,
                        '& .MuiFilledInput-root': {
                            ...commentInputStyle['& .MuiFilledInput-root'],
                            minHeight: isDrawer ? 48 : undefined,
                        },
                    }}
                />
                <Button
                    variant="contained"
                    onClick={onCreateRootComment}
                    sx={{
                        borderRadius: '10px',
                        backgroundColor: '#00bfa5',
                        minWidth: isDrawer ? 88 : undefined,
                        minHeight: 48,
                        alignSelf: 'stretch',
                        transition: 'background-color 0.2s ease',
                        '&:hover': { backgroundColor: '#009e8a' },
                    }}
                >
                    {isDrawer ? 'Отпр.' : 'Отпр.'}
                </Button>
            </Box>

            {commentsError && (
                <Typography sx={{ color: '#ff8a80', mt: 1, fontSize: '0.85rem' }}>{commentsError}</Typography>
            )}
        </Box>
    );

    const listBlock = (
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 1.5, ...scrollbarStyle }}>
            {commentsLoading ? (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                    <CircularProgress size={26} sx={{ color: '#00bfa5' }} />
                </Box>
            ) : commentsTree.length === 0 ? (
                <Typography sx={{ color: '#bdbdbd', fontSize: '0.9rem' }}>
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
    );

    return (
        <Box sx={isDrawer ? commentsDrawerInnerSx : commentsSidebarStyle}>
            {header}
            {titleBlock}
            {isDrawer ? (
                <>
                    {listBlock}
                    {inputBlock}
                </>
            ) : (
                <>
                    {inputBlock}
                    {listBlock}
                </>
            )}
        </Box>
    );
};

const PostPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
const [isResourcesModalOpen, setIsResourcesModalOpen] = useState(false);
const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
    const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
    const moreMenuLockRef = useRef(null);
    const moreMenuScrollTopRef = useRef(0);
    const theme = useTheme();
    const isDesktopLayout = useMediaQuery(theme.breakpoints.up(768));
    const isProfileModalOpenRef = useRef(false);
    
    const [viewedProfileId, setViewedProfileId] = useState(null); 
    const [articles, setArticles] = useState([]); 
    const [currentUser, setCurrentUser] = useState(null);
    
    const [pageNumber, setPageNumber] = useState(1);
    const [hasMore, setHasMore] = useState(true); // Есть ли еще данные для загрузки
    const pageSize = 10; // Размер страницы. Убедитесь, что он соответствует бэкенду.
    const [paginationType, setPaginationType] = useState('random'); // random | recommend | search | tags
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchQueryRef = useRef('');
    const lastNonSearchTypeRef = useRef('random');
    const lastFeedTypeRef = useRef('random');
    const [selectedTagIds, setSelectedTagIds] = useState([]);
    
    const [isLoading, setIsLoading] = useState(false); 
    const [error, setError] = useState(null);
    const [emptyStateMessage, setEmptyStateMessage] = useState('');
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
    const articlesRef = useRef([]);
    const hasMoreRef = useRef(hasMore);
    const feedCacheRef = useRef({ random: null, recommend: null });
    const switchRandomRecommendTabRef = useRef(() => {});

    useEffect(() => { articlesRef.current = articles; }, [articles]);
    useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);

    useEffect(() => {
        if (paginationType !== 'random' && paginationType !== 'recommend') return;
        feedCacheRef.current[paginationType] = {
            articles,
            pageNumber,
            hasMore,
            emptyStateMessage,
        };
    }, [articles, pageNumber, hasMore, emptyStateMessage, paginationType]);
    useEffect(() => { isProfileModalOpenRef.current = isProfileModalOpen; }, [isProfileModalOpen]);
    useEffect(() => { searchQueryRef.current = searchQuery; }, [searchQuery]);
    useEffect(() => {
        if (paginationType !== 'search') {
            lastNonSearchTypeRef.current = paginationType;
        }
        if (paginationType === 'random' || paginationType === 'recommend') {
            lastFeedTypeRef.current = paginationType;
        }
    }, [paginationType]);
    useEffect(() => {
        const container = articlesContainerRef.current;
        if (!container) return;
        if (moreMenuAnchor) {
            moreMenuScrollTopRef.current = container.scrollTop;
            moreMenuLockRef.current = {
                overflowY: container.style.overflowY,
                scrollBehavior: container.style.scrollBehavior,
                scrollSnapType: container.style.scrollSnapType,
            };
            container.style.overflowY = 'hidden';
            container.style.scrollBehavior = 'auto';
            container.style.scrollSnapType = 'none';
            requestAnimationFrame(() => {
                container.scrollTop = moreMenuScrollTopRef.current;
            });
            return;
        }
        if (moreMenuLockRef.current) {
            const { overflowY, scrollBehavior, scrollSnapType } = moreMenuLockRef.current;
            container.style.overflowY = overflowY;
            container.style.scrollBehavior = scrollBehavior;
            container.style.scrollSnapType = scrollSnapType;
            moreMenuLockRef.current = null;
        }
    }, [moreMenuAnchor]);
    const [returnToProfile, setReturnToProfile] = useState(false);
    const [returnProfileUserId, setReturnProfileUserId] = useState(null);
    const [profileReturnEnabled, setProfileReturnEnabled] = useState(false);
    const [profileReturnUserId, setProfileReturnUserId] = useState(null);

    // On mount: if URL contains ?article=<id>, try to open that article in detail view
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const articleId = params.get('article');
        if (!articleId) return;

        let cancelled = false;

        (async () => {
            // 1) try to find in already loaded articles
            let found = articlesRef.current.find(a => String(a.article_id) === String(articleId));
            if (found) {
                setSelectedPost(found);
                setIsViewingDetailPage(true);
                return;
            }

            // 2) try to fetch a single-article endpoint if available
            try {
                const singlePaths = [
                    `${API_BASE_URL}/Articles/getArticleById/${articleId}`,
                    `${API_BASE_URL}/Articles/GetArticleById/${articleId}`,
                    `${API_BASE_URL}/Articles/GetArticleById?id=${articleId}`,
                    `${API_BASE_URL}/Articles/get/${articleId}`,
                    `${API_BASE_URL}/Articles/getById/${articleId}`,
                    `${API_BASE_URL}/Articles/getArticle/${articleId}`,
                ];

                for (const p of singlePaths) {
                    try {
                        const r = await fetch(p, { credentials: 'include' });
                        if (!r.ok) continue;
                        const data = await r.json();
                        if (!data) continue;
                        const enriched = await enrichArticleData(data);
                        if (cancelled) return;
                        setSelectedPost(enriched);
                        setIsViewingDetailPage(true);
                        return;
                    } catch (e) {
                        // try next
                    }
                }
            } catch (e) {
                // ignore and fallback to pagination
            }

            // 3) fallback: paginate pages until we find the article
            let page = 1;
            while (!cancelled) {
                await fetchArticlesPage(page);
                const f = articlesRef.current.find(a => String(a.article_id) === String(articleId));
                if (f) {
                    setSelectedPost(f);
                    setIsViewingDetailPage(true);
                    return;
                }
                if (!hasMoreRef.current) break;
                page += 1;
            }
        })();

        return () => { cancelled = true; };
    }, []);
    const [feedReplyEditorOpen, setFeedReplyEditorOpen] = useState({});
    const [feedEditInputs, setFeedEditInputs] = useState({});
    const [feedEditEditorOpen, setFeedEditEditorOpen] = useState({});
    const feedCommentAuthorCacheRef = useRef({});

    const articlesContainerRef = useRef(null); 
    const postRefs = useRef({}); 
    const setPostRef = (id) => (el) => { postRefs.current[id] = el; };
    const lastCenteredIdRef = useRef(null);

    
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
        void checkAuth();
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
    const handleAdminOpen = () => setIsAdminPanelOpen(true);
    const handleAdminClose = () => setIsAdminPanelOpen(false);

    const handleProfileOpen = () => {
        if (!currentUser) {
            handleOpen();
        } else {
            setViewedProfileId(null); 
            setProfileReturnEnabled(false);
            setProfileReturnUserId(null);
            setIsProfileModalOpen(true);
            isProfileModalOpenRef.current = true;
        }
    };
    
    const handleProfileClose = () => {
        if (profileReturnEnabled) {
            setViewedProfileId(profileReturnUserId ?? null);
            setProfileReturnEnabled(false);
            setProfileReturnUserId(null);
            setIsProfileModalOpen(true);
            isProfileModalOpenRef.current = true;
            return;
        }
        setIsProfileModalOpen(false);
        isProfileModalOpenRef.current = false;
        setViewedProfileId(null);
        void checkAuth();
    };
    
    const handleOtherAuthorProfileOpen = (userId, options = {}) => {
        if (currentUser && currentUser.id === userId) {
            setViewedProfileId(null);
        } else {
            setViewedProfileId(userId);
        }
        if (options.returnToProfile) {
            setProfileReturnEnabled(true);
            setProfileReturnUserId(options.returnProfileUserId ?? null);
        } else {
            setProfileReturnEnabled(false);
            setProfileReturnUserId(null);
        }
        setIsProfileModalOpen(true);
        isProfileModalOpenRef.current = true;
    };

    const handlePostClick = (postData, options = {}, openComments = false) => { 
        setLastViewedArticleId(postData.article_id); 
        setSelectedPost(postData); 
        setIsViewingDetailPage(true);
        setReturnToProfile(!!options.returnToProfile);
        setReturnProfileUserId(options.profileUserId ?? null);
        setShouldOpenComments(openComments);
    };
    
    const handleBackToFeed = () => { 
        setSelectedPost(null); 
        setIsViewingDetailPage(false); 
        setShouldOpenComments(false);
        if (returnToProfile) {
            setViewedProfileId(returnProfileUserId ?? null);
            setIsProfileModalOpen(true);
        }
        setReturnToProfile(false);
        setReturnProfileUserId(null);
    };

    const handleSearchOpen = () => {
        setIsSearchMode(true);
    };

    const handleSearchSubmit = () => {
        const query = searchQuery.trim();
        setPaginationType('search');
        setArticles([]);
        setPageNumber(1);
        setHasMore(true);
        fetchArticlesPage(1, 'search', { force: true, searchQuery: query });
    };

    const handleApplyTagFilter = (tagIds) => {
        setSelectedTagIds(tagIds);
        setPaginationType('tags');
        setArticles([]);
        setPageNumber(1);
        setHasMore(true);
        fetchArticlesPage(1, 'tags', { force: true, tagIds });
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

    const handleScroll = useCallback(() => {
        if (isProfileModalOpen) return;
        const container = articlesContainerRef.current;
        
        if (container && !isViewingDetailPage) {
            const { scrollTop, scrollHeight, clientHeight } = container;
            
            const isNearBottom = scrollTop + clientHeight >= scrollHeight * 0.9; 

            if (isNearBottom && !isLoading && hasMore) {
                console.log('Достигнут низ ленты, загружаем следующую страницу...');
                fetchArticlesPage(pageNumber + 1);
            }
            // If user scrolled the feed while comments sidebar is open,
            // update the comments panel to the post currently centered in view.
            if (activeCommentsPost) {
                try {
                    const containerRect = container.getBoundingClientRect();
                    const containerCenterY = containerRect.top + container.clientHeight / 2;
                    let closestId = null;
                    let closestDist = Infinity;

                    Object.entries(postRefs.current).forEach(([id, el]) => {
                        if (!el) return;
                        const elRect = el.getBoundingClientRect();
                        const elCenter = elRect.top + (elRect.height || 0) / 2;
                        const dist = Math.abs(elCenter - containerCenterY);
                        if (dist < closestDist) {
                            closestDist = dist;
                            closestId = id;
                        }
                    });

                    const centeredId = closestId ? closestId : null; // keep as string key
                    if (centeredId && String(centeredId) !== String(activeCommentsPost?.article_id)) {
                        lastCenteredIdRef.current = centeredId;
                        const newPost = articles.find(a => String(a.article_id) === String(centeredId));
                        if (newPost) {
                            setActiveCommentsPost(newPost);
                            setFeedNewCommentText('');
                            setFeedReplyInputs({});
                            setFeedReplyEditorOpen({});
                            setFeedEditEditorOpen({});
                            setFeedEditInputs({});
                            // load comments for the newly centered post (async, don't await)
                            void loadFeedCommentsForPost(newPost);
                        }
                    }
                } catch (e) {
                    // swallow errors from measuring DOM during scroll
                }
            }
        }
    }, [activeCommentsPost, isViewingDetailPage, isLoading, hasMore, pageNumber, articles, isProfileModalOpen]);

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
    }, [handleScroll]);

    
    const enrichArticleData = async (article) => {
        const rawId = article.article_id ?? article.articleId ?? article.ArticleID;
        const rawAuthorId = article.author_id ?? article.authorId ?? article.AuthorID;
        const rawFilePath = article.file_path ?? article.filePath ?? article.FilePath;
        const fetchOptions = { credentials: 'include' };

        const authorReq = rawAuthorId
            ? fetch(`${API_BASE_URL}/Users/UserProfile/${rawAuthorId}`).then(r => r.json()).catch(() => ({}))
            : Promise.resolve({});
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
            article_id: rawId, 
            author_id: rawAuthorId, 
            nickname: authorData.name || 'Автор',
            authorAvatar: authorData.pathAvatar ?? authorData.PathAvatar ?? null,
            authorBio: authorData.aboutUser || 'Описание недоступно.',
            title: article.articleTitle || article.article_title || article.ArticleTitle || 'Нет названия', 
            article_preview: article.articlePreview || article.article_preview || article.ArticlePreview || 'Нет описания',
            article_content: article.article_content || article.articleContent || article.ArticleContent || '...', 
            likesCount: likeCountData.countLikes || 0,
            file_path: rawFilePath,
            articleImageUrl: buildArticleImageUrl(API_BASE_URL, rawFilePath),
            imageUrl: buildArticleImageUrl(API_BASE_URL, rawFilePath),
            isLiked: isLikedStatus, 
            commentsCount: article.countComments ?? article.commentsCount ?? article.comments_count ?? article.CountComments ?? 0,
            tags: article.article_tags || article.articleTags || article.ArticleTags || [], 
        };
    };

    const buildEmptyStateMessage = (type, options = {}) => {
        const { searchQuery: providedQuery } = options;
        const normalizedQuery = (providedQuery ?? searchQueryRef.current ?? '').trim();

        if (type === 'search') {
            return normalizedQuery
                ? `Статей по запросу «${normalizedQuery}» не найдено.`
                : 'Статей по такому запросу нет.';
        }

        if (type === 'tags') {
            return 'Статей с выбранными тегами не найдено.';
        }

        return 'Статей пока нет.';
    };

    // ✅ НОВАЯ ФУНКЦИЯ ЗАГРУЗКИ СТРАНИЦЫ
    const fetchArticlesPage = async (page, type = paginationType, options = {}) => {
        const { force = false, searchQuery: providedQuery, tagIds: providedTagIds } = options;
        if (!force && isProfileModalOpenRef.current) return;
        // Защита от повторной загрузки или загрузки несуществующих страниц
        if (isLoading || (!hasMore && page > pageNumber)) return; 

        setIsLoading(true);
        setError(null);
        setEmptyStateMessage('');
        
        try {
            let url = `${API_BASE_URL}/Articles/getPaginated?typePagination=${type}&page=${page}&size=${pageSize}`;
            if (type === 'search') {
                const q = (providedQuery ?? searchQueryRef.current).trim();
                if (!q) {
                    setArticles([]);
                    setHasMore(false);
                    setPageNumber(1);
                    setEmptyStateMessage(buildEmptyStateMessage(type, { searchQuery: q }));
                    return;
                }
                url = `${API_BASE_URL}/Articles/search?q=${encodeURIComponent(q)}&page=${page}&countPages=${pageSize}`;
            }
            if (type === 'tags') {
                const tagIds = Array.isArray(providedTagIds) ? providedTagIds : selectedTagIds;
                if (!tagIds || tagIds.length === 0) {
                    setArticles([]);
                    setHasMore(false);
                    setPageNumber(1);
                    setEmptyStateMessage(buildEmptyStateMessage(type));
                    return;
                }
                const params = new URLSearchParams();
                tagIds.forEach((id) => params.append('tags', id));
                params.set('page', page);
                params.set('pageSize', pageSize);
                url = `${API_BASE_URL}/Articles/searchbytags?${params.toString()}`;
            }
            const fetchOptions = { credentials: 'include' };
            const response = await fetch(url, fetchOptions);
            if (!response.ok) {
                const isEmptyResponse = (type === 'search' || type === 'tags') && (response.status === 404 || response.status === 204);
                if (isEmptyResponse) {
                    setArticles([]);
                    setHasMore(false);
                    setPageNumber(1);
                    const messageOptions = type === 'search'
                        ? { searchQuery: (providedQuery ?? searchQueryRef.current) }
                        : {};
                    setEmptyStateMessage(buildEmptyStateMessage(type, messageOptions));
                    return;
                }
                throw new Error(`Ошибка загрузки статей: ${response.statusText}`);
            }
            
            const data = await response.json(); 
            const newArticlesRaw = data.articles || [];
            if (newArticlesRaw.length === 0) {
                setArticles([]);
                setHasMore(false);
                setPageNumber(1);
                const messageOptions = type === 'search'
                    ? { searchQuery: (providedQuery ?? searchQueryRef.current) }
                    : {};
                setEmptyStateMessage(buildEmptyStateMessage(type, messageOptions));
                return;
            }
            
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

    const switchRandomRecommendTab = (type) => {
        if (type !== 'random' && type !== 'recommend') return;
        if (type === paginationType) return;
        if (isLoading) return;

        setPaginationType(type);
        setIsSearchMode(false);
        setSelectedTagIds([]);

        const cached = feedCacheRef.current[type];
        if (cached && cached.articles && cached.articles.length > 0) {
            setArticles(cached.articles);
            setPageNumber(cached.pageNumber);
            setHasMore(cached.hasMore);
            setEmptyStateMessage(cached.emptyStateMessage || '');
            setError(null);
            setIsLoading(false);
            queueMicrotask(() => {
                const el = articlesContainerRef.current;
                if (el) el.scrollTop = 0;
            });
            return;
        }

        if (cached && Array.isArray(cached.articles) && cached.articles.length === 0) {
            setArticles([]);
            setPageNumber(1);
            setHasMore(false);
            setEmptyStateMessage(cached.emptyStateMessage || '');
            setError(null);
            setIsLoading(false);
            queueMicrotask(() => {
                const el = articlesContainerRef.current;
                if (el) el.scrollTop = 0;
            });
            return;
        }

        setArticles([]);
        setPageNumber(1);
        setHasMore(true);
        setEmptyStateMessage('');
        setError(null);
        fetchArticlesPage(1, type, { force: true });
    };

    switchRandomRecommendTabRef.current = switchRandomRecommendTab;

    const handlePaginationTypeChange = (type) => {
        if (type === paginationType || isLoading) return;

        if (type === 'random' || type === 'recommend') {
            switchRandomRecommendTab(type);
            if (returnToProfile) {
                setViewedProfileId(returnProfileUserId ?? null);
                setIsProfileModalOpen(true);
            }
            setReturnToProfile(false);
            setReturnProfileUserId(null);
            return;
        }

        setPaginationType(type);
        if (type !== 'search') {
            setIsSearchMode(false);
        }
        if (type !== 'tags') {
            setSelectedTagIds([]);
        }
        setArticles([]);
        setPageNumber(1);
        setHasMore(true);
        fetchArticlesPage(1, type);
        if (returnToProfile) {
            setViewedProfileId(returnProfileUserId ?? null);
            setIsProfileModalOpen(true);
        }
        setReturnToProfile(false);
        setReturnProfileUserId(null);
    };

    const handleSearchClose = () => {
        setIsSearchMode(false);
        setSearchQuery('');
        const restoreType = lastNonSearchTypeRef.current || 'random';
        if (restoreType === 'random' || restoreType === 'recommend') {
            switchRandomRecommendTab(restoreType);
        } else {
            setPaginationType(restoreType);
            setArticles([]);
            setPageNumber(1);
            setHasMore(true);
            fetchArticlesPage(1, restoreType, { force: true });
        }
    };

    const handleMobileHomeNav = () => {
        if (isViewingDetailPage) {
            handleBackToFeed();
        } else if (isSearchMode) {
            handleSearchClose();
        } else if (paginationType === 'tags') {
            const targetFeedType = lastFeedTypeRef.current || 'random';
            handlePaginationTypeChange(targetFeedType);
        }
        setIsCategoryModalOpen(false);
    };

    const handleLikeToggle = async (rawId, currentIsLiked) => {
        const shouldFreezeFeed = isProfileModalOpenRef.current;
        if (!shouldFreezeFeed) {
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
        }

        const endpoint = currentIsLiked ? 'unLike' : 'like';
        try {
            const response = await fetch(`${API_BASE_URL}/Like/${endpoint}/${rawId}`, { 
                method: 'POST', 
                credentials: 'include' 
            }); 

            if (response.status === 401 || response.status === 403) {
                if (!shouldFreezeFeed) {
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
                }
                handleOpen();
                return; 
            }
            
            if (response.ok) {
                const res = await response.json();
                const realCount = res.countLikes;
                if (!shouldFreezeFeed) {
                    setArticles(prev => prev.map(a => 
                        a.article_id === rawId ? { ...a, likesCount: realCount } : a
                    ));
                    if (selectedPost?.article_id === rawId) {
                        setSelectedPost(prev => ({ ...prev, likesCount: realCount, isLiked: !currentIsLiked }));
                    }
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

    const getFeedCommentAuthorInfo = async (userId) => {
        if (feedCommentAuthorCacheRef.current[userId]) {
            return feedCommentAuthorCacheRef.current[userId];
        }

        try {
            const response = await fetch(`${API_BASE_URL}/Users/UserProfile/${userId}`, {
                credentials: 'include',
            });
            if (!response.ok) {
                const fallback = { name: 'Автор', avatar: null };
                feedCommentAuthorCacheRef.current[userId] = fallback;
                return fallback;
            }

            const data = await response.json();
            const info = {
                name: data.name || 'Автор',
                avatar: data.pathAvatar ?? data.PathAvatar ?? null,
            };
            feedCommentAuthorCacheRef.current[userId] = info;
            return info;
        } catch {
            const fallback = { name: 'Автор', avatar: null };
            feedCommentAuthorCacheRef.current[userId] = fallback;
            return fallback;
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

        const authorInfo = await getFeedCommentAuthorInfo(authorId);
        const isLiked = await getFeedCommentLikeStatus(commentId);

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
        if (trimmed.length < 2) {
            setFeedCommentsError('Комментарий должен быть не короче 2 символов');
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
        if (trimmed.length < 2) {
            setFeedCommentsError('Комментарий должен быть не короче 2 символов');
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

    const feedSwipeEnabled =
        !isDesktopLayout &&
        !isViewingDetailPage &&
        !isSearchMode &&
        !isLoading &&
        (paginationType === 'random' || paginationType === 'recommend');

    /** Вертикальный scroll-snap между статьями на мобильной ленте (свайп / инерция к следующей карточке). */
    const mobileArticleSnapEnabled =
        !isDesktopLayout && !isViewingDetailPage && articles.length > 0;

    const { dragOffset, swipeHandlers } = useFeedTabSwipe({
        enabled: feedSwipeEnabled,
        activeTab: paginationType === 'recommend' ? 'recommend' : 'random',
        scrollContainerRef: articlesContainerRef,
        threshold: 50,
        onSwipeLeft: () => switchRandomRecommendTabRef.current('recommend'),
        onSwipeRight: () => switchRandomRecommendTabRef.current('random'),
    });

    const feedCommentsSidebarProps = {
        activePost: activeCommentsPost,
        commentsTree: feedCommentsTree,
        commentsLoading: feedCommentsLoading,
        commentsError: feedCommentsError,
        newCommentText: feedNewCommentText,
        currentUserId: currentUser?.id,
        replyInputs: feedReplyInputs,
        replyEditorOpen: feedReplyEditorOpen,
        editInputs: feedEditInputs,
        editEditorOpen: feedEditEditorOpen,
        onNewCommentTextChange: setFeedNewCommentText,
        onCreateRootComment: handleFeedCreateRootComment,
        onReplyTextChange: handleFeedReplyChange,
        onToggleReplyEditor: handleFeedToggleReplyEditor,
        onReplySubmit: handleFeedReplySubmit,
        onEditTextChange: handleFeedEditChange,
        onToggleEditEditor: handleFeedToggleEditEditor,
        onEditSubmit: handleFeedEditSubmit,
        onDeleteComment: handleFeedDeleteComment,
        onCommentLikeToggle: handleFeedCommentLikeToggle,
        onCommentToggleReplies: handleFeedCommentToggleReplies,
        onClose: handleFeedCloseComments,
    };

    const mobileHomeActive = !isViewingDetailPage && !isSearchMode && paginationType !== 'search' && paginationType !== 'tags' && !isProfileModalOpen && !isCategoryModalOpen;
    const mobileSearchActive = isSearchMode || paginationType === 'search';
    const mobileCategoriesActive = isCategoryModalOpen || paginationType === 'tags';
    const mobileProfileActive = isProfileModalOpen;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#121212', overflow: 'hidden' }}>
            {!isViewingDetailPage && activeCommentsPost && isDesktopLayout && (
                <CommentsFeedSidebar variant="desktop" {...feedCommentsSidebarProps} />
            )}

            {!isViewingDetailPage && activeCommentsPost && !isDesktopLayout && (
                <SwipeableDrawer
                    anchor="bottom"
                    open={Boolean(activeCommentsPost)}
                    onClose={handleFeedCloseComments}
                    onOpen={() => {}}
                    disableDiscovery
                    PaperProps={{
                        sx: {
                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,
                            height: 'min(90vh, 720px)',
                            maxHeight: '90vh',
                            width: '100%',
                            maxWidth: '100vw',
                            overflow: 'hidden',
                            backgroundColor: '#1f1f1f',
                            transition: 'transform 0.25s ease-out',
                        },
                    }}
                >
                    <Box sx={{ height: '100%', maxWidth: '100vw' }}>
                        <CommentsFeedSidebar variant="drawer" {...feedCommentsSidebarProps} />
                    </Box>
                </SwipeableDrawer>
            )}

            <Box 
                sx={{ 
                    flex: 1, 
                    height: '100vh', 
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    scrollSnapType: 'none',
                    scrollPaddingTop: 0,
                    scrollPaddingBottom: 0,
                    '@media (max-width: 767.95px)': mobileArticleSnapEnabled
                        ? {
                            scrollSnapType: 'y mandatory',
                            scrollPaddingTop: 'calc(112px + env(safe-area-inset-top, 0px))',
                            scrollPaddingBottom: 'calc(88px + env(safe-area-inset-bottom, 0px))',
                        }
                        : {},
                    '@media (min-width: 768px)': {
                        scrollSnapType: 'y mandatory',
                    },
                    '&::-webkit-scrollbar': { display: 'none' }, 
                    msOverflowStyle: 'none', 
                    scrollbarWidth: 'none', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    scrollBehavior: 'smooth',
                    position: 'relative',
                    width: '100%',
                    maxWidth: '100vw',
                }}
                ref={articlesContainerRef} 
            >
                {!isViewingDetailPage && (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            '@media (min-width: 768px)': {
                                display: 'none',
                            },
                            position: 'sticky',
                            top: 0,
                            zIndex: 11,
                            width: '100%',
                            maxWidth: '100vw',
                            px: 1.25,
                            pt: 'calc(10px + env(safe-area-inset-top, 0px))',
                            pb: 1,
                            gap: 1,
                            background: 'linear-gradient(180deg, rgba(18,18,18,0.98) 0%, rgba(18,18,18,0.92) 92%, transparent 100%)',
                            borderBottom: '1px solid rgba(0, 191, 165, 0.12)',
                            backdropFilter: 'blur(12px)',
                            transition: 'background 0.25s ease',
                        }}
                    >
                        {isSearchMode ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                <IconButton
                                    onClick={handleSearchClose}
                                    aria-label="Назад"
                                    sx={{
                                        minWidth: 44,
                                        minHeight: 44,
                                        color: '#00e5c9',
                                        border: '1px solid rgba(0, 191, 165, 0.45)',
                                        transition: 'background-color 0.2s ease',
                                        '&:hover': { backgroundColor: 'rgba(0, 191, 165, 0.1)' },
                                    }}
                                >
                                    <ArrowBackIcon />
                                </IconButton>
                                <TextField
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSearchSubmit();
                                        }
                                    }}
                                    placeholder="Поиск статей..."
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    sx={{
                                        flex: 1,
                                        '& .MuiOutlinedInput-root': {
                                            color: '#f5f5f5',
                                            borderRadius: '12px',
                                            minHeight: 44,
                                            backgroundColor: 'rgba(0, 0, 0, 0.25)',
                                            transition: 'border-color 0.2s ease',
                                            '& fieldset': { borderColor: 'rgba(0, 191, 165, 0.4)' },
                                            '&:hover fieldset': { borderColor: '#00d4b4' },
                                            '&.Mui-focused fieldset': { borderColor: '#00e5c9' },
                                        },
                                        '& .MuiInputBase-input::placeholder': {
                                            color: '#b0b0b0',
                                            opacity: 1,
                                        },
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={handleSearchSubmit}
                                                    aria-label="Искать"
                                                    sx={{ color: '#00e5c9', minWidth: 44, minHeight: 44 }}
                                                >
                                                    <SearchIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                        ) : (
                            <>
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 800,
                                            letterSpacing: 0.5,
                                            color: '#00e5c9',
                                            fontSize: '1.15rem',
                                        }}
                                    >
                                        Lyambda
                                    </Typography>
                                    <Box sx={{ flex: 1 }} />
                                    <IconButton
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setMoreMenuAnchor(e.currentTarget);
                                        }}
                                        aria-label="Ещё"
                                        sx={{ minWidth: 44, minHeight: 44, color: '#e0f7f4' }}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                </Box>
                                {(paginationType === 'random' || paginationType === 'recommend') && (
                                    <MobileFeedSegmentedControl
                                        value={paginationType === 'recommend' ? 'recommend' : 'random'}
                                        disabled={isLoading}
                                        onChange={(next) => {
                                            if (next === 'random') {
                                                handlePaginationTypeChange('random');
                                            } else {
                                                handlePaginationTypeChange('recommend');
                                            }
                                        }}
                                    />
                                )}
                            </>
                        )}
                    </Box>
                )}

                {!isViewingDetailPage && (
                    <Box 
                        sx={{ 
                            position: 'sticky',
                            top: 0,
                            width: '100%',
                            display: 'none',
                            '@media (min-width: 768px)': {
                                display: 'flex',
                            },
                            justifyContent: 'center',
                            pt: 2,
                            pb: 2,
                            zIndex: 10,
                        }}
                    >
                        <Box sx={{ 
                            display: 'flex', 
                            gap: 2,
                            alignItems: 'center',
                            backdropFilter: 'blur(10px)',
                            backgroundColor: 'rgba(18, 18, 18, 0.7)',
                            borderRadius: '30px',
                            padding: '8px 12px',
                            border: '1px solid rgba(0, 191, 165, 0.2)',
                            boxShadow: '0 8px 32px rgba(0, 191, 165, 0.1)',
                            transition: 'all 0.3s ease',
                        }}>
                            {isSearchMode ? (
                                <>
                                    <IconButton
                                        onClick={handleSearchClose}
                                        sx={{
                                            borderRadius: '50%',
                                            color: '#00bfa5',
                                            border: '1px solid rgba(0, 191, 165, 0.5)',
                                            '&:hover': { backgroundColor: 'rgba(0, 191, 165, 0.12)' }
                                        }}
                                    >
                                        <ArrowBackIcon />
                                    </IconButton>
                                    <TextField
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSearchSubmit();
                                            }
                                        }}
                                        placeholder="Поиск статей..."
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            minWidth: { xs: 220, sm: 360, md: 420 },
                                            '& .MuiOutlinedInput-root': {
                                                color: 'white',
                                                borderRadius: '25px',
                                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                                '& fieldset': { borderColor: 'rgba(0, 191, 165, 0.4)' },
                                                '&:hover fieldset': { borderColor: '#00d4b4' },
                                                '&.Mui-focused fieldset': { borderColor: '#00d4b4' },
                                            },
                                            '& .MuiInputBase-input::placeholder': {
                                                color: '#9e9e9e',
                                                opacity: 1,
                                            },
                                        }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={handleSearchSubmit}
                                                        sx={{ color: '#00bfa5' }}
                                                    >
                                                        <SearchIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant={paginationType === 'random' ? 'contained' : 'outlined'}
                                        onClick={() => handlePaginationTypeChange('random')}
                                        sx={{ 
                                            textTransform: 'none',
                                            borderRadius: '25px',
                                            px: 3,
                                            py: 1,
                                            fontWeight: 'bold',
                                            transition: 'all 0.3s ease',
                                            ...(paginationType === 'random' ? {
                                                backgroundColor: '#00bfa5',
                                                color: '#000',
                                                '&:hover': { backgroundColor: '#00d4b4' }
                                            } : {
                                                borderColor: '#00bfa5',
                                                color: '#00bfa5',
                                                '&:hover': { 
                                                    backgroundColor: 'rgba(0, 191, 165, 0.12)',
                                                    borderColor: '#00d4b4',
                                                    color: '#00d4b4'
                                                }
                                            })
                                        }}
                                    >
                                        Случайные
                                    </Button>
                                    <Button
                                        variant={paginationType === 'recommend' ? 'contained' : 'outlined'}
                                        onClick={() => handlePaginationTypeChange('recommend')}
                                        sx={{ 
                                            textTransform: 'none',
                                            borderRadius: '25px',
                                            px: 3,
                                            py: 1,
                                            fontWeight: 'bold',
                                            transition: 'all 0.3s ease',
                                            ...(paginationType === 'recommend' ? {
                                                backgroundColor: '#00bfa5',
                                                color: '#000',
                                                '&:hover': { backgroundColor: '#00d4b4' }
                                            } : {
                                                borderColor: '#00bfa5',
                                                color: '#00bfa5',
                                                '&:hover': { 
                                                    backgroundColor: 'rgba(0, 191, 165, 0.12)',
                                                    borderColor: '#00d4b4',
                                                    color: '#00d4b4'
                                                }
                                            })
                                        }}
                                    >
                                        Рекомендации
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={handleSearchOpen}
                                        sx={{ 
                                            textTransform: 'none',
                                            borderRadius: '25px',
                                            px: 3,
                                            py: 1,
                                            fontWeight: 'bold',
                                            transition: 'all 0.3s ease',
                                            borderColor: '#00bfa5',
                                            color: '#00bfa5',
                                            '&:hover': { 
                                                backgroundColor: 'rgba(0, 191, 165, 0.12)',
                                                borderColor: '#00d4b4',
                                                color: '#00d4b4'
                                            }
                                        }}
                                    >
                                        Поиск
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Box>
                )}

                {isViewingDetailPage && selectedPost ? (
                    <Box sx={{
                        width: '100%',
                        maxWidth: '680px',
                        boxSizing: 'border-box',
                        px: 1,
                        pb: 'calc(96px + env(safe-area-inset-bottom, 0px))',
                        '@media (min-width: 600px)': { px: 1.5 },
                        '@media (min-width: 768px)': { px: 0, pb: 2 },
                    }}
                    >
                        <PostDetailPage
                            post={selectedPost}
                            onBack={handleBackToFeed}
                            backLabel={returnToProfile ? 'Назад к профилю' : 'Назад к ленте'}
                            nickname={selectedPost.nickname}
                            authorId={selectedPost.author_id} 
                            authorAvatar={selectedPost.authorAvatar}
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
                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: { xs: '100%', sm: '650px' },
                            boxSizing: 'border-box',
                            px: 1,
                            pb: 'calc(100px + env(safe-area-inset-bottom, 0px))',
                            '@media (min-width: 600px)': {
                                px: 1.5,
                            },
                        '@media (min-width: 768px)': {
                            px: 0,
                            pb: 5,
                            mt: '20px',
                        },
                            transform: `translateX(${dragOffset}px)`,
                            transition: Math.abs(dragOffset) > 0.5
                                ? 'none'
                                : 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease',
                            touchAction: feedSwipeEnabled ? 'pan-y' : 'auto',
                        }}
                        {...(feedSwipeEnabled ? swipeHandlers : {})}
                    >
                        {articles.length === 0 && isLoading && (isDesktopLayout || (paginationType !== 'random' && paginationType !== 'recommend')) && (
                            <Typography sx={{ color: '#f5f5f5', textAlign: 'center', pt: 4 }}>
                                <CircularProgress sx={{ color: '#00bfa5' }} />
                            </Typography>
                        )}
                        {articles.length === 0 && isLoading && !isDesktopLayout && (paginationType === 'random' || paginationType === 'recommend') && (
                            <MobileFeedListSkeleton count={3} />
                        )}
                        {!isLoading && articles.length === 0 && !error && (
                            <Typography sx={{ color: '#f5f5f5', textAlign: 'center', pt: 4 }}>
                                {emptyStateMessage || (paginationType === 'search' ? 'Статьи не найдены.' : 'Статей пока нет.')}
                            </Typography>
                        )}
                        
                        {articles.map((post) => (
                            <Box
                                key={post.article_id}
                                ref={setPostRef(post.article_id)}
                                sx={{ 
                                    minHeight: 'auto',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'stretch',
                                    py: 1,
                                    px: 0,
                                    scrollSnapAlign: 'none',
                                    scrollSnapStop: 'normal',
                                    '@media (max-width: 767.95px)': {
                                        minHeight:
                                            'calc(100dvh - 112px - env(safe-area-inset-top, 0px) - 88px - env(safe-area-inset-bottom, 0px))',
                                        scrollSnapAlign: 'start',
                                        scrollSnapStop: 'always',
                                    },
                                    '@media (min-width: 768px)': {
                                        minHeight: '100vh',
                                        alignItems: 'center',
                                        py: '20px',
                                        scrollSnapAlign: 'center',
                                    },
                                }}
                            >
                                <PostCard
                                    {...post}
                                    authorId={post.author_id} 
                                    onAuthorClick={handleOtherAuthorProfileOpen} 
                                    onClick={() => handlePostClick(post)}
                                    onCommentClick={() => handleOpenCommentsSidebar(post)}
                                    onLike={() => handleLikeToggle(post.article_id, post.isLiked)}
                                    showRepost={false}
                                />
                            </Box>
                        ))}
                        
                        {isLoading && articles.length > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                <CircularProgress size={30} sx={{ color: '#00bfa5' }} />
                            </Box>
                        )}
                        
                        {!hasMore && articles.length > 0 && <Typography sx={{ color: '#f5f5f5', textAlign: 'center', py: 4 }}>Это все статьи!</Typography>}
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
                handleAdminOpen={handleAdminOpen}
                isAdmin={currentUser?.role === 'Admin'}
                currentUser={currentUser}
            />

            <Menu
                anchorEl={moreMenuAnchor}
                open={Boolean(moreMenuAnchor)}
                onClose={() => setMoreMenuAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                    paper: {
                        sx: {
                            mt: 1,
                            minWidth: 220,
                            backgroundColor: '#1e1e1e',
                            border: '1px solid rgba(0, 191, 165, 0.25)',
                            borderRadius: 2,
                            color: '#f5f5f5',
                        },
                    },
                }}
            >
                <MenuItem
                    onClick={() => {
                        setMoreMenuAnchor(null);
                        handleResourcesOpen();
                    }}
                    sx={{ minHeight: 48, transition: 'background-color 0.2s ease' }}
                >
                    <ListItemIcon sx={{ color: '#00e5c9' }}>
                        <MenuBookIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '0.95rem' }} primary="Полезные материалы" />
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setMoreMenuAnchor(null);
                        handleFaqOpen();
                    }}
                    sx={{ minHeight: 48 }}
                >
                    <ListItemIcon sx={{ color: '#00e5c9' }}>
                        <HelpOutlineIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: '0.95rem' }} primary="FAQ" />
                </MenuItem>
                {currentUser?.role === 'Admin' && (
                    <MenuItem
                        onClick={() => {
                            setMoreMenuAnchor(null);
                            handleAdminOpen();
                        }}
                        sx={{ minHeight: 48 }}
                    >
                        <ListItemIcon sx={{ color: '#ff8a80' }}>
                            <AdminPanelSettingsIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primaryTypographyProps={{ fontSize: '0.95rem' }} primary="Админ-панель" />
                    </MenuItem>
                )}
            </Menu>

            <MobileBottomNav
                hidden={isDesktopLayout}
                homeActive={mobileHomeActive}
                searchActive={mobileSearchActive}
                categoriesActive={mobileCategoriesActive}
                profileActive={mobileProfileActive}
                onHome={handleMobileHomeNav}
                onSearch={() => {
                    if (isViewingDetailPage) {
                        handleBackToFeed();
                    }
                    handleSearchOpen();
                }}
                onCreate={handlePostOpen}
                onCategories={() => {
                    if (isViewingDetailPage) {
                        handleBackToFeed();
                    }
                    handleCategoryOpen();
                }}
                onProfile={() => {
                    if (isViewingDetailPage) {
                        handleBackToFeed();
                    }
                    handleProfileOpen();
                }}
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
                    setTimeout(() => fetchArticlesPage(1, paginationType, { force: true, searchQuery: searchQueryRef.current }), 0);
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

            <CategoryModal
                open={isCategoryModalOpen}
                handleClose={handleCategoryClose}
                selectedTags={selectedTagIds}
                onApply={handleApplyTagFilter}
            />
            <ResourcesModal open={isResourcesModalOpen} handleClose={handleResourcesClose} />
            <FaqModal open={isFaqModalOpen} handleClose={handleFaqClose} />
            <AdminPanelModal open={isAdminPanelOpen} handleClose={handleAdminClose} />
            
        </Box>
    );
};

export default PostPage;

