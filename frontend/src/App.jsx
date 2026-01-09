import React, { useState } from 'react';
import { Container, AppBar, Toolbar, Typography, Box, Tabs, Tab } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LockIcon from '@mui/icons-material/Lock';
import Upload from './components/Upload';
import Gallery from './components/Gallery';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
    },
    secondary: {
      main: '#ec4899',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',width:"98vw"}}>
        <AppBar position="static" sx={{ background: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(10px)' }}>
          <Toolbar sx={{ justifyContent: 'center' }}>
            <LockIcon sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h5" component="div" sx={{ fontWeight: 700, mr: 2 }}>
              Image Encryption Decryption System
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              AES-256 Encryption
            </Typography>
          </Toolbar>
        </AppBar>

        <Container 
           
          sx={{ 
            mt: 4, 
            pb: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 100px)',
           
          }}
        >
          <Box sx={{ width: '100vw' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                centered
                sx={{
                  '& .MuiTab-root': {
                    fontSize: '1rem',
                    fontWeight: 600,
                  }
                }}
              >
                <Tab label="Upload & Encrypt" />
                <Tab label="My Encrypted Images" />
              </Tabs>
            </Box>

            {activeTab === 0 && <Upload />}
            {activeTab === 1 && <Gallery />}
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
