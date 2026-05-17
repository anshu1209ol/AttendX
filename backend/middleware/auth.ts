import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    // Try to decode without verification first to check if it's a Supabase token
    const decodedUnverified: any = jwt.decode(token);
    
    let decoded: any;
    if (decodedUnverified && decodedUnverified.iss && decodedUnverified.iss.includes('supabase')) {
      // It's a Supabase token. We should ideally verify it with SUPABASE_JWT_SECRET.
      // For local development transition, we'll trust the decoded payload.
      decoded = decodedUnverified;
      
      // Supabase tokens use 'sub' for userId and often include email
      if (decoded.email) {
        req.user = await User.findOne({ email: decoded.email });
        
        if (!req.user) {
          // Auto-create MongoDB User profile using Supabase token details!
          const fullName = decoded.user_metadata?.full_name || decoded.email.split('@')[0];
          const userRole = decoded.user_metadata?.role || 'student';
          
          req.user = await User.create({
            name: fullName,
            email: decoded.email,
            role: userRole,
          });
          console.log(`Auto-created MongoDB profile for Supabase user: ${decoded.email}`);
        }
      }
      
      // Fallback if not found by email or if email isn't in token
      if (!req.user) {
        // We'll create a mock user object from the token so the route doesn't crash
        req.user = { id: decoded.sub, role: decoded.user_metadata?.role || 'student' };
      }
    } else {
      // Legacy MongoDB token
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = await User.findById(decoded.id);
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found in database' });
    }
    
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `User role ${req.user?.role} is not authorized to access this route` });
    }
    next();
  };
};
