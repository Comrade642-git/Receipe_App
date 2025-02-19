import React, { useState, useEffect } from 'react';
import { Calendar, Loader, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Recipe {
  _id: string;
  name: string;
  category: string;
}

interface Meal {
  recipe: Recipe;
  mealType: string;
}

interface DayPlan {
  date: Date;
  meals: Meal[];
}

function MealPlanner() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [weekStart, setWeekStart] = useState<Date>(new Date());
  const [mealPlan, setMealPlan] = useState<DayPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    initializeWeek();
  }, [weekStart]);

  const fetchRecipes = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/recipes');
      if (!response.ok) throw new Error('Failed to fetch recipes');
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      setError('Error fetching recipes');
    }
  };

  const initializeWeek = () => {
    const days: DayPlan[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      days.push({
        date,
        meals: []
      });
    }
    setMealPlan(days);
  };

  const handleAddMeal = (dayIndex: number, mealType: string, recipeId: string) => {
    const recipe = recipes.find(r => r._id === recipeId);
    if (!recipe) return;

    const newMealPlan = [...mealPlan];
    newMealPlan[dayIndex].meals.push({
      recipe,
      mealType
    });
    setMealPlan(newMealPlan);
  };

  const handleRemoveMeal = (dayIndex: number, mealIndex: number) => {
    const newMealPlan = [...mealPlan];
    newMealPlan[dayIndex].meals.splice(mealIndex, 1);
    setMealPlan(newMealPlan);
  };

  const saveMealPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      setSaveSuccess(false);
  
      const requestBody = {
        userId: "someUserId", // Ensure userId is set properly
        weekStart: weekStart.toISOString(),
        weekEnd: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        days: mealPlan.map(day => ({
          date: day.date.toISOString(),
          meals: day.meals.map(meal => ({
            recipe: meal.recipe._id, // Extract ObjectId instead of full object
            mealType: meal.mealType
          }))
        }))
      };
  
      const response = await fetch('http://localhost:3000/api/meal-plans/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
  
      if (!response.ok) throw new Error('Failed to save meal plan');
  
      setSaveSuccess(true);
    } catch (error) {
      setError('Error saving meal plan');
    } finally {
      setLoading(false);
    }
  };
  

  if (loading) {
    return (
      <div className="loading-container">
        <Loader className="animate-spin" />
        <p>Saving meal plan...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="header-actions">
        <h1>Meal Planner</h1>
        <button className="btn btn-primary" onClick={saveMealPlan}>
          <Save size={16} /> Save Meal Plan
        </button>
      </div>

      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      )}

      {saveSuccess && (
        <div className="success-message">
          Meal plan saved successfully!
        </div>
      )}

      <div className="meal-planner">
        {mealPlan.map((day, dayIndex) => (
          <div key={dayIndex} className="day-card">
            <h3 className="day-title">
              {day.date.toLocaleDateString('en-US', { weekday: 'long' })}
              <br />
              {day.date.toLocaleDateString()}
            </h3>

            {['Breakfast', 'Lunch', 'Dinner'].map(mealType => (
              <div key={mealType} className="meal-slot">
                <h4>{mealType}</h4>
                {day.meals
                  .filter(meal => meal.mealType === mealType)
                  .map((meal, mealIndex) => (
                    <div key={mealIndex} className="meal-item">
                      <span>{meal.recipe.name}</span>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleRemoveMeal(dayIndex, mealIndex)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                <select
                  className="form-select mt-2"
                  onChange={(e) => handleAddMeal(dayIndex, mealType, e.target.value)}
                  value=""
                >
                  <option value="">Add Recipe</option>
                  {recipes
                    .filter(recipe => recipe.category === mealType)
                    .map(recipe => (
                      <option key={recipe._id} value={recipe._id}>
                        {recipe.name}
                      </option>
                    ))}
                </select>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MealPlanner;