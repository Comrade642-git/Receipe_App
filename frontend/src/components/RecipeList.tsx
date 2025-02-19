import React, { useState, useEffect } from "react";
import { Search, Edit, Trash2, Loader } from "lucide-react";

interface Recipe {
  _id: string;
  name: string;
  category: string;
  dietaryTags: string[];
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  steps: string[];
}

function RecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:3000/api/recipes");
      if (!response.ok) {
        throw new Error("Failed to fetch recipes");
      }
      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleDeleteRecipe = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/recipes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete recipe");
      }

      setRecipes(recipes.filter((recipe) => recipe._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete recipe");
    }
  };

  const handleUpdateRecipe = async (recipe: Recipe) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/recipes/${recipe._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(recipe),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update recipe");
      }

      const updatedRecipe = await response.json();
      setRecipes(
        recipes.map((r) => (r._id === updatedRecipe._id ? updatedRecipe : r))
      );
      setEditingRecipe(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update recipe");
    }
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || recipe.category === selectedCategory;
    const matchesTag = !selectedTag || recipe.dietaryTags.includes(selectedTag);
    return matchesSearch && matchesCategory && matchesTag;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <Loader className="animate-spin" />
        <p>Loading recipes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="btn btn-primary" onClick={fetchRecipes}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-center">My Recipes</h1>

      <div className="card mt-2">
        <div className="flex gap-2">
          <div className="form-group">
            <div className="form-input">
              <Search className="inline-block mr-2" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
              <option value="Dessert">Dessert</option>
            </select>
          </div>

          <div className="form-group">
            <select
              className="form-select"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              <option value="">All Dietary Tags</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Gluten-Free">Gluten-Free</option>
              <option value="Dairy-Free">Dairy-Free</option>
              <option value="Keto">Keto</option>
              <option value="Paleo">Paleo</option>
            </select>
          </div>
        </div>
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="empty-state">
          <p>
            No recipes found. Try adjusting your filters or add a new recipe.
          </p>
        </div>
      ) : (
        <div className="recipe-grid">
          {filteredRecipes.map((recipe) => (
            <div key={recipe._id} className="recipe-card">
              <div className="recipe-info">
                <h3 className="card-title">{recipe.name}</h3>
                <p>{recipe.category}</p>
                <div className="recipe-tags">
                  {recipe.dietaryTags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="recipe-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => setEditingRecipe(recipe)}
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteRecipe(recipe._id)}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingRecipe && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Recipe</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateRecipe(editingRecipe);
              }}
            >
              <div className="form-group">
                <label className="form-label">Recipe Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingRecipe.name}
                  onChange={(e) =>
                    setEditingRecipe({
                      ...editingRecipe,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={editingRecipe.category}
                  onChange={(e) =>
                    setEditingRecipe({
                      ...editingRecipe,
                      category: e.target.value,
                    })
                  }
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                  <option value="Dessert">Dessert</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Dietary Tags</label>
                <div className="tags-input">
                  {[
                    "Vegetarian",
                    "Vegan",
                    "Gluten-Free",
                    "Dairy-Free",
                    "Keto",
                    "Paleo",
                  ].map((tag) => (
                    <label key={tag} className="tag-checkbox">
                      <input
                        type="checkbox"
                        checked={editingRecipe.dietaryTags.includes(tag)}
                        onChange={(e) => {
                          const newTags = e.target.checked
                            ? [...editingRecipe.dietaryTags, tag]
                            : editingRecipe.dietaryTags.filter(
                                (t) => t !== tag
                              );
                          setEditingRecipe({
                            ...editingRecipe,
                            dietaryTags: newTags,
                          });
                        }}
                      />
                      {tag}
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingRecipe(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipeList;
