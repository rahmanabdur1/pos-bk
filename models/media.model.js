import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  public_id: { // This might be imgbb's 'id' or 'image_id'
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  deleteUrl: { // ⭐ NEW: Store the ImgBB delete URL
    type: String,
    required: false, // Make it required if you always want deletion capability
  },
  name: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number, // Stored in bytes
  },
  fileType: {
    type: String,
  },
  dimensions: {
    width: Number,
    height: Number,
  },
  uploadedBy: {
    type: String,
    default: 'Zobaer Ahmmed',
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  title: {
    type: String,
  },
  caption: {
    type: String,
  },
  description: {
    type: String,
  },
  altText: {
    type: String,
  },
}, { timestamps: true });

const Media = mongoose.model('Media', mediaSchema);

export default Media;