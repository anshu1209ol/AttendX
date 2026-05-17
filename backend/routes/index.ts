import express from 'express';
import authRoutes from './auth.routes';
import classRoutes from './class.routes';
import attendanceRoutes from './attendance.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/classes', classRoutes);
router.use('/attendance', attendanceRoutes);

export default router;
