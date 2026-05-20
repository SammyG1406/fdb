'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';

type Food = {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
};

type LogItem = {
  food: Food;
  quantity: number;
};

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];

function scale(val: number, qty: number) {
  return Math.round((val * qty) / 100);
}

export default function LoggingPage() {
  const { userId } = useAuth();
  const [mealType, setMealType] = useState('Breakfast');
  const [foodSearch, setFoodSearch] = useState('');
  const [foodResults, setFoodResults] = useState<Food[]>([]);
  const [quantity, setQuantity] = useState(100);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [items, setItems] = useState<LogItem[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!foodSearch.trim() || selectedFood) {
      setFoodResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/foods?q=${encodeURIComponent(foodSearch.trim())}`);
      const data = await res.json();
      setFoodResults(data);
    }, 300);
  }, [foodSearch, selectedFood]);

  const totals = items.reduce(
    (acc, item) => ({
      calories: acc.calories + scale(item.food.calories, item.quantity),
      protein: acc.protein + scale(item.food.protein, item.quantity),
      carbs: acc.carbs + scale(item.food.carbs, item.quantity),
      fats: acc.fats + scale(item.food.fats, item.quantity),
      fiber: acc.fiber + scale(item.food.fiber ?? 0, item.quantity),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
  );

  function addItem() {
    if (!selectedFood) return;
    setItems((prev) => [...prev, { food: selectedFood, quantity }]);
    setSelectedFood(null);
    setFoodSearch('');
    setQuantity(100);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (items.length === 0) return;
    if (!userId) { setError('Not authenticated. Please sign in.'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tracked-meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          mealType: mealType.toLowerCase(),
          mealDate: new Date().toISOString().slice(0, 10),
          sourceType: 'manual',
          items: items.map((item) => ({
            foodId: item.food.id,
            quantity: item.quantity,
            unit: 'g',
            calories: Math.ceil(scale(item.food.calories, item.quantity)),
            protein: Math.ceil(scale(item.food.protein, item.quantity)),
            carbs: Math.ceil(scale(item.food.carbs, item.quantity)),
            fats: Math.ceil(scale(item.food.fats, item.quantity)),
            fibre: Math.ceil(scale(item.food.fiber ?? 0, item.quantity)),
          })),
        }),
      });
      if (!res.ok) {
        const contentType = res.headers.get('content-type') ?? '';
        const msg = contentType.includes('application/json')
          ? (await res.json()).error
          : await res.text();
        throw new Error(msg || 'Failed to log meal');
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log meal');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setItems([]);
    setMealType('Breakfast');
    setNotes('');
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 flex items-center justify-center">
        <div className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200 text-center max-w-md w-full">
          <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Meal Logged!</h2>
          <p className="text-sm text-slate-500 mb-1">
            <span className="font-medium text-slate-700">{mealType}</span> — {totals.calories} kcal
          </p>
          <p className="text-sm text-slate-500 mb-6">
            {totals.protein}g protein · {totals.carbs}g carbs · {totals.fats}g fats · {totals.fiber}g fibre
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleReset}
              className="rounded-2xl bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              Log Another Meal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">Log a Meal</h1>
          <p className="text-sm text-slate-600">
            Add food items to track your daily nutrition.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Left: form */}
          <div className="lg:col-span-3 space-y-5">

            {/* Meal type */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-4 text-base font-semibold text-slate-900">Meal Type</h2>
              <div className="flex flex-wrap gap-2">
                {MEAL_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setMealType(type)}
                    className={`rounded-2xl px-4 py-2 text-sm font-medium transition-colors ${
                      mealType === type
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Food search */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-4 text-base font-semibold text-slate-900">Add Food</h2>

              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                <svg className="shrink-0 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search food…"
                  value={foodSearch}
                  onChange={(e) => {
                    setFoodSearch(e.target.value);
                    setSelectedFood(null);
                  }}
                  className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>

              {/* Search results dropdown */}
              {foodSearch && !selectedFood && (
                <div className="mb-4 max-h-48 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {foodResults.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-slate-500">No results found</p>
                  ) : (
                    foodResults.map((food) => (
                      <button
                        key={food.id}
                        onClick={() => {
                          setSelectedFood(food);
                          setFoodSearch(food.name);
                        }}
                        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                      >
                        <span className="text-sm font-medium text-slate-800">{food.name}</span>
                        <span className="text-xs text-slate-500">{Math.ceil(food.calories)} kcal / 100g</span>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Selected food preview */}
              {selectedFood && (
                <div className="mb-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-sm font-semibold text-slate-900 mb-1">{selectedFood.name}</p>
                  <p className="text-xs text-slate-500">
                    {Math.ceil(selectedFood.calories)} kcal · {selectedFood.protein.toFixed(1)}g P · {selectedFood.carbs.toFixed(1)}g C · {selectedFood.fats.toFixed(1)}g F · {(selectedFood.fiber ?? 0).toFixed(1)}g Fibre per 100g
                  </p>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Quantity (grams)
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(10, q - 10))}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-24 rounded-xl bg-slate-50 px-3 py-2 text-center text-sm font-medium text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-slate-400"
                  />
                  <button
                    onClick={() => setQuantity((q) => q + 10)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                  <span className="text-sm text-slate-500">g</span>
                </div>
                {selectedFood && (
                  <p className="mt-2 text-xs text-slate-500">
                    ≈ {scale(selectedFood.calories, quantity)} kcal for {quantity}g
                  </p>
                )}
              </div>

              <button
                onClick={addItem}
                disabled={!selectedFood}
                className="w-full rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add to Meal
              </button>
            </div>

            {/* Notes */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-3 text-base font-semibold text-slate-900">Notes <span className="text-slate-400 font-normal text-xs">(optional)</span></h2>
              <textarea
                rows={3}
                placeholder="Any notes about this meal…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full resize-none rounded-2xl bg-slate-50 p-4 text-sm text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-200 outline-none focus:ring-slate-400"
              />
            </div>
          </div>

          {/* Right: summary */}
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sticky top-6">
              <h2 className="mb-4 text-base font-semibold text-slate-900">
                {mealType} Summary
              </h2>

              {items.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-6 text-center">
                  <p className="text-sm text-slate-500">No items added yet.</p>
                  <p className="mt-1 text-xs text-slate-400">Search for a food item to get started.</p>
                </div>
              ) : (
                <>
                  {/* Items list */}
                  <div className="mb-4 space-y-2">
                    {items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-800">{item.food.name}</p>
                          <p className="text-xs text-slate-500">{item.quantity}g · {scale(item.food.calories, item.quantity)} kcal</p>
                        </div>
                        <button
                          onClick={() => removeItem(i)}
                          className="ml-3 shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="rounded-2xl bg-slate-50 p-4 mb-4">
                    <div className="mb-3 flex items-baseline justify-between">
                      <span className="text-sm text-slate-600">Total Calories</span>
                      <span className="text-xl font-bold text-slate-900">{totals.calories} kcal</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">Protein</p>
                        <p className="text-sm font-semibold text-slate-800">{totals.protein}g</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">Carbs</p>
                        <p className="text-sm font-semibold text-slate-800">{totals.carbs}g</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">Fats</p>
                        <p className="text-sm font-semibold text-slate-800">{totals.fats}g</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">Fibre</p>
                        <p className="text-sm font-semibold text-slate-800">{totals.fiber}g</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {error && (
                <p className="mb-3 text-xs text-red-500">{error}</p>
              )}
              <button
                onClick={handleSubmit}
                disabled={items.length === 0 || loading}
                className="w-full rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting…' : 'Submit Meal Log'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
