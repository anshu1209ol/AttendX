import express from 'express';
import { uploadTimetable, getMyClasses, createClass } from '../controllers/class.controller';
import { protect } from '../middleware/auth';
import multer from 'multer';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/upload-timetable', protect, upload.single('timetable'), uploadTimetable as any);
router.get('/me', protect, getMyClasses as any);
router.post('/', protect, createClass as any);

export default router;
