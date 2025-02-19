import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true
  },
  mealType: {
    type: String,
    required: true,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack']
  }
});

const dayPlanSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  meals: [mealSchema]
});

const mealPlanSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  weekStart: {
    type: Date,
    required: true
  },
  weekEnd: {
    type: Date,
    required: true
  },
  days: [dayPlanSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('MealPlan', mealPlanSchema);