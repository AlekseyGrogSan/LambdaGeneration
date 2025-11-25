import React, { useState } from 'react';
import {
    Box, AppBar, Toolbar, InputBase, IconButton, Button, Typography, Link as MuiLink,
    Modal, TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';

import PostCard from './PostCard';
import PostDetailPage from './PostDetailPage';


// --- СТИЛИ ДЛЯ ПОЛЕЙ ВВОДА ---
const inputStyle = {
    '& .MuiFilledInput-root': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        borderRadius: '8px',
    },
};

// --- КОМПОНЕНТ: Регистрация (RegistrationModal) ---
const RegistrationModal = ({ open, handleClose }) => {

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: '#383838', // Цвет фона карточек
        borderRadius: '16px',
        boxShadow: 24,
        p: 4,
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="registration-modal-title"
        >
            <Box sx={modalStyle}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography id="registration-modal-title" variant="h5" component="h2" sx={{ color: '#ffffff', fontWeight: 300 }}>
                        Регистрация
                    </Typography>
                    <IconButton onClick={handleClose} sx={{ color: '#bdbdbd' }}><CloseIcon /></IconButton>
                </Box>

                <TextField
                    label="Логин"
                    variant="filled"
                    fullWidth
                    sx={inputStyle}
                />
                <TextField
                    label="Email"
                    variant="filled"
                    type="email"
                    fullWidth
                    sx={inputStyle}
                />
                <TextField
                    label="Пароль"
                    variant="filled"
                    type="password"
                    fullWidth
                    sx={inputStyle}
                />
                <TextField
                    label="Повторите пароль"
                    variant="filled"
                    type="password"
                    fullWidth
                    sx={inputStyle}
                />

                <Button
                    variant="contained"
                    fullWidth
                    sx={{ marginTop: 1, backgroundColor: '#00bfa5', '&:hover': { backgroundColor: '#009688' }, color: '#ffffff' }}
                    onClick={handleClose}
                >
                    Зарегистрироваться
                </Button>
            </Box>
        </Modal>
    );
};

const PostCreationModal = ({ open, handleClose }) => {
    // Этот компонент будет заменен в C1.5
    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', p: 4}}>
                <Typography variant="h6">Форма публикации (Заглушка)</Typography>
                <Button onClick={handleClose}>Закрыть</Button>
            </Box>
        </Modal>
    );
};

// --- ИСХОДНЫЕ ДАННЫЕ ПОСТОВ ---
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


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);

    const handleOpen = () => setIsModalOpen(true);
    const handleClose = () => setIsModalOpen(false);

    const handlePostOpen = () => setIsPostModalOpen(true);
    const handlePostClose = () => setIsPostModalOpen(false);

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
                    <PostDetailPage post={selectedPost} onBack={handleBackToFeed} onLike={handleLikeToggle} />
                ) : (
                    <Box
                        sx={{ height: feedHeight, display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'scroll', scrollSnapType: 'y mandatory', }}
                    >
                        {posts.map(post => (
                            <Box key={post.id} sx={{ scrollSnapAlign: 'start', height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2, }}>
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

            <RegistrationModal open={isModalOpen} handleClose={handleClose} />
            <PostCreationModal open={isPostModalOpen} handleClose={handlePostClose} />
        </Box>
    );
};

export default PostPage;