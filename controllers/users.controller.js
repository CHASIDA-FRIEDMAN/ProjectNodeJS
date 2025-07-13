import e from 'cors';
import User from '../models/user.model.js';
import { generateToken, JoiUserSchema } from '../models/user.model.js';
import bcrypt from 'bcryptjs';


// התחברות
export const signin = async (req, res, next) => {
    try {
        if (JoiUserSchema.signin.validate(req.body).error) {
            return next({ status: 400, message: 'invalid data' });
        }
        // בוודאות הנתונים תקינים
        // נבדוק אם המשתמש קיים
        // בדיקת קיום המשתמש
        // והאם הסיסמה נכונה

        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return next({ status: 401, message: 'user not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next({ status: 401, message: 'invalid password' });
        }
        const token = generateToken(user);
        res.status(201).json({ username: user.username, userId: user._id, token });
    } catch (err) {
        next({ message: err.message })
    }
}

// הרשמה
export const signup = async (req, res, next) => {
    try {
        if (JoiUserSchema.signup.validate(req.body).error) {
            return next({ status: 400, message: 'invalid data' });
        }

        // בוודאות הנתונים תקינים
        // נבדוק אם המשתמש קיים
        const { username, password, email, address, role } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            return next({ status: 409, message: 'user already exists' });
        }
        // ניצור משתמש חדש
        const newUser = new User({ username, password, email, address, role });
        await newUser.save();
        // ניצור טוקן למשתמש החדש
        const token = generateToken(newUser);
        // נחזיר את הטוקן למשתמש
        res.status(201).json({ username: newUser.username, userId: newUser._id, token })
    } catch (err) {
        next({ message: err.message });
    }
}

// קבלת כל המשתמשים
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}, '-password'); // לא מחזירים את הסיסמה
        res.status(200).json(users);
    } catch (err) {
        next({ message: err.message });
    }
}

// מחיקת משתמש
export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return next({ status: 400, message: 'user id is required' });
        }
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return next({ status: 404, message: 'user not found' });
        }
        res.status(204).end();
    } catch (err) {
        next({ message: err.message });
    }
}
