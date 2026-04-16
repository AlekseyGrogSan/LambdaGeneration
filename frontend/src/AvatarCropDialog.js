import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slider,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage';

const AvatarCropDialog = ({ open, imageSrc, onClose, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      setIsProcessing(true);
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, 0);
      onCropComplete(croppedFile);
    } catch (e) {
      console.error('Failed to crop image', e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#1e1e1e',
          color: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0px 10px 40px rgba(0,0,0,0.5)',
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Редактирование фото</Typography>
        <IconButton onClick={onClose} sx={{ color: '#9e9e9e', '&:hover': { color: '#ffffff' } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ 
          position: 'relative', 
          width: '100%', 
          height: { xs: 300, sm: 400 }, 
          background: '#121212',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={handleCropComplete}
              onZoomChange={setZoom}
              style={{
                containerStyle: { backgroundColor: '#121212' },
                cropAreaStyle: { border: '2px solid #00bfa5' }
              }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2 }}>
          <ZoomOutIcon sx={{ color: '#9e9e9e' }} />
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.05}
            onChange={(e, value) => setZoom(value)}
            sx={{
              color: '#00bfa5',
              '& .MuiSlider-thumb': {
                width: 20,
                height: 20,
                border: '2px solid currentColor',
                backgroundColor: '#1e1e1e',
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: '0px 0px 0px 8px rgba(0, 191, 165, 0.16)',
                },
              },
              '& .MuiSlider-track': {
                height: 6,
                borderRadius: 4,
              },
              '& .MuiSlider-rail': {
                height: 6,
                borderRadius: 4,
                opacity: 0.3,
                backgroundColor: '#9e9e9e'
              },
            }}
          />
          <ZoomInIcon sx={{ color: '#9e9e9e' }} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0, px: 3 }}>
        <Button 
          onClick={onClose} 
          disabled={isProcessing}
          sx={{ 
            color: '#bdbdbd',
            textTransform: 'none',
            fontSize: '1rem',
            '&:hover': { background: 'rgba(255,255,255,0.05)' }
          }}
        >
          Отмена
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={isProcessing}
          sx={{ 
            backgroundColor: '#00bfa5', 
            color: '#ffffff',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            borderRadius: '8px',
            px: 3,
            '&:hover': { backgroundColor: '#00a08b' },
            '&.Mui-disabled': { backgroundColor: 'rgba(0, 191, 165, 0.5)', color: 'rgba(255,255,255,0.5)' }
          }}
        >
          {isProcessing ? 'Сохранение...' : 'Применить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AvatarCropDialog;
