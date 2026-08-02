'use client';

import { useState, useEffect, useRef } from 'react';
import { CARD, MACRO_COLORS } from '../lib/theme';

type Food = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
};

export default function FoodPage() {
  const [search, setSearch] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!search.trim()) {
      setFoods([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/foods?q=${encodeURIComponent(search.trim())}`);
        const data = await res.json();
        setFoods(data);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [search]);

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">Food Database</h1>
          <p className="text-sm text-slate-600">
            Browse and search nutritional info for over 15,000 food items.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-violet-400 transition">
          <svg className="shrink-0 text-violet-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search foods…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-rose-500 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Results count */}
        {search.trim() && !loading && (
          <p className="mb-4 text-sm text-slate-500">
            {foods.length} {foods.length === 1 ? 'item' : 'items'} found for &quot;{search}&quot;
          </p>
        )}

        {/* States */}
        {!search.trim() ? (
          <div className={`${CARD} p-12 text-center`}>
            <p className="text-lg font-semibold text-slate-800">Search for a food</p>
            <p className="mt-1 text-sm text-slate-500">Type a food name above to get started.</p>
          </div>
        ) : loading ? (
          <div className={`${CARD} p-12 text-center`}>
            <p className="text-sm text-slate-500">Searching…</p>
          </div>
        ) : foods.length === 0 ? (
          <div className={`${CARD} p-12 text-center`}>
            <p className="text-lg font-semibold text-slate-800">No foods found</p>
            <p className="mt-1 text-sm text-slate-500">Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {foods.map((food) => (
              <div
                key={food.id}
                className={`${CARD} p-5 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-0.5 transition-all`}
              >
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-slate-900">{food.name}</h3>
                </div>

                <p className="mb-4 text-xs text-slate-400">Per 100g serving</p>

                <div className="mb-4 flex items-center gap-2">
                  <span className="text-3xl font-bold text-gradient-brand">{Math.round(food.calories)}</span>
                  <span className="text-sm text-slate-500">kcal</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className={`rounded-xl ${MACRO_COLORS.protein.soft} p-2.5 text-center`}>
                    <p className={`text-[10px] uppercase tracking-wide ${MACRO_COLORS.protein.text}`}>Protein</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800">{parseFloat(String(food.protein)).toFixed(1)}g</p>
                  </div>
                  <div className={`rounded-xl ${MACRO_COLORS.carbs.soft} p-2.5 text-center`}>
                    <p className={`text-[10px] uppercase tracking-wide ${MACRO_COLORS.carbs.text}`}>Carbs</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800">{parseFloat(String(food.carbs)).toFixed(1)}g</p>
                  </div>
                  <div className={`rounded-xl ${MACRO_COLORS.fats.soft} p-2.5 text-center`}>
                    <p className={`text-[10px] uppercase tracking-wide ${MACRO_COLORS.fats.text}`}>Fats</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800">{Number(food.fats).toFixed(1)}g</p>
                  </div>
                </div>

                {parseFloat(String(food.fiber)) > 0 && (
                  <p className={`mt-3 text-xs ${MACRO_COLORS.fibre.text}`}>Fibre: {parseFloat(String(food.fiber)).toFixed(1)}g</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
