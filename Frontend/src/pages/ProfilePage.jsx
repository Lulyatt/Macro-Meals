import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ProfilePage.css";

const GOAL_OPTIONS = ["Weight loss", "Weight gain", "Eating healthier", "Build muscle", "Increase energy", "Lower Cholesterol", "Improve digestion", ];
const DIETARY_OPTIONS = ["Vegan", "Vegetarian", "Gluten-free", "Dairy-free", "High-protein", "Low-carb", "Nut-free", "Pescatarian", "Keto", "Paleo", "Halal", "Kosher"];
const ACTIVITY_OPTIONS = ["Sedentary", "Lightly active", "Moderately active", "Very active"];

const SUGGESTED_DETAILED_GOALS = [
  "To find meals that are filling, that I enjoy and that are low calorie",
  "To find meals that let me hit my daily protein target",
  "To find meals that support steady energy throughout the day"
];

const initialProfile = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  height: "",
  heightUnit: "cm",
  weight: "",
  weightUnit: "kg",
  activityLevel: "",
  goals: [],
  otherGoal: "",
  dietaryRequirements: [],
  favoriteFoods: "",
  targetCalories: "",
  notes: "",
  detailedGoals: []
};

function getAge(dateOfBirth) {
  if (!dateOfBirth) return null;

  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

function convertWeight(value, fromUnit, toUnit) {
  if (!value) return "";
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) return "";

  const kilograms = {
    kg: numericValue,
    lbs: numericValue / 2.20462,
    st: numericValue * 6.35029
  }[fromUnit];

  if (toUnit === "kg") return (kilograms).toFixed(1);
  if (toUnit === "lbs") return (kilograms * 2.20462).toFixed(1);
  if (toUnit === "st") return (kilograms / 6.35029).toFixed(2);
  return "";
}

function createDetailedGoal(text) {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    text
  };
}

function Profile() {
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isAddingDetailedGoal, setIsAddingDetailedGoal] = useState(false);
  const [editingDetailedGoalId, setEditingDetailedGoalId] = useState(null);
  const [detailedGoalDraft, setDetailedGoalDraft] = useState("");

  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch(`${apiBaseUrl}/auth/me`, {
          credentials: "include"
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            setMessage({ type: "info", text: "Sign in to start building your profile." });
            setLoading(false);
            return;
          }

          throw new Error(data.error || "Unable to load profile");
        }

        setProfile({
          ...initialProfile,
          ...data.user,
          goals: Array.isArray(data.user?.goals) ? data.user.goals : [],
          dietaryRequirements: Array.isArray(data.user?.dietaryRequirements) ? data.user.dietaryRequirements : [],
          detailedGoals: Array.isArray(data.user?.detailedGoals) ? data.user.detailedGoals : []
        });
      } catch (error) {
        setMessage({ type: "error", text: error.message || "Unable to load profile" });
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [apiBaseUrl]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleArrayToggle = (field, value) => {
    setProfile((current) => {
      const values = current[field] || [];
      const updated = values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value];

      return { ...current, [field]: updated };
    });
  };

  const handleWeightUnitChange = (nextUnit) => {
    setProfile((current) => {
      if (current.weight && current.weightUnit !== nextUnit) {
        const converted = convertWeight(current.weight, current.weightUnit, nextUnit);
        return { ...current, weightUnit: nextUnit, weight: converted };
      }

      return { ...current, weightUnit: nextUnit };
    });
  };

  const handleDetailedGoalDraftChange = (event) => {
    setDetailedGoalDraft(event.target.value);
  };

  const startAddingDetailedGoal = () => {
    setEditingDetailedGoalId(null);
    setDetailedGoalDraft("");
    setIsAddingDetailedGoal(true);
  };

  const selectSuggestedGoal = (suggestion) => {
    setEditingDetailedGoalId(null);
    setDetailedGoalDraft(suggestion);
    setIsAddingDetailedGoal(true);
  };

  const saveNewDetailedGoal = () => {
    const text = detailedGoalDraft.trim();
    if (!text) return;

    setProfile((current) => ({
      ...current,
      detailedGoals: [...current.detailedGoals, createDetailedGoal(text)]
    }));
    setDetailedGoalDraft("");
    setIsAddingDetailedGoal(false);
  };

  const startEditingDetailedGoal = (goal) => {
    setEditingDetailedGoalId(goal.id);
    setDetailedGoalDraft(goal.text);
    setIsAddingDetailedGoal(false);
  };

  const saveEditedDetailedGoal = () => {
    const text = detailedGoalDraft.trim();
    if (!text) return;

    setProfile((current) => ({
      ...current,
      detailedGoals: current.detailedGoals.map((goal) =>
        goal.id === editingDetailedGoalId ? { ...goal, text } : goal
      )
    }));
    setEditingDetailedGoalId(null);
    setDetailedGoalDraft("");
  };

  const cancelDetailedGoalEdit = () => {
    setIsAddingDetailedGoal(false);
    setEditingDetailedGoalId(null);
    setDetailedGoalDraft("");
  };

  const deleteDetailedGoal = (goalId) => {
    setProfile((current) => ({
      ...current,
      detailedGoals: current.detailedGoals.filter((goal) => goal.id !== goalId)
    }));
    if (editingDetailedGoalId === goalId) {
      setEditingDetailedGoalId(null);
      setDetailedGoalDraft("");
    }
  };

  async function handleSave() {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(`${apiBaseUrl}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...profile,
          weight: profile.weight === "" ? "" : Number(profile.weight),
          height: profile.height === "" ? "" : Number(profile.height),
          targetCalories: profile.targetCalories === "" ? "" : Number(profile.targetCalories)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save profile");
      }

      setEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Unable to save profile" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="page"><p>Loading your profile...</p></div>;
  }

  return (
    <div className="page">
      <div className="hero">
        <div>
          <p className="eyebrow">Macro Meals personal profile</p>
          <h1>Build your profile</h1>
          <p className="subtitle">Add the details that help Macro Meals suggest meals, habits, and nutrition ideas that fit you.</p>
        </div>
        <button onClick={() => (editing ? handleSave() : setEditing(true))} className="primaryButton" disabled={saving}>
          {saving ? "Saving..." : editing ? "Save profile" : "Edit profile"}
        </button>
      </div>

      {message.text ? (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      ) : null}

      <div className="grid">
        <section className="card">
          <h2 className="sectionTitle">Your profile snapshot</h2>
          <div className="summaryBox">
            <h3 className="summaryName">{profile.firstName || profile.lastName ? `${profile.firstName} ${profile.lastName}`.trim() : "Your profile"}</h3>
            <p className="summaryText">Age: {getAge(profile.dateOfBirth) ?? "Add your birthday"}</p>
            <p className="summaryText">Height: {profile.height ? `${profile.height} ${profile.heightUnit}` : "Add your height"}</p>
            <p className="summaryText">Weight: {profile.weight ? `${profile.weight} ${profile.weightUnit}` : "Add your weight"}</p>
            <p className="summaryText">Activity: {profile.activityLevel || "Add activity level"}</p>
          </div>

          <div className="goalsBox">
            <h3 className="sectionTitle">Current goals</h3>
            {profile.goals.length || profile.otherGoal ? (
              <div className="goalChips">
                {(profile.goals || []).map((goal) => (
                  <span key={goal} className="goalChip">{goal}</span>
                ))}
                {profile.otherGoal ? <span className="goalChip">{profile.otherGoal}</span> : null}
              </div>
            ) : (
              <p className="summaryText">Your goals will be shown here in a larger, more visible way.</p>
            )}
          </div>

          <div className="detailList">
            <div className="detailListHeader">
              <h3 className="sectionTitle">Detailed goals</h3>
              <button type="button" className="secondaryButton smallButton" onClick={startAddingDetailedGoal}>
                Add detailed goal
              </button>
            </div>

            {profile.detailedGoals?.length ? (
              profile.detailedGoals.map((goal) => (
                <div key={goal.id} className="detailItem detailedGoalItem">
                  <p>{goal.text}</p>
                  <div className="goalActions">
                    <button type="button" className="secondaryButton smallButton" onClick={() => startEditingDetailedGoal(goal)}>
                      Edit
                    </button>
                    <button type="button" className="secondaryButton smallButton deleteButton" onClick={() => deleteDetailedGoal(goal.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="summaryText">Add a detailed goal to describe the meals you want.</p>
            )}

            {(isAddingDetailedGoal || editingDetailedGoalId) && (
              <div className="detailItem detailedGoalForm">
                <label className="label">
                  Detailed goal
                  <textarea
                    value={detailedGoalDraft}
                    onChange={handleDetailedGoalDraftChange}
                    className="input textareaInput"
                    placeholder="Write a detailed goal..."
                  />
                </label>

                <div className="suggestions">
                  <p className="fieldLabel">Suggested goals</p>
                  <div className="suggestionButtons">
                    {SUGGESTED_DETAILED_GOALS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        className="secondaryButton suggestionButton"
                        onClick={() => selectSuggestedGoal(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="actions detailedGoalActions">
                  <button type="button" className="secondaryButton" onClick={cancelDetailedGoalEdit}>
                    Cancel
                  </button>
                  <button type="button" className="primaryButton" onClick={editingDetailedGoalId ? saveEditedDetailedGoal : saveNewDetailedGoal}>
                    {editingDetailedGoalId ? "Save detailed goal" : "Add detailed goal"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="card">
          <h2 className="sectionTitle">{editing ? "Edit your details" : "Profile details"}</h2>

          {!editing ? (
            <div className="readOnlyList">
              <p><strong>Name:</strong> {profile.firstName || profile.lastName ? `${profile.firstName} ${profile.lastName}`.trim() : ""}</p>
              <p><strong>Date of birth:</strong> {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : ""}</p>
              <p><strong>Height:</strong> {profile.height ? `${profile.height} ${profile.heightUnit}` : ""}</p>
              <p><strong>Weight:</strong> {profile.weight ? `${profile.weight} ${profile.weightUnit}` : ""}</p>
              <p><strong>Dietary requirements:</strong> {profile.dietaryRequirements.length ? profile.dietaryRequirements.join(", ") : ""}</p>
              <p><strong>Favourite foods:</strong> {profile.favoriteFoods || ""}</p>
              <p><strong>Target daily calories:</strong> {profile.targetCalories || ""}</p>
              <p><strong>Notes:</strong> {profile.notes || ""}</p>
            </div>
          ) : (
            <div className="formGrid">
              <label className="label">
                First name
                <input name="firstName" value={profile.firstName} onChange={handleChange} className="input" />
              </label>

              <label className="label">
                Last name
                <input name="lastName" value={profile.lastName} onChange={handleChange} className="input" />
              </label>

              <label className="label">
                Date of birth
                <input name="dateOfBirth" type="date" value={profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : ""} onChange={handleChange} className="input" />
              </label>

              <label className="label">
                Height
                <input name="height" type="number" value={profile.height} onChange={handleChange} className="input" />
              </label>

              <label className="label">
                Height unit
                <select name="heightUnit" value={profile.heightUnit} onChange={handleChange} className="input">
                  <option value="cm">cm</option>
                  <option value="ft">ft</option>
                </select>
              </label>

              <label className="label">
                Weight
                <input name="weight" type="number" value={profile.weight} onChange={handleChange} className="input" />
              </label>

              <label className="label">
                Weight unit
                <select value={profile.weightUnit} onChange={(event) => handleWeightUnitChange(event.target.value)} className="input">
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                  <option value="st">st</option>
                </select>
              </label>

              <label className="label">
                Activity level
                <select name="activityLevel" value={profile.activityLevel} onChange={handleChange} className="input">
                  <option value="">Select one</option>
                  {ACTIVITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label className="label">
                Target calories
                <input name="targetCalories" type="number" value={profile.targetCalories} onChange={handleChange} className="input" />
              </label>

              <div className="fullWidth">
                <p className="fieldLabel">Current goals</p>
                <div className="choiceGrid">
                  {GOAL_OPTIONS.map((option) => (
                    <label key={option} className="choiceOption">
                      <input type="checkbox" checked={profile.goals.includes(option)} onChange={() => handleArrayToggle("goals", option)} />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                <input name="otherGoal" value={profile.otherGoal} onChange={handleChange} placeholder="Other goal" className="input spacedInput" />
              </div>

              <div className="fullWidth">
                <p className="fieldLabel">Dietary requirements</p>
                <div className="choiceGrid">
                  {DIETARY_OPTIONS.map((option) => (
                    <label key={option} className="choiceOption">
                      <input type="checkbox" checked={profile.dietaryRequirements.includes(option)} onChange={() => handleArrayToggle("dietaryRequirements", option)} />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="label">
                Favourite foods
                <input name="favoriteFoods" value={profile.favoriteFoods} onChange={handleChange} className="input" />
              </label>

              <label className="label">
                Notes for your meal plan
                <textarea name="notes" value={profile.notes} onChange={handleChange} className="input textareaInput" />
              </label>
            </div>
          )}

          {editing ? (
            <div className="actions">
              <button type="button" onClick={() => setEditing(false)} className="secondaryButton">Cancel</button>
              <button type="button" onClick={handleSave} className="primaryButton" disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
            </div>
          ) : (
            <p className="helperText">Use the edit button to tailor your Macro Meals profile with goals, preferences, and fitness details.</p>
          )}
        </section>
      </div>

      <div className="footerNotice">
        <p>Need to sign out? <Link to="/login">Go back to login</Link></p>
      </div>
    </div>
  );
}

export default Profile;