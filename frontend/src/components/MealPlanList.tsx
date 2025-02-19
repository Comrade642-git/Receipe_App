import { useState, useEffect } from "react";
import {
  Calendar,
  Loader,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  X,
} from "lucide-react";

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
  date: string;
  meals: Meal[];
}

interface MealPlan {
  _id: string;
  userId: string;
  weekStart: string;
  weekEnd: string;
  days: DayPlan[];
}

interface MealPlanResponse {
  mealPlans: MealPlan[];
  totalPages: number;
}

function MealPlanList() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editMealPlan, setEditMealPlan] = useState<MealPlan | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchMealPlans();
  }, [currentPage]);

  const fetchMealPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `http://localhost:3000/api/meal-plans/user/123?page=${currentPage}`
      );
      if (!response.ok) throw new Error("Failed to fetch meal plans");
      const data: MealPlanResponse = await response.json();
      setMealPlans(data.mealPlans || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setMealPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this meal plan?")) return;
    setDeleteId(id);
    try {
      await fetch(`http://localhost:3000/api/meal-plans/${id}`, {
        method: "DELETE",
      });
      setMealPlans((prev) => prev.filter((plan) => plan._id !== id));
    } catch (err) {
      alert("Error deleting meal plan");
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (mealPlan: MealPlan) => {
    setEditMealPlan(mealPlan);
  };

  const closeEditModal = () => {
    setEditMealPlan(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 flex items-center justify-center text-2xl font-bold">
        <Calendar className="mr-2 h-6 w-6" /> My Meal Plans
      </h1>

      {loading ? (
        <div className="flex flex-col items-center space-y-2">
          <Loader className="h-8 w-8 animate-spin text-gray-500" />
          <p>Loading meal plans...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : mealPlans.length === 0 ? (
        <div className="text-gray-600 text-center">No meal plans found.</div>
      ) : (
        <div className="space-y-6">
          {mealPlans.map((plan) => (
            <div
              key={plan._id}
              className="rounded-lg border p-4 bg-white shadow-sm"
            >
              <div className="flex justify-between border-b pb-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    Week: {plan.weekStart} - {plan.weekEnd}
                  </h2>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan._id)}
                    className={`text-red-500 hover:text-red-700 ${
                      deleteId === plan._id ? "opacity-50" : ""
                    }`}
                    disabled={deleteId === plan._id}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-md"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-md"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Edit Meal Plan Modal */}
      {editMealPlan && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg relative">
            <button
              onClick={closeEditModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold mb-4">Edit Meal Plan</h2>
            <p>
              Editing week: {editMealPlan.weekStart} - {editMealPlan.weekEnd}
            </p>
            {/* Add form fields here to edit meal details */}
            <button
              onClick={closeEditModal}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MealPlanList;
