/**
 * Modifies Cloudinary and ImageKit URLs to request compressed and resized formats.
 * Fallbacks to the original URL if not from these providers.
 * 
 * @param {Object|String} imageObj - The image object containing url and thumbnailUrl, or the raw url string
 * @param {Number} width - Requested width of the image
 * @param {Number} height - Requested height of the image
 * @returns {String} Optimized image URL
 */
export const getOptimizedImageUrl = (imageObj, width = 600, height = 400) => {
  if (!imageObj) return '';
  
  let url = '';
  let thumbnailUrl = '';
  
  if (typeof imageObj === 'string') {
    url = imageObj;
  } else {
    url = imageObj.url || '';
    thumbnailUrl = imageObj.thumbnailUrl || '';
  }
  
  if (!url) return '';
  
  // Base64 (mock uploads) don't need optimization
  if (url.startsWith('data:')) {
    return url;
  }
  
  // Cloudinary Optimization
  if (url.includes('cloudinary.com')) {
    // Inserts dynamic quality and size optimization parameters e.g., /upload/w_600,h_400,c_fill,g_auto,f_auto,q_auto/
    return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill,g_auto,f_auto,q_auto/`);
  }
  
  // ImageKit Optimization
  if (url.includes('imagekit.io')) {
    // Use thumbnailUrl if it exists and width is small (e.g. standard thumbnails)
    if (thumbnailUrl && width <= 200) {
      return thumbnailUrl;
    }
    // Append or append to existing search parameters
    const param = `tr=w-${width},h-${height},fo-auto,q-80`;
    return url.includes('?') ? `${url}&${param}` : `${url}?${param}`;
  }
  
  return url;
};

export default getOptimizedImageUrl;
