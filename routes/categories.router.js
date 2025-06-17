import { Router } from "express";
import {getAllCategories,getCategoryWithRecipe,getAllCategoriesWithRecipes } from "../controllers/categories.controller.js";

const router = Router();

router.get("/", getAllCategories);

router.get("/withRecipes", getAllCategoriesWithRecipes);

router.get("/:value", getCategoryWithRecipe);

export default router;
