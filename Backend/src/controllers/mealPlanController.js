import MealPlan from '../models/MealPlan.js';
import Recipe from '../models/Recipe.js';

export const createMealPlan = async (req, res) => {
  try {
    console.log('Received meal plan creation request:', req.body);
    
    const { userId, weekStart, weekEnd, days } = req.body;

    if (!userId || !weekStart || !weekEnd || !days || days.length === 0) {
      return res.status(400).json({ message: 'Missing required fields or days array is empty' });
    }

    // Extract Recipe IDs from meals
    const recipeIds = days.flatMap(day => day.meals.map(meal => meal.recipe));

    if (recipeIds.length === 0) {
      return res.status(400).json({ message: 'No recipes found in meal plan' });
    }

    console.log('Extracted Recipe IDs:', recipeIds);

    // Validate that all recipes exist
    const recipes = await Recipe.find({ _id: { $in: recipeIds } });

    if (recipes.length !== recipeIds.length) {
      const foundIds = recipes.map(r => r._id.toString());
      const missingIds = recipeIds.filter(id => !foundIds.includes(id.toString()));
      return res.status(400).json({ message: 'Some recipes do not exist', missingRecipes: missingIds });
    }

    // Create meal plan data
    const mealPlanData = {
      userId,
      weekStart: new Date(weekStart),
      weekEnd: new Date(weekEnd),
      days: days.map(day => ({
        date: new Date(day.date),
        meals: day.meals.map(meal => ({
          recipe: meal.recipe,
          mealType: meal.mealType
        }))
      }))
    };

    const mealPlan = new MealPlan(mealPlanData);
    await mealPlan.save();

    // Populate meal plan with recipes
    const populatedMealPlan = await MealPlan.findById(mealPlan._id).populate('days.meals.recipe');

    if (!populatedMealPlan) {
      return res.status(500).json({ message: 'Failed to fetch populated meal plan' });
    }

    console.log('Meal plan created successfully:', populatedMealPlan);
    res.status(201).json(populatedMealPlan);
  } catch (error) {
    console.error('Meal plan creation error:', error);
    res.status(500).json({ message: 'Failed to create meal plan', error: error.message });
  }
};

// Get meal plans for a user
export const getMealPlans = async (req, res) => {
  try {
    console.log('Fetching meal plans for user:', req.params.userId);
    const { start, end } = req.query;
    
    const query = { userId: req.params.userId };

    if (start && end) {
      query.weekStart = { $gte: new Date(start) };
      query.weekEnd = { $lte: new Date(end) };
    }

    const mealPlans = await MealPlan.find(query).populate('days.meals.recipe').sort({ weekStart: -1 });

    console.log(`Found ${mealPlans.length} meal plans`);
    res.json(mealPlans);
  } catch (error) {
    console.error('Error fetching meal plans:', error);
    res.status(500).json({ message: 'Failed to fetch meal plans', error: error.message });
  }
};

// Generate shopping list
export const getShoppingList = async (req, res) => {
  try {
    console.log('Generating shopping list for meal plan:', req.params.id);
    
    const mealPlan = await MealPlan.findById(req.params.id).populate('days.meals.recipe');

    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    const shoppingList = {};

    mealPlan.days.forEach(day => {
      day.meals.forEach(meal => {
        if (meal.recipe?.ingredients) {
          meal.recipe.ingredients.forEach(ingredient => {
            const key = `${ingredient.name}-${ingredient.unit}`;
            shoppingList[key] = (shoppingList[key] || 0) + ingredient.quantity;
          });
        }
      });
    });

    const formattedList = Object.entries(shoppingList).map(([key, quantity]) => {
      const [name, unit] = key.split('-');
      return { name, quantity, unit };
    });

    console.log(`Generated shopping list with ${formattedList.length} items`);
    res.json(formattedList);
  } catch (error) {
    console.error('Error generating shopping list:', error);
    res.status(500).json({ message: 'Failed to generate shopping list', error: error.message });
  }
};

// Update meal plan
export const updateMealPlan = async (req, res) => {
  try {
    console.log('Updating meal plan:', req.params.id);
    console.log('Update data:', req.body);

    const mealPlan = await MealPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('days.meals.recipe');

    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    console.log('Meal plan updated successfully');
    res.json(mealPlan);
  } catch (error) {
    console.error('Error updating meal plan:', error);
    res.status(500).json({ message: 'Failed to update meal plan', error: error.message });
  }
};

// Delete meal plan
export const deleteMealPlan = async (req, res) => {
  try {
    console.log('Deleting meal plan:', req.params.id);
    
    const mealPlan = await MealPlan.findByIdAndDelete(req.params.id);

    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    console.log('Meal plan deleted successfully');
    res.json({ message: 'Meal plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    res.status(500).json({ message: 'Failed to delete meal plan', error: error.message });
  }
};
