import { useEffect, useState } from "react";
import "./SearchPage.css";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meal, setMeal] = useState([]);
  const [mealName, setMealName] = useState("");
  const [savedMeals, setSavedMeals] = useState([]);
  const [status, setStatus] = useState({ type: "", text: "" });

  useEffect(() => {
    loadSavedMeals();
    const syncListener = () => loadSavedMeals();
    window.addEventListener("macroMealsSavedMealsChanged", syncListener);
    return () => window.removeEventListener("macroMealsSavedMealsChanged", syncListener);
  }, []);

  function loadSavedMeals() {
    const stored = localStorage.getItem("macroMealsSavedMeals");
    setSavedMeals(stored ? JSON.parse(stored) : []);
  }

  function persistSavedMeals(items) {
    localStorage.setItem("macroMealsSavedMeals", JSON.stringify(items));
    setSavedMeals(items);
  }

  async function searchFoods() {
    if (!query.trim()) return;

    setLoading(true);
    setResults([]);
    setStatus({ type: "", text: "" });

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/foods/search?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setResults(data.foods?.food || []);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", text: "Unable to load food results." });
    } finally {
      setLoading(false);
    }
  }

  function addToMeal(food) {
    const macros = parseMacros(food.food_description);
    const cleanFood = {
      id: `${food.food_name}-${Date.now()}`,
      name: food.food_name,
      amount: 100,
      ...macros,
    };
    setMeal((prevMeal) => [...prevMeal, cleanFood]);
  }

  function parseMacros(description) {
    const caloriesMatch = description.match(/Calories:\s*(\d+)\s*kcal/i);
    const fatMatch = description.match(/Fat:\s*([\d.]+)/i);
    const carbsMatch = description.match(/Carbs:\s*([\d.]+)/i);
    const proteinMatch = description.match(/Protein:\s*([\d.]+)/i);

    return {
      calories: caloriesMatch ? Number(caloriesMatch[1]) : 0,
      fat: fatMatch ? Number(fatMatch[1]) : 0,
      carbs: carbsMatch ? Number(carbsMatch[1]) : 0,
      protein: proteinMatch ? Number(proteinMatch[1]) : 0,
    };
  }

  const totalCalories = meal.reduce((sum, item) => sum + (item.calories * item.amount) / 100, 0);
  const totalProtein = meal.reduce((sum, item) => sum + (item.protein * item.amount) / 100, 0);
  const totalCarbs = meal.reduce((sum, item) => sum + (item.carbs * item.amount) / 100, 0);
  const totalFat = meal.reduce((sum, item) => sum + (item.fat * item.amount) / 100, 0);

  function removeFromMeal(indexToRemove) {
    setMeal((prevMeal) => prevMeal.filter((_, index) => index !== indexToRemove));
  }

  function setAmount(index, newAmount) {
    setMeal((prevMeal) =>
      prevMeal.map((item, i) =>
        i === index ? { ...item, amount: Math.max(0, newAmount) } : item
      )
    );
  }

  function saveMeal() {
    setStatus({ type: "", text: "" });

    if (!meal.length) {
      setStatus({ type: "error", text: "Add ingredients to save your meal." });
      return;
    }

    const defaultName = `My Meal #${savedMeals.length + 1}`;
    const newMeal = {
      id: `saved-${Date.now()}`,
      name: mealName.trim() || defaultName,
      items: meal,
      totals: {
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
      },
      savedAt: new Date().toISOString(),
    };

    const updated = [newMeal, ...savedMeals];
    persistSavedMeals(updated);
    setMeal([]);
    setMealName("");
    setStatus({ type: "success", text: "Meal saved successfully." });
    window.dispatchEvent(new Event("macroMealsSavedMealsChanged"));
  }

  const canSave = meal.length > 0;

  return (
    <div className="page searchPage">
      <div className="searchGrid">
        <section className="panel searchPanel">
          <div className="panelHeader">
            <h2>Food search</h2>
            <p>Find foods by name and add them to your meal.</p>
          </div>

          <div className="searchControls">
            <input
              className="textInput"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search food..."
            />
            <button className="primaryButton" onClick={searchFoods} disabled={!query.trim() || loading}>
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          <div className="resultsContainer">
            {loading ? (
              <p className="emptyState">Searching for foods...</p>
            ) : results.length ? (
              results.map((item, index) => (
                <div key={`${item.food_name}-${index}`} className="resultItem">
                  <div className="resultText">
                    <strong>{item.food_name}</strong>
                    <p>{item.food_description}</p>
                  </div>
                  <button className="secondaryButton" onClick={() => addToMeal(item)}>
                    Add
                  </button>
                </div>
              ))
            ) : (
              <p className="emptyState">Search for a food to see results.</p>
            )}
          </div>
        </section>

        <section className="panel ingredientsPanel">
          <div className="panelHeader">
            <h2>Ingredients</h2>
            <p>Name your meal and adjust ingredient servings.</p>
          </div>

          <label className="fieldLabel" htmlFor="mealName">
            Meal name
          </label>
          <input
            id="mealName"
            className="textInput"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            placeholder="Enter meal name"
          />

          <div className="ingredientsContainer">
            {meal.length ? (
              meal.map((item, index) => (
                <div key={item.id} className="ingredientItem">
                  <div>
                    <strong>{item.name}</strong>
                    <div className="ingredientMacros">
                      <span>{item.calories} kcal / 100g</span>
                      <span>{item.protein}g protein</span>
                    </div>
                  </div>

                  <div className="ingredientActions">
                    <label className="amountLabel">
                      Qty (g)
                      <input
                        type="number"
                        min="0"
                        value={item.amount}
                        onChange={(e) => setAmount(index, Number(e.target.value))}
                        className="amountInput"
                      />
                    </label>
                    <button className="secondaryButton deleteButton" onClick={() => removeFromMeal(index)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="emptyState">No ingredients added yet.</p>
            )}
          </div>
        </section>

        <section className="panel macrosPanel">
          <div className="panelHeader">
            <h2>Meal totals</h2>
            <p>Review macros and save your meal.</p>
          </div>

          <div className="totalsCard">
            <div className="totalRow">
              <span>Calories</span>
              <strong>{totalCalories.toFixed(0)} kcal</strong>
            </div>
            <div className="totalRow">
              <span>Protein</span>
              <strong>{totalProtein.toFixed(1)} g</strong>
            </div>
            <div className="totalRow">
              <span>Carbs</span>
              <strong>{totalCarbs.toFixed(1)} g</strong>
            </div>
            <div className="totalRow">
              <span>Fat</span>
              <strong>{totalFat.toFixed(1)} g</strong>
            </div>
          </div>

          {status.text && (
            <p className={status.type === "error" ? "statusMessage errorMessage" : "statusMessage successMessage"}>
              {status.text}
            </p>
          )}

          <button className="primaryButton saveButton" onClick={saveMeal} disabled={!canSave}>
            Save meal
          </button>
        </section>
      </div>
    </div>
  );
}
