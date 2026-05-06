import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';

/**
 * Конфигурация ролей в стиле Telegram-тегов.
 *
 * Ключи соответствуют значениям UserTagExtensions.ToApiValue() на бэкенде:
 *   "admin"      → красный  (#ef5350)
 *   "dross-boss" → оранжевый (#ff9800)
 *   "user"       → зелёный  (#4caf50)
 *
 * resolveRoleConfig также понимает legacy-варианты:
 *   "Admin", "DrossBoss", "dross_boss", число 0/1/2
 */
export const ROLE_CONFIG = {
    admin: {
        label: 'Admin',
        color: '#ef5350',
        bg: 'rgba(239,83,80,0.12)',
        border: 'rgba(239,83,80,0.35)',
        Icon: AdminPanelSettingsIcon,
    },
    'dross-boss': {
        label: 'Dross-Boss',
        color: '#ff9800',
        bg: 'rgba(255,152,0,0.12)',
        border: 'rgba(255,152,0,0.35)',
        Icon: StarIcon,
    },
    user: {
        label: 'User',
        color: '#4caf50',
        bg: 'rgba(76,175,80,0.12)',
        border: 'rgba(76,175,80,0.35)',
        Icon: PersonIcon,
    },
};

/**
 * Нормализует любое представление роли к ключу ROLE_CONFIG.
 *
 * Принимает:
 *   API-строки:    "admin", "dross-boss", "user"
 *   PascalCase:    "Admin", "DrossBoss"
 *   snake_case:    "dross_boss"
 *   enum-числа:   0 (User), 1 (Admin), 2 (DrossBoss)
 *   null / undefined → null (бейдж не рендерится)
 */
const ENUM_MAP = { 0: 'user', 1: 'admin', 2: 'dross-boss' };

const ALIAS_MAP = {
    admin:      'admin',
    'dross-boss': 'dross-boss',
    dross_boss: 'dross-boss',
    drossboss:  'dross-boss',
    user:       'user',
};

export const resolveRoleConfig = (role) => {
    if (role === null || role === undefined || role === '') return null;

    // числовой enum
    if (typeof role === 'number' || (typeof role === 'string' && /^\d+$/.test(role))) {
        const key = ENUM_MAP[Number(role)];
        return key ? ROLE_CONFIG[key] : ROLE_CONFIG.user;
    }

    const lower = String(role).toLowerCase().replace(/\s+/g, '');
    const key = ALIAS_MAP[lower];
    return key ? ROLE_CONFIG[key] : ROLE_CONFIG.user;
};

/**
 * UserRoleBadge — тег роли в стиле Telegram.
 *
 * Props:
 *   role        {string}  — значение поля `tag` из API (ToApiValue()):
 *                           "admin" | "dross-boss" | "user"
 *                           Также понимает PascalCase, snake_case и числа enum.
 *   size        {'sm'|'md'} — размер (по умолчанию 'sm')
 *   showIcon    {boolean} — показывать иконку (по умолчанию true)
 *   showLabel   {boolean} — показывать текст (по умолчанию true)
 *   sx          {object}  — доп. стили для обёртки
 */
const UserRoleBadge = ({ role, size = 'sm', showIcon = true, showLabel = true, sx = {} }) => {
    const config = resolveRoleConfig(role);
    if (!config) return null;

    const { label, color, bg, border, Icon } = config;

    const isSm = size === 'sm';
    const iconSize = isSm ? 12 : 15;
    const fontSize = isSm ? '0.62rem' : '0.75rem';
    const px = isSm ? '5px' : '8px';
    const py = isSm ? '1px' : '3px';

    return (
        <Tooltip title={label} placement="top" arrow>
            <Box
                component="span"
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    px,
                    py,
                    borderRadius: '6px',
                    border: `1px solid ${border}`,
                    backgroundColor: bg,
                    flexShrink: 0,
                    lineHeight: 1,
                    userSelect: 'none',
                    ...sx,
                }}
            >
                {showIcon && (
                    <Icon sx={{ fontSize: iconSize, color }} />
                )}
                {showLabel && (
                    <Typography
                        component="span"
                        sx={{
                            fontSize,
                            fontWeight: 700,
                            color,
                            lineHeight: 1,
                            letterSpacing: '0.02em',
                        }}
                    >
                        {label}
                    </Typography>
                )}
            </Box>
        </Tooltip>
    );
};

export default UserRoleBadge;
