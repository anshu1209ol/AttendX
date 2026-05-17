import express from 'express';
import { createClass, getClasses, getClassById, enrollStudent } from '../controllers/class.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All class routes require authentication

router.post('/', authorize('admin', 'teacher'), createClass);
router.get('/', getClasses);
router.get('/:id', getClassById);
router.post('/enroll', authorize('student'), enrollStudent);

export default router;
