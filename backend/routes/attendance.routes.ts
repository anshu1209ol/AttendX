import express from 'express';
import { createSession, markAttendance, getSessionAttendance, refreshSessionQR } from '../controllers/attendance.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/session', authorize('teacher'), createSession);
router.post('/session/refresh', authorize('teacher'), refreshSessionQR);
router.post('/mark', authorize('student'), markAttendance);
router.get('/session/:sessionId', authorize('admin', 'teacher'), getSessionAttendance);

export default router;
