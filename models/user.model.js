import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import Joi from "joi";

const userSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    role: { type: String, default: "guest_user", enum: ["admin", "guest_user", "registered_user"] }
})



export const generateToken = (user) => {
    const secretKey = process.env.JWT_SECRET || 'JWT_SECRET';
    const token = sign({ _id: user._id, role: user.role }, secretKey, { expiresIn: '1h' });
    return token;
}


export const JoiUserSchema = {
    signup: Joi.object({
        username: Joi.string().required(),
        password: Joi.string().min(8)
            .pattern(new RegExp('^(?=.*[א-תa-zA-Z])(?=.*\\d).{8,}$'))
            .required(),
        email: Joi.string().email().lowercase().required(),
        address: Joi.string().required(),
        role: Joi.string().valid("admin", "guest_user", "registered_user")

    }),
    signin: Joi.object({
        email: Joi.string().email().lowercase().required(),
        password: Joi.string().required()
    })
}

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

export default model('User', userSchema);
