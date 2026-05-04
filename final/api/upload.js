// Vercel Serverless Function for Photo Upload
// Bypass Apps Script issues completely

import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { action, category, fileName, fileData, fileId } = req.body;
    
    console.log('Request received:', { action, category, fileName, fileData: fileData ? fileData.length : 'null' });

    // Create photos directory if it doesn't exist
    const photosDir = path.join(process.cwd(), 'public', 'photos');
    if (!fs.existsSync(photosDir)) {
      fs.mkdirSync(photosDir, { recursive: true });
    }

    // Create category directory if it doesn't exist
    const categoryDir = path.join(photosDir, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    let result;

    switch (action) {
      case 'upload':
        result = handleUpload(category, fileName, fileData, categoryDir);
        break;
        
      case 'list':
        result = handleList(category, categoryDir);
        break;
        
      case 'delete':
        result = handleDelete(fileId, photosDir);
        break;
        
      case 'initialize':
        result = handleInitialize();
        break;
        
      case 'summary':
        result = handleSummary(photosDir);
        break;
        
      default:
        result = { success: false, error: 'Invalid action: ' + action };
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Upload function error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

function handleUpload(category, fileName, fileData, categoryDir) {
  try {
    if (!category || !fileName || !fileData) {
      return { success: false, error: 'Missing required fields' };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const fileExtension = fileName.split('.').pop().toLowerCase();
    const mimeType = 'image/' + (fileExtension === 'jpg' ? 'jpeg' : fileExtension);
    
    if (!allowedTypes.includes(mimeType)) {
      return { success: false, error: 'Invalid file type. Allowed: JPG, PNG, GIF' };
    }

    // Decode base64 data
    const buffer = Buffer.from(fileData, 'base64');
    
    // Validate file size (5MB max)
    if (buffer.length > 5 * 1024 * 1024) {
      return { success: false, error: 'File size exceeds 5MB limit' };
    }

    // Create unique filename
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${fileName}`;
    const filePath = path.join(categoryDir, uniqueFileName);

    // Write file
    fs.writeFileSync(filePath, buffer);

    const fileInfo = {
      id: uniqueFileName,
      name: uniqueFileName,
      originalName: fileName,
      size: buffer.length,
      url: `/photos/${category}/${uniqueFileName}`,
      category: category,
      uploadedAt: new Date().toISOString()
    };

    console.log('Successfully uploaded:', fileName);
    return { success: true, fileInfo: fileInfo };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: error.message };
  }
}

function handleList(category, categoryDir) {
  try {
    if (!fs.existsSync(categoryDir)) {
      return { success: true, photos: [] };
    }

    const files = fs.readdirSync(categoryDir);
    const photos = [];

    files.forEach(file => {
      const filePath = path.join(categoryDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isFile() && /\.(jpg|jpeg|png|gif)$/i.test(file)) {
        const originalName = file.split('_').slice(1).join('_');
        photos.push({
          id: file,
          name: file,
          originalName: originalName || file,
          size: stats.size,
          url: `/photos/${category}/${file}`,
          category: category,
          createdAt: stats.birthtime.toISOString(),
          updatedAt: stats.mtime.toISOString()
        });
      }
    });

    // Sort by creation date (newest first)
    photos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return { success: true, photos: photos };
  } catch (error) {
    console.error('List error:', error);
    return { success: false, error: error.message };
  }
}

function handleDelete(fileId, photosDir) {
  try {
    if (!fileId) {
      return { success: false, error: 'File ID required' };
    }

    // Find file in all categories
    const categories = ['engagement', 'prewedding', 'moments', 'together', 'bride', 'groom'];
    let fileDeleted = false;

    for (const category of categories) {
      const categoryDir = path.join(photosDir, category);
      const filePath = path.join(categoryDir, fileId);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        fileDeleted = true;
        console.log('Successfully deleted:', fileId);
        break;
      }
    }

    if (!fileDeleted) {
      return { success: false, error: 'File not found' };
    }

    return { success: true, message: 'Photo deleted successfully' };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: error.message };
  }
}

function handleInitialize() {
  try {
    const photosDir = path.join(process.cwd(), 'public', 'photos');
    const categories = ['engagement', 'prewedding', 'moments', 'together', 'bride', 'groom'];

    // Create photos directory and all category directories
    if (!fs.existsSync(photosDir)) {
      fs.mkdirSync(photosDir, { recursive: true });
    }

    categories.forEach(category => {
      const categoryDir = path.join(photosDir, category);
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }
    });

    return { success: true, message: 'Photo folders initialized successfully' };
  } catch (error) {
    console.error('Initialize error:', error);
    return { success: false, error: error.message };
  }
}

function handleSummary(photosDir) {
  try {
    const categories = ['engagement', 'prewedding', 'moments', 'together', 'bride', 'groom'];
    const summary = {};

    categories.forEach(category => {
      const categoryDir = path.join(photosDir, category);
      if (fs.existsSync(categoryDir)) {
        const files = fs.readdirSync(categoryDir);
        const photoFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
        summary[category] = {
          count: photoFiles.length,
          photos: []
        };
      } else {
        summary[category] = {
          count: 0,
          photos: []
        };
      }
    });

    return { success: true, summary: summary };
  } catch (error) {
    console.error('Summary error:', error);
    return { success: false, error: error.message };
  }
}
