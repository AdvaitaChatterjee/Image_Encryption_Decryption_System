import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  LinearProgress,
  Card,
  CardContent
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

const API_URL = 'https://image-encryption-decryption-system.onrender.com/api';

function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setMessage({ type: '', text: '' });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    if (!encryptionKey || encryptionKey.length < 8) {
      setMessage({ type: 'error', text: 'Encryption key must be at least 8 characters' });
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('key', encryptionKey);

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      setMessage({ type: 'success', text: response.data.message });
      setSelectedFile(null);
      setPreviewUrl(null);
      setEncryptionKey('');
      setUploadProgress(0);

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Upload failed. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
          <LockIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Encrypt Your Image
        </Typography>

        <Box sx={{ mb: 4 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="raised-button-file"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="raised-button-file">
            <Button
              variant="contained"
              component="span"
              size="large"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4f46e5 30%, #7c3aed 90%)',
                }
              }}
            >
              Select Image File
            </Button>
          </label>
        </Box>

        {previewUrl && (
          <Card sx={{ mb: 3, bgcolor: '#0f172a' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                Selected Image Preview
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                  }} 
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                File: {selectedFile?.name} ({(selectedFile?.size / 1024).toFixed(2)} KB)
              </Typography>
            </CardContent>
          </Card>
        )}

        <TextField
          fullWidth
          type="password"
          label="Encryption Key"
          variant="outlined"
          value={encryptionKey}
          onChange={(e) => setEncryptionKey(e.target.value)}
          placeholder="Enter at least 8 characters"
          helperText="Remember this key! You'll need it to decrypt the image."
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: <LockIcon sx={{ mr: 1, color: 'primary.main' }} />
          }}
        />

        {loading && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
              Encrypting... {uploadProgress}%
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleUpload}
          disabled={loading || !selectedFile || !encryptionKey}
          startIcon={loading ? <CircularProgress size={20} /> : <LockIcon />}
          sx={{
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            background: 'linear-gradient(45deg, #ec4899 30%, #f43f5e 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #db2777 30%, #e11d48 90%)',
            }
          }}
        >
          {loading ? 'Encrypting...' : 'Encrypt & Upload'}
        </Button>

        {message.text && (
          <Alert 
            severity={message.type} 
            sx={{ mt: 3 }}
            icon={message.type === 'success' ? <CheckCircleIcon /> : undefined}
          >
            {message.text}
          </Alert>
        )}
      </Paper>

      <Card sx={{ mt: 3, bgcolor: 'rgba(30, 41, 59, 0.6)' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
            🔒 Security Features
          </Typography>
          <Typography variant="body2" paragraph sx={{ textAlign: 'center' }}>
            • AES-256 encryption with CBC mode
          </Typography>
          <Typography variant="body2" paragraph sx={{ textAlign: 'center' }}>
            • Random initialization vector (IV) for each encryption
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            • Original images are deleted after encryption
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Upload;
