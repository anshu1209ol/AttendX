import { Request, Response } from 'express';
import Class from '../models/Class';
import { AuthRequest } from '../middleware/auth';

export const createClass = async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, description } = req.body;
    const teacherId = req.user.id;

    const classExists = await Class.findOne({ code });
    if (classExists) {
      return res.status(400).json({ success: false, message: 'Class with this code already exists' });
    }

    const newClass = await Class.create({
      name,
      code,
      description,
      teacher: teacherId,
      students: [],
    });

    res.status(201).json({ success: true, data: newClass });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getClasses = async (req: AuthRequest, res: Response) => {
  try {
    let query = {};
    if (req.user.role === 'teacher') {
      query = { teacher: req.user.id };
    } else if (req.user.role === 'student') {
      query = { students: req.user.id };
    }
    
    const classes = await Class.find(query).populate('teacher', 'name email').populate('students', 'name email studentId');
    res.status(200).json({ success: true, count: classes.length, data: classes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getClassById = async (req: AuthRequest, res: Response) => {
  try {
    const classInfo = await Class.findById(req.params.id)
      .populate('teacher', 'name email')
      .populate('students', 'name email studentId');
      
    if (!classInfo) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    res.status(200).json({ success: true, data: classInfo });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const enrollStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;
    const studentId = req.user.id;

    const classInfo = await Class.findOne({ code });
    if (!classInfo) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    if (classInfo.students.includes(studentId)) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this class' });
    }

    classInfo.students.push(studentId);
    await classInfo.save();

    res.status(200).json({ success: true, data: classInfo });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
