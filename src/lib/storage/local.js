const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

/**
 * Ensure upload directory exists
 */
const ensureUploadDir = async (subDir = '') => {
  const dir = subDir ? path.join(UPLOAD_DIR, subDir) : UPLOAD_DIR;
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
  return dir;
};

/**
 * Upload file to local storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result with URL
 */
const uploadToLocal = async (fileBuffer, options = {}) => {
  try {
    const folder = options.folder || 'documents';
    const uploadDir = await ensureUploadDir(folder);
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = options.format || 'jpg';
    const publicId = options.public_id || `file_${timestamp}_${randomString}`;
    const filename = `${publicId}.${extension}`;
    
    const filePath = path.join(uploadDir, filename);
    
    // Write file to disk
    await fs.writeFile(filePath, fileBuffer);
    
    // Generate public URL
    const publicUrl = `/uploads/${folder}/${filename}`;
    
    return {
      secure_url: publicUrl,
      public_id: publicId,
      url: publicUrl,
      format: extension,
      bytes: fileBuffer.length,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Local upload error:', error);
    throw error;
  }
};

/**
 * Delete file from local storage
 * @param {string} publicId - Public ID of the file
 * @param {string} folder - Folder path
 */
const deleteFromLocal = async (publicId, folder = 'documents') => {
  try {
    const uploadDir = path.join(UPLOAD_DIR, folder);
    const files = await fs.readdir(uploadDir);
    
    // Find file with matching public_id
    const fileToDelete = files.find(file => file.startsWith(publicId));
    
    if (fileToDelete) {
      const filePath = path.join(uploadDir, fileToDelete);
      await fs.unlink(filePath);
      return { result: 'ok' };
    }
    
    return { result: 'not found' };
  } catch (error) {
    console.error('Local delete error:', error);
    throw error;
  }
};

module.exports = {
  uploadToLocal,
  deleteFromLocal,
  ensureUploadDir
};
