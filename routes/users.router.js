import { Router } from "express";
import { signin,signup,getAllUsers,deleteUser } from "../controllers/users.controller.js";
import {auth, isAdmin} from "../middlewares/auth.middleware.js";

const router = Router();

router.get('/', auth, isAdmin, getAllUsers); // קבלת כל המשתמשים

router.post('/signin', signin); // התחברות

router.post('/', signup); // הרשמה

router.delete('/:id', auth, isAdmin, deleteUser); // מחיקת משתמש

export default router;