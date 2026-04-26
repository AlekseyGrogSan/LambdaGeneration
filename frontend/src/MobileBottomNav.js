import React from 'react';
import { Avatar, Box, Typography } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HomeIcon from '@mui/icons-material/Home';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import FolderIcon from '@mui/icons-material/Folder';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PersonIcon from '@mui/icons-material/Person';

const NAV_ITEM_SX = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.25,
    minHeight: 48,
    py: 0.5,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: '#9e9e9e',
    transition: 'color 0.2s ease, transform 0.2s ease',
    WebkitTapHighlightColor: 'transparent',
    '&:active': {
        transform: 'scale(0.96)',
    },
};

const labelSx = (active) => ({
    fontSize: '0.65rem',
    fontWeight: active ? 700 : 500,
    lineHeight: 1.1,
    color: active ? '#00e5c9' : '#9e9e9e',
    transition: 'color 0.2s ease',
    textAlign: 'center',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});

/**
 * Fixed bottom navigation for mobile / tablet below md breakpoint.
 */
const MobileBottomNav = ({
    hidden = false,
    homeActive,
    searchActive,
    categoriesActive,
    profileActive,
    isAuthenticated = false,
    profileAvatarSrc = '',
    profileInitial = '',
    onHome,
    onSearch,
    onCreate,
    onCategories,
    onProfile,
}) => {
    if (hidden) return null;

    return (
        <Box
            component="nav"
            aria-label="Основная навигация"
            sx={{
                display: 'flex',
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1200,
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                px: 0.5,
                pt: 0.5,
                pb: 'calc(8px + env(safe-area-inset-bottom, 0px))',
                background: 'linear-gradient(180deg, rgba(18,18,18,0) 0%, rgba(18,18,18,0.92) 18%, #141414 100%)',
                borderTop: '1px solid rgba(0, 191, 165, 0.2)',
                boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(12px)',
                transition: 'transform 0.25s ease, opacity 0.25s ease',
            }}
        >
            <Box
                component="button"
                type="button"
                onClick={onHome}
                sx={{
                    ...NAV_ITEM_SX,
                    color: homeActive ? '#00e5c9' : '#9e9e9e',
                }}
            >
                {homeActive ? (
                    <HomeIcon sx={{ fontSize: 26 }} />
                ) : (
                    <HomeOutlinedIcon sx={{ fontSize: 26 }} />
                )}
                <Typography component="span" sx={labelSx(homeActive)}>
                    Главная
                </Typography>
            </Box>

            <Box
                component="button"
                type="button"
                onClick={onSearch}
                sx={{
                    ...NAV_ITEM_SX,
                    color: searchActive ? '#00e5c9' : '#9e9e9e',
                }}
            >
                {searchActive ? (
                    <SearchIcon sx={{ fontSize: 26 }} />
                ) : (
                    <SearchOutlinedIcon sx={{ fontSize: 26 }} />
                )}
                <Typography component="span" sx={labelSx(searchActive)}>
                    Поиск
                </Typography>
            </Box>

            <Box
                sx={{
                    width: 72,
                    flex: '0 0 72px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 0.25,
                    pb: 0.25,
                }}
            >
                <Box
                    component="button"
                    type="button"
                    onClick={onCreate}
                    aria-label="Создать публикацию"
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        border: '2px solid rgba(0, 191, 165, 0.85)',
                        background: 'linear-gradient(145deg, #00e5c9 0%, #00bfa5 55%, #008c7a 100%)',
                        color: '#0d0d0d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 10px 28px rgba(0, 191, 165, 0.45)',
                        transform: 'translateY(-12px)',
                        flexShrink: 0,
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        WebkitTapHighlightColor: 'transparent',
                        '&:active': {
                            transform: 'translateY(-10px) scale(0.96)',
                            boxShadow: '0 6px 18px rgba(0, 191, 165, 0.35)',
                        },
                    }}
                >
                    <AddIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography
                    component="span"
                    sx={{
                        ...labelSx(false),
                        marginTop: '-8px',
                    }}
                >
                    Создать
                </Typography>
            </Box>

            <Box
                component="button"
                type="button"
                onClick={onCategories}
                sx={{
                    ...NAV_ITEM_SX,
                    color: categoriesActive ? '#00e5c9' : '#9e9e9e',
                }}
            >
                {categoriesActive ? (
                    <FolderIcon sx={{ fontSize: 26 }} />
                ) : (
                    <FolderOutlinedIcon sx={{ fontSize: 26 }} />
                )}
                <Typography component="span" sx={{ ...labelSx(categoriesActive), fontSize: '0.62rem', maxWidth: 76, whiteSpace: 'normal', lineHeight: 1.05 }}>
                    Категории
                </Typography>
            </Box>

            <Box
                component="button"
                type="button"
                onClick={onProfile}
                sx={{
                    ...NAV_ITEM_SX,
                    color: profileActive ? '#00e5c9' : '#9e9e9e',
                }}
            >
                {isAuthenticated ? (
                    <Avatar
                        src={profileAvatarSrc || undefined}
                        sx={{
                            width: 26,
                            height: 26,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            bgcolor: '#00bfa5',
                            color: '#10211f',
                            border: `1.5px solid ${profileActive ? '#00e5c9' : 'rgba(158, 158, 158, 0.65)'}`,
                        }}
                        imgProps={{
                            onError: (e) => {
                                e.currentTarget.src = '/default-avatar.svg';
                            },
                        }}
                    >
                        {profileInitial}
                    </Avatar>
                ) : profileActive ? (
                    <PersonIcon sx={{ fontSize: 26 }} />
                ) : (
                    <PersonOutlineIcon sx={{ fontSize: 26 }} />
                )}
                <Typography component="span" sx={labelSx(profileActive)}>
                    {isAuthenticated ? 'Профиль' : 'Вход/Профиль'}
                </Typography>
            </Box>
        </Box>
    );
};

export default MobileBottomNav;
