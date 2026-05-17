'use client';

import { useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

const securitySettings = [
  { label: 'Two-Factor Authentication', value: 'Enabled' },
  { label: 'Last Password Change', value: '3 days ago' },
  { label: 'Connected Devices', value: '3 active' },
];

const preferences = [
  { label: 'Email Notifications', value: 'On' },
  { label: 'SMS Alerts', value: 'Off' },
  { label: 'Weekly Progress Emails', value: 'On' },
];

const accountStats = {
  mealsLogged: 1240,
  goalsHit: 67,
  friends: 12,
  streakDays: 18,
};

export default function AccountPage() {
  const { userId } = useAuth();
  const { user } = useUser();

  const [editing, setEditing] = useState(false);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  async function handleSaveAttributes() {
    if (!userId) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/users/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: weight ? Number(weight) : undefined,
          height: height ? Number(height) : undefined,
          age: age ? Number(age) : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update profile');
      }
      setSaveSuccess(true);
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  const displayName = user?.fullName ?? user?.username ?? 'User';
  const displayEmail = user?.primaryEmailAddress?.emailAddress ?? '';
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">Account Dashboard</h1>
          <p className="text-sm text-slate-600">
            Manage your profile, subscription, and security settings.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  Premium
                </span>
              </div>

              <p className="text-2xl font-bold text-slate-900">{displayName}</p>
              <p className="text-sm text-slate-500">{displayEmail}</p>
              {joinedDate && (
                <p className="mt-2 text-sm text-slate-500">User since {joinedDate}</p>
              )}
            </div>

            {/* Physical Attributes */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Physical Attributes</h2>
                {!editing && (
                  <button
                    onClick={() => { setEditing(true); setSaveSuccess(false); }}
                    className="rounded-2xl bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
                  >
                    Edit
                  </button>
                )}
              </div>

              {editing ? (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Weight (kg)</label>
                    <input
                      type="number"
                      placeholder="e.g. 75"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-slate-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Height (cm)</label>
                    <input
                      type="number"
                      placeholder="e.g. 175"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-slate-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Age</label>
                    <input
                      type="number"
                      placeholder="e.g. 28"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 outline-none focus:ring-slate-400"
                    />
                  </div>
                  {saveError && (
                    <p className="text-xs text-red-500">{saveError}</p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSaveAttributes}
                      disabled={saving}
                      className="flex-1 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      onClick={() => { setEditing(false); setSaveError(null); }}
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
                  {saveSuccess && (
                    <p className="mb-2 text-xs font-medium text-green-600">Attributes updated successfully.</p>
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Weight</p>
                    <p className="text-sm text-slate-800">{weight ? `${weight} kg` : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Height</p>
                    <p className="text-sm text-slate-800">{height ? `${height} cm` : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Age</p>
                    <p className="text-sm text-slate-800">{age || '—'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Account Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 p-4 text-center">
                  <p className="text-xs text-slate-500">Meals Logged</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{accountStats.mealsLogged.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 text-center">
                  <p className="text-xs text-slate-500">Goals Hit</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{accountStats.goalsHit}%</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 text-center">
                  <p className="text-xs text-slate-500">Friends</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{accountStats.friends}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 text-center">
                  <p className="text-xs text-slate-500">Streak</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{accountStats.streakDays} days</p>
                </div>
              </div>
            </div> */}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Security</h2>
                  <p className="mt-1 text-sm text-slate-500">Update your login and verification settings</p>
                </div>
                <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
                  Manage Security
                </button>
              </div>

              <div className="space-y-3">
                {securitySettings.map((setting) => (
                  <div key={setting.label} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-700">{setting.label}</p>
                    <p className="text-sm text-slate-600">{setting.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Preferences</h2>
                  <p className="mt-1 text-sm text-slate-500">Notification and app preferences</p>
                </div>
                <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
                  Edit Preferences
                </button>
              </div>

              <div className="space-y-3">
                {preferences.map((pref) => (
                  <div key={pref.label} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-700">{pref.label}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      pref.value === 'On'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {pref.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Subscription</h2>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">Premium</span>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                You have full access to all features including advanced analytics and priority support.
              </p>
              <div className="flex gap-3">
                <button className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  Billing History
                </button>
                <button className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  Manage Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
