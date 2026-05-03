import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Collapse,
  Modal,
} from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { buildAvatarUrl, DEFAULT_AVATAR_SRC } from './avatarUtils';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

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
            return {
                ...art,
                author_name: authorData.userName || authorData.UserName || authorData.name || authorData.Name,
                author_avatar_path: authorData.pathAvatar || authorData.PathAvatar,
                
                id: art.article_id ?? art.articleId,
                article_id: art.article_id ?? art.articleId,
                author_id: rawAuthorId,
                nickname: authorData.userName || authorData.UserName || authorData.name || authorData.Name || "РђРІС‚РѕСЂ",
                authorAvatar: authorData.pathAvatar || authorData.PathAvatar,
                authorProfileIcon: authorData.profileIcon,
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
    if (index === 0) return '#FFD700'; // Gold
    if (index === 1) return '#C0C0C0'; // Silver
    if (index === 2) return '#CD7F32'; // Bronze
    return '#FFFFFF'; // White
  };

  const getRankShadow = (index) => {
    if (index === 0) return '0 0 10px rgba(255, 215, 0, 0.8)';
    if (index === 1) return '0 0 8px rgba(192, 192, 192, 0.6)';
    if (index === 2) return '0 0 6px rgba(205, 127, 50, 0.5)';
    return 'none';
  };

  const renderList = () => (
    <Box sx={{ p: 1, maxHeight: '70vh', overflowY: 'auto' }}>
      <Typography variant="h6" sx={{ color: '#00bfa5', mb: 2, textAlign: 'center' }}>
        Лучший статьи
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
                if (isMobile && onClose) onClose();
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: isFirst ? 2 : 1.5,
                mb: 1,
                bgcolor: '#1f1f1f',
                borderRadius: '12px',
                cursor: 'pointer',
                border: isFirst ? '2px solid rgba(255, 215, 0, 0.5)' : '1px solid #333',
                transform: isFirst ? 'scale(1.02)' : 'none',
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: '#2c2c2c',
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
                      bgcolor: '#ff5722', 
                      color: 'white', 
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
                      color: '#ffffff',
                      fontWeight: isFirst ? 'bold' : 'normal',
                      fontSize: isFirst ? '1.1rem' : '0.95rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {a.article_title}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: '#bdbdbd', fontSize: '0.75rem' }}>
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
        <Typography sx={{ color: '#bdbdbd', p: 2, textAlign: 'center' }}>РќРµС‚ СЃС‚Р°С‚РµР№</Typography>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Modal open={open} onClose={onClose} aria-labelledby="best-articles-mobile">
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 400,
          bgcolor: '#121212',
          border: '1px solid #333',
          boxShadow: 24,
          borderRadius: 3,
          p: 2,
          outline: 'none'
        }}>
          {renderList()}
        </Box>
      </Modal>
    );
  }

  return (
    <Collapse in={open} orientation="horizontal" timeout={280} unmountOnExit sx={{ height: '100vh', flexShrink: 0 }}>
      <Box
        sx={{
          width: 392,
          minWidth: 392,
          height: '100vh',
          px: 2,
          py: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{
          width: '100%',
          maxHeight: 'calc(100vh - 48px)',
          bgcolor: '#121212',
          border: '1px solid #333',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }}>
          {renderList()}
        </Box>
      </Box>
    </Collapse>
  );
};

export default BestArticlesList;
