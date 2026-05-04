// Photo Upload Test - Wedding App v2
// Goal: Upload foto ke Google Drive dari nol
// Folder: wedding-app-v2

// Global variables
const DRIVE_FOLDER_NAME = "Wedding_Photos_V2";

// Test function - Step 1
function testBasicSetup() {
  Logger.log("=== STEP 1: BASIC SETUP TEST ===");
  Logger.log("Script loaded successfully");
  Logger.log("Drive folder name: " + DRIVE_FOLDER_NAME);
  
  // Test Drive access
  try {
    const rootFolder = DriveApp.getRootFolder();
    Logger.log("Root folder access: SUCCESS");
    Logger.log("Root folder name: " + rootFolder.getName());
  } catch(error) {
    Logger.log("Drive access ERROR: " + error.toString());
  }
  
  return "Basic setup test completed";
}

// Create test folder - Step 1
function createTestFolder() {
  Logger.log("=== CREATE TEST FOLDER ===");
  
  try {
    // Check if folder exists
    const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
    if (folders.hasNext()) {
      const folder = folders.next();
      Logger.log("Folder already exists: " + folder.getName());
      Logger.log("Folder ID: " + folder.getId());
      return folder.getId();
    } else {
      // Create new folder
      const newFolder = DriveApp.createFolder(DRIVE_FOLDER_NAME);
      Logger.log("New folder created: " + newFolder.getName());
      Logger.log("Folder ID: " + newFolder.getId());
      return newFolder.getId();
    }
  } catch(error) {
    Logger.log("Error creating folder: " + error.toString());
    return null;
  }
}

// Step 2: Photo Upload Function
function handlePhotoUpload(e) {
  Logger.log("=== STEP 2: PHOTO UPLOAD FUNCTION ===");
  
  try {
    // Get form data
    const fileData = e.parameter.fileData;
    const fileName = e.parameter.fileName;
    const mimeType = e.parameter.mimeType;
    
    Logger.log("File name: " + fileName);
    Logger.log("Mime type: " + mimeType);
    Logger.log("Has fileData: " + (fileData ? 'yes' : 'no'));
    
    if (!fileData || !fileName || !mimeType) {
      Logger.log("ERROR: Missing required parameters");
      return ContentService.createTextOutput("ERROR: Missing required parameters");
    }
    
    // Get or create folder
    const folder = getOrCreateFolder();
    Logger.log("Target folder: " + folder.getName());
    
    // Decode base64
    let base64Data = fileData;
    if (base64Data.startsWith('data:')) {
      base64Data = base64Data.substring(base64Data.indexOf(',') + 1);
      Logger.log("Removed data URL prefix");
    }
    
    const decodedData = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decodedData, mimeType, fileName);
    
    Logger.log("Base64 decoded successfully");
    Logger.log("Blob size: " + decodedData.length + " bytes");
    
    // Save file to Drive
    const file = folder.createFile(blob);
    const fileUrl = 'https://drive.google.com/uc?id=' + file.getId();
    
    Logger.log("SUCCESS: File uploaded to Drive");
    Logger.log("File ID: " + file.getId());
    Logger.log("File name: " + file.getName());
    Logger.log("File size: " + file.getSize() + " bytes");
    Logger.log("File URL: " + fileUrl);
    
    return ContentService.createTextOutput("SUCCESS: Photo uploaded to Drive\nFile URL: " + fileUrl);
    
  } catch(error) {
    Logger.log("ERROR in handlePhotoUpload: " + error.toString());
    Logger.log("Error stack: " + error.stack);
    return ContentService.createTextOutput("ERROR: " + error.toString());
  }
}

// Helper function to get or create folder
function getOrCreateFolder() {
  try {
    const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
    if (folders.hasNext()) {
      const folder = folders.next();
      Logger.log("Found existing folder: " + folder.getName());
      return folder;
    } else {
      const newFolder = DriveApp.createFolder(DRIVE_FOLDER_NAME);
      Logger.log("Created new folder: " + newFolder.getName());
      return newFolder;
    }
  } catch(error) {
    Logger.log("ERROR in getOrCreateFolder: " + error.toString());
    throw error;
  }
}

// Test function for Step 2
function testPhotoUpload() {
  Logger.log("=== STEP 2: TEST PHOTO UPLOAD ===");
  
  try {
    // Test folder access
    const folder = getOrCreateFolder();
    Logger.log("Folder access: SUCCESS");
    Logger.log("Folder name: " + folder.getName());
    Logger.log("Folder ID: " + folder.getId());
    
    // Test base64 decode
    const testBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
    const decodedData = Utilities.base64Decode(testBase64);
    Logger.log("Base64 decode test: SUCCESS");
    Logger.log("Decoded size: " + decodedData.length + " bytes");
    
    return "Photo upload test completed successfully";
  } catch(error) {
    Logger.log("ERROR in testPhotoUpload: " + error.toString());
    return "ERROR: " + error.toString();
  }
}

// Main function for deployment
function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'test') {
    return ContentService.createTextOutput(testPhotoUpload());
  } else {
    return ContentService.createTextOutput("Photo Upload Test - Wedding App v2 - Step 2 Ready");
  }
}

function doPost(e) {
  const action = e.parameter.action;
  
  if (action === 'uploadphoto') {
    return handlePhotoUpload(e);
  } else {
    return ContentService.createTextOutput("Photo Upload Test - Wedding App v2 - Step 2 Ready");
  }
}
