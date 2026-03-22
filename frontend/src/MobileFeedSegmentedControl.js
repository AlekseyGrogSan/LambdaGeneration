import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Segmented control: «Случайные» | «Рекомендации» с анимированным pill-индикатором.
 */
const MobileFeedSegmentedControl = ({ value, onChange, disabled = false }) => {
    const isRandom = value === 'random';

    return (
        <Box
            role="tablist"
            aria-label="Тип ленты"
            sx={{
                position: 'relative',
                display: 'flex',
                width: '100%',
                p: '5px',
                borderRadius: '14px',
                backgroundColor: 'rgba(40, 40, 40, 0.95)',
                border: '1px solid rgba(0, 191, 165, 0.28)',
                boxSizing: 'border-box',
                minHeight: 48,
            }}
        >
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    top: 5,
                    bottom: 5,
                    left: 5,
                    width: 'calc(50% - 7px)',
                    borderRadius: '10px',
                    background: 'linear-gradient(145deg, #00e5c9 0%, #00bfa5 100%)',
                    boxShadow: '0 4px 14px rgba(0, 191, 165, 0.35)',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease',
                    transform: isRandom ? 'translateX(0)' : 'translateX(calc(100% + 10px))',
                    opacity: disabled ? 0.45 : 1,
                    pointerEvents: 'none',
                }}
            />
            <Box
                component="button"
                type="button"
                role="tab"
                aria-selected={isRandom}
                disabled={disabled}
                onClick={() => onChange('random')}
                sx={{
                    flex: 1,
                    zIndex: 1,
                    minHeight: 44,
                    border: 'none',
                    borderRadius: '10px',
                    background: 'transparent',
                    cursor: disabled ? 'default' : 'pointer',
                    color: isRandom ? '#0a0a0a' : '#e0f7f4',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    transition: 'color 0.25s ease, transform 0.15s ease',
                    WebkitTapHighlightColor: 'transparent',
                    '&:active': { transform: disabled ? 'none' : 'scale(0.98)' },
                }}
            >
                <Typography component="span" sx={{ fontWeight: 'inherit', fontSize: 'inherit', color: 'inherit' }}>
                    Случайные
                </Typography>
            </Box>
            <Box
                component="button"
                type="button"
                role="tab"
                aria-selected={!isRandom}
                disabled={disabled}
                onClick={() => onChange('recommend')}
                sx={{
                    flex: 1,
                    zIndex: 1,
                    minHeight: 44,
                    border: 'none',
                    borderRadius: '10px',
                    background: 'transparent',
                    cursor: disabled ? 'default' : 'pointer',
                    color: !isRandom ? '#0a0a0a' : '#e0f7f4',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    transition: 'color 0.25s ease, transform 0.15s ease',
                    WebkitTapHighlightColor: 'transparent',
                    '&:active': { transform: disabled ? 'none' : 'scale(0.98)' },
                }}
            >
                <Typography component="span" sx={{ fontWeight: 'inherit', fontSize: 'inherit', color: 'inherit' }}>
                    Рекомендации
                </Typography>
            </Box>
        </Box>
    );
};

export default MobileFeedSegmentedControl;
