/**
 * Storage configuration for handling file uploads
 * Supports both local filesystem and Google Cloud Storage
 */
const path = require('path');

const config = {
  // Environment-based storage selection
  storage: process.env.NODE_ENV === 'production' ? 'gcp' : 'local',
  
  // Local storage configuration
  local: {
    uploadDir: path.join(__dirname, '../uploads'),
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    getUrl: function(filename) {
      return `${this.baseUrl}/uploads/${filename}`;
    }
  },
  
  // GCP storage configuration
  gcp: {
    bucketName: process.env.GCP_BUCKET_NAME || 'puretome-uploads',
    projectId: process.env.GCP_PROJECT_ID,
    keyFilename: process.env.GCP_KEY_FILE,
    getUrl: function(filename) {
      return `https://storage.googleapis.com/${this.bucketName}/${filename}`;
    }
  }
};

module.exports = config;