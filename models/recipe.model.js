import mongoose, { Schema, model } from "mongoose";
import Joi from "joi";

const recipeSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    time: { type: Number, required: true },
    level: { type: Number, min: 1, max: 5, required: true },
    date: { type: Date, default: Date.now },
    layers: [{
        description: { type: String, required: true },
        ingredients: [{ type: String, required: true }]
    }],
    instructions: { type: [String], required: true },
    img: { type: String },
    isPrivate: { type: Boolean, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
})

export const JoiRecipeSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    categories: Joi.array().items(Joi.string()) ,// לא חייב להיות ObjectId תקף
    time: Joi.number().min(1).required(),
    level: Joi.number().min(1).max(5).required(),
    date: Joi.date().iso(),
    layers: Joi.array().items(
        Joi.object({
            description: Joi.string().required(),
            ingredients: Joi.array().items(Joi.string().required()).required()
        })
    ),
    instructions: Joi.array().items(Joi.string().required()).required(),
    img: Joi.string().uri(), // אם את שומרת קישור
    isPrivate: Joi.boolean().required(),
});

export default model('Recipe', recipeSchema);

