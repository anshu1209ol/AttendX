import express from 'express';
import { createSession, markAttendance, getSessionAttendance } from '../controllers/attendance.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/session', authorize('teacher'), createSession);
router.post('/mark', authorize('student'), markAttendance);
router.get('/session/:sessionId', authorize('admin', 'teacher'), getSessionAttendance);

export default router;
