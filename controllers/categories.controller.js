import Category from '../models/category.model.js';


// --- קבלת כל הקטגוריות ---
export const getAllCategories = async (req, res, next) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        next({ status: 500, message: 'Error fetching categories', error });
    }
}

// קבלת כל הקטגוריות עם המתכונים שלהן
export const getAllCategoriesWithRecipes = async (req, res, next) => {
    console.log('Fetching all categories with recipes');

    try {
        const categories = await Category.find().populate('recipes');
        res.status(200).json(categories);
    } catch (error) {
        next({ status: 500, message: 'Error fetching categories with recipes', error });
    }
}

// --- קבלת קטגוריה לפי ID עם המתכונים שלה ---
export const getCategoryWithRecipe = async (req, res, next) => {
    try {
        const { value } = req.params;
        let category;
        if (value.match(/^[0-9a-fA-F]{24}$/)) {
            // אם הערך הוא ID של קטגוריה
            category = await Category.findById(value).populate('recipes');
        }
        if (!category) {
            // אם לא נמצא ב-ID, ננסה למצוא לפי תיאור
            category = await Category.findOne({ description: value }).populate('recipes');
        }
        if (!category) {
            return next({ status: 404, message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        next({ status: 500, message: 'Error fetching category with recipes', error });
    }
}
