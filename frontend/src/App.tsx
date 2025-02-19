import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Utensils } from 'lucide-react';
import RecipeList from './components/RecipeList';
import AddRecipe from './components/AddRecipe';
import MealPlanner from './components/MealPlanner';
import MealPlanList from './components/MealPlanList';
import ShoppingList from './components/ShoppingList';

function App() {
  return (
    <Router>
      <nav className="nav">
        <div className="nav-content">
          <Link to="/" className="nav-brand">
            <Utensils className="inline-block mr-2" /> Recipe Organizer
          </Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">Recipes</Link>
            <Link to="/add-recipe" className="nav-link">Add Recipe</Link>
            <Link to="/meal-planner" className="nav-link">Meal Planner</Link>
            <Link to="/meal-plans" className="nav-link">View Meal Plans</Link>
            <Link to="/shopping-list" className="nav-link">Shopping List</Link>
          </div>
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<RecipeList />} />
          <Route path="/add-recipe" element={<AddRecipe />} />
          <Route path="/meal-planner" element={<MealPlanner />} />
          <Route path="/meal-plans" element={<MealPlanList />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App