import mongoose, { Schema, model } from "mongoose";
import Joi from "joi";

const categorySchema = new Schema({
    // אני משתמשת ב id האוטומטי של מונגו בשביל קוד זיהוי הייחודי של הקטגוריה
    // code: {type: Number,required: true},
    description: {type: String, required: true,unique: true},
    numrecipes: {type: Number, default: 0},
    recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
})

export const JoiCategorySchema = Joi.object({
    // code: Joi.number().required(),
    description: Joi.string().required(),
    numrecipes: Joi.number().default(0),
    recipes: Joi.array().items(Joi.string().hex().length(24)) // ObjectId
});

export default model('Category', categorySchema);
