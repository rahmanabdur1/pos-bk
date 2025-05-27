import Image from '../models/media.model.js'; // Renamed import from Media to Image for consistency
import cloudinary from '../lib/cloudinary.js';

const MAX_FILE_SIZE_BYTES_BACKEND = 40 * 1024 * 1024; // 40 MB

export const uploadImage = async (req, res) => {
  try {
    const { image, name, uploadedBy, title, caption, description, altText } = req.body;

    if (!image || !name || !uploadedBy) {
      return res.status(400).json({ message: 'Image (base64 string), name, and uploadedBy are required' });
    }
    const base64Length = image.length;
    const estimatedFileSize = (base64Length * 0.75) - (base64Length / 8) * 2;

    if (estimatedFileSize > MAX_FILE_SIZE_BYTES_BACKEND) {
      return res.status(413).json({ message: `File is too large. Maximum size allowed is ${MAX_FILE_SIZE_BYTES_BACKEND / (1024 * 1024)} MB.` });
    }
 
    const imgbbResult = await imgbb.upload(image); 

    const newImage = await Image.create({
      url: imgbbResult.url,
      public_id: imgbbResult.id, // ImgBB uses 'id' for their unique identifier
      deleteUrl: imgbbResult.delete_url, // ⭐ Store the delete URL
      name: name,
      fileSize: imgbbResult.size, // ImgBB provides size in bytes
      fileType: imgbbResult.mime, // ImgBB provides MIME type
      dimensions: { width: imgbbResult.width, height: imgbbResult.height },
      uploadedBy,
      title: title || '',
      caption: caption || '',
      description: description || '',
      altText: altText || '',
    });

    res.status(201).json({ message: 'Image uploaded successfully', image: newImage });
  } catch (error) {
    console.error('Error uploading image:', error);
    // Customize error message for ImgBB specific errors if needed
    if (error.message.includes('ImgBB upload failed')) {
        return res.status(500).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
};

// ... (getAllImages, searchImages, getImageDetails, updateImageMetadata remain mostly unchanged)

export const deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: 'Image not found' });

    // ⭐ Use imgbb.delete with the stored deleteUrl
    if (image.deleteUrl) {
        await imgbb.delete(image.deleteUrl);
    } else {
        console.warn(`No delete URL found for image ${image.name}. Cannot delete from ImgBB.`);
        // Decide how to handle this: still delete from DB, or return an error?
        // For now, we'll proceed to delete from DB even if ImgBB deletion fails.
    }

    await image.deleteOne();

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    if (error.message.includes('ImgBB deletion failed')) {
        return res.status(500).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error deleting image', error: error.message });
  }
};


// Get All Images (Media Library)
export const getAllImages = async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.status(200).json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ message: 'Error fetching images', error: error.message });
  }
};

// Search Images
export const searchImages = async (req, res) => {
  try {
    const { query } = req.query;
    const images = await Image.find({
      $or: [
        { name: { $regex: query, $options: 'i' } }, // Changed from fileName to name
        { title: { $regex: query, $options: 'i' } },
        { altText: { $regex: query, $options: 'i' } } // Also search altText
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json(images);
  } catch (error) {
    console.error('Error searching images:', error);
    res.status(500).json({ message: 'Error searching images', error: error.message });
  }
};

// Get Image Details by ID
export const getImageDetails = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: 'Image not found' });
    res.status(200).json(image);
  } catch (error) {
    console.error('Error fetching image details:', error);
    res.status(500).json({ message: 'Error fetching image', error: error.message });
  }
};

export const updateImageMetadata = async (req, res) => {
  try {
    const { title, caption, description, altText } = req.body;

    const image = await Image.findByIdAndUpdate(
      req.params.id,
      { title, caption, description, altText },
      { new: true }
    );

    if (!image) return res.status(404).json({ message: 'Image not found' });

    res.status(200).json({ message: 'Metadata updated', image });
  } catch (error) {
    console.error('Error updating image metadata:', error);
    res.status(500).json({ message: 'Error updating metadata', error: error.message });
  }
};

