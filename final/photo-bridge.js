// Photo Bridge - Connect Upload API to Wedding Invitation
// This script bridges uploaded photos to the invitation display

// Store uploaded photos in memory (for this session)
let uploadedPhotos = {
    groom: [],
    bride: [],
    engagement: [],
    prewedding: [],
    moments: [],
    together: []
};

// Function to store uploaded photo
function storeUploadedPhoto(category, photoInfo) {
    if (!uploadedPhotos[category]) {
        uploadedPhotos[category] = [];
    }
    uploadedPhotos[category].push(photoInfo);
    
    // For groom/bride, also store in legacy format for invitation
    if (category === 'groom' && photoInfo.originalName.toLowerCase().includes('pria')) {
        uploadedPhotos.groom.push({
            ...photoInfo,
            legacyPath: 'groom/pria.jpg',
            dataUrl: photoInfo.dataUrl
        });
    } else if (category === 'bride' && photoInfo.originalName.toLowerCase().includes('wanita')) {
        uploadedPhotos.bride.push({
            ...photoInfo,
            legacyPath: 'bride/wanita.jpg',
            dataUrl: photoInfo.dataUrl
        });
    }
    
    console.log('Stored photo:', category, photoInfo.originalName);
}

// Function to get photo for invitation
function getPhotoForInvitation(category) {
    const photos = uploadedPhotos[category] || [];
    
    // Return most recent photo with dataUrl
    const photoWithDataUrl = photos.find(p => p.dataUrl);
    if (photoWithDataUrl) {
        return photoWithDataUrl;
    }
    
    // Fallback to first photo
    return photos[0] || null;
}

// Function to get all photos for management
function getAllPhotos() {
    return uploadedPhotos;
}

// Integration with management panel
if (typeof window !== 'undefined') {
    // Override the uploadPhoto function to store photos
    const originalUploadPhoto = window.uploadPhoto;
    
    window.uploadPhoto = function(file, category) {
        // Call original upload function
        originalUploadPhoto(file, category).then(result => {
            if (result.success) {
                // Store the uploaded photo
                storeUploadedPhoto(category, result.fileInfo);
                
                // Update invitation if it's open
                updateInvitationPhotos(category);
            }
        });
    };
    
    // Function to update invitation photos
    function updateInvitationPhotos(category) {
        const photo = getPhotoForInvitation(category);
        if (photo && photo.dataUrl) {
            // Update photo elements in invitation
            const photoElements = document.querySelectorAll(`[data-category="${category}"] img`);
            photoElements.forEach(element => {
                element.src = photo.dataUrl;
                element.onerror = null; // Clear any previous error
            });
        }
    }
}

// Export functions for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        storeUploadedPhoto,
        getPhotoForInvitation,
        getAllPhotos
    };
}
