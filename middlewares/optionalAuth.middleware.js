import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const optionalAuth = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return next();

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        if (user) {
            req.user = user;
        }
    } catch (err) {
        // טוקן לא תקין - מתעלמים וממשיכים כאורח
    }
    next();
};
