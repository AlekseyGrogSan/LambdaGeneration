import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Segmented control: «Случайные» | «Рекомендации» — ближе к гамме desktop-версии.
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
                    'linear-gradient(180deg, rgba(26,26,26,0.96) 0%, rgba(16,16,16,0.92) 100%)',
                backdropFilter: 'blur(12px) saturate(160%)',
                WebkitBackdropFilter: 'blur(12px) saturate(160%)',
                border: '1px solid rgba(0, 191, 165, 0.32)',
                boxShadow: `
                    inset 0 1px 0 rgba(255, 255, 255, 0.08),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.28),
                    0 6px 22px rgba(0, 0, 0, 0.38),
                    0 0 0 0.5px rgba(0, 191, 165, 0.16)
                `,
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    pointerEvents: 'none',
                    background:
                        'linear-gradient(110deg, rgba(0,229,201,0.12) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.04) 60%, rgba(255,255,255,0) 90%)',
                    opacity: 0.55,
                },
                opacity: disabled ? 0.65 : 1,
            }}
        >
            <Box
                aria-hidden
                sx={{
                    position: 'absolute',
                    top: 5,
                    bottom: 5,
                    left: 5,
                    width: 'calc(50% - 5px)',
                    borderRadius: '12px',
                    zIndex: 0,
                    background:
                        'linear-gradient(135deg, #00e5c9 0%, #00bfa5 55%, #009f89 100%)',
                    backdropFilter: 'blur(10px) saturate(140%)',
                    WebkitBackdropFilter: 'blur(10px) saturate(140%)',
                    border: '1px solid rgba(0, 229, 201, 0.55)',
                    boxShadow: `
                        inset 0 1px 0 rgba(255, 255, 255, 0.45),
                        inset 0 -1px 0 rgba(0, 0, 0, 0.12),
                        0 8px 20px rgba(0, 191, 165, 0.35),
                        0 2px 10px rgba(0, 0, 0, 0.2)
                    `,
                    transition: 'transform 0.35s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.25s ease',
                    transform: isRandom ? 'translateX(0)' : 'translateX(100%)',
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
                    borderRadius: '12px',
                    background: 'transparent',
                    cursor: disabled ? 'default' : 'pointer',
                    color: isRandom ? 'rgba(6, 18, 16, 0.94)' : 'rgba(0, 229, 201, 0.78)',
                    fontWeight: 800,
                    fontSize: '0.8rem',
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
                    color: !isRandom ? 'rgba(6, 18, 16, 0.94)' : 'rgba(0, 229, 201, 0.78)',
                    fontWeight: 800,
                    fontSize: '0.8rem',
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
