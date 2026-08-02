'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import Logo from '../components/Logo';

type Gender        = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
type Goal          = 'lose_weight' | 'maintain' | 'build_muscle' | 'improve_fitness';
type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';

const GOALS: { value: Goal; label: string; icon: string }[] = [
  { value: 'lose_weight',     label: 'Lose Weight',     icon: '↓' },
  { value: 'maintain',        label: 'Maintain',        icon: '⟷' },
  { value: 'build_muscle',    label: 'Build Muscle',    icon: '↑' },
  { value: 'improve_fitness', label: 'Improve Fitness', icon: '◎' },
];

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; sub: string }[] = [
  { value: 'sedentary',         label: 'Sedentary',         sub: 'Little or no exercise' },
  { value: 'lightly_active',    label: 'Lightly Active',    sub: '1–3 days / week' },
  { value: 'moderately_active', label: 'Moderately Active', sub: '3–5 days / week' },
  { value: 'very_active',       label: 'Very Active',       sub: '6–7 days / week' },
  { value: 'extremely_active',  label: 'Extremely Active',  sub: 'Physical job + daily training' },
];

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male',              label: 'Male' },
  { value: 'female',            label: 'Female' },
  { value: 'non_binary',        label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

function calcAge(dob: string) {
  if (!dob) return undefined;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

const SELECT_BTN = 'rounded-xl transition-all';
const SELECTED = 'bg-gradient-brand text-white shadow-md shadow-violet-500/25';
const UNSELECTED = 'bg-slate-50 text-slate-700 ring-1 ring-slate-200 hover:bg-indigo-50';

export default function OnboardingPage() {
  const router     = useRouter();
  const { userId } = useAuth();
  const { user }   = useUser();

  const [step, setStep] = useState(0);

  const [height, setHeight]               = useState('');
  const [weight, setWeight]               = useState('');
  const [dob, setDob]                     = useState('');
  const [gender, setGender]               = useState<Gender | ''>('');
  const [goal, setGoal]                   = useState<Goal | ''>('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | ''>('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    if (localStorage.getItem('onboarding_complete')) router.replace('/dashboard');
  }, [router]);

  const displayName = user?.firstName ?? user?.username ?? 'there';

  async function handleComplete() {
    if (!userId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight:         weight ? Number(weight) : undefined,
          height:         height ? Number(height) : undefined,
          age:            calcAge(dob),
          gender:         gender        || undefined,
          goal:           goal          || undefined,
          activity_level: activityLevel || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Failed to save profile');
      }
      localStorage.setItem('onboarding_complete', 'true');
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleSkip() {
    localStorage.setItem('onboarding_complete', 'true');
    router.replace('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex flex-col items-center justify-center p-6">

      {/* Brand */}
      <div className="mb-8">
        <Logo size="lg" showSubtitle />
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg shadow-indigo-500/5 ring-1 ring-slate-200">

        {/* Progress */}
        <div className="flex gap-2 mb-7">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-gradient-brand' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* ── Step 1 ── */}
        {step === 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-500">Step 1 of 2</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Welcome, {displayName}!</h1>
            <p className="mt-1 mb-6 text-sm text-slate-500">
              Tell us about yourself so we can personalise your nutrition plan.
            </p>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">Height (cm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">Weight (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 75"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-violet-400"
                />
                {dob && (
                  <p className="mt-1 text-xs text-slate-400">You are {calcAge(dob)} years old</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                  {GENDERS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setGender(value)}
                      className={`${SELECT_BTN} py-2.5 text-sm font-medium ${gender === value ? SELECTED : UNSELECTED}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button onClick={handleSkip} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
                Skip for now
              </button>
              <button
                onClick={() => setStep(1)}
                className="rounded-2xl bg-gradient-brand px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/25 hover:shadow-lg hover:shadow-violet-500/40 transition"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 1 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-500">Step 2 of 2</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Your Goals</h1>
            <p className="mt-1 mb-6 text-sm text-slate-500">
              What are you working towards and how active are you?
            </p>

            <div className="flex flex-col gap-5">
              <div>
                <p className="mb-2 text-xs font-medium text-slate-600">Primary Goal</p>
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map(({ value, label, icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setGoal(value)}
                      className={`${SELECT_BTN} flex items-center gap-2.5 px-4 py-3 text-left text-sm font-medium ${goal === value ? SELECTED : UNSELECTED}`}
                    >
                      <span className="text-base">{icon}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-slate-600">Activity Level</p>
                <div className="flex flex-col gap-1.5">
                  {ACTIVITY_LEVELS.map(({ value, label, sub }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setActivityLevel(value)}
                      className={`${SELECT_BTN} flex items-center justify-between px-4 py-2.5 ${activityLevel === value ? SELECTED : UNSELECTED}`}
                    >
                      <span className="text-sm font-medium">{label}</span>
                      <span className={`text-xs ${activityLevel === value ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-2 text-xs text-red-600 ring-1 ring-red-200">{error}</p>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button onClick={() => setStep(0)} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
                ← Back
              </button>
              <button
                onClick={handleComplete}
                disabled={submitting}
                className="rounded-2xl bg-gradient-brand px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/25 hover:shadow-lg hover:shadow-violet-500/40 transition disabled:opacity-40"
              >
                {submitting ? 'Saving…' : 'Get Started'}
              </button>
            </div>
          </div>
        )}

      </div>

      <p className="mt-6 text-xs text-slate-400">
        You can update these details anytime in your{' '}
        <button onClick={handleSkip} className="underline hover:text-slate-600 transition-colors">
          account settings
        </button>.
      </p>
    </div>
  );
}
