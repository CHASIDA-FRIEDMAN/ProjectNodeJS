import Recipe from '../models/recipe.model.js';
import Category from '../models/category.model.js';
import { JoiRecipeSchema } from '../models/recipe.model.js';
import { getOrCreateCategories, addRecipeToCategories, removeRecipeFromCategories, updateCategoriesRecipeCount } from '../utils/categoryUtils.js';

// --- חיפוש מתכונים לפי טקסט ---
export const getBySearch = async (req, res, next) => {
    const { search = '', limit = 10, page = 1 } = req.query;
    try {
        const baseQuery = {
            name: { $regex: search, $options: 'i' },
        }
        const query = req.user ? {
            ...baseQuery,
            $or: [
                { isprivate: false },
                { createdBy: req.user._id }
            ]
        } : {
            ...baseQuery,
            isprivate: false
        };

        const recipes = await Recipe.find(query)
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = await Recipe.countDocuments(query);
        res.json({
            data: recipes,
            total,
            page: Number(page),
            limit: Number(limit)
        });
    } catch (err) {
        res.status(500).json({ message: 'error fetching recipes', error: err });
    }
}

// --- קבלת מתכון לפי ID ---
export const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const recipe = await Recipe.findById(id);
        if (!recipe) {
            return next({ status: 404, message: 'Recipe not found' });
        }
        if (recipe.isprivate && recipe.createdBy.toString() !== req.user._id) {
            return next({ status: 403, message: 'Access denied: private recipe' });
        }
        res.status(200).json(recipe);
    } catch (error) {
        next({ message: error.message });
    }
}

// --- קבלת מתכון לפי זמן (פחות מהזמן המבוקש) ---
export const getByTime = async (req, res, next) => {
    try {
        const { time } = req.params;
        const query = req.user ? {
            time: { $lt: Number(time) },
            $or: [
                { isprivate: false },
                { createdBy: req.user._id }
            ]
        } : {
            time: { $lt: Number(time) },
            isprivate: false
        };

        const recipes = await Recipe.find(query);
        res.status(200).json(recipes);
    } catch (error) {
        next({ message: error.message });
    }
};

// --- הוספת מתכון ---
export const addRecipe = async (req, res, next) => {
    try {
        // אימות הנתונים עם Joi
        const { error } = JoiRecipeSchema.validate(req.body);
        if (error) {
            return next({ status: 400, message: error.details[0].message });
        }
        // חילוץ הנתונים מהבקשה
        const { name, description, categories, time, level, date, layers, instructions, img, isprivate } = req.body;

        // יצירת מערך ייחודי של קטגוריות
        const categoryIds = await getOrCreateCategories(categories);

        // יצירת מתכון חדש, כולל המזהה של המשתמש מהטוקן
        const newRecipe = new Recipe({
            name,
            description,
            categories: categoryIds,
            time,
            level,
            date,
            layers,
            instructions,
            img,
            isprivate,
            createdBy: req.user._id //  כאן משתמשים בטוקן
        });

        // שמירת המתכון במסד הנתונים

        await newRecipe.save();

        // הוספת המתכון לקטגוריות
        await addRecipeToCategories(categoryIds, newRecipe._id);

        // עדכון מספר המתכונים בכל קטגוריה
        await updateCategoriesRecipeCount(categoryIds);

        // הבאת פרטי הקטגוריות
        await newRecipe.populate('categories');

        // החזרת המתכון שנוצר
        res.status(201).json(newRecipe);

    } catch (error) {
        next({ message: error.message });
    }
};

// --- עדכון מתכון ---
export const updateRecipe = async (req, res, next) => {
    try {
        const { id } = req.params;

        // אימות הנתונים עם Joi
        if (Object.keys(req.body).length === 0) {
            return next({ status: 400, message: "No fields to update" });
        }
        // const { error } = JoiRecipeSchema.validate(req.body);
        // if (error) {
        //     return next({ status: 400, message: error.details[0].message });
        // }

        const recipe = await Recipe.findById(id);
        if (!recipe) return next({ status: 404, message: "Recipe not found" });


        if (!recipe.createdBy.equals(req.user._id)) {
            return next({ status: 403, message: "You are not allowed to update this recipe" });
        }
        // חילוץ הנתונים מהבקשה
        const {
            name,
            description,
            categories,
            time,
            level,
            date,
            layers,
            instructions,
            img,
            isprivate
        } = req.body;

        let allCategories = new Set(); // הוגדר מוקדם כדי לא להיתקל בשגיאה

        if (categories !== undefined) {
            // שמירת הקטגוריות הישנות כדי להשוות
            const oldCategoriesIds = recipe.categories.map(cat => cat.toString());
            // קבלת מזהים לקטגוריות החדשות
            const newCategoryIds = await getOrCreateCategories(categories);
            const newCategoryIdsStrings = newCategoryIds.map(catId => catId.toString());
            // חישוב מה הוסר ומה נוסף
            const added = newCategoryIdsStrings.filter(cat => !oldCategoriesIds.includes(cat));
            const removed = oldCategoriesIds.filter(cat => !newCategoryIdsStrings.includes(cat));
            // עדכון בקטגוריות
            await addRecipeToCategories(added, recipe._id);

            // עדכון במתכון
            recipe.categories = newCategoryIds;
            await recipe.save();

            // הסרת המתכון מהקטגוריות שהוסרו            
            await removeRecipeFromCategories(removed, recipe._id);

            // איחוד הקטגוריות 
            allCategories = new Set([...added, ...removed, ...newCategoryIdsStrings]);
        } else {
            allCategories = new Set(recipe.categories.map(cat => cat.toString()));
        }

        // עדכון שדות רגילים
        if (name !== undefined) recipe.name = name;
        if (description !== undefined) recipe.description = description;
        if (time !== undefined) recipe.time = time;
        if (level !== undefined) recipe.level = level;
        if (date !== undefined) recipe.date = date;
        if (layers !== undefined) recipe.layers = layers;
        if (instructions !== undefined) recipe.instructions = instructions;
        if (img !== undefined) recipe.img = img;
        if (isprivate !== undefined) recipe.isprivate = isprivate;

        // שמירה נוספת של המתכון
        // אם התעדכנו שדות נוספים חוץ מקטגוריות
        await recipe.save();

        // עדכון numrecipes בקטגוריות
        await updateCategoriesRecipeCount([...allCategories]);

        await recipe.populate('categories');
        res.status(200).json(recipe);
    } catch (error) {
        next({ message: error.message });
    }
};

// --- מחיקת מתכון ---
export const deleteRecipe = async (req, res, next) => {
    try {
        const { id } = req.params;
        const recipe = await Recipe.findById(id);
        if (!recipe) return next({ status: 404, message: "Recipe not found" });
        // בדיקה אם המשתמש הוא זה שיצר את המתכון
        // אם לא, נחזיר שגיאה 403
        if (!recipe.createdBy.equals(req.user._id)) {
            return next({ status: 403, message: "You are not allowed to delete this recipe" });
        }

        // שמירת רשימת הקטגוריות לפני המחיקה
        const categoryIds = recipe.categories;

        // מחיקת המתכון
        await Recipe.findByIdAndDelete(id);


        // הסרת המתכון מהקטגוריות כולל מחיקת קטגוריות ריקות
        await removeRecipeFromCategories(categoryIds, recipe._id);

        // עדכון מספר המתכונים בכל קטגוריה
        await updateCategoriesRecipeCount(categoryIds);

        res.status(204).end(); // מחיקת המתכון הצליחה, אין תוכן להחזיר

    } catch (error) {
        next({ message: error.message });
    }
};
