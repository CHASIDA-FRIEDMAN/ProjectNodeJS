import { Router } from "express";
import { getBySearch,getById,getByTime,addRecipe,updateRecipe,deleteRecipe } from "../controllers/recipes.controller.js";
import {auth,isAdmin} from "../middlewares/auth.middleware.js";

const router = Router();

router.get('/',auth, getBySearch);

router.get('/:id', auth, getById);

router.get('/time/:time', auth, getByTime);

router.post('/', auth, addRecipe);

router.put('/:id', auth, updateRecipe);

router.delete('/:id', auth, deleteRecipe);

export default router;
