// cloudinaryUpload.js
import apiService from '../services/api';

/**
 * Upload image to Cloudinary using signed upload
 * @param {string} imageUri - The local URI of the image to upload
 * @param {string} cloudName - Your Cloudinary cloud name
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export const uploadImageToCloudinary = async (imageUri, cloudName) => {
  try {
    // Get timestamp for signature
    const timestamp = Math.round((new Date()).getTime() / 1000);

    // Get signature from backend
    const signatureResponse = await apiService.request('/upload/cloudinary-signature', {
      method: 'POST',
      body: JSON.stringify({ timestamp })
    });

    if (!signatureResponse.success) {
      throw new Error('Failed to get upload signature');
    }

    const { signature, api_key, folder } = signatureResponse.data;

    // Create form data
    const formData = new FormData();

    // Extract file name and type from URI
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // Append image file to form data
    formData.append('file', {
      uri: imageUri,
      type: type,
      name: filename,
    });

    // Append signed upload parameters
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('api_key', api_key);
    formData.append('folder', folder);

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const data = await response.json();
    console.log('Cloudinary response:', data);

    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error(`Upload failed: ${data.error?.message || 'No URL returned'}`);
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Upload image with progress tracking using signed upload
 * @param {string} imageUri - The local URI of the image
 * @param {string} cloudName - Your Cloudinary cloud name
 * @param {function} onProgress - Callback for upload progress (optional)
 * @returns {Promise<object>} - Object containing secure_url and other image details
 */
export const uploadImageWithProgress = async (
  imageUri,
  cloudName,
  onProgress
) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get timestamp for signature
      const timestamp = Math.round((new Date()).getTime() / 1000);

      // Get signature from backend
      const signatureResponse = await apiService.request('/upload/cloudinary-signature', {
        method: 'POST',
        body: JSON.stringify({ timestamp })
      });

      if (!signatureResponse.success) {
        reject(new Error('Failed to get upload signature'));
        return;
      }

      const { signature, api_key, folder } = signatureResponse.data;

      const xhr = new XMLHttpRequest();
      const formData = new FormData();

      // Extract file info
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri: imageUri,
        type: type,
        name: filename,
      });

      // Append signed upload parameters
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('api_key', api_key);
      formData.append('folder', folder);

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
      xhr.send(formData);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array<string>} imageUris - Array of local image URIs
 * @param {string} cloudName - Your Cloudinary cloud name
 * @returns {Promise<Array<string>>} - Array of secure URLs
 */
export const uploadMultipleImages = async (imageUris, cloudName) => {
  try {
    const uploadPromises = imageUris.map((uri) =>
      uploadImageToCloudinary(uri, cloudName)
    );

    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};