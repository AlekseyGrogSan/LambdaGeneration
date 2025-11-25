import React, { useState } from 'react';
import {
    Box, AppBar, Toolbar, InputBase, IconButton, Button, Typography, Link as MuiLink,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PostCard from './PostCard';
import PostDetailPage from './PostDetailPage';


// --- СТИЛИ ДЛЯ ПОЛЕЙ ВВОДА (Будет использоваться в модальных окнах, пока пустая) ---
const inputStyle = {
    '& .MuiFilledInput-root': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        borderRadius: '8px',
    },
};

// --- ИСХОДНЫЕ ДАННЫЕ ПОСТОВ (Минимум для теста) ---
const initialPostData = [
    { id: 1, nickname: 'Иван', title: 'Nissan 350Z on RDS GP', imageUrl: 'https://images.unsplash.com/photo-1549488314-e53ed42e6126', likesCount: 0, commentsCount: 0, isLiked: false },
    { id: 2, nickname: 'Петр', title: 'Старые времена на BMW E30', imageUrl: 'https://via.placeholder.com/700x400/00bfa5/ffffff?text=Post+2', likesCount: 0, commentsCount: 0, isLiked: false },
];

// --- СТИЛИ: Боковая панель (Sidebar) ---
const sidebarStyle = {
    width: '250px', backgroundColor: '#333333', padding: 2, display: 'flex', flexDirection: 'column', minHeight: '100vh',
};
const sidebarButtonStyle = {
    backgroundColor: '#00bfa5', color: 'white', fontWeight: 'bold', '&:hover': { backgroundColor: '#009688' }, borderRadius: '8px', textTransform: 'none', justifyContent: 'flex-start', padding: '10px 15px',
};
const profileButtonStyle = {
    ...sidebarButtonStyle, backgroundColor: '#333333', border: '2px solid #00bfa5', color: '#00bfa5', '&:hover': { backgroundColor: 'rgba(0, 191, 165, 0.1)' },
};


const PostPage = () => {
    const [posts] = useState(initialPostData);
    const [selectedPostId, setSelectedPostId] = useState(null);

    // ЗАГЛУШКИ для модальных окон
    const handleOpen = () => console.log('Open Modal');
    const handlePostOpen = () => console.log('Open Post Modal');

    // ЗАГЛУШКА для лайков
    const handleLikeToggle = (postId) => { console.log(`Like toggled for ${postId}`); };

    // Логика навигации
    const handlePostClick = (id) => setSelectedPostId(id);
    const handleBackToFeed = () => setSelectedPostId(null);

    const toolbarHeight = 64;
    const feedHeight = `calc(100vh - ${toolbarHeight}px)`;
    const selectedPost = posts.find(post => post.id === selectedPostId);
    const isViewingDetailPage = selectedPostId !== null;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#555555' }}>

            {/* -------------------- ОСНОВНАЯ КОНТЕНТНАЯ ЧАСТЬ -------------------- */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

                {/* 1. Верхняя панель (AppBar) */}
                <AppBar position="static" sx={{ backgroundColor: '#333333', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>
                    <Toolbar>
                        <InputBase
                            placeholder="Поиск"
                            sx={{ flexGrow: 1, color: 'white', backgroundColor: '#555555', borderRadius: '8px', padding: '5px 15px', marginRight: 2 }}
                            startAdornment={<SearchIcon sx={{ color: '#00bfa5', marginRight: 1 }} />}
                        />
                        <IconButton color="inherit"><MoreVertIcon sx={{ color: '#00bfa5' }} /></IconButton>
                    </Toolbar>
                </AppBar>

                {/* 2. Основной контент: Условный рендеринг */}
                {isViewingDetailPage ? (
                    // >>>>> ИЗМЕНЕНИЕ C1.3: Используем PostDetailPage
                    <PostDetailPage post={selectedPost} onBack={handleBackToFeed} onLike={handleLikeToggle} />
                ) : (
                    <Box
                        sx={{ height: feedHeight, display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'scroll', scrollSnapType: 'y mandatory', }}
                    >
                        {posts.map(post => (
                            <Box key={post.id} sx={{ scrollSnapAlign: 'start', height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2, }}>
                                {/* >>>>> ИЗМЕНЕНИЕ C1.3: Используем PostCard */}
                                <PostCard {...post} onClick={handlePostClick} onLike={handleLikeToggle} />
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>

            {/* -------------------- ПРАВАЯ ЧАСТЬ (Боковая панель) -------------------- */}
            <Box sx={sidebarStyle}>
                <Typography variant="h5" sx={{ color: '#00bfa5', fontWeight: 'bold', textAlign: 'right', marginBottom: 2 }}>
                    Lyambda
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}>
                    <Button variant="contained" sx={sidebarButtonStyle}>Категории</Button>
                    <Button variant="contained" sx={sidebarButtonStyle}>Статьи</Button>
                    <Button variant="contained" sx={sidebarButtonStyle}>Полезные материалы</Button>
                    <Button variant="contained" sx={sidebarButtonStyle}>FAQ</Button>
                </Box>

                <Box sx={{ borderTop: '1px solid #555555', margin: '16px 0' }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 2, }}>
                    <Button variant="outlined" sx={profileButtonStyle} startIcon={<PersonIcon />}>Мой профиль</Button>
                    <Button variant="outlined" sx={profileButtonStyle} startIcon={<CloudUploadIcon />} onClick={handlePostOpen}>
                        Опубликовать
                    </Button>
                    <Button variant="outlined" sx={profileButtonStyle} startIcon={<NotificationsIcon />}>Уведомления</Button>
                </Box>

                <Box sx={{ paddingTop: 2, borderTop: '1px solid #555555', textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#bdbdbd', marginBottom: 1 }}>
                        Нет аккаунта?
                    </Typography>
                    <MuiLink component="span" onClick={handleOpen} sx={{ color: '#00bfa5', cursor: 'pointer', fontWeight: 'bold' }}>
                        Зарегистрироваться
                    </MuiLink>
                </Box>

            </Box>
        </Box>
    );
};

export default PostPage;