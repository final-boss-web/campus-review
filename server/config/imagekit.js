import ImageKit from 'imagekit';
import dotenv from 'dotenv';

dotenv.config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'mock_public_key',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'mock_private_key',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/mock',
});

export const getImageKitAuthParams = () => {
  try {
    return imagekit.getAuthenticationParameters();
  } catch (error) {
    throw new Error(`Failed to generate ImageKit authentication parameters: ${error.message}`);
  }
};

export default imagekit;
