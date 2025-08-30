// utils/fileUpload.js

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * Convert file to base64 data URL with compression for images
 */
export const fileToDataUrl = (file, maxWidth = 1920, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (file.type.startsWith('image/')) {
      // Compress images
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL(file.type, quality);
        resolve(compressedDataUrl);
      };
      
      img.onerror = reject;
      
      const reader = new FileReader();
      reader.onload = () => img.src = reader.result;
      reader.onerror = reject;
      reader.readAsDataURL(file);
    } else {
      // For non-images, use standard conversion
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }
  });
};

/**
 * Upload file and return URL
 * For demo purposes, this creates a data URL
 * In production, this would upload to cloud storage
 */
export const uploadFile = async (file, token) => {
  try {
    // Validate file
    if (!file) throw new Error('No file provided');
    
    // Increased limits to match backend
    const maxSize = 25 * 1024 * 1024; // 25MB (leaving some overhead for base64 encoding)
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
    }

    // For demo: convert to compressed data URL
    const dataUrl = await fileToDataUrl(file);
    
    // Check final size after base64 encoding
    const base64Size = dataUrl.length * 0.75; // Approximate size after base64 encoding
    if (base64Size > 40 * 1024 * 1024) { // 40MB limit for final payload
      throw new Error('File too large after encoding. Please use a smaller file or lower quality image.');
    }
    
    // In production, you would:
    // 1. Create FormData
    // const formData = new FormData();
    // formData.append('file', file);
    // 
    // 2. Upload to your backend
    // const response = await fetch(`${API_BASE}/api/upload`, {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${token}` },
    //   body: formData
    // });
    // 
    // 3. Return the uploaded file URL
    // const { url } = await response.json();
    // return url;

    // For demo, return the compressed data URL
    return {
      url: dataUrl,
      originalName: file.name,
      size: file.size,
      type: getFileType(file)
    };
    
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

/**
 * Get file type category
 */
export const getFileType = (file) => {
  if (file.type.startsWith('image/')) return 'photo';
  if (file.type === 'application/pdf') return 'pdf';
  return 'file';
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

/**
 * Validate file type
 */
export const isValidFileType = (file) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf'
  ];
  return allowedTypes.includes(file.type);
};
