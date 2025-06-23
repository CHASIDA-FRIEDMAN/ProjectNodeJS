import { Router } from "express";
import {getAllCategories,getCategoryWithRecipes,getAllCategoriesWithRecipes } from "../controllers/categories.controller.js";

const router = Router();

router.get("/", getAllCategories);

router.get("/withRecipes", getAllCategoriesWithRecipes);

router.get("/:value", getCategoryWithRecipes);

export default router;
