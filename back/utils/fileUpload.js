const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const { AppError } = require('../middleware/errorHandler');
const logger = require('./logger');

// 配置
const config = {
  UPLOAD_DIR: 'uploads',
  IMAGE_DIR: 'uploads/images',
  DOCUMENT_DIR: 'uploads/documents',
  TEMP_DIR: 'uploads/temp',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
  },
  ALLOWED_DOCUMENT_TYPES: {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
  }
};

class FileUpload {
  constructor() {
    this.initializeDirectories();
  }

  async initializeDirectories() {
    try {
      // 创建所需的目录
      await Promise.all([
        this.ensureDirectory(config.UPLOAD_DIR),
        this.ensureDirectory(config.IMAGE_DIR),
        this.ensureDirectory(config.DOCUMENT_DIR),
        this.ensureDirectory(config.TEMP_DIR)
      ]);
    } catch (error) {
      logger.error('Error initializing upload directories:', error);
      throw new AppError('Failed to initialize upload system', 500);
    }
  }

  async ensureDirectory(dir) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  validateFile(file, type = 'image') {
    if (!file) {
      throw new AppError('No file uploaded', 400);
    }

    if (file.size > config.MAX_FILE_SIZE) {
      throw new AppError(`File size exceeds limit (${config.MAX_FILE_SIZE / 1024 / 1024}MB)`, 400);
    }

    const allowedTypes = type === 'image' ? config.ALLOWED_IMAGE_TYPES : config.ALLOWED_DOCUMENT_TYPES;
    if (!allowedTypes[file.mimetype]) {
      throw new AppError(
        `Invalid file type. Allowed types: ${Object.keys(allowedTypes).join(', ')}`,
        400
      );
    }
  }

  generateFileName(file, userId) {
    const fileExt = this.getFileExtension(file);
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    return `${userId}_${timestamp}_${randomString}.${fileExt}`;
  }

  getFileExtension(file) {
    const allowedTypes = { ...config.ALLOWED_IMAGE_TYPES, ...config.ALLOWED_DOCUMENT_TYPES };
    return allowedTypes[file.mimetype];
  }

  getUploadDir(type = 'image') {
    return type === 'image' ? config.IMAGE_DIR : config.DOCUMENT_DIR;
  }

  async uploadFile(file, userId, type = 'image') {
    try {
      this.validateFile(file, type);

      const fileName = this.generateFileName(file, userId);
      const uploadDir = this.getUploadDir(type);
      const filePath = path.join(uploadDir, fileName);

      // 先将文件保存到临时目录
      const tempPath = path.join(config.TEMP_DIR, fileName);
      await file.mv(tempPath);

      // 移动到最终目录
      await fs.rename(tempPath, filePath);

      return {
        fileName,
        filePath,
        url: `/${uploadDir}/${fileName}`,
        size: file.size,
        type: file.mimetype
      };
    } catch (error) {
      logger.error('Error uploading file:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to upload file', 500);
    }
  }

  async uploadMultipleFiles(files, userId, type = 'image') {
    if (!Array.isArray(files)) {
      files = [files];
    }

    try {
      const uploadPromises = files.map(file => this.uploadFile(file, userId, type));
      return await Promise.all(uploadPromises);
    } catch (error) {
      logger.error('Error uploading multiple files:', error);
      throw new AppError('Failed to upload one or more files', 500);
    }
  }

  async deleteFile(fileName, type = 'image') {
    try {
      const uploadDir = this.getUploadDir(type);
      const filePath = path.join(uploadDir, fileName);

      await fs.access(filePath);
      await fs.unlink(filePath);

      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      }
      logger.error('Error deleting file:', error);
      throw new AppError('Failed to delete file', 500);
    }
  }

  async deleteMultipleFiles(fileNames, type = 'image') {
    try {
      const deletePromises = fileNames.map(fileName => this.deleteFile(fileName, type));
      return await Promise.all(deletePromises);
    } catch (error) {
      logger.error('Error deleting multiple files:', error);
      throw new AppError('Failed to delete one or more files', 500);
    }
  }

  // 清理临时文件
  async cleanupTempFiles() {
    try {
      const files = await fs.readdir(config.TEMP_DIR);
      const now = Date.now();
      const deletePromises = files.map(async (file) => {
        const filePath = path.join(config.TEMP_DIR, file);
        const stats = await fs.stat(filePath);
        // 删除超过1小时的临时文件
        if (now - stats.mtimeMs > 3600000) {
          await fs.unlink(filePath);
        }
      });
      await Promise.all(deletePromises);
    } catch (error) {
      logger.error('Error cleaning up temp files:', error);
    }
  }
}

// 创建定时任务，每小时清理一次临时文件
const fileUpload = new FileUpload();
setInterval(() => {
  fileUpload.cleanupTempFiles();
}, 3600000);

module.exports = fileUpload; 