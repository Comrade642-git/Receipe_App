import express from 'express';
import {
  createMealPlan,
  getMealPlans,
  getShoppingList,
  updateMealPlan,
  deleteMealPlan
} from '../controllers/mealPlanController.js';

const router = express.Router();

// Create a meal plan
router.post('/', createMealPlan);

// Get meal plan by user ID and date range
router.get('/user/:userId', getMealPlans);

// Generate shopping list for a meal plan
router.get('/shopping-list', getShoppingList);

// Update meal plan
router.put('/:id', updateMealPlan);

// Delete meal plan
router.delete('/:id', deleteMealPlan);

export default router;  