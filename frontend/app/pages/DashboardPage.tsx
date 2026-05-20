'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

type MealItem = {
  id: number;
  food_id: number;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fibre: number;
};

type TrackedMeal = {
  id: number;
  meal_type: string;
  meal_date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  total_fibre: number;
  logged_at: string;
  items: MealItem[];
};

type UserGoals = {
  calorie_goal: number;
  protein_goal: number;
  carbs_goal: number;
  fat_goal: number;
  fibre_goal: number;
};

const DEFAULT_GOALS: UserGoals = {
  calorie_goal: 2000,
  protein_goal: 150,
  carbs_goal:   200,
  fat_goal:     67,
  fibre_goal:   30,
};

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];

const reminders = [
  { label: 'Drink water', due: 'in 30 min' },
  { label: 'Add dinner', due: 'by 7:45 PM' },
  { label: 'Review weekly goals', due: 'today' },
];

function formatTime(loggedAt: string) {
  return new Date(loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function MacroBar({ label, current, goal, unit = 'g' }: { label: string; current: number; goal: number; unit?: string }) {
  const pct = Math.min((current / (goal || 1)) * 100, 100);
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xs text-slate-400">{Math.round(current)}/{Math.round(goal)}{unit}</p>
      </div>
      <p className="text-xl font-bold text-slate-900 mb-2">{Math.round(current)}{unit}</p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { userId } = useAuth();
  const [meals, setMeals] = useState<TrackedMeal[]>([]);
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editType, setEditType] = useState('');

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      fetch(`/api/tracked-meals?userId=${encodeURIComponent(userId)}&date=${new Date().toISOString().split('T')[0]}`)
        .then((r) => r.json())
        .catch(() => []),
      fetch(`/api/users/${encodeURIComponent(userId)}/goals`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ]).then(([mealsData, goalsData]) => {
      setMeals(Array.isArray(mealsData) ? mealsData : []);
      setGoals(goalsData);
    }).finally(() => setLoading(false));
  }, [userId]);

  const toNum = (val: any) => {
    const n = typeof val === 'string' ? parseFloat(val) : Number(val);
    return Number.isFinite(n) ? n : 0;
  };

  const totalCalories = meals.reduce((s, m) => s + toNum(m.total_calories), 0);
  const totalProtein  = meals.reduce((s, m) => s + toNum(m.total_protein), 0);
  const totalCarbs    = meals.reduce((s, m) => s + toNum(m.total_carbs), 0);
  const totalFats     = meals.reduce((s, m) => s + toNum(m.total_fats), 0);
  const totalFibre    = meals.reduce((s, m) => s + toNum(m.total_fibre), 0);

  const activeGoals   = goals ?? DEFAULT_GOALS;
  const calorieGoal   = toNum(activeGoals.calorie_goal);
  const completion    = Math.min((totalCalories / (calorieGoal || 1)) * 100, 100);

  function startEdit(meal: TrackedMeal) {
    setEditingId(meal.id);
    setEditType(meal.meal_type);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditType('');
  }

  async function saveEdit(id: number) {
    const res = await fetch(`/api/tracked-meals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mealType: editType }),
    });
    if (res.ok) {
      setMeals((prev) =>
        prev.map((m) => (m.id === id ? { ...m, meal_type: editType } : m))
      );
    }
    cancelEdit();
  }

  async function deleteMeal(id: number) {
    const res = await fetch(`/api/tracked-meals/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMeals((prev) => prev.filter((m) => m.id !== id));
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">Daily Dashboard</h1>
          <p className="text-sm text-slate-600">Quick snapshot of your daily goals, activity, and log status.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            {/* Calorie goal card */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Nutrition Goal</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {goals ? 'Personalised' : 'Default'}
                </span>
              </div>

              <p className="text-4xl font-bold text-slate-900">{Math.round(totalCalories)} kcal</p>
              <p className="text-sm text-slate-500">of {Math.round(calorieGoal)} kcal target</p>

              <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${completion}%` }} />
              </div>

              <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                <span>{Math.round(completion)}% complete</span>
                <span>{Math.max(Math.round(calorieGoal - totalCalories), 0)} kcal left</span>
              </div>
            </div>

            {/* Macro summary with goals */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <MacroBar label="Protein" current={totalProtein} goal={toNum(activeGoals.protein_goal)} />
                <MacroBar label="Carbs"   current={totalCarbs}   goal={toNum(activeGoals.carbs_goal)} />
                <MacroBar label="Fats"    current={totalFats}    goal={toNum(activeGoals.fat_goal)} />
                <MacroBar label="Fibre"   current={totalFibre}   goal={toNum(activeGoals.fibre_goal)} />
                <div className="rounded-2xl bg-slate-50 p-4 text-center col-span-2">
                  <p className="text-xs text-slate-500">Meals</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{meals.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Today's Meals</h2>
                  <p className="mt-1 text-sm text-slate-500">Meals you've logged today</p>
                </div>
              </div>

              {loading ? (
                <p className="text-sm text-slate-400">Loading...</p>
              ) : meals.length === 0 ? (
                <p className="text-sm text-slate-400">No meals logged yet today.</p>
              ) : (
                <div className="space-y-3">
                  {meals.map((meal) => (
                    <div key={meal.id} className="rounded-2xl bg-slate-50 p-4">
                      {editingId === meal.id ? (
                        <div className="flex items-center gap-3">
                          <select
                            value={editType}
                            onChange={(e) => setEditType(e.target.value)}
                            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                          >
                            {MEAL_TYPES.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => saveEdit(meal.id)}
                            className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:opacity-90"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{meal.meal_type}</p>
                            <p className="text-xs text-slate-500">
                              {meal.items.length} item{meal.items.length !== 1 ? 's' : ''}
                              {' · '}
                              {Math.round(meal.total_protein)}g protein
                              {' · '}
                              {Math.round(meal.total_carbs)}g carbs
                              {' · '}
                              {Math.round(meal.total_fats)}g fats
                              {' · '}
                              {Math.round(toNum(meal.total_fibre))}g fibre
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-700">{Math.round(meal.total_calories)} kcal</span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                              {formatTime(meal.logged_at)}
                            </span>
                            <button
                              onClick={() => startEdit(meal)}
                              title="Edit meal type"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteMeal(meal.id)}
                              title="Delete meal"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Today's Focus</h2>
                  <p className="mt-1 text-sm text-slate-500">Action items and reminders to finish strong</p>
                </div>
                <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
                  Manage Reminders
                </button>
              </div>

              <div className="space-y-3">
                {reminders.map((reminder) => (
                  <div key={reminder.label} className="flex justify-between rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-700">{reminder.label}</p>
                    <p className="text-sm text-slate-600">{reminder.due}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Weekly Points</h2>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-5">
                <div>
                  <p className="text-sm text-slate-600">Total Points</p>
                  <p className="text-3xl font-bold text-slate-900">1,420</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Target</p>
                  <p className="text-xl font-semibold text-slate-900">2,000</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
