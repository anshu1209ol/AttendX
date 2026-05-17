import { Request, Response } from 'express';
import Session from '../models/Session';
import Attendance from '../models/Attendance';
import Class from '../models/Class';
import { AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

export const createSession = async (req: AuthRequest, res: Response) => {
  try {
    const { classId, location } = req.body;
    const teacherId = req.user.id;

    const classInfo = await Class.findOne({ _id: classId, teacher: teacherId });
    if (!classInfo) {
      return res.status(404).json({ success: false, message: 'Class not found or you are not authorized' });
    }

    const qrCodeToken = crypto.randomBytes(20).toString('hex');
    const qrExpiresAt = new Date(Date.now() + 30 * 1000); // 30 seconds expiry

    const session = await Session.create({
      classId,
      teacherId,
      qrCode: qrCodeToken,
      qrExpiresAt,
      location,
      isActive: true,
    });

    res.status(201).json({ success: true, data: session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, qrCodeToken, location, deviceInfo } = req.body;
    const studentId = req.user.id;

    const session = await Session.findById(sessionId);
    if (!session || !session.isActive) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive session' });
    }

    if (session.qrCode !== qrCodeToken || new Date() > session.qrExpiresAt!) {
      return res.status(400).json({ success: false, message: 'QR Code has expired or is invalid' });
    }

    // Geofencing Logic here if needed
    // Calculate distance between session.location and request location...
    
    const classInfo = await Class.findById(session.classId);
    if (!classInfo?.students.includes(studentId)) {
      return res.status(403).json({ success: false, message: 'You are not enrolled in this class' });
    }

    const existingAttendance = await Attendance.findOne({ sessionId, studentId });
    if (existingAttendance) {
      return res.status(400).json({ success: false, message: 'Attendance already marked for this session' });
    }

    const attendance = await Attendance.create({
      sessionId,
      studentId,
      status: 'present',
      location,
      deviceInfo,
    });

    res.status(201).json({ success: true, data: attendance });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSessionAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const attendance = await Attendance.find({ sessionId: req.params.sessionId })
      .populate('studentId', 'name email studentId department');
    res.status(200).json({ success: true, count: attendance.length, data: attendance });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
