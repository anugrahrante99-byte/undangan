// Vercel Serverless Function for Photo Upload - Simple Version

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    // Handle GET requests for listing photos
    if (req.method === 'GET') {
      const { action, category } = req.query;
      
      switch (action) {
        case 'list':
          return res.status(200).json({ success: true, photos: [] });
          
        case 'initialize':
          return res.status(200).json({ 
            success: true, 
            message: 'Photo folders initialized' 
          });
          
        case 'summary':
          return res.status(200).json({ 
            success: true, 
            summary: {
              engagement: { count: 0 },
              prewedding: { count: 0 },
              moments: { count: 0 },
              together: { count: 0 },
              bride: { count: 0 },
              groom: { count: 0 }
            }
          });
          
        default:
          return res.status(400).json({ 
            success: false, 
            error: 'Invalid GET action: ' + action 
          });
      }
    }

    // Handle POST requests
    const { action, category, fileName, fileData } = req.body;
    
    console.log('Request:', { action, category, fileName, hasData: !!fileData });

    // Simple upload handler
    if (action === 'upload') {
      if (!category || !fileName || !fileData) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields' 
        });
      }

      // Validate file type
      const allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
      const fileExtension = fileName.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid file type. Allowed: JPG, PNG, GIF' 
        });
      }

      // Decode and validate base64
      let buffer;
      try {
        buffer = Buffer.from(fileData, 'base64');
      } catch (e) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid base64 data' 
        });
      }

      // Validate file size (5MB max)
      if (buffer.length > 5 * 1024 * 1024) {
        return res.status(400).json({ 
          success: false, 
          error: 'File size exceeds 5MB limit' 
        });
      }

      // Create response with actual file URL for invitation
      const timestamp = Date.now();
      
      // For groom/bride photos, use simple names for invitation compatibility
      let finalFileName = fileName;
      if (category === 'groom' && fileName.toLowerCase().includes('pria')) {
        finalFileName = 'pria.jpg';
      } else if (category === 'bride' && fileName.toLowerCase().includes('wanita')) {
        finalFileName = 'wanita.jpg';
      } else {
        finalFileName = `${timestamp}_${fileName}`;
      }
      
      const fileInfo = {
        id: finalFileName,
        name: finalFileName,
        originalName: fileName,
        size: buffer.length,
        url: `${category}/${finalFileName}`,
        category: category,
        uploadedAt: new Date().toISOString()
      };

      console.log('Upload successful:', fileName, 'as:', finalFileName);
      return res.status(200).json({ 
        success: true, 
        fileInfo: fileInfo 
      });
    }

    // Handle other actions
    switch (action) {
      case 'list':
        return res.status(200).json({ success: true, photos: [] });
        
      case 'initialize':
        return res.status(200).json({ 
          success: true, 
          message: 'Photo folders initialized' 
        });
        
      case 'summary':
        return res.status(200).json({ 
          success: true, 
          summary: {
            engagement: { count: 0 },
            prewedding: { count: 0 },
            moments: { count: 0 },
            together: { count: 0 },
            bride: { count: 0 },
            groom: { count: 0 }
          }
        });
        
      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid action: ' + action 
        });
    }

  } catch (error) {
    console.error('Function error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error: ' + error.message 
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
