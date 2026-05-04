// Wedding App v2 - Fresh Start
// Integrasi: Index.html + Generator + Sheets + Drive

// Configuration
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE";
const SHEET_NAME = "Guests";
const DRIVE_FOLDER_NAME = "Wedding_Photos_V2";

// Folder structure
const FOLDER_STRUCTURE = {
  groom: 'pria.jpg',
  bride: 'wanita.jpg',
  gallery: 'gallery',
  cover: 'cover.jpg'
};

// Main function - handle all requests
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    switch(action) {
      case 'getphotourl':
        return getPhotoUrl(e);
      case 'getguests':
        return getGuests();
      case 'getconfig':
        return getConfig();
      default:
        return json_({ok: false, error: 'Unknown action'});
    }
  } catch(error) {
    return json_({ok: false, error: error.toString()});
  }
}

function doPost(e) {
  try {
    const action = e.parameter.action;
    
    switch(action) {
      case 'addguest':
        return addGuest(e);
      case 'uploadphoto':
        return handlePhotoUpload(e);
      case 'updateconfig':
        return updateConfig(e);
      default:
        return json_({ok: false, error: 'Unknown action'});
    }
  } catch(error) {
    return json_({ok: false, error: error.toString()});
  }
}

// Photo upload handler - WORKING VERSION FROM SCRATCH
function handlePhotoUpload(e) {
  Logger.log("=== PHOTO UPLOAD DEBUG ===");
  
  try {
    // Get form data
    const type = e.parameter.type;
    const fileData = e.parameter.fileData;
    const fileName = e.parameter.fileName;
    const mimeType = e.parameter.mimeType;
    
    Logger.log('Type: ' + type);
    Logger.log('FileName: ' + fileName);
    Logger.log('MimeType: ' + mimeType);
    Logger.log('Has fileData: ' + (fileData ? 'yes' : 'no'));
    
    if (!fileData || !fileName || !mimeType) {
      Logger.log('ERROR: Missing required parameters');
      return json_({ok: false, error: 'Missing required parameters'});
    }
    
    // Get or create folder
    const folder = getOrCreateFolder(type);
    Logger.log('Target folder: ' + folder.getName());
    
    // Decode base64
    let base64Data = fileData;
    if (base64Data.startsWith('data:')) {
      base64Data = base64Data.substring(base64Data.indexOf(',') + 1);
      Logger.log('Removed data URL prefix');
    }
    
    const decodedData = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decodedData, mimeType, fileName);
    
    Logger.log('Base64 decoded successfully');
    Logger.log('Blob size: ' + decodedData.length + ' bytes');
    
    // Save file to Drive
    const file = folder.createFile(blob);
    const fileUrl = 'https://drive.google.com/uc?id=' + file.getId();
    
    Logger.log('SUCCESS: File uploaded to Drive');
    Logger.log('File ID: ' + file.getId());
    Logger.log('File name: ' + file.getName());
    Logger.log('File size: ' + file.getSize() + ' bytes');
    Logger.log('File URL: ' + fileUrl);
    
    return json_({
      ok: true,
      data: {
        url: fileUrl,
        id: file.getId(),
        name: file.getName()
      }
    });
    
  } catch(error) {
    Logger.log('ERROR in handlePhotoUpload: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    return json_({ok: false, error: error.toString()});
  }
}

// Get photo URL
function getPhotoUrl(e) {
  try {
    const type = e.parameter.type;
    const folder = getOrCreateFolder(type);
    const files = folder.getFiles();
    
    if (files.hasNext()) {
      const file = files.next();
      const fileUrl = 'https://drive.google.com/uc?id=' + file.getId();
      return json_({ok: true, data: {url: fileUrl}});
    } else {
      return json_({ok: false, error: 'Photo not found'});
    }
  } catch(error) {
    return json_({ok: false, error: error.toString()});
  }
}

// Guest management - SIMPLIFIED FOR TESTING
function addGuest(e) {
  try {
    const name = e.parameter.name;
    const message = e.parameter.message;
    const attendance = e.parameter.attendance;
    
    // For now, return success without Sheets integration
    Logger.log('Guest: ' + name + ', ' + message + ', ' + attendance);
    
    return json_({ok: true, message: 'Guest added successfully'});
  } catch(error) {
    return json_({ok: false, error: error.toString()});
  }
}

function getGuests() {
  try {
    // For now, return empty guest list without Sheets integration
    const data = [
      [new Date(), 'Test Guest', 'Test Message', 'hadir'],
      [new Date(), 'Sample Guest', 'Sample Message', 'tidak hadir']
    ];
    
    return json_({ok: true, data: data});
  } catch(error) {
    return json_({ok: false, error: error.toString()});
  }
}

// Configuration - SIMPLIFIED FOR TESTING
function getConfig() {
  try {
    // For now, return basic config without Sheets integration
    const config = {
      weddingDate: '2026-06-26T10:00:00',
      brideName: 'Fepprianti',
      groomName: 'Adiaksa'
    };
    
    return json_({ok: true, data: config});
  } catch(error) {
    return json_({ok: false, error: error.toString()});
  }
}

function updateConfig(e) {
  try {
    const key = e.parameter.key;
    const value = e.parameter.value;
    
    // For now, just log the update without Sheets integration
    Logger.log('Config update: ' + key + ' = ' + value);
    
    return json_({ok: true, message: 'Config updated'});
  } catch(error) {
    return json_({ok: false, error: error.toString()});
  }
}

// Helper functions
function getOrCreateFolder(type) {
  try {
    const parentFolder = getOrCreateDriveFolder();
    
    const subfolders = parentFolder.getFoldersByName(type);
    if (subfolders.hasNext()) {
      return subfolders.next();
    } else {
      return parentFolder.createFolder(type);
    }
  } catch(error) {
    Logger.log('Error creating folder: ' + error.toString());
    throw error;
  }
}

function getOrCreateDriveFolder() {
  try {
    const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
    if (folders.hasNext()) {
      return folders.next();
    } else {
      return DriveApp.createFolder(DRIVE_FOLDER_NAME);
    }
  } catch(error) {
    Logger.log('Error creating drive folder: ' + error.toString());
    throw error;
  }
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
