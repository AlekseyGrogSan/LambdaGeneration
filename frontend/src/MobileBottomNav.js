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
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';

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
    color: 'var(--text-secondary)',
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
    color: active ? 'var(--accent-400)' : 'var(--text-secondary)',
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
    onThemeToggle,
    mode = 'dark',
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
                background: 'linear-gradient(180deg, transparent 0%, color-mix(in oklab, var(--bg-elevated) 82%, transparent) 18%, var(--bg-elevated) 100%)',
                borderTop: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-soft)',
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
                    color: homeActive ? 'var(--accent-400)' : 'var(--text-secondary)',
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
                    color: searchActive ? 'var(--accent-400)' : 'var(--text-secondary)',
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
                        border: '2px solid var(--ui-c123)',
                        background: 'linear-gradient(145deg, var(--accent-400) 0%, var(--accent-500) 55%, var(--accent-600) 100%)',
                        color: 'var(--ui-c15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 10px 28px color-mix(in oklab, var(--accent-500) 45%, transparent)',
                        transform: 'translateY(-12px)',
                        flexShrink: 0,
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        WebkitTapHighlightColor: 'transparent',
                        '&:active': {
                            transform: 'translateY(-10px) scale(0.96)',
                            boxShadow: '0 6px 18px color-mix(in oklab, var(--accent-500) 35%, transparent)',
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
                    color: categoriesActive ? 'var(--accent-400)' : 'var(--text-secondary)',
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
                onClick={onThemeToggle || onProfile}
                sx={{
                    ...NAV_ITEM_SX,
                    color: profileActive ? 'var(--accent-400)' : 'var(--text-secondary)',
                }}
            >
                {onThemeToggle ? (
                    mode === 'dark' ? <LightModeRoundedIcon sx={{ fontSize: 26 }} /> : <DarkModeRoundedIcon sx={{ fontSize: 26 }} />
                ) : isAuthenticated ? (
                    <Avatar
                        src={profileAvatarSrc || undefined}
                        sx={{
                            width: 26,
                            height: 26,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            bgcolor: 'var(--accent-500)',
                            color: 'var(--ui-c19)',
                            border: `1.5px solid ${profileActive ? 'var(--accent-400)' : 'var(--ui-c151)'}`,
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
                    {onThemeToggle ? 'Тема' : (isAuthenticated ? 'Профиль' : 'Вход/Профиль')}
                </Typography>
            </Box>
        </Box>
    );
};

export default MobileBottomNav;
