// lib/cloudinary.js
import cloudinaryPkg from 'cloudinary';
import dotenv from 'dotenv'; // Import dotenv

// Load environment variables from .env file
dotenv.config();

const { v2: cloudinary } = cloudinaryPkg;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Correctly reference the environment variable
  api_key: process.env.CLOUDINARY_API_KEY,       // Correctly reference the environment variable
  api_secret: process.env.CLOUDINARY_API_SECRET, // Correctly reference the environment variable
});

export default cloudinary;