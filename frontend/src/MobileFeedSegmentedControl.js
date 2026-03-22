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
                p: '5px',
                borderRadius: '18px',
                overflow: 'hidden',
                isolation: 'isolate',
                boxSizing: 'border-box',
                minHeight: 48,
                background:
                    'linear-gradient(155deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 42%, rgba(0,229,201,0.06) 100%)',
                backdropFilter: 'blur(22px) saturate(190%)',
                WebkitBackdropFilter: 'blur(22px) saturate(190%)',
                border: '1px solid rgba(255, 255, 255, 0.24)',
                boxShadow: `
                    inset 0 1px 0 rgba(255, 255, 255, 0.28),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.12),
                    0 4px 24px rgba(0, 0, 0, 0.22),
                    0 0 0 0.5px rgba(0, 229, 201, 0.08)
                `,
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    pointerEvents: 'none',
                    background:
                        'linear-gradient(105deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 38%, rgba(255,255,255,0.06) 55%, rgba(255,255,255,0) 85%)',
                    opacity: 0.85,
                },
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
                    borderRadius: '12px',
                    zIndex: 0,
                    background:
                        'linear-gradient(168deg, rgba(0, 245, 220, 0.52) 0%, rgba(0, 191, 165, 0.42) 45%, rgba(0, 229, 201, 0.38) 100%)',
                    backdropFilter: 'blur(14px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(14px) saturate(160%)',
                    border: '1px solid rgba(255, 255, 255, 0.38)',
                    boxShadow: `
                        inset 0 1px 0 rgba(255, 255, 255, 0.45),
                        inset 0 -1px 0 rgba(0, 0, 0, 0.08),
                        0 6px 20px rgba(0, 191, 165, 0.28),
                        0 2px 8px rgba(0, 0, 0, 0.15)
                    `,
                    transition: 'transform 0.35s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.25s ease',
                    transform: isRandom ? 'translateX(0)' : 'translateX(calc(100% + 10px))',
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
                    color: isRandom ? 'rgba(6, 18, 16, 0.92)' : 'rgba(224, 247, 244, 0.78)',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    textShadow: isRandom ? '0 1px 0 rgba(255,255,255,0.25)' : 'none',
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
                    color: !isRandom ? 'rgba(6, 18, 16, 0.92)' : 'rgba(224, 247, 244, 0.78)',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    textShadow: !isRandom ? '0 1px 0 rgba(255,255,255,0.25)' : 'none',
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
