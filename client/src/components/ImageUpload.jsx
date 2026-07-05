import React, { useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import axios from 'axios';
import api from '../services/api.js';

/**
 * Helper to compress images on the client side before upload
 */
const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

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

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas is empty'));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const ImageUpload = ({ images, onChange, maxFiles = 15, label = 'Upload Images' }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (images.length + files.length > maxFiles) {
      setError(`You can only upload a maximum of ${maxFiles} images.`);
      return;
    }

    setError('');
    setUploading(true);

    try {
      const uploadedImages = [];

      for (const file of files) {
        // Validate File Type
        if (!file.type.startsWith('image/')) {
          setError(`File ${file.name} is not an image.`);
          continue;
        }

        // Validate Original Size limit (Max 5MB for actual uploads)
        if (file.size > 5 * 1024 * 1024) {
          setError(`File ${file.name} is too large. Max size allowed is 5MB.`);
          continue;
        }

        let fileToUpload = file;

        // 1. Get upload auth parameters from the unified auth endpoint
        let signatureData;
        let isMock = false;
        try {
          const { data } = await api.get('/upload/auth');
          signatureData = data;
        } catch (err) {
          console.warn('Backend upload credentials not configured. Using simulator mock upload.');
          isMock = true;
        }

        const provider = signatureData?.provider || 'imagekit';
        
        if (isMock || !signatureData) {
          // Simulator fallback if backend endpoint is unavailable
          await new Promise((resolve) => setTimeout(resolve, 800)); // simulate network delay
          const mockId = 'mock_' + (provider === 'cloudinary' ? 'cl_' : 'ik_') + Math.floor(Math.random() * 1000000);
          
          // Re-compress aggressively for local base64 storage to avoid DB bloating and lag
          let lowResFile = fileToUpload;
          try {
            lowResFile = await compressImage(fileToUpload, 400, 400, 0.4);
          } catch (e) {
            console.warn('Low-res compression skipped:', e);
          }

          const base64Data = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(lowResFile);
          });

          uploadedImages.push({
            url: base64Data,
            fileId: mockId,
            thumbnailUrl: base64Data,
          });
        } else if (provider === 'imagekit') {
          // Actual ImageKit direct upload
          const formData = new FormData();
          formData.append('file', fileToUpload);
          formData.append('fileName', fileToUpload.name);
          formData.append('publicKey', signatureData.publicKey || '');
          formData.append('signature', signatureData.signature);
          formData.append('expire', signatureData.expire);
          formData.append('token', signatureData.token);

          // Upload direct to ImageKit endpoint
          const uploadRes = await axios.post(
            'https://upload.imagekit.io/api/v1/files/upload',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          uploadedImages.push({
            url: uploadRes.data.url,
            fileId: uploadRes.data.fileId,
            thumbnailUrl: uploadRes.data.thumbnailUrl,
          });
        } else if (provider === 'cloudinary') {
          // Actual Cloudinary direct upload
          const formData = new FormData();
          formData.append('file', fileToUpload);
          formData.append('api_key', signatureData.apiKey);
          formData.append('timestamp', signatureData.timestamp);
          formData.append('signature', signatureData.signature);
          formData.append('folder', signatureData.folder);

          const uploadRes = await axios.post(
            `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          uploadedImages.push({
            url: uploadRes.data.secure_url || uploadRes.data.url,
            fileId: uploadRes.data.public_id,
            thumbnailUrl: uploadRes.data.secure_url || uploadRes.data.url,
          });
        }
      }

      onChange([...images, ...uploadedImages]);
    } catch (err) {
      console.error('Upload error:', err);
      const serverMsg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : '');
      const errMsg = serverMsg || err.message || 'Unknown network error';
      setError(`Upload Failed: ${errMsg}. Please verify that your IMAGEKIT keys in the server's .env are correct.`);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (fileIdOrUrl) => {
    onChange(images.filter((img) => img.fileId !== fileIdOrUrl && img.url !== fileIdOrUrl));
  };

  return (
    <div className="space-y-3">
      <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </span>
      
      {/* File Upload Selector */}
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-slate-100/50 dark:bg-slate-100/50 hover:bg-slate-100 dark:hover:bg-slate-100 transition-colors relative">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {uploading ? (
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            <p className="text-xs text-slate-500">Uploading media to secure hosting...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2 pointer-events-none">
            <Upload className="w-8 h-8 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Drag & Drop or Click to Upload
            </span>
            <span className="text-[10px] text-slate-400">Max size 5MB. Supports JPG, PNG, WebP.</span>
          </div>
        )}
      </div>

      {error && (
        <span className="block text-xs text-red-500 font-semibold">{error}</span>
      )}

      {/* Previews Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-5 gap-3 mt-3">
          {images.map((img, idx) => (
            <div key={img.fileId || img.url || idx} className="relative group rounded-xl overflow-hidden aspect-video border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
              <img
                src={img.thumbnailUrl || img.url}
                alt="Upload preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(img.fileId || img.url)}
                className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-red-600 rounded-full text-white transition opacity-0 group-hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
