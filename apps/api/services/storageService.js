/**
 * Storage service for handling file uploads
 * Supports both local filesystem and Google Cloud Storage
 */
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const storageConfig = require('../config/storage');

// For GCP implementation (when needed)
let storage, bucket;
if (storageConfig.storage === 'gcp') {
  const { Storage } = require('@google-cloud/storage');
  storage = new Storage({
    projectId: storageConfig.gcp.projectId,
    keyFilename: storageConfig.gcp.keyFilename,
  });
  bucket = storage.bucket(storageConfig.gcp.bucketName);
}

/**
 * Upload a file to the configured storage
 * @param {Object} file - The file object (from multer)
 * @param {String} folder - Optional subfolder to organize uploads
 * @returns {Promise<String>} - URL of the uploaded file
 */
const uploadFile = async (file, folder = '') => {
  const fileExtension = path.extname(file.originalname);
  const fileName = `${folder ? folder + '/' : ''}${uuidv4()}${fileExtension}`;

  if (storageConfig.storage === 'local') {
    // Ensure upload directory exists
    const uploadPath = path.join(storageConfig.local.uploadDir, folder);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Save file to local filesystem
    const filePath = path.join(uploadPath, path.basename(fileName));
    fs.writeFileSync(filePath, file.buffer);

    return storageConfig.local.getUrl(fileName);
  } else {
    // Upload to Google Cloud Storage
    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (err) => reject(err));
      blobStream.on('finish', () => {
        resolve(storageConfig.gcp.getUrl(fileName));
      });
      blobStream.end(file.buffer);
    });
  }
};

/**
 * Delete a file from the configured storage
 * @param {String} fileUrl - URL of the file to delete
 * @returns {Promise<Boolean>} - Success status
 */
const deleteFile = async (fileUrl) => {
  try {
    if (storageConfig.storage === 'local') {
      // Extract filename from URL
      const baseUrl = storageConfig.local.baseUrl + '/uploads/';
      if (!fileUrl.startsWith(baseUrl)) return false;

      const relativePath = fileUrl.substring(baseUrl.length);
      const filePath = path.join(storageConfig.local.uploadDir, relativePath);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } else {
      // Delete from Google Cloud Storage
      const baseUrl = `https://storage.googleapis.com/${storageConfig.gcp.bucketName}/`;
      if (!fileUrl.startsWith(baseUrl)) return false;

      const fileName = fileUrl.substring(baseUrl.length);
      await bucket.file(fileName).delete();
      return true;
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

module.exports = {
  uploadFile,
  deleteFile,
};
