const multer = require('multer');

// Configure multer for memory storage (we'll upload to Cloudinary)
const storage = multer.memoryStorage();

// File filter for images only
const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// File filter for documents
const documentFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and images are allowed.'), false);
  }
};

// File filter for all types
const allFilesFilter = (req, file, cb) => {
  cb(null, true);
};

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024,      // 5MB
  document: 10 * 1024 * 1024,  // 10MB
  video: 50 * 1024 * 1024,     // 50MB
  all: 20 * 1024 * 1024        // 20MB
};

// Upload configurations
const uploadConfigs = {
  // Single image upload
  singleImage: multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: FILE_SIZE_LIMITS.image }
  }).single('image'),

  // Multiple images upload (max 10)
  multipleImages: multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: { 
      fileSize: FILE_SIZE_LIMITS.image,
      files: 10
    }
  }).array('images', 10),

  // Single document upload
  singleDocument: multer({
    storage: storage,
    fileFilter: documentFileFilter,
    limits: { fileSize: FILE_SIZE_LIMITS.document }
  }).single('document'),

  // Multiple documents upload (max 5)
  multipleDocuments: multer({
    storage: storage,
    fileFilter: documentFileFilter,
    limits: { 
      fileSize: FILE_SIZE_LIMITS.document,
      files: 5
    }
  }).array('documents', 5),

  // Profile picture upload
  profilePicture: multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB for profile pictures
  }).single('profilePicture'),

  // Verification documents (NIN, BVN, etc.)
  verificationDocuments: multer({
    storage: storage,
    fileFilter: documentFileFilter,
    limits: { 
      fileSize: FILE_SIZE_LIMITS.document,
      files: 3
    }
  }).fields([
    { name: 'idDocument', maxCount: 1 },
    { name: 'proofOfAddress', maxCount: 1 },
    { name: 'selfie', maxCount: 1 }
  ]),

  // Any file type upload
  anyFile: multer({
    storage: storage,
    fileFilter: allFilesFilter,
    limits: { fileSize: FILE_SIZE_LIMITS.all }
  }).any()
};

// Error handler for multer
const handleMulterError = (error) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return 'File size is too large. Maximum size allowed is specified per file type.';
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return 'Too many files. Maximum number of files exceeded.';
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return 'Unexpected field name. Please check your file upload field.';
    }
    return error.message;
  }
  return error.message || 'File upload error';
};

module.exports = {
  uploadConfigs,
  handleMulterError,
  FILE_SIZE_LIMITS
};

