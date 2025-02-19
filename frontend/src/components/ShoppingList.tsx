import React, { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface ShoppingListItem extends Ingredient {
  recipes: string[];
}

function ShoppingList() {
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);

  useEffect(() => {
    // Fetch shopping list for current meal plan
    fetch("http://localhost:3000/api/meal-plans/shopping-list")
      .then((res) => res.json())
      .then((data) => setShoppingList(data))
      .catch((error) => console.error("Error fetching shopping list:", error));
  }, []);

  return (
    <div>
      <h1 className="text-center">
        <ShoppingCart className="inline-block mr-2" />
        Shopping List
      </h1>

      <div className="shopping-list">
        {shoppingList.length === 0 ? (
          <p>
            No items in shopping list. Add some recipes to your meal plan first!
          </p>
        ) : (
          shoppingList.map((item, index) => (
            <div key={index} className="ingredient-item">
              <div>
                <span className="font-bold">{item.name}</span>
                <span className="text-gray-600 ml-2">
                  ({item.quantity} {item.unit})
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Used in: {item.recipes.join(", ")}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ShoppingList;
