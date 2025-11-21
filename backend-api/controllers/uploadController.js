const { uploadImage, uploadMultipleImages, deleteImage } = require('../config/cloudinary');
const { cleanupFiles } = require('../middleware/upload');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');
const path = require('path');
const fs = require('fs');

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to Cloudinary
    const result = await uploadImage(req.file, req.body.folder || 'elsoug');

    // Clean up local file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      success: true,
      data: result,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    // Clean up local file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Upload single image error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image'
    });
  }
};

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
const uploadMultipleImagesHandler = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Upload to Cloudinary
    const results = await uploadMultipleImages(req.files, req.body.folder || 'elsoug');

    // Clean up local files
    req.files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });

    res.json({
      success: true,
      data: results,
      message: 'Images uploaded successfully'
    });
  } catch (error) {
    // Clean up local files on error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    console.error('Upload multiple images error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload images'
    });
  }
};

// @desc    Upload avatar
// @route   POST /api/upload/avatar
// @access  Private
const uploadAvatarHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No avatar file uploaded'
      });
    }

    // Upload to Cloudinary with avatar-specific transformations
    const result = await uploadImage(req.file, 'elsoug/avatars');

    // Clean up local file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      success: true,
      data: result,
      message: 'Avatar uploaded successfully'
    });
  } catch (error) {
    // Clean up local file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload avatar'
    });
  }
};

// @desc    Upload store logo
// @route   POST /api/upload/store-logo
// @access  Private
const uploadStoreLogoHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No logo file uploaded'
      });
    }

    // Upload to Cloudinary with logo-specific transformations
    const result = await uploadImage(req.file, 'elsoug/store-logos');

    // Clean up local file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      success: true,
      data: result,
      message: 'Store logo uploaded successfully'
    });
  } catch (error) {
    // Clean up local file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Upload store logo error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload store logo'
    });
  }
};

// @desc    Delete image
// @route   DELETE /api/upload/image/:publicId
// @access  Private
const deleteImageHandler = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    // Delete from Cloudinary
    const result = await deleteImage(publicId);

    res.json({
      success: true,
      data: result,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete image'
    });
  }
};

// @desc    Upload mixed files (images, videos, documents)
// @route   POST /api/upload/mixed
// @access  Private
const uploadMixedFilesHandler = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const results = {
      images: [],
      videos: [],
      documents: [],
      audio: []
    };

    const folder = req.body.folder || 'elsoug';

    // Process each file type
    for (const [fieldName, files] of Object.entries(req.files)) {
      if (files && files.length > 0) {
        try {
          const uploadResults = await uploadMultipleImages(files, `${folder}/${fieldName}`);
          results[fieldName] = uploadResults;

          // Clean up local files
          files.forEach(file => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
        } catch (error) {
          console.error(`Error uploading ${fieldName}:`, error);
          // Clean up local files on error
          files.forEach(file => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
        }
      }
    }

    res.json({
      success: true,
      data: results,
      message: 'Files uploaded successfully'
    });
  } catch (error) {
    // Clean up all local files on error
    if (req.files) {
      cleanupFiles(req.files);
    }

    console.error('Upload mixed files error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload files'
    });
  }
};

// @desc    Get upload signature for direct uploads
// @route   GET /api/upload/signature
// @access  Private
const getUploadSignature = async (req, res) => {
  try {
    const { folder = 'elsoug', resource_type = 'auto' } = req.query;
    
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
      timestamp,
      folder,
      resource_type
    };

    const signature = require('cloudinary').v2.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      success: true,
      data: {
        signature,
        timestamp,
        api_key: process.env.CLOUDINARY_API_KEY,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        folder,
        resource_type
      }
    });
  } catch (error) {
    console.error('Get upload signature error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate upload signature'
    });
  }
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImagesHandler,
  uploadAvatarHandler,
  uploadStoreLogoHandler,
  deleteImageHandler,
  uploadMixedFilesHandler,
  getUploadSignature
};