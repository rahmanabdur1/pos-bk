import express from 'express';
const router = express.Router();

import {
  uploadImage,
  getAllImages,
  getImageDetails,
  updateImageMetadata,
  deleteImage,
  searchImages
} from '../controllers/media.controller.js';

router.post('/upload', uploadImage);
router.get('/', getAllImages);
router.get('/:id', getImageDetails);
router.put('/:id', updateImageMetadata);
router.delete('/:id', deleteImage);
router.get("/search", searchImages);

export default router;