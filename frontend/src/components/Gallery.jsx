import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  IconButton,
  CircularProgress,
  Fade,
  Tooltip,
  Snackbar
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import SecurityIcon from '@mui/icons-material/Security';
import axios from 'axios';

const API_URL = 'https://image-encryption-decryption-system.onrender.com/api';

function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decryptDialog, setDecryptDialog] = useState({ open: false, image: null });
  const [decryptionKey, setDecryptionKey] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [decrypting, setDecrypting] = useState(false);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/images`);
      setImages(response.data.images);
    } catch (error) {
      console.error('Error fetching images:', error);
      setSnackbar({ open: true, message: 'Failed to load images', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleDecryptClick = (image) => {
    setDecryptDialog({ open: true, image });
    setDecryptionKey('');
    setMessage({ type: '', text: '' });
  };

  const handleDecrypt = async () => {
    if (!decryptionKey) {
      setMessage({ type: 'error', text: 'Please enter decryption key' });
      return;
    }

    try {
      setDecrypting(true);
      setMessage({ type: '', text: '' });

      const response = await axios.post(
        `${API_URL}/decrypt/${decryptDialog.image._id}`,
        { key: decryptionKey },
        { responseType: 'blob' }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', decryptDialog.image.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSnackbar({ open: true, message: 'Image decrypted successfully!', severity: 'success' });
      setDecryptDialog({ open: false, image: null });
      setDecryptionKey('');

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Decryption failed. Check your key.' 
      });
    } finally {
      setDecrypting(false);
    }
  };

  const handleDelete = async (imageId, imageName) => {
    if (!window.confirm(`Are you sure you want to delete "${imageName}"?`)) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/images/${imageId}`);
      setImages(images.filter(img => img._id !== imageId));
      setSnackbar({ open: true, message: 'Image deleted successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete image', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100px"
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading encrypted images...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', width: '70%' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center">
            <SecurityIcon sx={{ mr: 1, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Encrypted Images
            </Typography>
          </Box>
          <Tooltip title="Refresh gallery">
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchImages}
              sx={{
                borderRadius: 2,
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: 'primary.main'
                }
              }}
            >
              Refresh
            </Button>
          </Tooltip>
        </Box>

        {images.length === 0 ? (
          <Fade in timeout={800}>
            <Box textAlign="center" py={8}>
              <ImageIcon sx={{ fontSize: 100, opacity: 0.3, mb: 3, color: 'primary.main' }} />
              <Typography variant="h5" gutterBottom fontWeight={600}>
                No encrypted images yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Upload and encrypt your first image to get started
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Your encrypted images will appear here
              </Typography>
            </Box>
          </Fade>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Total: {images.length} encrypted {images.length === 1 ? 'image' : 'images'}
            </Typography>
            <Grid container spacing={3}>
              {images.map((image, index) => (
                <Grid item xs={12} sm={6} md={4} key={image._id}>
                  <Fade in timeout={300 + index * 100}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: '#0f172a',
                        borderRadius: 2,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 28px rgba(99, 102, 241, 0.4)',
                        }
                      }}
                    >
                      <Box
                        sx={{
                          height: 180,
                          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '-50%',
                            left: '-50%',
                            width: '200%',
                            height: '200%',
                            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                            animation: 'rotate 10s linear infinite',
                          }
                        }}
                      >
                        <LockOpenIcon 
                          sx={{ 
                            fontSize: 80, 
                            opacity: 0.5,
                            zIndex: 1,
                            transition: 'transform 0.3s',
                            '&:hover': {
                              transform: 'scale(1.1) rotate(5deg)'
                            }
                          }} 
                        />
                      </Box>
                      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                        <Tooltip title={image.originalName} arrow>
                          <Typography variant="h6" noWrap gutterBottom sx={{ fontWeight: 600 }}>
                            {image.originalName}
                          </Typography>
                        </Tooltip>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                          <Chip 
                            label={`${(image.size / 1024).toFixed(2)} KB`} 
                            size="small" 
                            color="default"
                            sx={{ fontWeight: 500 }}
                          />
                          <Chip 
                            label={image.mimeType.split('/')[1].toUpperCase()} 
                            size="small" 
                            color="primary"
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            📅 {new Date(image.uploadDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            🕐 {new Date(image.uploadDate).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                        <Tooltip title="Decrypt and download this image">
                          <Button
                            size="medium"
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDecryptClick(image)}
                            fullWidth
                            sx={{
                              background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                              fontWeight: 600,
                              '&:hover': {
                                background: 'linear-gradient(45deg, #4f46e5 30%, #7c3aed 90%)',
                              }
                            }}
                          >
                            Decrypt
                          </Button>
                        </Tooltip>
                        <Tooltip title="Delete permanently">
                          <IconButton
                            size="medium"
                            color="error"
                            onClick={() => handleDelete(image._id, image.originalName)}
                            sx={{
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'scale(1.1)',
                                bgcolor: 'error.dark'
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Paper>

      {/* Decrypt Dialog */}
      <Dialog 
        open={decryptDialog.open} 
        onClose={() => !decrypting && setDecryptDialog({ open: false, image: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center">
            <LockOpenIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h6" fontWeight={700}>
              Decrypt Image
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Enter the encryption key you used when uploading this image.
          </Alert>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
            File: <strong>{decryptDialog.image?.originalName}</strong>
          </Typography>
          <TextField
            fullWidth
            type="password"
            label="Decryption Key"
            variant="outlined"
            value={decryptionKey}
            onChange={(e) => setDecryptionKey(e.target.value)}
            placeholder="Enter your encryption key"
            autoFocus
            disabled={decrypting}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && decryptionKey && !decrypting) {
                handleDecrypt();
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              }
            }}
          />
          {message.text && (
            <Alert severity={message.type} sx={{ mt: 2 }}>
              {message.text}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setDecryptDialog({ open: false, image: null })}
            disabled={decrypting}
            sx={{ fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDecrypt} 
            variant="contained"
            disabled={decrypting || !decryptionKey}
            startIcon={decrypting ? <CircularProgress size={20} color="inherit" /> : <LockOpenIcon />}
            sx={{
              fontWeight: 600,
              background: 'linear-gradient(45deg, #ec4899 30%, #f43f5e 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #db2777 30%, #e11d48 90%)',
              }
            }}
          >
            {decrypting ? 'Decrypting...' : 'Decrypt & Download'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Add keyframe animation for rotating background */}
      <style>
        {`
          @keyframes rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </Box>
  );
}

export default Gallery;
