import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus } from 'lucide-react';

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

function AddRecipe() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', quantity: 0, unit: '' }]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: 0, unit: '' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const handleAddStep = () => {
    setSteps([...steps, '']);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const recipe = {
      name,
      category,
      ingredients,
      steps: steps.filter(step => step.trim() !== ''),
      dietaryTags
    };

    try {
      const response = await fetch('http://localhost:3000/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipe),
      });

      if (response.ok) {
        navigate('/');
      } else {
        console.error('Failed to create recipe');
      }
    } catch (error) {
      console.error('Error creating recipe:', error);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Add New Recipe</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Recipe Name</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Snack">Snack</option>
            <option value="Dessert">Dessert</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Ingredients</label>
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                className="form-input"
                placeholder="Ingredient name"
                value={ingredient.name}
                onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                required
              />
              <input
                type="number"
                className="form-input"
                placeholder="Quantity"
                value={ingredient.quantity}
                onChange={(e) => handleIngredientChange(index, 'quantity', parseFloat(e.target.value))}
                required
              />
              <input
                type="text"
                className="form-input"
                placeholder="Unit"
                value={ingredient.unit}
                onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleRemoveIngredient(index)}
              >
                <Minus />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-primary mt-2"
            onClick={handleAddIngredient}
          >
            <Plus /> Add Ingredient
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Steps</label>
          {steps.map((step, index) => (
            <div key={index} className="flex gap-2">
              <textarea
                className="form-textarea"
                placeholder={`Step ${index + 1}`}
                value={step}
                onChange={(e) => handleStepChange(index, e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleRemoveStep(index)}
              >
                <Minus />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-primary mt-2"
            onClick={handleAddStep}
          >
            <Plus /> Add Step
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Dietary Tags</label>
          <div className="flex gap-2">
            {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'].map(tag => (
              <label key={tag} className="flex gap-2">
                <input
                  type="checkbox"
                  checked={dietaryTags.includes(tag)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setDietaryTags([...dietaryTags, tag]);
                    } else {
                      setDietaryTags(dietaryTags.filter(t => t !== tag));
                    }
                  }}
                />
                {tag}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Create Recipe
        </button>
      </form>
    </div>
  );
}

export default AddRecipe;