import { useEffect, useState } from "react";
import "./FavouritesPage.css";

function Favourites() {
  const [savedMeals, setSavedMeals] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [status, setStatus] = useState({ type: "", text: "" });

  useEffect(() => {
    loadSavedMeals();
    loadShoppingList();
    const syncSavedMeals = () => loadSavedMeals();
    window.addEventListener("macroMealsSavedMealsChanged", syncSavedMeals);
    return () => window.removeEventListener("macroMealsSavedMealsChanged", syncSavedMeals);
  }, []);

  function loadSavedMeals() {
    const stored = localStorage.getItem("macroMealsSavedMeals");
    setSavedMeals(stored ? JSON.parse(stored) : []);
  }

  function loadShoppingList() {
    const stored = localStorage.getItem("macroMealsShoppingList");
    setShoppingList(stored ? JSON.parse(stored) : []);
  }

  function persistShoppingList(items) {
    localStorage.setItem("macroMealsShoppingList", JSON.stringify(items));
    setShoppingList(items);
  }

  function removeSavedMeal(mealId) {
    const updated = savedMeals.filter((meal) => meal.id !== mealId);
    localStorage.setItem("macroMealsSavedMeals", JSON.stringify(updated));
    setSavedMeals(updated);
    setStatus({ type: "success", text: "Saved meal deleted." });
  }

  function addToShoppingList(meal) {
    setStatus({ type: "", text: "" });

    const updated = [...shoppingList];

    meal.items.forEach((item) => {
      const existing = updated.find((entry) => entry.name.toLowerCase() === item.name.toLowerCase());
      if (existing) {
        existing.amount += item.amount;
      } else {
        updated.push({ name: item.name, amount: item.amount });
      }
    });

    persistShoppingList(updated);
    setStatus({ type: "success", text: `${meal.name} added to your shopping list.` });
  }

  function clearShoppingList() {
    persistShoppingList([]);
    setStatus({ type: "success", text: "Shopping list cleared." });
  }

  return (
    <div className="page favouritesPage">
      <div className="favouritesHeader">
        <div>
          <p className="eyebrow">Saved meals</p>
          <h1>Recipes</h1>
          <p className="subtitle">Your saved meals appear here so you can review them anytime.</p>
        </div>
      </div>

      <section className="savedMealsSection">
        <header className="sectionTitleRow">
          <div>
            <h2>My saved meals</h2>
            <p className="sectionSubtitle">Saved meals from your meal builder.</p>
          </div>
          <span className="mealCount">{savedMeals.length} meal{savedMeals.length === 1 ? "" : "s"}</span>
        </header>

        {savedMeals.length === 0 ? (
          <div className="emptyStateCard">
            <p>No saved meals yet. Save a meal from the search page to see it here.</p>
          </div>
        ) : (
          <div className="savedMealsList">
            {savedMeals.map((meal) => (
              <details key={meal.id} className="mealCard">
                <summary>
                  <div>
                    <strong>{meal.name}</strong>
                    <p>{new Date(meal.savedAt).toLocaleString()}</p>
                  </div>
                  <div className="summaryRight">
                    <div className="mealTotals">
                      <span>{Math.round(meal.totals.calories)} kcal</span>
                      <span>{meal.totals.protein.toFixed(1)}g P</span>
                      <span>{meal.totals.carbs.toFixed(1)}g C</span>
                      <span>{meal.totals.fat.toFixed(1)}g F</span>
                    </div>
                    <button
                      className="secondaryButton shoppingButton"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        addToShoppingList(meal);
                      }}
                    >
                      Add to shopping list
                    </button>
                    <button
                      className="secondaryButton deleteButton"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        removeSavedMeal(meal.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </summary>
                <div className="mealDetails">
                  <h3>Ingredients</h3>
                  <ul>
                    {meal.items.map((item, index) => (
                      <li key={`${meal.id}-${index}`}>
                        <span>{item.name}</span>
                        <span>{item.amount} g</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            ))}
          </div>
        )}
      </section>

      <section className="shoppingListSection">
        <header className="sectionTitleRow">
          <div>
            <h2>Shopping list</h2>
            <p className="sectionSubtitle">Items from saved meals are combined into one list.</p>
          </div>
          <button className="secondaryButton clearButton" onClick={clearShoppingList}>
            Clear list
          </button>
        </header>

        {status.text && (
          <p className={status.type === "error" ? "statusMessage errorMessage" : "statusMessage successMessage"}>
            {status.text}
          </p>
        )}

        {shoppingList.length === 0 ? (
          <div className="emptyStateCard">
            <p>Your shopping list is empty. Add a saved meal to begin.</p>
          </div>
        ) : (
          <div className="shoppingListCard">
            <ul>
              {shoppingList.map((item) => (
                <li key={item.name}>
                  <span>{item.name}</span>
                  <span>{Math.round(item.amount)} g</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

export default Favourites