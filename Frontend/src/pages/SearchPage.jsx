import { useState } from "react";

export default function FoodSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meal, setMeal] = useState([]);

  async function searchFoods() {
    if (!query) return;

    setLoading(true);

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/foods/search?q=${query}`
    );

    const data = await res.json();

    setResults(data.foods?.food || []);
    setLoading(false);

  
  }

 function addToMeal(food) {

  console.log("FOOD PASSED IN:", food);

  const macros = parseMacros(food.food_description);

  const cleanFood = {
    name: food.food_name,
    amount: 100,
    ...macros,
    
  };

  setMeal((prevMeal) => [...prevMeal, cleanFood]);

  
}

function parseMacros(description) {
  const caloriesMatch = description.match(/Calories:\s*(\d+)\s*kcal/);
  const fatMatch = description.match(/Fat:\s*([\d.]+)/);
  const carbsMatch = description.match(/Carbs:\s*([\d.]+)/);
  const proteinMatch = description.match(/Protein:\s*([\d.]+)/);

  return {
    calories: caloriesMatch ? Number(caloriesMatch[1]) : 0,
    fat: fatMatch ? Number(fatMatch[1]) : 0,
    carbs: carbsMatch ? Number(carbsMatch[1]) : 0,
    protein: proteinMatch ? Number(proteinMatch[1]) : 0,
  };
}

const totalCalories = meal.reduce((sum, item) => {
  return sum + (item.calories * item.amount) / 100;
}, 0);

const totalProtein = meal.reduce((sum, item) => {
  return sum + (item.protein * item.amount) / 100;
}, 0);

const totalCarbs = meal.reduce((sum, item) => {
  return sum + (item.carbs * item.amount) / 100;
}, 0);

const totalFat = meal.reduce((sum, item) => {
  return sum + (item.fat * item.amount) / 100;
}, 0);

function removeFromMeal(indexToRemove) {
  setMeal((prevMeal) =>
    prevMeal.filter((_, index) => index !== indexToRemove)
  );
}

function setAmount(index, newAmount) {
  setMeal((prevMeal) =>
    prevMeal.map((item, i) =>
      i === index
        ? { ...item, amount: Math.max(0, newAmount) }
        : item
    )
  );
}

  return (
  <div style={{ padding: "20px" }}>
    <h1>Food Search</h1>

    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search food..."
    />

    <button onClick={searchFoods}>Search</button>

    {loading && <p>Loading...</p>}

    <ul>
      {results.map((item, index) => (
        <li key={index}>
          {item.food_name}
          <button onClick={() => addToMeal(item)}>
            Add
          </button>
        </li>
      ))}
    </ul>

    <h2>Meal Total Macros</h2>

<p>Calories: {totalCalories.toFixed(0)} kcal</p>
<p>Protein: {totalProtein.toFixed(1)} g</p>
<p>Carbs: {totalCarbs.toFixed(1)} g</p>
<p>Fat: {totalFat.toFixed(1)} g</p>

   <h2>Ingredients List</h2>

{meal.length === 0 ? (
  <p>No items added yet</p>
) : (
  <ul>
    {meal.map((item, index) => (
      <li key={index}>
     {item.name}

<input
  type="number"
  value={item.amount}
  onChange={(e) => setAmount(index, Number(e.target.value))}
  style={{ width: "80px", marginLeft: "10px" }}
/>

<span>g</span>

    <button onClick={() => removeFromMeal(index)}>
      Remove
      </button>
      </li>
    ))}
  </ul>
)}
  </div>
);
}