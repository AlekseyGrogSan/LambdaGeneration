import React from 'react';
import {
    Box,
    Typography,
    Modal,
    IconButton,
    Button,
    Divider,
    Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PostCard from './PostCard'; // <-- ИМПОРТ PostCard для отображения постов

// --- ЗАГЛУШКА ДАННЫХ ---
const mockUserPosts = [
    { id: 101, title: 'Мой первый пост', imageUrl: 'https://picsum.photos/300/300?random=1', likesCount: 5, commentsCount: 2, isLiked: true, nickname: 'Имя Пользователя' },
    { id: 102, title: 'Второй пост о React', imageUrl: 'https://picsum.photos/300/300?random=2', likesCount: 15, commentsCount: 5, isLiked: false, nickname: 'Имя Пользователя' },
    { id: 103, title: 'Закат в горах', imageUrl: 'https://picsum.photos/300/300?random=3', likesCount: 8, commentsCount: 1, isLiked: true, nickname: 'Имя Пользователя' },
    { id: 104, title: 'Новый код', imageUrl: 'https://picsum.photos/300/300?random=4', likesCount: 22, commentsCount: 7, isLiked: false, nickname: 'Имя Пользователя' },
    { id: 105, title: 'Прогулка с друзьями', imageUrl: 'https://picsum.photos/300/300?random=5', likesCount: 12, commentsCount: 3, isLiked: true, nickname: 'Имя Пользователя' },
    { id: 106, title: 'Рабочий стол', imageUrl: 'https://picsum.photos/300/300?random=6', likesCount: 9, commentsCount: 0, isLiked: false, nickname: 'Имя Пользователя' },
];

// Обновленные стили для модального окна (шире и прокручиваемое)
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 1235 }, // Шире для постов
    maxHeight: '90vh', // Ограничиваем высоту видимой областью
    backgroundColor: '#1e1e1e',
    border: '1px solid #333',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
    padding: '10px',
    color: 'white',
    overflowY: 'auto', // Делаем контент модального окна прокручиваемым
};

const ProfileModal = ({
                          open,
                          handleClose,
                          nickname = "Имя Пользователя",
                          // Заглушка для описания "О себе"
                          bio = "Привет всем! Я разработчик интерфейсов. Люблю чистый код, минималистичный дизайн и кошек. Работаю над этим проектом в свободное время." ,
                          avatarUrl
                      }) => {

    const handleEditProfile = () => { console.log("Редактировать профиль"); handleClose(); };
    const handleLogout = () => { console.log("Выход"); handleClose(); };
    const handlePostClick = (postId) => { console.log(`Просмотр поста с ID: ${postId}`); };
    const handlePostLike = (postId) => { console.log(`Лайк посту с ID: ${postId}`); };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyle}>

                {/* Кнопка закрытия */}
                <IconButton
                    onClick={handleClose}
                    sx={{ position: 'absolute', top: 5, right: 5, color: '#bdbdbd' }}
                >
                    <CloseIcon />
                </IconButton>

                {/* Заголовок и Аватар */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 1, pt: 3 }}>

                    {/* Круглая Аватарка */}
                    {avatarUrl ? (
                        <Box
                            component="img"
                            src={avatarUrl}
                            sx={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', mb: 1.5 }}
                        />
                    ) : (
                        <AccountCircleIcon sx={{ fontSize: 80, color: '#00bfa5', mb: 1.5 }} />
                    )}

                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {nickname}
                    </Typography>

                    {/* Кнопка "Редактировать профиль" */}
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={handleEditProfile}
                        sx={{
                            mt: 1,
                            mb: 2,
                            color: '#00bfa5',
                            borderColor: '#00bfa5',
                            '&:hover': { borderColor: '#00a38f', backgroundColor: 'rgba(0, 191, 165, 0.1)' }
                        }}
                    >
                        Редактировать профиль
                    </Button>
                </Box>

                <Divider sx={{ backgroundColor: '#333', mb: 2 }} />

                {/* Секция "О Себе" / Bio */}
                <Box sx={{ px: 2, mb: 3, textAlign: 'center' }}>
                    <Typography variant="subtitle1" sx={{ color: '#bdbdbd', fontWeight: 'bold', mb: 1 }}>
                        О себе
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', lineHeight: 1.5 }}>
                        {bio}
                    </Typography>
                </Box>

                <Divider sx={{ backgroundColor: '#333', mb: 2 }} />

                {/* Заголовок секции постов */}
                <Typography variant="h6" sx={{ px: 2, mb: 2, color: '#00bfa5', fontWeight: 'bold' }}>
                    Публикации
                </Typography>

                {/* Сетка постов пользователя (Grid) */}
                <Grid container spacing={1} sx={{ px: 1, pb: 2 }}>
                    {mockUserPosts.map((post) => (
                        <Grid item xs={4} key={post.id}> {/* <-- 4 из 12 колонок = 3 поста в ряд */}
                            <PostCard
                                id={post.id}
                                nickname={post.nickname}
                                title={post.title}
                                imageUrl={post.imageUrl}
                                likesCount={post.likesCount}
                                commentsCount={post.commentsCount}
                                isLiked={post.isLiked}
                                onClick={handlePostClick}
                                onLike={handlePostLike}
                                isProfileView={true} // <--- ПЕРЕДАЕМ ФЛАГ, ЧТО ЭТО ПРОФИЛЬ
                            />
                        </Grid>
                    ))}
                </Grid>

                <Divider sx={{ backgroundColor: '#333', my: 1 }} />

                {/* Кнопка Выхода */}
                <Box sx={{ p: 1 }}>
                    <Button
                        fullWidth
                        variant="text"
                        startIcon={<LogoutIcon />}
                        onClick={handleLogout}
                        sx={{
                            justifyContent: 'flex-start',
                            color: '#ff5252',
                            '&:hover': { backgroundColor: 'rgba(255, 82, 82, 0.1)' }
                        }}
                    >
                        Выйти
                    </Button>
                </Box>

            </Box>
        </Modal>
    );
};

export default ProfileModal;