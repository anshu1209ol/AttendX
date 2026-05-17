import { Request, Response } from 'express';
import Session from '../models/Session';
import Attendance from '../models/Attendance';
import Class from '../models/Class';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

export const createSession = async (req: AuthRequest, res: Response) => {
  try {
    const { classId, location } = req.body;
    const teacherId = req.user.id;

    // Temporarily disabled for development/demo testing
    // const classInfo = await Class.findOne({ _id: classId, teacher: teacherId });
    // if (!classInfo) {
    //   return res.status(404).json({ success: false, message: 'Class not found or you are not authorized' });
    // }

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

    // Advanced Geofencing Verification (GPS Validation)
    let distance = 0;
    if (session.location && session.location.latitude && session.location.longitude) {
      if (!location || !location.latitude || !location.longitude) {
        return res.status(400).json({ success: false, message: 'GPS coordinate verification is required' });
      }

      const lat1 = session.location.latitude;
      const lon1 = session.location.longitude;
      const lat2 = location.latitude;
      const lon2 = location.longitude;

      const R = 6371000; // Earth's radius in meters
      const phi1 = lat1 * Math.PI / 180;
      const phi2 = lat2 * Math.PI / 180;
      const deltaPhi = (lat2 - lat1) * Math.PI / 180;
      const deltaLambda = (lon2 - lon1) * Math.PI / 180;

      const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
                Math.cos(phi1) * Math.cos(phi2) *
                Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance = R * c;

      const maxRadius = session.location.radius || 50; // default 50 meters
      if (distance > maxRadius) {
        return res.status(400).json({
          success: false,
          message: `GPS check failed: You are ${Math.round(distance)} meters from the classroom. Allowed radius: ${maxRadius}m.`,
          distance: Math.round(distance)
        });
      }
    }

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

    // Fetch user details for real-time live notification
    const studentUser = await User.findById(studentId);

    // Emit live scan event to teacher's dashboard
    const io = req.app.get('io');
    if (io) {
      io.emit(`attendance:marked:${sessionId}`, {
        studentId: studentId,
        name: studentUser?.name || 'Anonymous Student',
        email: studentUser?.email || 'N/A',
        studentIdStr: studentUser?.studentId || 'N/A',
        scannedAt: new Date(),
        status: 'present',
        distance: Math.round(distance),
        deviceInfo: deviceInfo || 'N/A'
      });
    }

    res.status(201).json({ 
      success: true, 
      message: 'Attendance marked successfully', 
      data: attendance,
      distance: Math.round(distance)
    });
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

export const refreshSessionQR = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.body;
    const teacherId = req.user.id;

    const session = await Session.findOne({ _id: sessionId, teacherId });
    if (!session || !session.isActive) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive session' });
    }

    const qrCodeToken = crypto.randomBytes(20).toString('hex');
    const qrExpiresAt = new Date(Date.now() + 30 * 1000); // 30 seconds expiry

    session.qrCode = qrCodeToken;
    session.qrExpiresAt = qrExpiresAt;
    await session.save();

    res.status(200).json({ success: true, qrCodeToken, qrExpiresAt });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
