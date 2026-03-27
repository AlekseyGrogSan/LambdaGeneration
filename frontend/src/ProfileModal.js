import React, { useState, useEffect, useRef } from 'react'; 
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
import DeleteIcon from '@mui/icons-material/Delete'; 
import VisibilityIcon from '@mui/icons-material/Visibility';
import PostCard from './PostCard'; 
import EditArticleModal from './EditArticleModal';
import EmailVerificationModal from './EmailVerificationModal'; 
import { buildArticleImageUrl, buildAvatarUrl, DEFAULT_AVATAR_SRC, formatBytes, isAvatarTooLarge, MAX_AVATAR_BYTES } from './avatarUtils';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

const modalStyle = {
    position: 'absolute',
    top: { xs: 0, sm: '50%' },
    left: { xs: 0, sm: '50%' },
    transform: { xs: 'none', sm: 'translate(-50%, -50%)' },
    width: { xs: '100vw', sm: '95%', md: 1200 }, 
    height: { xs: '100dvh', sm: 'auto' },
    maxHeight: { xs: '100dvh', sm: '90vh' }, 
    background: 'linear-gradient(180deg, rgba(34, 34, 34, 0.72), rgba(18, 18, 18, 0.82))',
    backdropFilter: 'blur(16px) saturate(120%)', 
    borderRadius: { xs: 0, sm: '16px' }, 
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.65)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    padding: '0', 
    color: 'white',
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    
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
    height: { xs: '390px', sm: '420px' }, 
    position: 'relative',
    '@media (hover: hover) and (pointer: fine)': {
        '&:hover .actions-overlay': { opacity: 1 }
    }
};

const sectionStyle = {
    p: { xs: 2, sm: 4 },
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
    border: '1px solid rgba(255, 255, 255, 0.18)',
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

const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

const flattenErrorMessages = (errors) => {
    if (!errors) return '';
    if (typeof errors === 'string') return errors;
    if (Array.isArray(errors)) {
        return errors.filter(Boolean).join(' ');
    }
    if (typeof errors === 'object') {
        return Object.entries(errors)
            .map(([field, value]) => {
                const messages = Array.isArray(value) ? value : [value];
                const joined = messages.filter(Boolean).join(' ');
                return joined ? `${field}: ${joined}` : '';
            })
            .filter(Boolean)
            .join(', ');
    }
    return '';
};

const extractApiErrorMessage = async (response) => {
    const clone = response.clone();
    try {
        const payload = await response.json();
        if (payload) {
            if (payload.message) return payload.message;
            if (payload.detail) return payload.detail;
            if (payload.error) return payload.error;
            const flattened = flattenErrorMessages(
                payload.errors ?? payload.Errors ?? payload.modelState ?? payload.response ?? payload
            );
            if (flattened) return flattened;
        }
    } catch (e) {
        // Ignore JSON parsing issues
    }

    try {
        const text = await clone.text();
        if (text) return text;
    } catch {
        // Ignore text parsing issues
    }

    return response.statusText || 'Ошибка';
};
const ProfileModal = ({ open, handleClose, userId, onUnauthorized, onLogout, onPostClick, onLikes, openProfile }) => {
    const profileModalRef = useRef(null);
    const isMyProfile = userId === null; 
    const [profileData, setProfileData] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [visiblePostsCount, setVisiblePostsCount] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editData, setEditData] = useState({ name: '', aboutUser: '' });
    const [emailEdit, setEmailEdit] = useState('');
    const [emailError, setEmailError] = useState(null);
    const [emailSuccess, setEmailSuccess] = useState(null);
    const [emailSending, setEmailSending] = useState(false);
    const [showEmailVerification, setShowEmailVerification] = useState(false);
    const [pendingEmail, setPendingEmail] = useState('');
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    
    const [editingPost, setEditingPost] = useState(null); 
    
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [deleteConfirmData, setDeleteConfirmData] = useState({ email: '', password: '' });
    const [isDeletingUser, setIsDeletingUser] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    
    const [isFollowingListOpen, setIsFollowingListOpen] = useState(false);
    const [followingList, setFollowingList] = useState([]);
    const [isFollowingListLoading, setIsFollowingListLoading] = useState(false);
    const [followingListError, setFollowingListError] = useState(null);
    const [isLikesListOpen, setIsLikesListOpen] = useState(false);
    const [likesList, setLikesList] = useState([]);
    const [isLikesListLoading, setIsLikesListLoading] = useState(false);
    const [likesListError, setLikesListError] = useState(null);
    const [likedArticlesCount, setLikedArticlesCount] = useState(0);
    const [isFollowingUser, setIsFollowingUser] = useState(false);
    const [isFollowBusy, setIsFollowBusy] = useState(false);

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [avatarError, setAvatarError] = useState(null);
    const authorProfileCache = useRef(new Map());
    
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
                aboutUser: profileJson.aboutUser || '' 
            });
            if (isMyProfile) {
                setEmailEdit(profileJson.email || '');
            }

            // 2. Посты
            const postsResponse = await fetch(postsEndpoint, fetchOptions);
            if (!postsResponse.ok) {
                setUserPosts([]); 
                return;
            }
            
            const postsJson = await postsResponse.json(); 
            const profileAvatar = profileJson.pathAvatar ?? profileJson.PathAvatar ?? null;
            const formattedPosts = (postsJson.articles || []).map(article => ({
                ...mapArticleFromApi(article, profileJson.name || 'Автор'),
                authorAvatar: profileAvatar,
            }));
            setUserPosts(formattedPosts);

            if (isMyProfile) {
                try {
                    const likesResponse = await fetch(`${API_BASE_URL}/Articles/likesArticles`, fetchOptions);
                    if (likesResponse.ok) {
                        const likesJson = await likesResponse.json();
                        const likedArticlesRaw = likesJson.articles || likesJson || [];
                        const mappedArticles = likedArticlesRaw.map(article => mapArticleFromApi(article));
                        const enrichedArticles = await Promise.all(mappedArticles.map(enrichArticleWithAuthorProfile));
                        setLikesList(enrichedArticles);
                        setLikedArticlesCount(enrichedArticles.length);
                    } else {
                        setLikesList([]);
                        setLikedArticlesCount(0);
                    }
                } catch {
                    setLikesList([]);
                    setLikedArticlesCount(0);
                }
            } else {
                setLikesList([]);
                setLikedArticlesCount(0);
            }

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
            setIsLikesListOpen(false);
            setLikesListError(null);
            setIsLikesListLoading(false);
            setEmailError(null);
            setEmailSuccess(null);
            setEmailSending(false);
            setShowEmailVerification(false);
            setPendingEmail('');
            setIsEmailModalOpen(false);
            setAvatarFile(null);
            setAvatarPreview('');
            setAvatarError(null);
            setVisiblePostsCount(10);
            fetchProfileData();
        }
    }, [open, userId]);

    useEffect(() => {
        return () => {
            if (avatarPreview && avatarPreview.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

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
    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (isAvatarTooLarge(file)) {
            setAvatarError(`Размер аватара не должен превышать ${formatBytes(MAX_AVATAR_BYTES)}.`);
            setAvatarFile(null);
            setAvatarPreview('');
            return;
        }

        setAvatarError(null);
        setAvatarFile(file);
        const nextPreview = URL.createObjectURL(file);
        setAvatarPreview((prev) => {
            if (prev && prev.startsWith('blob:')) {
                URL.revokeObjectURL(prev);
            }
            return nextPreview;
        });
    };

    const handleSaveProfile = async () => {
        if (avatarError) {
            setError(avatarError);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('name', editData.name || '');
            formData.append('email', profileData?.email || emailEdit || '');
            formData.append('aboutUser', editData.aboutUser ?? '');
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }
            const response = await fetch(`${API_BASE_URL}/Users`, {
                method: 'PUT', 
                credentials: 'include',
                body: formData
            });
            
            if (response.status === 401 || response.status === 403) {
                 handleClose(); 
                 if (onUnauthorized) onUnauthorized();
                 throw new Error('Сессия истекла.');
            }

            if (!response.ok) {
                const errorMsg = await extractApiErrorMessage(response);
                throw new Error(errorMsg || 'Не удалось обновить профиль.');
            }

            const updatedProfile = await response.json(); 
            setProfileData(updatedProfile);
            setEditData({ 
                name: updatedProfile.name, 
                aboutUser: updatedProfile.aboutUser || '' 
            });
            if (isMyProfile) {
                setEmailEdit(updatedProfile.email || '');
            }
            setAvatarFile(null);
            setAvatarPreview('');
            setAvatarError(null);
            setIsEditingProfile(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileModalClose = () => {
        if (isEditingProfile) {
            setIsEditingProfile(false);
            setEmailError(null);
            setEmailSuccess(null);
            return;
        }
        handleClose();
    };

    const handleOpenEmailModal = () => {
        setEmailError(null);
        setEmailSuccess(null);
        setEmailSending(false);
        setPendingEmail('');
        setShowEmailVerification(false);
        setIsEmailModalOpen(true);
    };

    const handleCloseEmailModal = () => {
        setIsEmailModalOpen(false);
        setEmailError(null);
        setEmailSuccess(null);
        setEmailSending(false);
        setPendingEmail('');
        setShowEmailVerification(false);
    };

    const handleSendEmailVerification = async () => {
        setEmailError(null);
        setEmailSuccess(null);

        if (!validateEmail(emailEdit)) {
            setEmailError('Введите корректный адрес электронной почты.');
            return;
        }
        if (emailEdit === profileData?.email) {
            setEmailError('Новый Email совпадает с текущим.');
            return;
        }

        setEmailSending(true);
        try {
            const response = await fetch(`${API_BASE_URL}/Users/resend-code`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(emailEdit),
                credentials: 'include',
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Не удалось отправить код подтверждения.');
            }

            setPendingEmail(emailEdit);
            setShowEmailVerification(true);
            setIsEmailModalOpen(false);
        } catch (err) {
            setEmailError(err.message || 'Не удалось отправить код подтверждения.');
        } finally {
            setEmailSending(false);
        }
    };

    const handleEmailVerificationSuccess = async () => {
        setShowEmailVerification(false);
        setIsEmailModalOpen(false);
        setEmailError(null);
        setEmailSuccess(null);
        setEmailSending(true);
        try {
            const formData = new FormData();
            formData.append('name', profileData?.name || editData.name || '');
            formData.append('email', pendingEmail || '');
            formData.append('aboutUser', editData.aboutUser ?? profileData?.aboutUser ?? '');
            const response = await fetch(`${API_BASE_URL}/Users`, {
                method: 'PUT',
                credentials: 'include',
                body: formData
            });

            if (response.status === 401 || response.status === 403) {
                handleClose();
                if (onUnauthorized) onUnauthorized();
                throw new Error('Сессия истекла.');
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Не удалось обновить Email.');
            }

            const updatedProfile = await response.json();
            setProfileData(updatedProfile);
            setEmailEdit(updatedProfile.email || pendingEmail);
            setEmailSuccess('Email успешно обновлен.');
        } catch (err) {
            setEmailError(err.message || 'Не удалось обновить Email.');
        } finally {
            setEmailSending(false);
            setPendingEmail('');
        }
    };

    // --- ARTICLE HANDLERS (опущен для краткости) ---
    
    const handleArticleUpdateSuccess = (articleId, updatedData) => {
        setUserPosts(prevPosts => 
            prevPosts.map(post => {
                if (post.id === articleId) {
                    const nextFilePath = updatedData.file_path ?? updatedData.filePath ?? updatedData.FilePath;
                    return { 
                        ...post, 
                        title: updatedData.article_title || updatedData.articleTitle || post.title,
                        article_preview: updatedData.article_preview || updatedData.articlePreview || post.article_preview,
                        article_content: updatedData.article_content || updatedData.articleContent || post.article_content,
                        tags: updatedData.article_tags || updatedData.articleTags || post.tags,
                        file_path: nextFilePath ?? post.file_path,
                        articleImageUrl: nextFilePath ? buildArticleImageUrl(API_BASE_URL, nextFilePath) : post.articleImageUrl
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

    const mapArticleFromApi = (article, fallbackNickname = 'Автор') => ({
        id: article.article_id ?? article.articleId ?? article.ArticleID,
        article_id: article.article_id ?? article.articleId ?? article.ArticleID,
        author_id: article.author_id ?? article.authorId ?? article.AuthorID,
        authorId: article.author_id ?? article.authorId ?? article.AuthorID,
        nickname: article.nickname || article.authorName || fallbackNickname,
        authorAvatar: article.pathAvatar ?? article.PathAvatar ?? article.authorAvatar ?? article.author_avatar ?? null,
        title: article.article_title ?? article.articleTitle ?? article.ArticleTitle,
        article_preview: article.article_preview ?? article.articlePreview ?? article.ArticlePreview,
        article_content: article.article_content ?? article.articleContent ?? article.ArticleContent,
        file_path: article.file_path ?? article.filePath ?? article.FilePath,
        articleImageUrl: buildArticleImageUrl(API_BASE_URL, article.file_path ?? article.filePath ?? article.FilePath),
        likesCount: article.countLikes ?? article.likesCount ?? 0,
        commentsCount: article.comments_count ?? article.commentsCount ?? 0,
        isLiked: article.is_liked ?? article.isLiked ?? false,
        tags: article.article_tags ?? article.articleTags ?? [],
    });

    const applyAuthorProfileToArticle = (article, profile) => {
        if (!profile) return article;
        const authorAvatar = profile.pathAvatar ?? profile.PathAvatar ?? profile.Pathavatar ?? profile.avatar ?? article.authorAvatar;
        const nickname = profile.name || profile.UserName || profile.userName || article.nickname || 'Автор';
        return {
            ...article,
            nickname,
            authorAvatar,
        };
    };

    const fetchAuthorProfile = async (authorId) => {
        if (!authorId) return null;
        const cacheKey = String(authorId);
        if (authorProfileCache.current.has(cacheKey)) {
            return authorProfileCache.current.get(cacheKey);
        }
        try {
            const response = await fetch(`${API_BASE_URL}/Users/UserProfile/${authorId}`, { credentials: 'include' });
            if (!response.ok) return null;
            const profile = await response.json();
            authorProfileCache.current.set(cacheKey, profile);
            return profile;
        } catch {
            return null;
        }
    };

    const enrichArticleWithAuthorProfile = async (article) => {
        if (!article?.author_id) return article;
        const profile = await fetchAuthorProfile(article.author_id);
        return applyAuthorProfileToArticle(article, profile);
    };

    const visiblePosts = userPosts.slice(0, visiblePostsCount);
    const canLoadMorePosts = visiblePostsCount < userPosts.length;
    const handleLoadMorePosts = () => {
        setVisiblePostsCount(prev => Math.min(prev + 10, userPosts.length));
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

    const handleOpenLikesList = async () => {
        if (!isMyProfile) return;
        setIsLikesListOpen(true);
        if (likesList.length > 0) return;
        setIsLikesListLoading(true);
        setLikesListError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/Articles/likesArticles`, { credentials: 'include' });
            if (response.status === 401 || response.status === 403) {
                if (onUnauthorized) onUnauthorized();
                throw new Error('Необходимо войти в аккаунт.');
            }
            if (!response.ok) throw new Error('Не удалось загрузить понравившиеся статьи.');
            const data = await response.json();
            const likedArticlesRaw = data.articles || data || [];
            const likedArticles = likedArticlesRaw.map(article => mapArticleFromApi(article));
            setLikesList(likedArticles);
            setLikedArticlesCount(likedArticles.length);
        } catch (err) {
            setLikesListError(err.message || 'Ошибка загрузки понравившихся статей.');
        } finally {
            setIsLikesListLoading(false);
        }
    };

    const handleCloseLikesList = () => setIsLikesListOpen(false);

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
            <Modal open={open} onClose={handleProfileModalClose}>
                <Box sx={modalStyle} ref={profileModalRef}>
                    
                    <IconButton
                        onClick={handleProfileModalClose}
                        sx={{ position: 'absolute', top: { xs: 8, sm: 15 }, right: { xs: 8, sm: 15 }, color: '#bdbdbd', zIndex: 5 }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {isMyProfile && isEditingProfile ? (
                        <Box
                            sx={{
                                p: { xs: 2, sm: 4 },
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                backdropFilter: 'blur(18px) saturate(120%)',
                                background: 'linear-gradient(180deg, rgba(32, 32, 32, 0.85), rgba(18, 18, 18, 0.9))',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '20px',
                                boxShadow: '0 18px 48px rgba(0, 0, 0, 0.55)',
                                margin: { xs: '12px', sm: '32px' },
                            }}
                        >
                            <Typography variant="h5" sx={{ color: '#00bfa5', fontWeight: 'bold', textAlign: 'center' }}>
                                Редактирование профиля
                            </Typography>

                            {error && <Alert severity="error">{error}</Alert>}
                            {avatarError && <Alert severity="error">{avatarError}</Alert>}

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                                    <Avatar
                                        src={buildAvatarUrl(API_BASE_URL, avatarPreview || profileData?.pathAvatar || profileData?.PathAvatar)}
                                        sx={{ width: 96, height: 96, border: '2px solid #00bfa5' }}
                                        imgProps={{
                                            onError: (e) => {
                                                e.currentTarget.src = DEFAULT_AVATAR_SRC;
                                            },
                                        }}
                                    />
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            sx={{ color: '#00bfa5', borderColor: '#00bfa5', '&:hover': { borderColor: '#009688', backgroundColor: 'rgba(0, 191, 165, 0.08)' } }}
                                        >
                                            Загрузить аватар
                                            <input hidden type="file" accept="image/*" onChange={handleAvatarChange} />
                                        </Button>
                                        {avatarFile && (
                                            <Typography variant="body2" sx={{ color: '#bdbdbd' }}>
                                                {avatarFile.name}
                                            </Typography>
                                        )}
                                        <Typography variant="caption" sx={{ color: '#7e7e7e' }}>
                                            Максимум {formatBytes(MAX_AVATAR_BYTES)}
                                        </Typography>
                                    </Box>
                                </Stack>
                                <TextField
                                    label="Имя пользователя"
                                    value={editData.name}
                                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                                    fullWidth
                                    variant="filled"
                                    sx={inputStyle}
                                />
                                <TextField
                                    label="О себе"
                                    value={editData.aboutUser}
                                    onChange={(e) => setEditData({...editData, aboutUser: e.target.value})}
                                    required={false}
                                    fullWidth
                                    multiline
                                    rows={4}
                                    variant="filled"
                                    sx={inputStyle}
                                />
                                <Button
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSaveProfile}
                                    disabled={isLoading}
                                    sx={{ bgcolor: '#00bfa5', '&:hover': { bgcolor: '#009688' } }}
                                >
                                    {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Сохранить изменения'}
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        <>

                    {/* --- ВЕРХНЯЯ ЧАСТЬ ПРОФИЛЯ (ИМЯ/EMAIL/ДАТА) --- */}
                    <Box sx={{ p: { xs: 2, sm: 4 }, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(180deg, #252525 0%, #1e1e1e 100%)' }}>
                        
                        <Avatar
                            src={buildAvatarUrl(API_BASE_URL, profileData?.pathAvatar ?? profileData?.PathAvatar)}
                            sx={{ width: 110, height: 110, border: '3px solid #00bfa5', mb: 2 }}
                            imgProps={{
                                onError: (e) => {
                                    e.currentTarget.src = DEFAULT_AVATAR_SRC;
                                },
                            }}
                        />

                        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5, textAlign: 'center', fontSize: { xs: '1.65rem', sm: '2.125rem' } }}>
                            {profileData.name}
                        </Typography>
                        {isMyProfile && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="h6" sx={{ color: '#00bfa5' }}>
                                    {profileData.email}
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={handleOpenEmailModal}
                                    sx={{
                                        color: '#00bfa5',
                                        border: '1px solid rgba(0, 191, 165, 0.4)',
                                        width: 30,
                                        height: 30,
                                        '&:hover': { backgroundColor: 'rgba(0, 191, 165, 0.12)' }
                                    }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        )}

                        <Typography variant="body1" sx={{ color: '#757575', mt: 1 }}>
                            На сайте с {new Date(profileData.createDate).toLocaleDateString()}
                        </Typography>

                        <Box sx={{ mt: 3, width: '100%', maxWidth: 720, mx: 'auto' }}>
                            <Grid container spacing={{ xs: 1.5, sm: 2 }} justifyContent="center">
                                <Grid item xs={12} sm={6} md={3}>
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
                                <Grid item xs={12} sm={6} md={3}>
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
                                <Grid item xs={12} sm={6} md={3}>
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
                                {isMyProfile && (
                                    <Grid item xs={12} sm={6} md={3}>
                                        <ButtonBase
                                            onClick={handleOpenLikesList}
                                            sx={{
                                                ...statCardStyle,
                                                display: 'block',
                                                cursor: 'pointer',
                                                '&:hover': { 
                                                    transform: 'translateY(-2px)', 
                                                    boxShadow: '0 14px 30px rgba(0,0,0,0.45)',
                                                    backgroundColor: 'rgba(0, 191, 165, 0.12)'
                                                }
                                            }}
                                        >
                                            <Stack spacing={0.5}>
                                                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                                    {likedArticlesCount}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#bdbdbd', letterSpacing: 0.3 }}>
                                                    Понравившиеся
                                                </Typography>
                                            </Stack>
                                        </ButtonBase>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>

                        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {isMyProfile ? (
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
                    <Box sx={{ ...sectionStyle, m: { xs: 1.5, sm: 3 }, textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ color: '#bdbdbd', fontWeight: 'bold', mb: 2 }}>
                            О себе
                        </Typography>
                        
                        <Typography variant="h6" sx={{ color: 'white', lineHeight: 1.6, maxWidth: 800, margin: '0 auto', fontWeight: 300 }}>
                            {profileData.aboutUser || 'Пользователь ничего о себе не добавил.'}
                        </Typography>
                    </Box>

                    <Divider sx={{ backgroundColor: '#333' }} />
                    
                    {/* --- ПУБЛИКАЦИИ --- */}
                    <Box sx={{ p: { xs: 2, sm: 4 } }}>
                        <Typography variant="h4" sx={{ mb: 3, color: '#00bfa5', fontWeight: 'bold' }}>
                            Публикации ({articlesCount})
                        </Typography>

                        <Grid container spacing={3}>
                            {userPosts.length > 0 ? (
                                visiblePosts.map((post) => (
                                    <Grid item xs={12} sm={6} lg={4} key={post.id}>
                                        <Box sx={cardContainerStyle}>
                                            <PostCard
                                                {...post}
                                                sx = {{ height: '100%' }}
                                                showImage={false}
                                                authorId={post.author_id} 
                                                onClick={() => {
                                                    if (isMyProfile) {
                                                        handleClose({ skipReturn: true });
                                                        if (onPostClick){
                                                            onPostClick(post, { returnToProfile: true, profileUserId: null });
                                                        }
                                                    } else {
                                                        handleClose({ skipReturn: true }); 
                                                        if (onPostClick){
                                                            onPostClick(post, { returnToProfile: true, profileUserId: userId });
                                                        }
                                                    }
                                                }}
                                                onLike={() => onLikes(post.article_id, post.isLiked)}
                                                showCommentAction={false}
                                                showRepost={false}
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
                                                        opacity: { xs: 1, sm: 0 },
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
                                                            handleClose({ skipReturn: true });
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
                        {canLoadMorePosts && (
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                                <Button
                                    variant="outlined"
                                    onClick={handleLoadMorePosts}
                                    sx={{
                                        color: '#00bfa5',
                                        borderColor: '#00bfa5',
                                        textTransform: 'none',
                                        '&:hover': { borderColor: '#00a38f', backgroundColor: 'rgba(0, 191, 165, 0.08)' }
                                    }}
                                >
                                    Показать еще
                                </Button>
                            </Box>
                        )}
                    </Box>


                    {/* --- КНОПКИ УПРАВЛЕНИЯ АККАУНТОМ --- */}
                    {isMyProfile && (
                        <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', borderTop: '1px solid #333' }}>
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
                        </>
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
                container={profileModalRef.current}
                disablePortal
            />

            <Modal open={isEmailModalOpen} onClose={handleCloseEmailModal}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '92%', sm: 420 },
                        p: 3,
                        borderRadius: '18px',
                        color: 'white',
                        backdropFilter: 'blur(18px) saturate(120%)',
                        background: 'linear-gradient(180deg, rgba(40, 40, 40, 0.85), rgba(20, 20, 20, 0.9))',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 18px 48px rgba(0, 0, 0, 0.55)',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ color: '#00bfa5', fontWeight: 'bold' }}>
                            Изменение Email
                        </Typography>
                        <IconButton onClick={handleCloseEmailModal} sx={{ ml: 'auto', color: '#bdbdbd' }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {emailError && <Alert severity="error" sx={{ mb: 1 }}>{emailError}</Alert>}
                    {emailSuccess && <Alert severity="success" sx={{ mb: 1 }}>{emailSuccess}</Alert>}

                    <TextField
                        label="Новый Email"
                        value={emailEdit}
                        onChange={(e) => setEmailEdit(e.target.value)}
                        fullWidth
                        variant="filled"
                        sx={{ ...inputStyle, mb: 2 }}
                    />

                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleSendEmailVerification}
                        disabled={emailSending}
                        sx={{ color: '#00bfa5', borderColor: '#00bfa5', '&:hover': { borderColor: '#00a38f', backgroundColor: 'rgba(0, 191, 165, 0.1)' } }}
                    >
                        {emailSending ? <CircularProgress size={22} sx={{ color: '#00bfa5' }} /> : 'Отправить код подтверждения'}
                    </Button>
                </Box>
            </Modal>

            <EmailVerificationModal
                open={showEmailVerification}
                handleClose={() => setShowEmailVerification(false)}
                email={pendingEmail}
                onVerificationSuccess={handleEmailVerificationSuccess}
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
                <DialogContent sx={{
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': { width: '8px' },
                    '&::-webkit-scrollbar-track': { background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px' },
                    '&::-webkit-scrollbar-thumb': { background: '#00bfa5', borderRadius: '10px' },
                    '&::-webkit-scrollbar-thumb:hover': { background: '#009688' }
                }}>
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
                                            <Avatar
                                                src={buildAvatarUrl(API_BASE_URL, user.pathAvatar ?? user.PathAvatar)}
                                                sx={{ bgcolor: '#00bfa5' }}
                                                imgProps={{
                                                    onError: (e) => {
                                                        e.currentTarget.src = DEFAULT_AVATAR_SRC;
                                                    },
                                                }}
                                            >
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

            <Dialog
                open={isLikesListOpen}
                onClose={handleCloseLikesList}
                PaperProps={{ sx: { backgroundColor: '#1b1b1b', color: 'white', borderRadius: '12px', minWidth: { xs: '90vw', sm: 520 } } }}
            >
                <DialogTitle sx={{ color: '#00bfa5', fontWeight: 'bold' }}>
                    Понравившиеся статьи
                </DialogTitle>
                <DialogContent sx={{
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': { width: '8px' },
                    '&::-webkit-scrollbar-track': { background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px' },
                    '&::-webkit-scrollbar-thumb': { background: '#00bfa5', borderRadius: '10px' },
                    '&::-webkit-scrollbar-thumb:hover': { background: '#009688' }
                }}>
                    {isLikesListLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress size={28} sx={{ color: '#00bfa5' }} />
                        </Box>
                    )}
                    {likesListError && <Alert severity="error" sx={{ mb: 2 }}>{likesListError}</Alert>}
                    {!isLikesListLoading && likesList.length === 0 && !likesListError && (
                        <Typography sx={{ color: '#bdbdbd', textAlign: 'center', py: 2 }}>
                            У вас пока нет понравившихся статей.
                        </Typography>
                    )}
                    {!isLikesListLoading && likesList.length > 0 && (
                        <List sx={{ width: '100%' }}>
                            {likesList.map((article) => (
                                <ListItem key={article.article_id || article.id} disablePadding>
                                    <ListItemButton
                                        onClick={() => {
                                            handleCloseLikesList();
                                            handleClose({ skipReturn: true });
                                            if (onPostClick) {
                                                onPostClick(article, { returnToProfile: true, profileUserId: null });
                                            }
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                src={buildAvatarUrl(API_BASE_URL, article.authorAvatar)}
                                                sx={{ bgcolor: '#00bfa5' }}
                                                imgProps={{
                                                    onError: (e) => {
                                                        e.currentTarget.src = DEFAULT_AVATAR_SRC;
                                                    },
                                                }}
                                            >
                                                {article.nickname?.[0]?.toUpperCase() || 'A'}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={article.title || 'Статья'}
                                            secondary={
                                                <span style={{ color: '#9e9e9e' }}>
                                                    @{article.nickname || 'Автор'} · Лайки: {article.likesCount ?? 0} · Комментарии: {article.commentsCount ?? 0}
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
                    <Button onClick={handleCloseLikesList} sx={{ color: '#00bfa5' }}>
                        Закрыть
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ProfileModal;




