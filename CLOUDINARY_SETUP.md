# ☁️ Cloudinary File Upload Setup

## Overview

Complete file upload system with Cloudinary integration for APICTS Exchange platform.

---

## 📦 Installed Packages

- `cloudinary` - Cloudinary SDK for Node.js
- `multer` - File upload middleware
- `multer-storage-cloudinary` - Cloudinary storage for multer

---

## 🔧 Configuration

### 1. Get Cloudinary Credentials

1. Sign up at https://cloudinary.com (Free tier available)
2. Go to Dashboard
3. Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret

### 2. Update `.env.local`

Add these to your `.env.local` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 📁 File Structure

```
src/
├── lib/
│   ├── cloudinary/
│   │   ├── config.js          # Cloudinary configuration
│   │   └── upload.js          # Upload utilities
│   └── middleware/
│       └── upload.js          # Multer middleware
│
└── app/
    └── api/
        └── upload/
            ├── image/route.js          # Image upload
            ├── document/route.js       # Document upload
            ├── profile/route.js        # Profile picture upload
            ├── verification/route.js   # Verification docs upload
            └── delete/route.js         # File deletion
```

---

## 🎯 API Endpoints

### 1. Upload Image

**POST** `/api/upload/image`

Upload a single image file.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with 'image' field

**Allowed formats:** JPEG, PNG, GIF, WebP  
**Max size:** 5MB

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch('/api/upload/image', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data.url); // Cloudinary URL
```

**Response:**
```json
{
  "message": "Image uploaded successfully",
  "url": "https://res.cloudinary.com/...",
  "publicId": "apicts/images/abc123",
  "format": "jpg",
  "width": 1920,
  "height": 1080,
  "size": 245678
}
```

---

### 2. Upload Document

**POST** `/api/upload/document`

Upload documents (PDF, DOC, DOCX, Images).

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with 'document' and optional 'documentType'

**Allowed formats:** PDF, DOC, DOCX, JPG, PNG  
**Max size:** 10MB

**Example:**
```javascript
const formData = new FormData();
formData.append('document', fileInput.files[0]);
formData.append('documentType', 'nin'); // Optional: nin, bvn, passport, etc.

const response = await fetch('/api/upload/document', {
  method: 'POST',
  body: formData
});
```

**Response:**
```json
{
  "message": "Document uploaded successfully",
  "url": "https://res.cloudinary.com/...",
  "publicId": "apicts/documents/nin/abc123",
  "format": "pdf",
  "size": 1024567,
  "documentType": "nin"
}
```

---

### 3. Upload Profile Picture

**POST** `/api/upload/profile`

Upload user profile picture (authenticated).

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Headers: Authorization: Bearer {token}
- Body: FormData with 'profilePicture' field

**Allowed formats:** JPEG, PNG, WebP  
**Max size:** 2MB  
**Auto-transformations:** 400x400, face detection, quality optimization

**Example:**
```javascript
const formData = new FormData();
formData.append('profilePicture', fileInput.files[0]);

const response = await fetch('/api/upload/profile', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Response:**
```json
{
  "message": "Profile picture uploaded successfully",
  "url": "https://res.cloudinary.com/...",
  "publicId": "apicts/profiles/user_123_1234567890"
}
```

---

### 4. Upload Verification Documents

**POST** `/api/upload/verification`

Upload KYC/verification documents (authenticated).

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Headers: Authorization: Bearer {token}
- Body: FormData with:
  - `idDocument` (required) - NIN, BVN, Passport, etc.
  - `selfie` (required) - User selfie
  - `proofOfAddress` (optional) - Utility bill, etc.

**Example:**
```javascript
const formData = new FormData();
formData.append('idDocument', ninFile);
formData.append('selfie', selfieFile);
formData.append('proofOfAddress', utilityBill); // Optional

const response = await fetch('/api/upload/verification', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Response:**
```json
{
  "message": "Verification documents uploaded successfully",
  "documents": [
    {
      "type": "idDocument",
      "url": "https://res.cloudinary.com/...",
      "publicId": "apicts/verification/123/idDocument_1234567890",
      "originalName": "nin_card.jpg"
    },
    {
      "type": "selfie",
      "url": "https://res.cloudinary.com/...",
      "publicId": "apicts/verification/123/selfie_1234567890",
      "originalName": "my_selfie.jpg"
    }
  ],
  "userId": "123"
}
```

---

### 5. Delete File

**DELETE** `/api/upload/delete?publicId={publicId}&resourceType={type}`

Delete file from Cloudinary (authenticated).

**Request:**
- Method: DELETE
- Headers: Authorization: Bearer {token}
- Query params:
  - `publicId` (required) - Cloudinary public ID
  - `resourceType` (optional) - image, video, raw (default: image)

**Example:**
```javascript
const response = await fetch(
  '/api/upload/delete?publicId=apicts/images/abc123&resourceType=image',
  {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
```

**Response:**
```json
{
  "message": "File deleted successfully",
  "publicId": "apicts/images/abc123",
  "result": "ok"
}
```

---

## 🛠️ Utilities

### Available Functions

All functions are in `src/lib/cloudinary/upload.js`:

#### `uploadToCloudinary(fileBuffer, options)`
Upload single file to Cloudinary.

```javascript
const { uploadToCloudinary } = require('@/lib/cloudinary/upload');

const result = await uploadToCloudinary(buffer, {
  folder: 'apicts/images',
  resource_type: 'image',
  transformation: [{ quality: 'auto' }],
  tags: ['blog', 'featured']
});
```

#### `uploadMultipleToCloudinary(files, options)`
Upload multiple files at once.

#### `deleteFromCloudinary(publicId, options)`
Delete single file.

#### `deleteMultipleFromCloudinary(publicIds, options)`
Delete multiple files.

#### `getOptimizedImageUrl(publicId, options)`
Get optimized image URL with transformations.

```javascript
const url = getOptimizedImageUrl('apicts/images/photo', {
  width: 800,
  height: 600,
  crop: 'fill',
  quality: 'auto'
});
```

#### `getTransformedImageUrl(publicId, transformations)`
Get image URL with custom Cloudinary transformations.

---

## 📏 File Size Limits

| Type | Max Size |
|------|----------|
| Images | 5MB |
| Documents | 10MB |
| Profile Pictures | 2MB |
| Videos | 50MB |

---

## 🎨 Image Transformations

Cloudinary automatically applies optimizations:

### Profile Pictures:
- Resized to 400x400
- Face detection & cropping
- Auto quality
- Auto format (WebP for supported browsers)

### General Images:
- Auto quality optimization
- Auto format selection
- Responsive sizing

### Custom Transformations:
```javascript
const result = await uploadToCloudinary(buffer, {
  transformation: [
    { width: 1200, height: 800, crop: 'fill' },
    { quality: 'auto:good' },
    { effect: 'sharpen' },
    { fetch_format: 'auto' }
  ]
});
```

---

## 📂 Folder Structure in Cloudinary

```
apicts/
├── images/              # General images
├── documents/
│   ├── nin/            # NIN documents
│   ├── bvn/            # BVN documents
│   ├── passport/       # Passport documents
│   └── general/        # Other documents
├── profiles/           # User profile pictures
├── verification/
│   └── {userId}/       # User-specific verification docs
└── blog/               # Blog images
```

---

## 🔒 Security Features

1. **File Type Validation:** Only allowed file types can be uploaded
2. **File Size Limits:** Prevents large file uploads
3. **Authentication:** Profile and verification uploads require auth
4. **Secure URLs:** All URLs use HTTPS
5. **Public ID Control:** Organized folder structure
6. **Auto-deletion:** Old files can be cleaned up

---

## ✅ Testing

### Test Image Upload:

```bash
curl -X POST http://localhost:3000/api/upload/image \
  -F "image=@/path/to/image.jpg"
```

### Test with Authentication:

```bash
curl -X POST http://localhost:3000/api/upload/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "profilePicture=@/path/to/image.jpg"
```

---

## 💡 Pro Tips

1. **Use transformations** to reduce bandwidth
2. **Enable auto-format** for WebP support
3. **Use folders** to organize files
4. **Tag files** for easy searching
5. **Set up webhooks** for upload notifications
6. **Use signed URLs** for private files
7. **Enable backup** in Cloudinary settings

---

## 🚀 Next Steps

1. ✅ Credentials configured in `.env.local`
2. ✅ Test image upload endpoint
3. ✅ Test document upload
4. ✅ Integrate with user registration
5. ✅ Add file upload to forms
6. ✅ Set up automated backups

---

## 📚 Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Image Transformations](https://cloudinary.com/documentation/image_transformations)
- [Upload API](https://cloudinary.com/documentation/upload_images)

---

**Your file upload system is ready to use!** 🎉

