import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const parseCloudinaryUrl = (url) => {
  if (!url) return null;
  const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (!match) return null;
  return {
    apiKey: match[1],
    apiSecret: match[2],
    cloudName: match[3]
  };
};

const parsed = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
if (parsed) {
  cloudinary.config({
    cloud_name: parsed.cloudName,
    api_key: parsed.apiKey,
    api_secret: parsed.apiSecret,
    secure: true
  });
} else {
  // Mock config for fallback
  cloudinary.config({
    cloud_name: 'mock_cloud_name',
    api_key: 'mock_api_key',
    api_secret: 'mock_api_secret',
    secure: true
  });
}

export const getCloudinaryAuthParams = () => {
  try {
    const config = cloudinary.config();
    const isMock = config.api_key === 'mock_api_key' || !process.env.CLOUDINARY_URL;

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'campus-review';

    let signature = '';
    if (!isMock) {
      signature = cloudinary.utils.api_sign_request(
        {
          timestamp,
          folder,
        },
        config.api_secret
      );
    }

    return {
      signature,
      timestamp,
      apiKey: config.api_key,
      cloudName: config.cloud_name,
      folder,
      isMock,
    };
  } catch (error) {
    throw new Error(`Failed to generate Cloudinary authentication parameters: ${error.message}`);
  }
};

export default cloudinary;
