import React from 'react';
import { Box } from '@mui/material';

export const DEFAULT_PROFILE_ICON_ID = 'dog';

export const PROFILE_ICON_PRESETS = [
    { id: 'dog', label: 'Собачка', description: 'Верный и дружелюбный профиль', emoji: '🐶' },
    { id: 'doc', label: 'Документ', description: 'Любит порядок, тексты и заметки', emoji: '📝' },
    { id: 'rocket', label: 'Ракета', description: 'Летит к идеям без лишних остановок', emoji: '🚀' },
    { id: 'idea', label: 'Идея', description: 'Когда в голове уже есть следующий план', emoji: '💡' },
    { id: 'like', label: 'Лайк', description: 'Для тех, кто поддерживает хорошее', emoji: '👍' },
    { id: 'chat', label: 'Диалог', description: 'Общение, обсуждения и живой отклик', emoji: '💬' },
    { id: 'science', label: 'Наука', description: 'Эксперименты, факты и немного магии', emoji: '⚗️' },
    { id: 'search', label: 'Поиск', description: 'Вечно ищет лучший ответ', emoji: '🔎' },
    { id: 'bell', label: 'Уведомление', description: 'Всегда в курсе свежих событий', emoji: '🔔' },
    { id: 'user', label: 'Профиль', description: 'Спокойный и узнаваемый стиль', emoji: '👤' },
    { id: 'link', label: 'Ссылка', description: 'Соединяет идеи и людей', emoji: '🔗' },
    { id: 'heart', label: 'Сердце', description: 'Тёплый и живой характер', emoji: '❤️' },
    { id: 'star', label: 'Звезда', description: 'Для тех, кто светит ярче остальных', emoji: '⭐' },
    { id: 'share', label: 'Поделиться', description: 'Готов разносить полезное дальше', emoji: '🔀' },
    { id: 'article', label: 'Статья', description: 'Живёт идеями, текстами и смыслами', emoji: '📰' },
    { id: 'globe', label: 'Глобус', description: 'Открыт миру и новым взглядам', emoji: '🌐' },
];

const PRESET_BY_ID = PROFILE_ICON_PRESETS.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
}, {});

const isImageLikePath = (value = '') => /^(https?:)?\/\//i.test(value)
    || value.startsWith('/')
    || value.startsWith('./')
    || value.startsWith('data:')
    || value.startsWith('blob:');

export const extractNameAndIcon = (nameString) => {
    if (!nameString || typeof nameString !== 'string') return { name: '', icon: '' };
    for (const preset of PROFILE_ICON_PRESETS) {
        if (nameString.endsWith(preset.emoji)) {
            const cleanName = nameString.substring(0, nameString.length - preset.emoji.length).trim();
            return { name: cleanName, icon: preset.id };
        }
    }
    return { name: nameString, icon: '' };
};

export const resolveProfileIconValue = (source) => {
    if (!source || typeof source !== 'object') return '';
    
    // Extract from name fields if present
    const nameField = source.name || source.nickname || source.UserName || source.UserName || source.authorName || '';
    if (nameField) {
        const extracted = extractNameAndIcon(nameField);
        if (extracted.icon) return extracted.icon;
    }

    return source.profileIcon
        ?? source.profile_icon
        ?? source.userIcon
        ?? source.user_icon
        ?? source.icon
        ?? source.badgeIcon
        ?? source.badge_icon
        ?? '';
};

export const normalizeProfileIconValue = (rawValue) => {
    const value = String(rawValue || '').trim();
    if (!value) return '';

    const lower = value.toLowerCase();
    if (PRESET_BY_ID[lower]) return lower;
    return value;
};

export const getProfileIconVisual = (rawValue) => {
    const value = normalizeProfileIconValue(rawValue) || DEFAULT_PROFILE_ICON_ID;
    const preset = PRESET_BY_ID[String(value).toLowerCase()];
    if (preset) {
        return { type: 'emoji', value: preset.emoji, title: preset.label };
    }

    if (isImageLikePath(value)) {
        return { type: 'image', value, title: 'Значок' };
    }

    return { type: 'emoji', value, title: 'Значок' };
};

export const ProfileIcon = ({ icon, size = 20, sx = {} }) => {
    const visual = getProfileIconVisual(icon);
    if (!visual?.value) return null;

    if (visual.type === 'image') {
        return (
            <Box
                component="img"
                src={visual.value}
                alt={visual.title}
                title={visual.title}
                sx={{
                    width: size,
                    height: size,
                    objectFit: 'contain',
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    ...sx,
                }}
            />
        );
    }

    return (
        <Box
            component="span"
            title={visual.title}
            sx={{
                width: size,
                minWidth: size,
                height: size,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: Math.max(12, size - 2),
                lineHeight: 1,
                verticalAlign: 'middle',
                ...sx,
            }}
        >
            {visual.value}
        </Box>
    );
};
