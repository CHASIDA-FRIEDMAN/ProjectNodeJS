import express from 'express';
import usersRouter from './routes/users.router.js';
import recipesRouter from './routes/recipes.router.js';
import categoriesRouter from './routes/categories.router.js';

import {config} from 'dotenv';
import { connectDB } from './config/db.js';
import cors from 'cors';
import { errorHandler,notFound } from './middlewares/errorHandling.middleware.js';

config(); // טוען את משתני הסביבה מקובץ .env

connectDB(); // מחבר למסד הנתונים

const app = express();

app.use(express.json()); // מאפשר לקרוא את גוף הבקשה כ-JSON
app.use(express.urlencoded({ extended: true })); // מאפשר לקרוא את גוף הבקשה כ-URL Encoded
app.use(cors()); // מאפשר קריאות בין דומיינים שונים

app.use('/users', usersRouter); // מפנה את כל הבקשות לנתיב /users ל-router של המשתמשים

app.use('/recipes', recipesRouter); // מפנה את כל הבקשות לנתיב /recipes ל-router של המתכונים

app.use('/categories', categoriesRouter); // מפנה את כל הבקשות לנתיב /categories ל-router של הקטגוריות

app.use(notFound); // מפנה בקשות לא קיימות ל-middleware של 404
app.use(errorHandler); // מפנה שגיאות ל-middleware של טיפול בשגיאות

const PORT = process.env.PORT || 5000; // פורט השרת
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});