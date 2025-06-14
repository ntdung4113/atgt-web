import React from 'react';
import { Dialog, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const VideoDialog = ({ open, onClose, videoUrl }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: '#fff',
          boxShadow: 6,
          p: 2,
          border: '1px solid #eee'
        }
      }}
    >
      {videoUrl && (
        <Box sx={{ position: 'relative', width: '100%', pt: '56.25%' }}>
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'grey.700',
              zIndex: 1
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}>
            <video
              src={videoUrl}
              controls
              autoPlay
              style={{ width: '100%', height: '100%', borderRadius: 12, background: '#000' }}
            />
          </Box>
        </Box>
      )}
    </Dialog>
  );
};

export default VideoDialog;