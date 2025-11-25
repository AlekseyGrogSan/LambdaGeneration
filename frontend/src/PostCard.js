import React from 'react';
import {
    Box, Card, CardMedia, Typography, IconButton,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

const PostCard = ({ id, nickname, title, imageUrl, likesCount, commentsCount, isLiked, onClick, onLike }) => {
    return (
        <Card
            onClick={() => onClick(id)}
            sx={{
                height: '100%', maxHeight: '100%', overflowY: 'auto', backgroundColor: '#333333',
                borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', maxWidth: '700px',
                width: '100%', alignSelf: 'center', cursor: 'pointer', transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.01)', boxShadow: '0 6px 15px rgba(0,0,0,0.6)', }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', padding: 2 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#00bfa5', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: 1, border: '2px solid #00bfa5' }}>
                    <CameraAltIcon sx={{ color: '#333333', fontSize: 20 }} />
                </Box>
                <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                    {nickname}
                </Typography>
            </Box>

            <CardMedia
                component="img"
                image={imageUrl}
                alt={title}
                sx={{ height: 'auto', maxHeight: 500, objectFit: 'cover' }}
            />

            <Box sx={{ padding: 2, color: 'white' }}>
                <Typography variant="body1" sx={{ marginBottom: 1, fontWeight: 'bold' }}>
                    {title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton sx={{ color: 'white' }} onClick={(e) => { e.stopPropagation(); onLike(id); }}>
                            <FavoriteIcon sx={{ fontSize: 30 }} />
                        </IconButton>
                        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold' }}>0</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton sx={{ color: '#00bfa5'}} onClick={(e) => { e.stopPropagation(); console.log('Коммент!'); }}>
                            <ChatBubbleOutlineIcon sx={{ fontSize: 30 }} />
                        </IconButton>
                        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold' }}>0</Typography>
                    </Box>

                    <IconButton sx={{ color: '#00bfa5'}} onClick={(e) => { e.stopPropagation(); console.log('Репост!'); }}>
                        <SendIcon sx={{ fontSize: 30 }} />
                    </IconButton>

                </Box>
            </Box>
        </Card>
    );
};

export default PostCard;