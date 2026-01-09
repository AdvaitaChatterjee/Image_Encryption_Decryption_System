const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os'); // ADD THIS LINE
const Image = require('../models/Image');

// ADD THIS HELPER FUNCTION
function getPythonCommand() {
  // On Windows use 'python', on Linux/Mac use 'python3'
  return os.platform() === 'win32' ? 'python' : 'python3';
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|bmp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Upload and encrypt image
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { key } = req.body;
    
    if (!key || key.length < 8) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Encryption key must be at least 8 characters' });
    }

    const imagePath = req.file.path;
    
    // Call Python encryption script - UPDATED TO USE getPythonCommand()
    const pythonProcess = spawn(getPythonCommand(), [
      'python/encryption.py',
      'encrypt',
      imagePath,
      key
    ]);

    let resultData = '';
    
    pythonProcess.stdout.on('data', (data) => {
      resultData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', async (code) => {
      if (code !== 0) {
        fs.unlinkSync(imagePath);
        return res.status(500).json({ error: 'Encryption failed' });
      }

      try {
        const result = JSON.parse(resultData);
        
        if (!result.success) {
          fs.unlinkSync(imagePath);
          return res.status(500).json({ error: result.error });
        }

        // Delete original file
        fs.unlinkSync(imagePath);

        // Save to MongoDB
        const newImage = new Image({
          originalName: req.file.originalname,
          encryptedPath: result.encrypted_path,
          size: req.file.size,
          mimeType: req.file.mimetype,
          iv: result.iv
        });

        await newImage.save();

        res.json({
          success: true,
          message: 'Image encrypted successfully',
          imageId: newImage._id,
          originalName: newImage.originalName
        });

      } catch (error) {
        fs.unlinkSync(imagePath);
        res.status(500).json({ error: 'Failed to save image data' });
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all encrypted images
router.get('/images', async (req, res) => {
  try {
    const images = await Image.find().sort({ uploadDate: -1 });
    res.json({ success: true, images });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Decrypt image
router.post('/decrypt/:id', async (req, res) => {
  try {
    const { key } = req.body;
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const outputPath = image.encryptedPath.replace('_encrypted', '_decrypted');

    // Call Python decryption script - UPDATED TO USE getPythonCommand()
    const pythonProcess = spawn(getPythonCommand(), [
      'python/encryption.py',
      'decrypt',
      image.encryptedPath,
      key,
      outputPath
    ]);

    let resultData = '';
    
    pythonProcess.stdout.on('data', (data) => {
      resultData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: 'Decryption failed' });
      }

      try {
        const result = JSON.parse(resultData);
        
        if (!result.success) {
          return res.status(500).json({ error: result.error || 'Invalid key' });
        }

        // Send decrypted file
        res.download(outputPath, image.originalName, (err) => {
          // Delete decrypted file after download
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
          }
          
          if (err) {
            console.error('Download error:', err);
          }
        });

      } catch (error) {
        res.status(500).json({ error: 'Decryption parsing failed' });
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete encrypted image
router.delete('/images/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete encrypted file
    if (fs.existsSync(image.encryptedPath)) {
      fs.unlinkSync(image.encryptedPath);
    }

    // Delete from database
    await Image.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
