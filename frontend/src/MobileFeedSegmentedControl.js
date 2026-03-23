import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Segmented control: «Случайные» | «Рекомендации» — стиль liquid glass (матовое стекло, blur).
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
                p: '4px',
                borderRadius: '16px',
                overflow: 'hidden',
                isolation: 'isolate',
                boxSizing: 'border-box',
                minHeight: 48,
                backgroundColor: 'rgba(0, 191, 165, 0.08)',
                border: '1px solid rgba(0, 191, 165, 0.6)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
            }}
        >
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    top: 4,
                    bottom: 4,
                    left: 4,
                    width: 'calc((100% - 8px) / 2)',
                    borderRadius: '11px',
                    zIndex: 0,
                    backgroundColor: '#00bfa5',
                    boxShadow: '0 6px 14px rgba(0, 191, 165, 0.35)',
                    transition: 'transform 0.35s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.25s ease',
                    transform: isRandom ? 'translateX(0)' : 'translateX(100%)',
                    opacity: disabled ? 0.4 : 1,
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
                    borderRadius: '12px',
                    background: 'transparent',
                    cursor: disabled ? 'default' : 'pointer',
                    color: isRandom ? '#000000' : '#00bfa5',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    textAlign: 'center',
                    transition: 'color 0.28s ease, transform 0.15s ease',
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
                    borderRadius: '12px',
                    background: 'transparent',
                    cursor: disabled ? 'default' : 'pointer',
                    color: !isRandom ? '#000000' : '#00bfa5',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    textAlign: 'center',
                    transition: 'color 0.28s ease, transform 0.15s ease',
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
