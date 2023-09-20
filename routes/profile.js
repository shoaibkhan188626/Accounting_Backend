import express from 'express';
import {
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  getProfileByUser,
} from '../controllers/profile.js';
const router = express.Router();

router.get('/:id', getProfile);
router.get('/', getProfileByUser);
router.post('/', createProfile);
router.patch('/:id', updateProfile);
router.delete('/:id', deleteProfile);

export default router;
