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
          backgroundColor: 'var(--surface-panel)',
          color: 'var(--text-primary)',
          borderRadius: '16px',
          boxShadow: '0px 10px 40px var(--ui-c136)',
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid var(--ui-c191)' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Редактирование фото</Typography>
        <IconButton onClick={onClose} sx={{ color: 'var(--text-secondary)', '&:hover': { color: 'var(--text-primary)' } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ 
          position: 'relative', 
          width: '100%', 
          height: { xs: 300, sm: 400 }, 
          background: 'var(--bg-canvas)',
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
                containerStyle: { backgroundColor: 'var(--bg-canvas)' },
                cropAreaStyle: { border: '2px solid var(--accent-500)' }
              }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2 }}>
          <ZoomOutIcon sx={{ color: 'var(--text-secondary)' }} />
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.05}
            onChange={(e, value) => setZoom(value)}
            sx={{
              color: 'var(--accent-500)',
              '& .MuiSlider-thumb': {
                width: 20,
                height: 20,
                border: '2px solid currentColor',
                backgroundColor: 'var(--surface-panel)',
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: '0px 0px 0px 8px var(--ui-c116)',
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
                backgroundColor: 'var(--text-secondary)'
              },
            }}
          />
          <ZoomInIcon sx={{ color: 'var(--text-secondary)' }} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0, px: 3 }}>
        <Button 
          onClick={onClose} 
          disabled={isProcessing}
          sx={{ 
            color: 'var(--text-secondary)',
            textTransform: 'none',
            fontSize: '1rem',
            '&:hover': { background: 'var(--ui-c189)' }
          }}
        >
          Отмена
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={isProcessing}
          sx={{ 
            backgroundColor: 'var(--accent-500)', 
            color: 'var(--text-primary)',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            borderRadius: '8px',
            px: 3,
            '&:hover': { backgroundColor: 'var(--ui-c3)' },
            '&.Mui-disabled': { backgroundColor: 'var(--ui-c121)', color: 'var(--ui-c198)' }
          }}
        >
          {isProcessing ? 'Сохранение...' : 'Применить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AvatarCropDialog;
