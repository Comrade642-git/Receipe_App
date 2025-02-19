import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe
} from '../controllers/recipeController.js';

const router = express.Router();

// Validation middleware
const validateRecipe = [
  body('name').trim().notEmpty().withMessage('Recipe name is required'),
  body('ingredients').isArray().withMessage('Ingredients must be an array'),
  body('ingredients.*.name').trim().notEmpty().withMessage('Ingredient name is required'),
  body('ingredients.*.quantity').isNumeric().withMessage('Quantity must be a number'),
  body('ingredients.*.unit').trim().notEmpty().withMessage('Unit is required'),
  body('steps').isArray().withMessage('Steps must be an array'),
  body('category').isIn(['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert']),
  body('dietaryTags').optional().isArray()
];

// Create a new recipe
router.post('/', validateRecipe, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, createRecipe);

// Get all recipes
router.get('/', getRecipes);

// Get recipe by ID
router.get('/:id', getRecipeById);

// Update recipe
router.put('/:id', validateRecipe, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, updateRecipe);

// Delete recipe
router.delete('/:id', deleteRecipe);

export default router;