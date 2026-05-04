# Wedding App v2 - Fresh Start

## 📁 Project Structure
```
wedding-app-v2/
├── wedding-script-v2.gs    # Google Apps Script backend
├── index-v2.html          # Frontend undangan
├── management-v2.html     # Admin management
└── README.md              # Documentation
```

## 🚀 Setup Instructions

### 1. Google Apps Script Setup
1. Buka [script.google.com](https://script.google.com)
2. Create new project
3. Copy content dari `wedding-script-v2.gs`
4. Update `SPREADSHEET_ID` dengan ID Google Sheets
5. Deploy sebagai Web App:
   - Type: Web app
   - Execute as: Me
   - Access: Anyone
   - Copy Web App URL

### 2. Google Sheets Setup
1. Create new Google Sheets
2. Create sheets:
   - `Guests` (columns: Timestamp, Name, Message, Attendance)
   - `Config` (columns: Key, Value)
3. Copy Spreadsheet ID
4. Update di `wedding-script-v2.gs`

### 3. Frontend Setup
1. Update `CONFIG.WEB_APP_URL` di `index-v2.html` dan `management-v2.html`
2. Upload ke GitHub Pages atau hosting lainnya
3. Test semua fitur

## 🎯 Features

### Index-v2.html (Undangan)
- 📸 Auto-load photos dari Google Drive
- ⏰ Countdown timer
- 📝 RSVP form dengan Google Sheets integration
- 📱 Responsive design

### Management-v2.html (Admin)
- 📸 Photo upload ke Google Drive
- 👥 Guest list management
- 📊 Dashboard statistics
- ⚙️ Configuration settings

### wedding-script-v2.gs (Backend)
- 📁 Google Drive folder management
- 📊 Google Sheets integration
- 🖼️ Photo upload & retrieval
- 👥 Guest data management

## 🔧 Configuration

### Required Scopes
- `https://www.googleapis.com/auth/drive`
- `https://www.googleapis.com/auth/spreadsheets`
- `https://www.googleapis.com/auth/script.external_request`

### Environment Variables
```javascript
const CONFIG = {
    WEB_APP_URL: 'YOUR_WEB_APP_URL_HERE',
    SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',
    DRIVE_FOLDER_NAME: 'Wedding_Photos_V2',
    ADMIN_PASSWORD: 'kawinkawin'
};
```

## 🚀 Quick Start

1. **Deploy Google Apps Script**
   ```bash
   # Copy wedding-script-v2.gs ke script.google.com
   # Deploy sebagai Web App
   # Copy Web App URL
   ```

2. **Setup Google Sheets**
   ```bash
   # Create new Google Sheets
   # Add sheets: Guests, Config
   # Copy Spreadsheet ID
   ```

3. **Update Configuration**
   ```bash
   # Update WEB_APP_URL di HTML files
   # Update SPREADSHEET_ID di script
   ```

4. **Test Integration**
   ```bash
   # Upload index-v2.html ke hosting
   # Upload management-v2.html ke hosting
   # Test semua fitur
   ```

## 🎉 Success Indicators

✅ Photo upload berhasil ke Google Drive  
✅ RSVP data tersimpan di Google Sheets  
✅ Photos auto-load di halaman undangan  
✅ Dashboard menampilkan statistik real-time  
✅ Admin login berfungsi dengan benar  

## 🔍 Troubleshooting

### Photo tidak muncul
- Check Google Apps Script permissions
- Verify Drive folder exists
- Check execution logs

### RSVP tidak tersimpan
- Verify Spreadsheet ID
- Check Sheets permissions
- Check script execution logs

### Login tidak berhasil
- Verify admin password
- Check localStorage settings
- Clear browser cache

## 📞 Support

Jika ada masalah:
1. Check Google Apps Script execution logs
2. Verify semua permissions
3. Check configuration values
4. Test dengan data dummy
