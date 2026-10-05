/**
 * Client-side Image Utility for Profile Avatars
 * Automatically scales, squares, and compresses image files
 * into ultra-lightweight Base64 Data URLs (< 60KB).
 */

export const compressAndResizeImage = (file, maxWidth = 360, maxHeight = 360, quality = 0.82) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Please select a valid image file (PNG, JPG, JPEG, WEBP).'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse selected image.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio scaling
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(e.target.result); // Fallback to raw base64 if canvas context fails
        }

        // Draw image smoothly
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compact JPEG data URL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Utility to process and compress certificate and honors documents/images.
 * Supports image files (PNG, JPG, JPEG, WEBP) and PDF files.
 */
export const compressCertificateFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('Please select a certificate file.'));

    // Handle PDF files
    if (file.type === 'application/pdf') {
      if (file.size > 5 * 1024 * 1024) {
        return reject(new Error('PDF file size is too large. Please select a PDF under 5MB.'));
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          dataUrl: e.target.result,
          fileType: 'pdf',
          fileName: file.name
        });
      };
      reader.onerror = () => reject(new Error('Failed to read PDF certificate.'));
      reader.readAsDataURL(file);
      return;
    }

    // Handle Image files
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Please upload an image file (PNG, JPG, WEBP) or a PDF document.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse certificate image.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({
            dataUrl: e.target.result,
            fileType: 'image',
            fileName: file.name
          });
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve({
          dataUrl: compressedDataUrl,
          fileType: 'image',
          fileName: file.name
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Returns initials from full name (e.g., 'Vivek Kumar' -> 'VK')
 */
export const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};


