import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Modal,
  Collapse,
} from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { buildAvatarUrl, DEFAULT_AVATAR_SRC } from './avatarUtils';
import { resolveProfileIconValue, extractNameAndIcon, ProfileIcon } from './profileIcons';
import { Chip } from '@mui/material';
import { mapTagsToLabels } from './CategoryModal';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

const TAG_COLORS = [
  'color-mix(in oklab, var(--accent-500) 70%, #3b82f6)',
  'color-mix(in oklab, var(--accent-500) 65%, #f59e0b)',
  'color-mix(in oklab, var(--accent-500) 60%, #22c55e)',
  'color-mix(in oklab, var(--accent-500) 58%, #f43f5e)',
  'color-mix(in oklab, var(--accent-500) 56%, #8b5cf6)',
  'color-mix(in oklab, var(--accent-500) 54%, #06b6d4)'
];

const getTagColor = (tag, index) => {
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return TAG_COLORS[(hash + index) % TAG_COLORS.length];
};

const BestArticlesList = ({ isMobile, onArticleClick, open, onClose }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const wasOpenRef = useRef(false);

  const fetchBestArticles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/Articles/best`, {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        const rawArticles = data.articles || data || [];
        
        const enriched = await Promise.all(rawArticles.map(async (art) => {
            const rawAuthorId = art.author_id || art.authorId || art.AuthorID;
            let authorData = {};
            if (rawAuthorId) {
                try {
                    authorData = await fetch(`${API_BASE_URL}/Users/UserProfile/${rawAuthorId}`)
                        .then(r => r.json());
                } catch(e) {}
            }
            const rawNickname = authorData.userName || authorData.UserName || authorData.name || authorData.Name || 'Автор';
            const iconInfo = extractNameAndIcon(rawNickname);
            return {
                ...art,
                author_name: iconInfo.name,
                author_avatar_path: authorData.pathAvatar || authorData.PathAvatar,
                
                id: art.article_id ?? art.articleId,
                article_id: art.article_id ?? art.articleId,
                author_id: rawAuthorId,
                nickname: iconInfo.name,
                authorAvatar: authorData.pathAvatar || authorData.PathAvatar,
                authorProfileIcon: iconInfo.icon || resolveProfileIconValue(authorData),
                authorRole: authorData.tag ?? authorData.Tag ?? 'user',
                title: art.article_title ?? art.articleTitle,
                article_preview: art.article_preview ?? art.articlePreview,
                article_content: art.article_content ?? art.articleContent,
                file_path: art.file_path ?? art.filePath,
                likesCount: art.countLikes ?? art.count_likes ?? 0,
                commentsCount: art.countComments ?? art.count_comments ?? 0,
                viewsCount: art.countViews ?? art.count_views ?? 0,
                isLiked: art.is_liked ?? false,
                tags: art.article_tags ?? art.articleTags ?? [],
                created_time: art.created_time ?? art.createdTime
            };
        }));
        setArticles(enriched);
      }
    } catch (err) {
      console.error('Failed to fetch best articles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isOpening = open && !wasOpenRef.current;

    if (isOpening) {
      fetchBestArticles();
    }

    wasOpenRef.current = open;
  }, [open]);

  const getRankColor = (index) => {
    if (index === 0) return '#d9b45a'; 
    if (index === 1) return '#b7c0cd'; 
    if (index === 2) return '#c9915a'; 
    return 'var(--text-secondary)';
  };

  const getRankShadow = (index) => {
    if (index === 0) return '0 0 10px color-mix(in oklab, #d9b45a 55%, transparent)';
    if (index === 1) return '0 0 8px color-mix(in oklab, #b7c0cd 55%, transparent)';
    if (index === 2) return '0 0 6px color-mix(in oklab, #c9915a 55%, transparent)';
    return 'none';
  };

  const renderList = () => (
    <Box
      sx={{
        p: 1,
        flex: '1 1 0',
        minHeight: 0,
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--accent-500) var(--surface-soft)',
        '&::-webkit-scrollbar': { width: 8 },
        '&::-webkit-scrollbar-track': { background: 'var(--surface-soft)', borderRadius: 10 },
        '&::-webkit-scrollbar-thumb': { background: 'var(--accent-500)', borderRadius: 10 },
      }}
    >
      <Typography variant="h6" sx={{ color: 'var(--accent-500)', mb: 2, textAlign: 'center' }}>
        Лучшие статьи
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={24} color="secondary" />
        </Box>
      ) : articles.length > 0 ? (
        articles.map((a, index) => {
          const isFirst = index === 0;
          return (
            <Box
              key={a.article_id}
              onClick={() => {
                if (onArticleClick) onArticleClick(a);
                if (onClose) onClose();
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: isFirst ? 2 : 1.5,
                mb: 1,
                bgcolor: 'var(--surface-panel)',
                borderRadius: '12px',
                cursor: 'pointer',
                border: isFirst ? '2px solid color-mix(in oklab, var(--accent-500) 45%, var(--border-default))' : '1px solid var(--border-default)',
                transform: 'none',
                boxShadow: isFirst ? '0 0 0 1px color-mix(in oklab, var(--accent-500) 25%, transparent) inset' : 'none',
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: 'var(--surface-elevated)',
                }
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  minWidth: 30,
                  color: getRankColor(index),
                  textShadow: getRankShadow(index),
                  fontWeight: 'bold',
                  textAlign: 'center',
                  mr: 2
                }}
              >
                {index + 1}
              </Typography>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  {isFirst && (
                    <Box sx={{ 
                      bgcolor: 'color-mix(in oklab, var(--accent-500) 70%, transparent)', 
                      color: 'var(--accent-contrast)', 
                      px: 0.8, 
                      py: 0.2, 
                      borderRadius: 1, 
                      fontSize: '0.65rem', 
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      Hot
                    </Box>
                  )}
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'var(--text-primary)',
                      fontWeight: isFirst ? 'bold' : 'normal',
                      fontSize: isFirst ? '1.1rem' : '0.95rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      flex: 1
                    }}
                  >
                    {a.article_title || a.title}
                  </Typography>
                  <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flexShrink: 0 }}>
                    {mapTagsToLabels(Array.isArray(a.tags) ? a.tags : []).slice(0, 2).map((tag, i) => {
                      const strTag = String(tag);
                      return (
                        <Chip
                          key={i}
                          label={strTag}
                          size="small"
                          sx={{
                            backgroundColor: getTagColor(strTag, i),
                            color: 'var(--accent-contrast)',
                            fontWeight: 'bold',
                            height: 18,
                            fontSize: '0.65rem'
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, minWidth: 0 }}>
                    <Avatar
                      src={buildAvatarUrl(API_BASE_URL, a.author_avatar_path)}
                      sx={{ width: 16, height: 16 }}
                      imgProps={{ onError: (e) => e.currentTarget.src = DEFAULT_AVATAR_SRC }}
                    >
                      {a.author_name?.[0]?.toUpperCase() || '?'}
                    </Avatar>
                    <Typography variant="caption" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {a.author_name || 'Автор'}
                    </Typography>
                    <ProfileIcon icon={a.authorProfileIcon} size={14} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                    <ChatBubbleOutlineIcon sx={{ fontSize: '0.9rem' }} />
                    {a.countComments || a.count_comments || a.comments_count || 0}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                    <FavoriteBorderIcon sx={{ fontSize: '0.9rem' }} />
                    {a.countLikes || a.count_likes || a.likes_count || 0}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                    <VisibilityIcon sx={{ fontSize: '0.9rem' }} />
                    {a.countViews || a.count_views || a.views_count || 0}
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        })
      ) : (
        <Typography sx={{ color: 'var(--text-secondary)', p: 2, textAlign: 'center' }}>Нет статей</Typography>
      )}
    </Box>
  );

  if (!isMobile) {
    return (
      <Collapse
        in={Boolean(open)}
        orientation="horizontal"
        timeout={280}
        unmountOnExit
        sx={{ height: '100vh', flexShrink: 0 }}
      >
        <Box
          sx={{
            width: 340,
            minWidth: 340,
            height: '100vh',
            pl: 2,
            py: 3,
            display: 'flex',
            alignItems: 'center',
            boxSizing: 'border-box',
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              backgroundColor: 'color-mix(in oklab, var(--surface-panel) 94%, transparent)',
              border: '1px solid var(--border-default)',
              borderRadius: '18px',
              boxShadow: 'var(--shadow-soft)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {renderList()}
          </Box>
        </Box>
      </Collapse>
    );
  }

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="best-articles-modal">
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: 500,
        bgcolor: 'var(--surface-panel)',
        border: '1px solid var(--border-default)',
        boxShadow: 24,
        borderRadius: 3,
        p: 2,
        outline: 'none',
        display: 'flex',
        flexDirection: 'column',
        height: '80vh',
      }}>
        {renderList()}
      </Box>
    </Modal>
  );
};

export default BestArticlesList;
