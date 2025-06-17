import Category from '../models/category.model.js';
import Recipe from '../models/recipe.model.js';

/**
 * מחזיר מזהי קטגוריות קיימות או יוצר חדשות לפי תיאור
 */
export const getOrCreateCategories = async (descriptions) => {
    const categoryIds = [];

    const uniqueDescriptions = [...new Set(descriptions)];

    for (const desc of uniqueDescriptions) {
        let category = await Category.findOne({ description: desc });
        if (!category) {
            category = new Category({ description: desc, numrecipes: 1, recipes: [] });
            await category.save();
        }
        categoryIds.push(category._id);
    }

    return categoryIds;
};

/**
 * מעדכן את שדה numrecipes לפי מספר המתכונים בכל קטגוריה
 */
export const updateCategoriesRecipeCount = async (categoryIds) => {
    await Promise.all(categoryIds.map(async catId => {
        const count = await Recipe.countDocuments({ categories: catId });
        const category = await Category.findById(catId);
        if (category) {
            category.numrecipes = count;
            await category.save();
        }
    }));
};

/**
 * מסיר מתכון מקטגוריות, מוחק קטגוריה אם לא נותרו מתכונים
 */
export const removeRecipeFromCategories = async (categoryIds, recipeId) => {
    await Promise.all(categoryIds.map(async catId => {
        await Category.findByIdAndUpdate(catId, { $pull: { recipes: recipeId } });

        const category = await Category.findById(catId);
        if (category) {
            const count = await Recipe.countDocuments({ categories: catId });
            if (count === 0) {
                await Category.findByIdAndDelete(catId);
            } else {
                category.numrecipes = count;
                await category.save();
            }
        }
    }));
};

/**
 * מוסיף מתכון לקטגוריות
 */
export const addRecipeToCategories = async (categoryIds, recipeId) => {
    await Category.updateMany(
        { _id: { $in: categoryIds } },
        { $addToSet: { recipes: recipeId } }
    );
};
