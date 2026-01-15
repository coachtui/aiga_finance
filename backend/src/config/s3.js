const AWS = require('aws-sdk');
const logger = require('../utils/logger');

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'aiga-finance-attachments';

let s3Instance = null;

/**
 * Check if S3 is configured (for local dev without AWS)
 */
function isS3Configured() {
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;

  // Return false if no AWS credentials or if they're empty
  if (!accessKey || !secretKey) {
    return false;
  }

  // Check if keys are not placeholder/example values
  const isValid =
    accessKey.length > 10 && // Real AWS keys are longer
    secretKey.length > 10 &&
    !accessKey.toLowerCase().includes('your_') &&
    !secretKey.toLowerCase().includes('your_') &&
    !accessKey.toLowerCase().includes('example') &&
    !accessKey.toLowerCase().includes('placeholder');

  return isValid;
}

/**
 * Get S3 instance (lazy initialization)
 */
function getS3() {
  if (!s3Instance) {
    s3Instance = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }
  return s3Instance;
}

/**
 * Upload file to S3
 */
async function uploadToS3(file, folder = 'expenses') {
  if (!isS3Configured()) {
    throw new Error('S3 is not configured');
  }

  const s3 = getS3();
  const fileExtension = file.originalname.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'private', // Files are private by default
  };

  try {
    const result = await s3.upload(params).promise();
    logger.info('File uploaded to S3:', { fileName, location: result.Location });
    return {
      key: result.Key,
      location: result.Location,
      bucket: result.Bucket,
    };
  } catch (error) {
    logger.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
}

/**
 * Get signed URL for file access (temporary link)
 */
function getSignedUrl(key, expiresIn = 3600) {
  if (!isS3Configured()) {
    throw new Error('S3 is not configured');
  }

  const s3 = getS3();
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Expires: expiresIn, // URL expires in 1 hour by default
  };

  try {
    const url = s3.getSignedUrl('getObject', params);
    return url;
  } catch (error) {
    logger.error('Error generating signed URL:', error);
    throw new Error('Failed to generate file access URL');
  }
}

/**
 * Delete file from S3
 */
async function deleteFromS3(key) {
  if (!isS3Configured()) {
    throw new Error('S3 is not configured');
  }

  const s3 = getS3();
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };

  try {
    await s3.deleteObject(params).promise();
    logger.info('File deleted from S3:', { key });
    return true;
  } catch (error) {
    logger.error('S3 delete error:', error);
    throw new Error('Failed to delete file from S3');
  }
}

module.exports = {
  uploadToS3,
  getSignedUrl,
  deleteFromS3,
  isS3Configured,
  BUCKET_NAME,
};
