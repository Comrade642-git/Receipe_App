import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true }
});

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  ingredients: [ingredientSchema],
  steps: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: true,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert']
  },
  dietaryTags: [{
    type: String,
    enum: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate recipes with same name and ingredients
recipeSchema.index({ name: 1 }, { unique: true });

export default mongoose.model('Recipe', recipeSchema);