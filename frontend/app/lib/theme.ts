export const PAGE_BG =
  'min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50';

export const BTN_PRIMARY =
  'bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 text-white shadow-md shadow-violet-500/25 transition hover:shadow-lg hover:shadow-violet-500/40 hover:-translate-y-0.5';

export const BTN_PRIMARY_DISABLED =
  'disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-md disabled:cursor-not-allowed';

export const CARD =
  'rounded-3xl bg-white/90 backdrop-blur shadow-sm ring-1 ring-slate-200';

export const MACRO_COLORS = {
  calories: { text: 'text-orange-600', bg: 'bg-orange-500', soft: 'bg-orange-50', ring: 'ring-orange-100' },
  protein: { text: 'text-rose-600', bg: 'bg-rose-500', soft: 'bg-rose-50', ring: 'ring-rose-100' },
  carbs: { text: 'text-amber-600', bg: 'bg-amber-500', soft: 'bg-amber-50', ring: 'ring-amber-100' },
  fats: { text: 'text-sky-600', bg: 'bg-sky-500', soft: 'bg-sky-50', ring: 'ring-sky-100' },
  fibre: { text: 'text-emerald-600', bg: 'bg-emerald-500', soft: 'bg-emerald-50', ring: 'ring-emerald-100' },
} as const;
