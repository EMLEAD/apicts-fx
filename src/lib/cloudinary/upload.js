const cloudinary = require('./config');
const { Readable } = require('stream');

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from upload
 * @param {Object} options - Upload options
 * @returns {Promise} Cloudinary upload result
 */
const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'apicts',
        resource_type: options.resource_type || 'auto',
        transformation: options.transformation || null,
        public_id: options.public_id || undefined,
        overwrite: options.overwrite || false,
        tags: options.tags || []
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    const bufferStream = Readable.from(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
};

/**
 * Upload multiple files to Cloudinary
 * @param {Array} files - Array of file objects with buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Array>} Array of upload results
 */
const uploadMultipleToCloudinary = async (files, options = {}) => {
  try {
    const uploadPromises = files.map(file => 
      uploadToCloudinary(file.buffer, {
        ...options,
        public_id: options.public_id ? `${options.public_id}_${Date.now()}` : undefined
      })
    );
    
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new Error(`Multiple upload failed: ${error.message}`);
  }
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Public ID of the file to delete
 * @param {Object} options - Delete options
 * @returns {Promise} Cloudinary delete result
 */
const deleteFromCloudinary = async (publicId, options = {}) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: options.resource_type || 'image',
      invalidate: true
    });
    return result;
  } catch (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
};

/**
 * Delete multiple files from Cloudinary
 * @param {Array} publicIds - Array of public IDs to delete
 * @param {Object} options - Delete options
 * @returns {Promise} Cloudinary delete result
 */
const deleteMultipleFromCloudinary = async (publicIds, options = {}) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: options.resource_type || 'image',
      invalidate: true
    });
    return result;
  } catch (error) {
    throw new Error(`Multiple delete failed: ${error.message}`);
  }
};

/**
 * Get optimized image URL
 * @param {String} publicId - Public ID of the image
 * @param {Object} options - Transformation options
 * @returns {String} Optimized image URL
 */
const getOptimizedImageUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    width: options.width || 800,
    height: options.height || 600,
    crop: options.crop || 'fill',
    quality: options.quality || 'auto',
    fetch_format: 'auto',
    ...options
  });
};

/**
 * Generate image transformation URL
 * @param {String} publicId - Public ID of the image
 * @param {Object} transformations - Cloudinary transformations
 * @returns {String} Transformed image URL
 */
const getTransformedImageUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, transformations);
};

module.exports = {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  getOptimizedImageUrl,
  getTransformedImageUrl,
  cloudinary
};

