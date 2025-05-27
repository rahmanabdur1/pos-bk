// lib/imgbb.js
import axios from 'axios'; // Import axios
import dotenv from 'dotenv'; // Import dotenv

dotenv.config(); // Load environment variables

const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';
const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

if (!IMGBB_API_KEY) {
  console.error('IMGBB_API_KEY is not defined in your .env file!');
  // Consider exiting the process or throwing an error if the key is critical
}

const imgbb = {
  // Function to upload a base64 image to ImgBB
  upload: async (base64Image) => {
    // Remove the "data:image/jpeg;base64," part if it exists
    const cleanedBase64 = base64Image.split(',')[1] || base64Image;

    try {
      const response = await axios.post(IMGBB_UPLOAD_URL, null, {
        params: {
          key: IMGBB_API_KEY,
          image: cleanedBase64,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // ImgBB prefers this
        },
        // ImgBB free tier limit is 32MB for direct uploads
        // For larger files, you might need to adjust or use premium features
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      if (response.data && response.data.data) {
        return response.data.data; // This contains URL, dimensions, size, etc.
      } else {
        throw new Error('ImgBB upload response missing data.');
      }
    } catch (error) {
      console.error('ImgBB upload error:', error.response?.data || error.message);
      throw new Error(`ImgBB upload failed: ${error.response?.data?.error?.message || error.message}`);
    }
  },

  // ImgBB doesn't have a public API for deleting images by public_id
  // You can only delete via the delete_url returned at upload time.
  // If you need permanent deletion, you'll need to store delete_url.
  delete: async (deleteUrl) => {
    if (!deleteUrl) {
      console.warn("No delete URL provided for ImgBB deletion.");
      return { success: false, message: "No delete URL provided." };
    }
    try {
      // ImgBB delete works by making a GET request to the delete_url
      const response = await axios.get(deleteUrl);
      if (response.data && response.data.success) {
        return { success: true, message: "Image deleted from ImgBB." };
      } else {
        throw new Error(`ImgBB deletion failed: ${response.data.status_code} - ${response.data.error.message}`);
      }
    } catch (error) {
      console.error('ImgBB delete error:', error.response?.data || error.message);
      throw new Error(`ImgBB deletion failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }
};

export default imgbb;